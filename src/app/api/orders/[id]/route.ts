import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/orders/[id]
 * Get a specific order by ID (for authenticated users or guest lookup)
 */
export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await getSupabaseServerClient();
		const { data: auth } = await supabase.auth.getUser();

		// Get order with items
		const { data: order, error } = await supabase
			.from("orders")
			.select(`
				id,
				user_id,
				guest_email,
				status,
				payment_status,
				amount_cents,
				shipping_name,
				phone,
				shipping_address_line1,
				shipping_address_line2,
				shipping_city,
				shipping_state,
				shipping_postal_code,
				shipping_country,
				stripe_payment_intent,
				created_at,
				updated_at,
				order_items (
					id,
					quantity,
					unit_price_cents,
					product:products (
						id,
						name,
						image_url,
						price_cents
					)
				)
			`)
			.eq("id", id)
			.single();

		if (error) {
			console.error("[Order API] Error fetching order:", error);
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		// Check if user has access
		if (auth.user) {
			// Authenticated user - can access their own orders
			if (order.user_id === auth.user.id) {
				return NextResponse.json({ order });
			}
		}

		// For guest orders, we'll handle lookup via separate endpoint with email/phone verification
		// This endpoint only returns orders for authenticated users
		if (!auth.user || order.user_id !== auth.user.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		return NextResponse.json({ order });
	} catch (error: any) {
		console.error("[Order API] Error:", error);
		return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
	}
}


