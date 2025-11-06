"use server";

import { cookies } from "next/headers";

function generateSessionId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
}

// Read-only version for Server Components
export async function getCartSessionId(): Promise<string | null> {
	const cookieStore = await cookies();
	const existing = cookieStore.get("cart_session_id");
	return existing?.value || null;
}

// For Route Handlers - can modify cookies
export async function getOrCreateCartSessionId(): Promise<string> {
	const cookieStore = await cookies();
	const existing = cookieStore.get("cart_session_id");
	if (existing?.value) {
		return existing.value;
	}
	const sessionId = generateSessionId();
	cookieStore.set("cart_session_id", sessionId, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 30, // 30 days
	});
	return sessionId;
}

