import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateCartSessionId } from "@/lib/cart";

export async function POST(req: Request) {
	const supabase = await getSupabaseServerClient();
	const { data: auth } = await supabase.auth.getUser();
	const user = auth.user;

	const formData = await req.formData();
	const productId = String(formData.get("product_id"));
	const quantity = Number(formData.get("quantity") ?? 1);
	if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
		return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
	}

	let cartId: string;
	if (user) {
		// Authenticated user - use user_id
		const { data: cart } = await supabase
			.from("carts")
			.select("id")
			.eq("user_id", user.id)
			.maybeSingle();
		
		if (cart) {
			cartId = cart.id;
		} else {
			const { data: newCart } = await supabase
				.from("carts")
				.insert({ user_id: user.id })
				.select("id")
				.single();
			cartId = newCart!.id;
		}
	} else {
		// Guest user - use session_id
		const sessionId = await getOrCreateCartSessionId();
		const { data: cart } = await supabase
			.from("carts")
			.select("id")
			.eq("session_id", sessionId)
			.maybeSingle();
		
		if (cart) {
			cartId = cart.id;
		} else {
			const { data: newCart } = await supabase
				.from("carts")
				.insert({ session_id: sessionId })
				.select("id")
				.single();
			cartId = newCart!.id;
		}
	}

	// Add or update cart item
	const { data: existing } = await supabase
		.from("cart_items")
		.select("id, quantity")
		.eq("cart_id", cartId)
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
			.insert({ cart_id: cartId, product_id: productId, quantity });
	}

	// Check if request is from API (has Accept header or explicit JSON) or form submission
	const acceptHeader = req.headers.get("accept");
	const contentType = req.headers.get("content-type");
	
	// If it's a fetch request (has Accept header) or explicitly JSON, return JSON
	if (acceptHeader?.includes("application/json") || contentType?.includes("application/json")) {
		return NextResponse.json({ success: true });
	}
	
	// Form submission - redirect
	return NextResponse.redirect(new URL("/cart", req.url));
}


