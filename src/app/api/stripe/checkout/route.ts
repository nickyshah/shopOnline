import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateCartSessionId } from "@/lib/cart";

export async function POST(req: Request) {
	const supabase = await getSupabaseServerClient();
	const { data: auth } = await supabase.auth.getUser();
	const user = auth.user;

	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-10-29.clover" });

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

	const origin = new URL(req.url).origin;
	const metadata: Record<string, string> = {};
	if (user) {
		metadata.user_id = user.id;
	} else {
		const sessionId = await getOrCreateCartSessionId();
		metadata.session_id = sessionId;
	}

	const session = await stripe.checkout.sessions.create({
		mode: "payment",
		line_items: lineItems,
		success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${origin}/cart`,
		metadata,
	});

	return NextResponse.redirect(session.url!, { status: 303 });
}


