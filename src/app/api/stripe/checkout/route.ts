import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateCartSessionId } from "@/lib/cart";

export async function POST(req: Request) {
	try {
		const supabase = await getSupabaseServerClient();
		const { data: auth } = await supabase.auth.getUser();
		const user = auth.user;

		// Parse request body
		const body = await req.json().catch(() => ({}));
		const { coupon_id, gift_card_id, customer } = body;

		// Validate Stripe secret key
		const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
		if (!stripeSecretKey) {
			console.error("[Checkout] Missing STRIPE_SECRET_KEY environment variable");
			return NextResponse.json(
				{ 
					error: "Checkout is not configured. Please set STRIPE_SECRET_KEY in your .env.local file. " +
						"Get your test keys from: https://dashboard.stripe.com/test/apikeys"
				},
				{ status: 500 }
			);
		}

		const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-10-29.clover" });

	let cartId: string | null = null;
	if (user) {
		// Authenticated user
		const { data: cart } = await supabase
			.from("carts")
			.select("id")
			.eq("user_id", user.id)
			.maybeSingle();
		cartId = cart?.id || null;
	} else {
		// Guest user
		const sessionId = await getOrCreateCartSessionId();
		const { data: cart } = await supabase
			.from("carts")
			.select("id")
			.eq("session_id", sessionId)
			.maybeSingle();
		cartId = cart?.id || null;
	}

	if (!cartId) {
		return NextResponse.json({ error: "Cart not found" }, { status: 400 });
	}

	const { data: items } = await supabase
		.from("cart_items")
		.select("quantity, product:products(id, name, price_cents)")
		.eq("cart_id", cartId);

	if (!items || items.length === 0) {
		return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
	}

	// Calculate subtotal
	const subtotalCents = items.reduce((sum: number, it: any) => sum + it.quantity * it.product.price_cents, 0);

	// Apply coupon discount
	let discountAmount = 0;
	let couponData: any = null;
	if (coupon_id) {
		const { data: coupon } = await supabase
			.from("coupons")
			.select("*")
			.eq("id", coupon_id)
			.single();

		if (coupon && coupon.active) {
			couponData = coupon;
			if (coupon.discount_type === "percentage") {
				discountAmount = Math.round((subtotalCents * coupon.discount_value) / 100);
				if (coupon.maximum_discount_cents) {
					discountAmount = Math.min(discountAmount, coupon.maximum_discount_cents);
				}
			} else {
				discountAmount = coupon.discount_value;
			}
			// Ensure discount doesn't exceed subtotal
			discountAmount = Math.min(discountAmount, subtotalCents);
		}
	}

	// Apply gift card discount
	let giftCardData: any = null;
	let giftCardAmount = 0;
	if (gift_card_id) {
		const { data: giftCard } = await supabase
			.from("gift_cards")
			.select("*")
			.eq("id", gift_card_id)
			.single();

		if (giftCard && giftCard.active && giftCard.remaining_amount_cents > 0) {
			giftCardData = giftCard;
			// Gift card can cover up to the remaining amount after coupon
			const remainingAfterCoupon = subtotalCents - discountAmount;
			giftCardAmount = Math.min(giftCard.remaining_amount_cents, remainingAfterCoupon);
		}
	}

	// Calculate final total
	const finalTotalCents = Math.max(0, subtotalCents - discountAmount - giftCardAmount);

	// Calculate discount ratio to apply proportionally to line items
	// This ensures the total matches the final amount without using negative line items
	const totalDiscount = discountAmount + giftCardAmount;
	const discountRatio = subtotalCents > 0 ? finalTotalCents / subtotalCents : 1;

	// Build line items with adjusted prices to account for discounts
	// Stripe doesn't allow negative unit_amount, so we adjust prices proportionally
	const lineItems = items.map((it: any) => {
		const originalItemTotal = it.quantity * it.product.price_cents;
		const adjustedItemTotal = Math.round(originalItemTotal * discountRatio);
		const adjustedUnitAmount = Math.round(adjustedItemTotal / it.quantity);
		
		return {
			price_data: {
				currency: "usd",
				product_data: { name: it.product.name },
				unit_amount: Math.max(0, adjustedUnitAmount), // Ensure non-negative
			},
			quantity: it.quantity,
		};
	});

	// If the proportional adjustment doesn't exactly match due to rounding,
	// adjust the last item to make the total exact
	if (totalDiscount > 0 && lineItems.length > 0) {
		const calculatedTotal = lineItems.reduce((sum: number, item: any) => {
			return sum + (item.price_data.unit_amount * item.quantity);
		}, 0);
		
		const difference = finalTotalCents - calculatedTotal;
		if (difference !== 0 && Math.abs(difference) < finalTotalCents) {
			// Adjust the last item to account for rounding differences
			const lastItem = lineItems[lineItems.length - 1];
			const adjustment = Math.round(difference / lastItem.quantity);
			lastItem.price_data.unit_amount = Math.max(0, lastItem.price_data.unit_amount + adjustment);
		}
	}

	// Get origin from request URL
	const url = new URL(req.url);
	const origin = url.origin;
	const metadata: Record<string, string> = {};
	if (user) {
		metadata.user_id = user.id;
	} else {
		const sessionId = await getOrCreateCartSessionId();
		metadata.session_id = sessionId;
	}
	if (coupon_id) {
		metadata.coupon_id = coupon_id;
		metadata.discount_amount_cents = discountAmount.toString();
	}
	if (gift_card_id) {
		metadata.gift_card_id = gift_card_id;
		metadata.gift_card_amount_cents = giftCardAmount.toString();
	}
	// Store original subtotal for reference
	metadata.subtotal_cents = subtotalCents.toString();
	
	// Store customer information in metadata for webhook
	if (customer) {
		metadata.customer_email = customer.email || "";
		metadata.customer_name = customer.name || "";
		metadata.customer_phone = customer.phone || "";
		if (customer.address) {
			metadata.shipping_address_line1 = customer.address.line1 || "";
			metadata.shipping_address_line2 = customer.address.line2 || "";
			metadata.shipping_city = customer.address.city || "";
			metadata.shipping_state = customer.address.state || "";
			metadata.shipping_postal_code = customer.address.postal_code || "";
			metadata.shipping_country = customer.address.country || "";
		}
	}

		console.log("[Checkout] Creating Stripe session with:", {
			lineItemsCount: lineItems.length,
			origin,
			hasUser: !!user,
			hasCoupon: !!coupon_id,
			hasGiftCard: !!gift_card_id,
			subtotal: subtotalCents,
			discount: discountAmount,
			giftCard: giftCardAmount,
			finalTotal: finalTotalCents,
		});

		// Use Stripe coupon if available and no manual discount needed
		const sessionParams: Stripe.Checkout.SessionCreateParams = {
			mode: "payment",
			line_items: lineItems,
			success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}/cart`,
			metadata,
		};

		// Add customer information if provided
		if (customer) {
			sessionParams.customer_email = customer.email;
			
			// Pre-fill shipping address if provided
			if (customer.address) {
				sessionParams.shipping_address_collection = {
					allowed_countries: [customer.address.country || "US"],
				};
				// Note: Stripe Checkout doesn't support pre-filling addresses via API
				// The address will be collected/confirmed during checkout
			}
		}

		// If we have a Stripe coupon ID, use it (but we'll still track manually)
		if (couponData?.stripe_coupon_id) {
			// Note: Stripe Checkout Sessions don't directly support applying coupons via API
			// We'll use the discount line item approach above
		}

		const session = await stripe.checkout.sessions.create(sessionParams);

		console.log("[Checkout] Stripe session created:", {
			sessionId: session.id,
			hasUrl: !!session.url,
			url: session.url?.substring(0, 50) + "...",
		});

		if (!session.url) {
			console.error("[Checkout] Stripe session created but no URL returned", { sessionId: session.id });
			return NextResponse.json(
				{ error: "Failed to create checkout session" },
				{ status: 500 }
			);
		}

		// Validate the URL is a valid Stripe checkout URL
		if (!session.url.startsWith("https://checkout.stripe.com")) {
			console.error("[Checkout] Invalid Stripe checkout URL:", session.url);
			return NextResponse.json(
				{ error: "Invalid checkout URL returned from Stripe" },
				{ status: 500 }
			);
		}

		// Check if request is from a client-side fetch (has Accept header)
		const acceptHeader = req.headers.get("accept");
		const isClientFetch = acceptHeader?.includes("application/json") || acceptHeader?.includes("*/*");

		if (isClientFetch) {
			// Return JSON for client-side redirect
			return NextResponse.json({ url: session.url }, { status: 200 });
		}

		// Server-side redirect for form submissions
		return NextResponse.redirect(session.url, { status: 303 });
	} catch (error: any) {
		console.error("[Checkout] Error:", error);
		
		// Handle Stripe-specific errors
		if (error.type === "StripeAuthenticationError") {
			return NextResponse.json(
				{ 
					error: "Invalid Stripe API key. Please check your STRIPE_SECRET_KEY in .env.local. " +
						"Get your test keys from: https://dashboard.stripe.com/test/apikeys"
				},
				{ status: 401 }
			);
		}

		return NextResponse.json(
			{ error: error.message || "Failed to process checkout" },
			{ status: 500 }
		);
	}
}


