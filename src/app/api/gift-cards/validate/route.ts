import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
	try {
		const supabase = await getSupabaseServerClient();
		const body = await req.json();
		const { code } = body;

		if (!code) {
			return NextResponse.json({ error: "Gift card code is required" }, { status: 400 });
		}

		// Get gift card
		const { data: giftCard, error: giftCardError } = await supabase
			.from("gift_cards")
			.select("*")
			.eq("code", code.toUpperCase().trim())
			.single();

		if (giftCardError || !giftCard) {
			return NextResponse.json({ error: "Invalid gift card code" }, { status: 404 });
		}

		// Check if active
		if (!giftCard.active) {
			return NextResponse.json({ error: "This gift card is not active" }, { status: 400 });
		}

		// Check validity dates
		const now = new Date();
		if (giftCard.valid_from && new Date(giftCard.valid_from) > now) {
			return NextResponse.json({ error: "This gift card is not yet valid" }, { status: 400 });
		}
		if (giftCard.valid_until && new Date(giftCard.valid_until) < now) {
			return NextResponse.json({ error: "This gift card has expired" }, { status: 400 });
		}

		// Check balance
		if (giftCard.remaining_amount_cents <= 0) {
			return NextResponse.json({ error: "This gift card has no remaining balance" }, { status: 400 });
		}

		return NextResponse.json({
			valid: true,
			giftCard: {
				id: giftCard.id,
				code: giftCard.code,
				remaining_amount_cents: giftCard.remaining_amount_cents,
			},
		});
	} catch (error: any) {
		console.error("[Validate Gift Card] Error:", error);
		return NextResponse.json({ error: error.message || "Failed to validate gift card" }, { status: 500 });
	}
}

