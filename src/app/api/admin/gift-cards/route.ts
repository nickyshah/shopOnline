import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST(req: Request) {
	try {
		const supabase = getSupabaseServiceClient();
		const body = await req.json();

		if (!body.code || !body.initial_amount_cents) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		// Check if gift card code already exists
		const { data: existing } = await supabase
			.from("gift_cards")
			.select("id")
			.eq("code", body.code.toUpperCase())
			.single();

		if (existing) {
			return NextResponse.json({ error: "Gift card code already exists" }, { status: 400 });
		}

		// Get current user (admin)
		const { data: auth } = await supabase.auth.getUser();

		const { data: giftCard, error } = await supabase
			.from("gift_cards")
			.insert({
				code: body.code.toUpperCase(),
				initial_amount_cents: body.initial_amount_cents,
				remaining_amount_cents: body.remaining_amount_cents || body.initial_amount_cents,
				valid_from: body.valid_from || new Date().toISOString(),
				valid_until: body.valid_until || null,
				active: body.active !== false,
				created_by: auth.user?.id || null,
			})
			.select()
			.single();

		if (error) {
			console.error("[Gift Cards API] Database error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true, giftCard }, { status: 201 });
	} catch (error: any) {
		console.error("[Gift Cards API] Unexpected error:", error);
		return NextResponse.json({ error: error.message || "Failed to create gift card" }, { status: 500 });
	}
}

export async function GET() {
	try {
		const supabase = getSupabaseServiceClient();
		const { data: giftCards, error } = await supabase
			.from("gift_cards")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ giftCards });
	} catch (error: any) {
		return NextResponse.json({ error: error.message || "Failed to fetch gift cards" }, { status: 500 });
	}
}

