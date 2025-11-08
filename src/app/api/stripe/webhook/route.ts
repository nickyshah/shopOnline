import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
	const body = await req.text();
	const signature = req.headers.get("stripe-signature");
	const secret = process.env.STRIPE_WEBHOOK_SECRET;
	
	if (!secret) {
		console.error("[Webhook] STRIPE_WEBHOOK_SECRET is not configured!");
		console.error("[Webhook] To fix: Run 'stripe listen --forward-to localhost:3000/api/stripe/webhook' and add the secret to .env.local");
		return new NextResponse("Webhook secret not configured", { status: 500 });
	}
	
	const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
	if (!stripeSecretKey) {
		console.error("[Webhook] STRIPE_SECRET_KEY is not configured!");
		return new NextResponse("Stripe secret key not configured", { status: 500 });
	}
	
	const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-10-29.clover" });

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(body, signature!, secret);
		console.log("[Webhook] Event received:", event.type);
	} catch (err: any) {
		console.error("[Webhook] Signature verification failed:", err.message);
		console.error("[Webhook] Make sure STRIPE_WEBHOOK_SECRET matches the one from 'stripe listen'");
		return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
	}

		if (event.type === "checkout.session.completed") {
		console.log("[Webhook] Received checkout.session.completed event");
		const session = event.data.object as Stripe.Checkout.Session;
		const metadata = session.metadata as any;
		const userId = metadata?.user_id as string | undefined;
		const sessionId = metadata?.session_id as string | undefined;
		
		console.log("[Webhook] Session metadata:", {
			userId: userId || "none",
			sessionId: sessionId || "none",
			hasMetadata: !!metadata,
			metadataKeys: metadata ? Object.keys(metadata) : [],
			sessionId_from_session: session.id,
			paymentIntent: session.payment_intent,
			amountTotal: session.amount_total,
		});
		const couponId = metadata?.coupon_id as string | undefined;
		const giftCardId = metadata?.gift_card_id as string | undefined;
		const giftCardAmountCents = metadata?.gift_card_amount_cents
			? parseInt(metadata.gift_card_amount_cents)
			: 0;
		const customerEmail = session.customer_email || session.customer_details?.email || metadata?.customer_email;
		
		// Extract customer information from metadata (if provided from checkout form)
		const customerName = metadata?.customer_name || session.customer_details?.name;
		const customerPhone = metadata?.customer_phone;
		const shippingAddress = {
			line1: metadata?.shipping_address_line1 || session.shipping_details?.address?.line1,
			line2: metadata?.shipping_address_line2 || session.shipping_details?.address?.line2,
			city: metadata?.shipping_city || session.shipping_details?.address?.city,
			state: metadata?.shipping_state || session.shipping_details?.address?.state,
			postal_code: metadata?.shipping_postal_code || session.shipping_details?.address?.postal_code,
			country: metadata?.shipping_country || session.shipping_details?.address?.country,
		};

		// Use service role client to bypass RLS for order creation
		const supabase = getSupabaseServiceClient();

		let cartId: string | null = null;
		if (userId) {
			// Authenticated user
			const { data: cart } = await supabase
				.from("carts")
				.select("id")
				.eq("user_id", userId)
				.maybeSingle();
			cartId = cart?.id || null;
		} else if (sessionId) {
			// Guest user
			const { data: cart } = await supabase
				.from("carts")
				.select("id")
				.eq("session_id", sessionId)
				.maybeSingle();
			cartId = cart?.id || null;
		}

		if (!cartId) {
			console.error("[Webhook] Cart not found:", {
				userId: userId || "none",
				sessionId: sessionId || "none",
				metadataKeys: metadata ? Object.keys(metadata) : [],
			});
			
			// If cart is not found, try to create order from line items in Stripe session
			// This is a fallback if cart was cleared before webhook ran
			console.log("[Webhook] Attempting to create order from Stripe line items as fallback...");
			const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
			
			if (lineItems.data && lineItems.data.length > 0) {
				console.log("[Webhook] Found line items in Stripe session, creating order from them");
				// We'll create order without order_items if cart is missing
				// This is better than failing completely
				const orderData = {
					user_id: userId || null,
					guest_email: userId ? null : customerEmail || null,
					status: "pending",
					payment_status: "paid",
					stripe_payment_intent: session.payment_intent as string,
					amount_cents: session.amount_total || 0,
					shipping_name: customerName || null,
					phone: customerPhone || null,
					shipping_address_line1: shippingAddress.line1 || null,
					shipping_address_line2: shippingAddress.line2 || null,
					shipping_city: shippingAddress.city || null,
					shipping_state: shippingAddress.state || null,
					shipping_postal_code: shippingAddress.postal_code || null,
					shipping_country: shippingAddress.country || null,
				};
				
				const { data: order, error: orderError } = await supabase
					.from("orders")
					.insert(orderData)
					.select("id")
					.single();
				
				if (orderError) {
					console.error("[Webhook] Error creating order from line items:", orderError);
					return NextResponse.json({ received: true, error: orderError.message }, { status: 500 });
				}
				
				if (order) {
					console.log("[Webhook] Order created from line items (no cart):", order.id);
					return NextResponse.json({ received: true, order_id: order.id });
				}
			}
			
			return NextResponse.json({ received: true, error: "Cart not found and no line items" }, { status: 400 });
		}
		
		console.log("[Webhook] Found cart:", cartId);

		const { data: items, error: itemsError } = await supabase
			.from("cart_items")
			.select("quantity, product:products(id, name, price_cents)")
			.eq("cart_id", cartId);

		if (itemsError) {
			console.error("[Webhook] Error fetching cart items:", itemsError);
			return NextResponse.json({ received: true, error: itemsError.message }, { status: 500 });
		}

		console.log("[Webhook] Cart items:", {
			count: items?.length || 0,
			items: items?.map((it: any) => ({
				productId: it.product?.id,
				quantity: it.quantity,
				price: it.product?.price_cents,
			})),
		});

		if (items && items.length > 0) {
			// Calculate subtotal from items
			const subtotalCents = items.reduce((sum: number, it: any) => sum + it.quantity * it.product.price_cents, 0);
			
			// Get final amount from Stripe session (which includes discounts)
			const finalAmountCents = session.amount_total || subtotalCents;

			console.log("[Webhook] Creating order:", {
				userId: userId || "guest",
				customerEmail: customerEmail || "none",
				subtotalCents,
				finalAmountCents,
				itemsCount: items.length,
				hasCoupon: !!couponId,
				hasGiftCard: !!giftCardId,
			});

			// Create order (use service role to bypass RLS)
			// Note: status should be "pending" initially, payment_status indicates payment
			const orderData = {
				user_id: userId || null,
				guest_email: userId ? null : customerEmail || null,
				status: "pending", // Order status starts as pending, payment_status indicates payment
				payment_status: "paid",
				stripe_payment_intent: session.payment_intent as string,
				amount_cents: finalAmountCents,
				shipping_name: customerName || null,
				phone: customerPhone || null,
				shipping_address_line1: shippingAddress.line1 || null,
				shipping_address_line2: shippingAddress.line2 || null,
				shipping_city: shippingAddress.city || null,
				shipping_state: shippingAddress.state || null,
				shipping_postal_code: shippingAddress.postal_code || null,
				shipping_country: shippingAddress.country || null,
			};
			
			console.log("[Webhook] Creating order with data:", {
				userId: orderData.user_id || "null (guest)",
				guestEmail: orderData.guest_email || "null",
				amountCents: orderData.amount_cents,
			});
			
			console.log("[Webhook] Inserting order with data:", JSON.stringify(orderData, null, 2));
			
			const { data: order, error: orderError } = await supabase
				.from("orders")
				.insert(orderData)
				.select("id")
				.single();

			if (orderError) {
				console.error("[Webhook] Error creating order:", {
					message: orderError.message,
					code: orderError.code,
					details: orderError.details,
					hint: orderError.hint,
					orderData: JSON.stringify(orderData, null, 2),
				});
				return NextResponse.json({ received: true, error: orderError.message }, { status: 500 });
			}
			
			if (!order) {
				console.error("[Webhook] Order insert returned no data");
				return NextResponse.json({ received: true, error: "Order creation returned no data" }, { status: 500 });
			}

			if (order) {
				console.log("[Webhook] Order created successfully:", order.id);

				const { error: itemsError } = await supabase.from("order_items").insert(
					items.map((it: any) => ({
						order_id: order.id,
						product_id: it.product.id,
						quantity: it.quantity,
						unit_price_cents: it.product.price_cents,
					}))
				);

				if (itemsError) {
					console.error("[Webhook] Error creating order items:", itemsError);
				} else {
					console.log("[Webhook] Order items created successfully");
				}

				// Clear cart items (for both authenticated users and guests)
				const { error: cartItemsError } = await supabase
					.from("cart_items")
					.delete()
					.eq("cart_id", cartId);
				
				if (cartItemsError) {
					console.error("[Webhook] Error clearing cart items:", cartItemsError);
				} else {
					console.log("[Webhook] Cart items cleared successfully for cart:", cartId);
				}

				// Optionally delete the cart itself (optional, but keeps DB clean)
				// Note: We keep the cart record as it might be useful for history
				// The cart can be reused for future shopping sessions

				// Track coupon usage (for both authenticated and guest users)
				if (couponId) {
					try {
						// Record coupon usage (user_id can be null for guests)
						await supabase.from("coupon_usage").insert({
							coupon_id: couponId,
							user_id: userId || null,
							order_id: order.id,
						});

						// Increment usage count
						await supabase.rpc("increment", {
							table_name: "coupons",
							column_name: "usage_count",
							row_id: couponId,
							increment_value: 1,
						}).catch(() => {
							// Fallback if RPC doesn't exist
							const { data: coupon } = await supabase
								.from("coupons")
								.select("usage_count")
								.eq("id", couponId)
								.single();
							
							if (coupon) {
								await supabase
									.from("coupons")
									.update({ usage_count: (coupon.usage_count || 0) + 1 })
									.eq("id", couponId);
							}
						});

						console.log("[Webhook] Coupon usage tracked:", couponId);
					} catch (couponError) {
						console.error("[Webhook] Error tracking coupon usage:", couponError);
					}
				}

				// Process gift card transaction
				if (giftCardId && giftCardAmountCents > 0) {
					try {
						// Get current gift card balance
						const { data: giftCard } = await supabase
							.from("gift_cards")
							.select("remaining_amount_cents")
							.eq("id", giftCardId)
							.single();

						if (giftCard) {
							const newBalance = Math.max(0, giftCard.remaining_amount_cents - giftCardAmountCents);

							// Update gift card balance
							await supabase
								.from("gift_cards")
								.update({ remaining_amount_cents: newBalance })
								.eq("id", giftCardId);

							// Record transaction
							await supabase.from("gift_card_transactions").insert({
								gift_card_id: giftCardId,
								order_id: order.id,
								amount_cents: giftCardAmountCents,
								transaction_type: "redeemed",
							});

							console.log("[Webhook] Gift card transaction processed:", {
								giftCardId,
								amount: giftCardAmountCents,
								newBalance,
							});
						}
					} catch (giftCardError) {
						console.error("[Webhook] Error processing gift card transaction:", giftCardError);
					}
				}

				console.log("[Webhook] Order processing completed for order:", order.id);
			}
		} else {
			console.warn("[Webhook] No items found in cart, skipping order creation");
		}
	}

	return NextResponse.json({ received: true });
}


