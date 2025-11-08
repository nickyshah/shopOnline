import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/orders
 * Get all orders (admin only) with filters
 * Query params: status, payment_status, start_date, end_date, limit, offset
 */
export async function GET(req: Request) {
	try {
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

		// Use service client to get all orders
		const serviceSupabase = getSupabaseServiceClient();
		const { searchParams } = new URL(req.url);
		const status = searchParams.get("status");
		const paymentStatus = searchParams.get("payment_status");
		const startDate = searchParams.get("start_date");
		const endDate = searchParams.get("end_date");
		const limit = parseInt(searchParams.get("limit") || "100");
		const offset = parseInt(searchParams.get("offset") || "0");

		let query = serviceSupabase
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
				shipping_city,
				shipping_state,
				shipping_country,
				created_at,
				updated_at,
				order_items (
					id,
					quantity,
					unit_price_cents,
					product:products (
						id,
						name
					)
				)
			`)
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (status) {
			query = query.eq("status", status);
		}

		if (paymentStatus) {
			query = query.eq("payment_status", paymentStatus);
		}

		if (startDate) {
			query = query.gte("created_at", startDate);
		}

		if (endDate) {
			query = query.lte("created_at", endDate);
		}

		const { data: orders, error } = await query;

		if (error) {
			console.error("[Admin Orders API] Error fetching orders:", {
				message: error.message,
				code: error.code,
				details: error.details,
				hint: error.hint,
			});
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		
		console.log("[Admin Orders API] Fetched orders:", {
			count: orders?.length || 0,
			filters: { status, paymentStatus, startDate, endDate },
		});

		// Get user emails for registered orders
		const userIds = (orders || [])
			.filter((o: any) => o.user_id)
			.map((o: any) => o.user_id);

		const userEmailsMap: Record<string, string> = {};
		if (userIds.length > 0) {
			const { data: usersList } = await serviceSupabase.auth.admin.listUsers();
			(usersList?.users || []).forEach((u) => {
				if (u.id && u.email) {
					userEmailsMap[u.id] = u.email;
				}
			});
		}

		// Add customer email to each order
		const ordersWithEmails = (orders || []).map((order: any) => ({
			...order,
			customer_email: order.user_id ? (userEmailsMap[order.user_id] || null) : order.guest_email,
		}));

		return NextResponse.json({
			orders: ordersWithEmails,
			total: ordersWithEmails.length,
			limit,
			offset,
		});
	} catch (error: any) {
		console.error("[Admin Orders API] Error:", error);
		return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
	}
}


