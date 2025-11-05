import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
	const supabase = await getSupabaseServerClient();
	const { data: auth } = await supabase.auth.getUser();
	const user = auth.user;
	if (!user) {
		return NextResponse.redirect(new URL("/login", req.url));
	}

	const formData = await req.formData();
	const productId = String(formData.get("product_id"));
	const quantity = Number(formData.get("quantity") ?? 1);
	if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
		return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
	}

	// ensure cart exists
	await supabase.from("carts").upsert({ user_id: user.id });
	// add or update cart item
	const { data: existing } = await supabase
		.from("cart_items")
		.select("id, quantity")
		.eq("cart_user_id", user.id)
		.eq("product_id", productId)
		.maybeSingle();

	if (existing) {
		await supabase
			.from("cart_items")
			.update({ quantity: existing.quantity + quantity })
			.eq("id", existing.id);
	} else {
		await supabase
			.from("cart_items")
			.insert({ cart_user_id: user.id, product_id: productId, quantity });
	}

	return NextResponse.redirect(new URL("/cart", req.url));
}


