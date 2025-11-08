import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * POST /api/orders/guest/lookup
 * Look up a guest order by order ID and email/phone
 * Body: { orderId: string, email?: string, phone?: string }
 */
export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { orderId, email, phone } = body;

		if (!orderId) {
			return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
		}

		if (!email && !phone) {
			return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
		}

		const supabase = await getSupabaseServerClient();

		// Build query
		let query = supabase
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
			.eq("id", orderId)
			.is("user_id", null); // Only guest orders

		const { data: order, error } = await query.single();

		if (error || !order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		// Verify email or phone matches
		const emailMatch = email && order.guest_email?.toLowerCase() === email.toLowerCase();
		const phoneMatch = phone && order.phone === phone;

		if (!emailMatch && !phoneMatch) {
			return NextResponse.json({ error: "Invalid credentials" }, { status: 403 });
		}

		return NextResponse.json({ order });
	} catch (error: any) {
		console.error("[Guest Order Lookup] Error:", error);
		return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
	}
}


