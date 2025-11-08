import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

/**
 * Debug endpoint to check if orders exist in the database
 * This bypasses RLS using the service client
 */
export async function GET() {
	try {
		const supabase = getSupabaseServiceClient();
		
		// Get all orders directly
		const { data: orders, error } = await supabase
			.from("orders")
			.select("*")
			.order("created_at", { ascending: false })
			.limit(10);

		if (error) {
			return NextResponse.json({
				error: error.message,
				code: error.code,
				details: error.details,
				hint: error.hint,
			}, { status: 500 });
		}

		return NextResponse.json({
			count: orders?.length || 0,
			orders: orders || [],
		});
	} catch (error: any) {
		return NextResponse.json({
			error: error.message || "Unknown error",
			stack: error.stack,
		}, { status: 500 });
	}
}

