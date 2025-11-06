"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCartSessionId } from "@/lib/cart";

export async function signOutAction() {
	const supabase = await getSupabaseServerClient();
	await supabase.auth.signOut();
	redirect("/");
}

export async function getSessionUser() {
	const supabase = await getSupabaseServerClient();
	const { data } = await supabase.auth.getUser();
	return data.user;
}

export async function getCartItemCount(): Promise<number> {
	const supabase = await getSupabaseServerClient();
	const { data: auth } = await supabase.auth.getUser();
	const user = auth.user;

	let items: any[] = [];
	if (user) {
		// Authenticated user
		const { data: cart } = await supabase
			.from("carts")
			.select("id")
			.eq("user_id", user.id)
			.maybeSingle();
		
		if (cart) {
			const { data } = await supabase
				.from("cart_items")
				.select("quantity")
				.eq("cart_id", cart.id);
			items = data || [];
		}
	} else {
		// Guest user
		const sessionId = await getCartSessionId();
		if (sessionId) {
			const { data: cart } = await supabase
				.from("carts")
				.select("id")
				.eq("session_id", sessionId)
				.maybeSingle();
			
			if (cart) {
				const { data } = await supabase
					.from("cart_items")
					.select("quantity")
					.eq("cart_id", cart.id);
				items = data || [];
			}
		}
	}

	// Sum up all quantities
	return items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
}

export async function getCurrentUserInfo() {
	const supabase = await getSupabaseServerClient();
	const { data: auth } = await supabase.auth.getUser();
	
	if (!auth.user) {
		return {
			loggedIn: false,
			email: null,
			role: null,
			isAdmin: false,
		};
	}

	// Get user profile to check role
	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", auth.user.id)
		.single();

	return {
		loggedIn: true,
		email: auth.user.email,
		userId: auth.user.id,
		role: profile?.role || "customer",
		isAdmin: profile?.role === "admin",
		isAdminEmail: auth.user.email === "admin@rawnode.com",
	};
}


