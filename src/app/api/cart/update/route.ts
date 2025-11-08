import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateCartSessionId } from "@/lib/cart";

export async function POST(req: Request) {
	try {
		const supabase = await getSupabaseServerClient();
		const { data: auth } = await supabase.auth.getUser();
		const user = auth.user;

		const body = await req.json();
		const { cart_item_id, quantity } = body;

		if (!cart_item_id || !Number.isFinite(quantity) || quantity <= 0) {
			return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
		}

		let cartId: string | null = null;
		if (user) {
			// Authenticated user
			const { data: cart } = await supabase
				.from("carts")
				.select("id")
				.eq("user_id", user.id)
				.maybeSingle();
			cartId = cart?.id || null;
		} else {
			// Guest user
			const sessionId = await getOrCreateCartSessionId();
			const { data: cart } = await supabase
				.from("carts")
				.select("id")
				.eq("session_id", sessionId)
				.maybeSingle();
			cartId = cart?.id || null;
		}

		if (!cartId) {
			return NextResponse.json({ error: "Cart not found" }, { status: 404 });
		}

		// Verify the cart item belongs to this cart
		const { data: cartItem, error: fetchError } = await supabase
			.from("cart_items")
			.select("id, cart_id")
			.eq("id", cart_item_id)
			.eq("cart_id", cartId)
			.single();

		if (fetchError || !cartItem) {
			return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
		}

		// Update the quantity
		const { error: updateError } = await supabase
			.from("cart_items")
			.update({ quantity })
			.eq("id", cart_item_id);

		if (updateError) {
			console.error("[Cart Update] Error updating cart item:", updateError);
			return NextResponse.json({ error: updateError.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error("[Cart Update] Unexpected error:", error);
		return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
	}
}

