import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

type Props = {
	params: Promise<{ id: string }>;
};

// PUT /api/admin/categories/[id] - Update category
export async function PUT(req: Request, props: Props) {
	try {
		const { id } = await props.params;
		const supabase = getSupabaseServiceClient();
		const body = await req.json();
		const { name, slug, description } = body;

		if (!name || !slug) {
			return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
		}

		const { data, error } = await supabase
			.from("categories")
			.update({
				name,
				slug,
				description: description || null,
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("[Categories API] Error updating category:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true, data });
	} catch (error: any) {
		console.error("[Categories API] Unexpected error:", error);
		return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
	}
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(req: Request, props: Props) {
	try {
		const { id } = await props.params;
		const supabase = getSupabaseServiceClient();

		const { error } = await supabase
			.from("categories")
			.delete()
			.eq("id", id);

		if (error) {
			console.error("[Categories API] Error deleting category:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error("[Categories API] Unexpected error:", error);
		return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
	}
}

