import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

/**
 * Debug endpoint to check the order creation flow
 * This helps diagnose issues with order creation
 */
export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const sessionId = searchParams.get("session_id");
		const paymentIntent = searchParams.get("payment_intent");

		const supabase = getSupabaseServiceClient();
		const diagnostics: any = {
			timestamp: new Date().toISOString(),
		};

		// Check if order exists by payment intent
		if (paymentIntent) {
			const { data: orderByIntent, error: intentError } = await supabase
				.from("orders")
				.select("*")
				.eq("stripe_payment_intent", paymentIntent)
				.maybeSingle();

			diagnostics.order_by_payment_intent = {
				exists: !!orderByIntent,
				order: orderByIntent,
				error: intentError?.message,
			};
		}

		// Check recent orders
		const { data: recentOrders, error: recentError } = await supabase
			.from("orders")
			.select("id, user_id, guest_email, status, payment_status, stripe_payment_intent, created_at")
			.order("created_at", { ascending: false })
			.limit(5);

		diagnostics.recent_orders = {
			count: recentOrders?.length || 0,
			orders: recentOrders || [],
			error: recentError?.message,
		};

		// Check carts
		const { data: carts, error: cartsError } = await supabase
			.from("carts")
			.select("id, user_id, session_id, updated_at")
			.order("updated_at", { ascending: false })
			.limit(5);

		diagnostics.recent_carts = {
			count: carts?.length || 0,
			carts: carts || [],
			error: cartsError?.message,
		};

		// Check cart items
		if (carts && carts.length > 0) {
			const cartIds = carts.map((c: any) => c.id);
			const { data: cartItems, error: itemsError } = await supabase
				.from("cart_items")
				.select("id, cart_id, product_id, quantity")
				.in("cart_id", cartIds);

			diagnostics.cart_items = {
				count: cartItems?.length || 0,
				items: cartItems || [],
				error: itemsError?.message,
			};
		}

		return NextResponse.json(diagnostics, { status: 200 });
	} catch (error: any) {
		return NextResponse.json({
			error: error.message || "Internal server error",
			stack: error.stack,
		}, { status: 500 });
	}
}

