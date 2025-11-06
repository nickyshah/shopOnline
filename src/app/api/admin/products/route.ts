import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

// POST /api/admin/products - Create product
export async function POST(req: Request) {
	try {
		const supabase = getSupabaseServiceClient();
		const form = await req.formData();
		const name = String(form.get("name") || "");
		const description = String(form.get("description") || "");
		const price_cents = Number(form.get("price_cents"));
		const category_id = String(form.get("category_id") || "");

		if (!name || !Number.isFinite(price_cents) || price_cents < 0) {
			return NextResponse.json({ error: "Invalid data" }, { status: 400 });
		}

		const productData: any = { name, price_cents };
		if (description) {
			productData.description = description;
		}
		if (category_id && category_id !== "none") {
			productData.category_id = category_id;
		}

		const { data, error } = await supabase
			.from("products")
			.insert(productData)
			.select()
			.single();

		if (error) {
			console.error("[Products API] Error creating product:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true, data }, { status: 201 });
	} catch (error: any) {
		console.error("[Products API] Unexpected error:", error);
		return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
	}
}

