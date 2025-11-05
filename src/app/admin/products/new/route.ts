import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
	const supabase = await getSupabaseServerClient();
	const form = await req.formData();
	const name = String(form.get("name") || "");
	const price_cents = Number(form.get("price_cents"));
	if (!name || !Number.isFinite(price_cents) || price_cents < 0) {
		return NextResponse.json({ error: "Invalid data" }, { status: 400 });
	}
	await supabase.from("products").insert({ name, price_cents });
	return NextResponse.redirect(new URL("/admin/products", req.url));
}


