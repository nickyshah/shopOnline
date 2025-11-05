import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
	const supabase = await getSupabaseServerClient();
	const { data: auth } = await supabase.auth.getUser();
	const user = auth.user;
	if (!user) return NextResponse.redirect(new URL("/login", req.url));

	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

	const { data: items } = await supabase
		.from("cart_items")
		.select("quantity, product:products(id, name, price_cents)")
		.eq("cart_user_id", user.id);

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
	const session = await stripe.checkout.sessions.create({
		mode: "payment",
		line_items: lineItems,
		success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${origin}/cart`,
		metadata: { user_id: user.id },
	});

	return NextResponse.redirect(session.url!, { status: 303 });
}


