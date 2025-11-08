import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/orders
 * Get orders for the authenticated user
 * Query params: status, limit, offset
 */
export async function GET(req: Request) {
	try {
		const supabase = await getSupabaseServerClient();
		const { data: auth } = await supabase.auth.getUser();

		if (!auth.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const status = searchParams.get("status");
		const limit = parseInt(searchParams.get("limit") || "50");
		const offset = parseInt(searchParams.get("offset") || "0");

		let query = supabase
			.from("orders")
			.select(`
				id,
				status,
				payment_status,
				amount_cents,
				created_at,
				updated_at,
				order_items (
					id,
					quantity,
					unit_price_cents,
					product:products (
						id,
						name,
						image_url
					)
				)
			`)
			.eq("user_id", auth.user.id)
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (status) {
			query = query.eq("status", status);
		}

		const { data: orders, error } = await query;

		if (error) {
			console.error("[Orders API] Error fetching orders:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ orders: orders || [] });
	} catch (error: any) {
		console.error("[Orders API] Error:", error);
		return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
	}
}


