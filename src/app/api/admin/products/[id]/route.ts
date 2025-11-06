import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

type Props = {
	params: Promise<{ id: string }>;
};

// PUT /api/admin/products/[id] - Update product
export async function PUT(req: Request, props: Props) {
	try {
		const { id } = await props.params;
		const supabase = getSupabaseServiceClient();
		const form = await req.formData();
		const name = String(form.get("name") || "");
		const description = String(form.get("description") || "");
		const price_cents = Number(form.get("price_cents"));
		const category_id = String(form.get("category_id") || "");

		if (!name || !Number.isFinite(price_cents) || price_cents < 0) {
			return NextResponse.json({ error: "Invalid data" }, { status: 400 });
		}

		const productData: any = {
			name,
			price_cents,
		};

		if (description) {
			productData.description = description;
		}

		if (category_id && category_id !== "none") {
			productData.category_id = category_id;
		} else {
			productData.category_id = null;
		}

		const { data, error } = await supabase
			.from("products")
			.update(productData)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("[Products API] Error updating product:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true, data });
	} catch (error: any) {
		console.error("[Products API] Unexpected error:", error);
		return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
	}
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(req: Request, props: Props) {
	try {
		const { id } = await props.params;
		const supabase = getSupabaseServiceClient();

		const { error } = await supabase
			.from("products")
			.delete()
			.eq("id", id);

		if (error) {
			console.error("[Products API] Error deleting product:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error("[Products API] Unexpected error:", error);
		return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
	}
}

