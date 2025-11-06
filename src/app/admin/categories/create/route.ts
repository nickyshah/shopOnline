import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST(req: Request) {
	try {
		const supabase = getSupabaseServiceClient();
		const body = await req.json();
		const { name, slug, description } = body;

		if (!name || !slug) {
			return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
		}

		const { data, error } = await supabase
			.from("categories")
			.insert({
				name,
				slug,
				description: description || null,
			})
			.select()
			.single();

		if (error) {
			console.error("[Categories] Error creating category:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true, data }, { status: 201 });
	} catch (error: any) {
		console.error("[Categories] Unexpected error:", error);
		return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
	}
}

