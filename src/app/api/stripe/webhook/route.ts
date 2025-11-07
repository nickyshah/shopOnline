import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
	const body = await req.text();
	const signature = req.headers.get("stripe-signature");
	const secret = process.env.STRIPE_WEBHOOK_SECRET!;
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-10-29.clover" });

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(body, signature!, secret);
	} catch (err: any) {
		return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
	}

	if (event.type === "checkout.session.completed") {
		const session = event.data.object as Stripe.Checkout.Session;
		const metadata = session.metadata as any;
		const userId = metadata?.user_id as string | undefined;
		const sessionId = metadata?.session_id as string | undefined;
		const couponId = metadata?.coupon_id as string | undefined;
		const giftCardId = metadata?.gift_card_id as string | undefined;
		const giftCardAmountCents = metadata?.gift_card_amount_cents
			? parseInt(metadata.gift_card_amount_cents)
			: 0;
		const customerEmail = session.customer_email || session.customer_details?.email;

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
			return NextResponse.json({ received: true, error: "Cart not found" });
		}

		const { data: items } = await supabase
			.from("cart_items")
			.select("quantity, product:products(id, name, price_cents)")
			.eq("cart_id", cartId);

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
			const { data: order, error: orderError } = await supabase
				.from("orders")
				.insert({
					user_id: userId || null,
					guest_email: userId ? null : customerEmail || null,
					status: "paid",
					stripe_payment_intent: session.payment_intent as string,
					amount_cents: finalAmountCents,
				})
				.select("id")
				.single();

			if (orderError) {
				console.error("[Webhook] Error creating order:", orderError);
				return NextResponse.json({ received: true, error: orderError.message }, { status: 500 });
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


