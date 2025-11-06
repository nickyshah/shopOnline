import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

type Props = {
	params: Promise<{ id: string }>;
};

// PATCH /api/admin/products/[id]/toggle - Toggle product active status
export async function PATCH(req: Request, props: Props) {
	try {
		const { id } = await props.params;
		const supabase = getSupabaseServiceClient();

		// Get current product status
		const { data: product, error: fetchError } = await supabase
			.from("products")
			.select("id, active")
			.eq("id", id)
			.single();

		if (fetchError || !product) {
			return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		// Toggle active status
		const { data, error } = await supabase
			.from("products")
			.update({ active: !product.active })
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("[Products API] Error toggling product:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true, data });
	} catch (error: any) {
		console.error("[Products API] Unexpected error:", error);
		return NextResponse.json({ error: error.message || "Failed to toggle product" }, { status: 500 });
	}
}

