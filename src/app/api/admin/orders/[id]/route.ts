import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/orders/[id]
 * Get a specific order by ID (admin only)
 */
export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await getSupabaseServerClient();
		const { data: auth } = await supabase.auth.getUser();

		if (!auth.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Check if user is admin
		const { data: profile } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", auth.user.id)
			.single();

		if (profile?.role !== "admin") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const serviceSupabase = getSupabaseServiceClient();
		const { data: order, error } = await serviceSupabase
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
			console.error("[Admin Order API] Error:", error);
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		return NextResponse.json({ order });
	} catch (error: any) {
		console.error("[Admin Order API] Error:", error);
		return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
	}
}

/**
 * PUT /api/admin/orders/[id]
 * Update order status (admin only)
 * Body: { status?: string, payment_status?: string }
 */
export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const body = await req.json();
		const { status, payment_status } = body;

		const supabase = await getSupabaseServerClient();
		const { data: auth } = await supabase.auth.getUser();

		if (!auth.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Check if user is admin
		const { data: profile } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", auth.user.id)
			.single();

		if (profile?.role !== "admin") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Validate status values
		const validStatuses = ["pending", "processing", "paid", "fulfilled", "shipped", "completed", "cancelled", "refunded"];
		const validPaymentStatuses = ["unpaid", "paid", "refunded", "failed"];

		if (status && !validStatuses.includes(status)) {
			return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
		}

		if (payment_status && !validPaymentStatuses.includes(payment_status)) {
			return NextResponse.json({ error: `Invalid payment_status. Must be one of: ${validPaymentStatuses.join(", ")}` }, { status: 400 });
		}

		const serviceSupabase = getSupabaseServiceClient();
		const updateData: any = {};
		if (status) updateData.status = status;
		if (payment_status) updateData.payment_status = payment_status;

		const { data: order, error } = await serviceSupabase
			.from("orders")
			.update(updateData)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("[Admin Order API] Error updating order:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ order });
	} catch (error: any) {
		console.error("[Admin Order API] Error:", error);
		return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
	}
}


