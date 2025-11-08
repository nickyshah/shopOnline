import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

// Test endpoint to verify orders exist and can be queried
export async function GET() {
	try {
		const supabase = getSupabaseServiceClient();
		
		// Try to get all orders
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
	} catch (e: any) {
		return NextResponse.json({ 
			error: e.message,
			stack: e.stack,
		}, { status: 500 });
	}
}

