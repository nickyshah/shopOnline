import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateCartSessionId } from "@/lib/cart";

export async function POST(req: Request) {
	try {
		const supabase = await getSupabaseServerClient();
		const { data: auth } = await supabase.auth.getUser();
		const user = auth.user;

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
		return NextResponse.redirect(new URL("/cart", req.url));
	}

	const { data: items } = await supabase
		.from("cart_items")
		.select("quantity, product:products(id, name, price_cents)")
		.eq("cart_id", cartId);

	if (!items || items.length === 0) {
		return NextResponse.redirect(new URL("/cart", req.url));
	}

	const lineItems = items.map((it: any) => ({
		price_data: {
			currency: "usd",
			product_data: { name: it.product.name },
			unit_amount: it.product.price_cents,
		},
		quantity: it.quantity,
	}));

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

		console.log("[Checkout] Creating Stripe session with:", {
			lineItemsCount: lineItems.length,
			origin,
			hasUser: !!user,
		});

		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			line_items: lineItems,
			success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}/cart`,
			metadata,
		});

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


