import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export async function POST(req: Request, props: Props) {
	const { id } = await props.params;
	const supabase = await getSupabaseServerClient();
	const { data: product } = await supabase
		.from("products")
		.select("id, active")
		.eq("id", id)
		.single();
	if (!product) return NextResponse.redirect(new URL("/admin/products", req.url));
	await supabase.from("products").update({ active: !product.active }).eq("id", id);
	return NextResponse.redirect(new URL("/admin/products", req.url));
}


