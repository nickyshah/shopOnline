import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
	const body = await req.text();
	const signature = req.headers.get("stripe-signature");
	const secret = process.env.STRIPE_WEBHOOK_SECRET!;
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(body, signature!, secret);
	} catch (err: any) {
		return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
	}

	if (event.type === "checkout.session.completed") {
		const session = event.data.object as Stripe.Checkout.Session;
		const userId = (session.metadata as any)?.user_id as string | undefined;
		if (userId) {
			const supabase = await getSupabaseServerClient();
			// read cart items at the time of completion
			const { data: items } = await supabase
				.from("cart_items")
				.select("quantity, product:products(id, name, price_cents)")
				.eq("cart_user_id", userId);

			const amountCents = (items ?? []).reduce((sum: number, it: any) => sum + it.quantity * it.product.price_cents, 0);

			// create order
			const { data: order } = await supabase
				.from("orders")
				.insert({
					user_id: userId,
					status: "paid",
					stripe_payment_intent: session.payment_intent as string,
					amount_cents: amountCents,
				})
				.select("id")
				.single();

			if (order && items && items.length > 0) {
				await supabase.from("order_items").insert(
					items.map((it: any) => ({
						order_id: order.id,
						product_id: it.product.id,
						quantity: it.quantity,
						unit_price_cents: it.product.price_cents,
					}))
				);
				// clear cart
				await supabase.from("cart_items").delete().eq("cart_user_id", userId);
			}
		}
	}

	return NextResponse.json({ received: true });
}


