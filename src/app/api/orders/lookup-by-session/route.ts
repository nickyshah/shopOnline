import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

/**
 * API endpoint to look up an order by Stripe Checkout Session ID.
 * This is used by the success page to verify order creation.
 */
export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const sessionId = searchParams.get("session_id");

		if (!sessionId) {
			return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
		}

		const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
		if (!stripeSecretKey) {
			console.error("[Lookup Order] Stripe secret key not configured.");
			return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
		}

		const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-10-29.clover" });

		// 1. Fetch the Stripe Checkout Session
		const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
			expand: ["payment_intent"], // Expand payment_intent to get its ID
		});

		if (!stripeSession || !stripeSession.payment_intent) {
			console.warn(`[Lookup Order] Stripe session or payment intent not found for session ID: ${sessionId}`);
			return NextResponse.json({ order: null }, { status: 200 });
		}

		const paymentIntentId =
			typeof stripeSession.payment_intent === "string"
				? stripeSession.payment_intent
				: stripeSession.payment_intent.id;

		if (!paymentIntentId) {
			console.warn(`[Lookup Order] Payment Intent ID not found in Stripe session for session ID: ${sessionId}`);
			return NextResponse.json({ order: null }, { status: 200 });
		}

		// 2. Query Supabase for the order using the payment_intent_id
		const supabase = getSupabaseServiceClient(); // Use service client to bypass RLS for lookup

		const { data: order, error: orderError } = await supabase
			.from("orders")
			.select("*")
			.eq("stripe_payment_intent", paymentIntentId)
			.single();

		if (orderError && orderError.code !== "PGRST116") { // PGRST116 means "no rows found"
			console.error("[Lookup Order] Error fetching order from DB:", orderError);
			return NextResponse.json({ error: orderError.message }, { status: 500 });
		}

		if (!order) {
			console.log(`[Lookup Order] No order found in DB for payment intent: ${paymentIntentId}`);
		} else {
			console.log(`[Lookup Order] Order found: ${order.id} for payment intent: ${paymentIntentId}`);
		}

		return NextResponse.json({ order });
	} catch (error: any) {
		console.error("[Lookup Order] Unexpected error:", error);
		return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
	}
}

