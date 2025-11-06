import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

type Props = {
	params: Promise<{ id: string }>;
};

export async function POST(req: Request, props: Props) {
	try {
		const { id } = await props.params;
		const supabase = getSupabaseServiceClient();

		const { error } = await supabase
			.from("products")
			.delete()
			.eq("id", id);

		if (error) {
			console.error("[Products] Error deleting product:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.redirect(new URL("/admin/products", req.url));
	} catch (error: any) {
		console.error("[Products] Unexpected error:", error);
		return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
	}
}

