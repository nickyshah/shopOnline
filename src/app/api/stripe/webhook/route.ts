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
			const amountCents = items.reduce((sum: number, it: any) => sum + it.quantity * it.product.price_cents, 0);

			// Create order (use service role to bypass RLS)
			const { data: order } = await supabase
				.from("orders")
				.insert({
					user_id: userId || null,
					guest_email: userId ? null : customerEmail || null,
					status: "paid",
					stripe_payment_intent: session.payment_intent as string,
					amount_cents: amountCents,
				})
				.select("id")
				.single();

			if (order) {
				await supabase.from("order_items").insert(
					items.map((it: any) => ({
						order_id: order.id,
						product_id: it.product.id,
						quantity: it.quantity,
						unit_price_cents: it.product.price_cents,
					}))
				);

				// Clear cart
				await supabase.from("cart_items").delete().eq("cart_id", cartId);
			}
		}
	}

	return NextResponse.json({ received: true });
}


