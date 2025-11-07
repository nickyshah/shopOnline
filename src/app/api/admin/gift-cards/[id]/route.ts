import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

type Props = { params: Promise<{ id: string }> };

export async function PUT(req: Request, props: Props) {
	try {
		const { id } = await props.params;
		const supabase = getSupabaseServiceClient();
		const body = await req.json();

		const { data: giftCard, error } = await supabase
			.from("gift_cards")
			.update({
				valid_from: body.valid_from || new Date().toISOString(),
				valid_until: body.valid_until || null,
				active: body.active !== false,
				// Note: We don't update initial_amount_cents or remaining_amount_cents here
				// Those should be managed through transactions
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true, giftCard });
	} catch (error: any) {
		return NextResponse.json({ error: error.message || "Failed to update gift card" }, { status: 500 });
	}
}

export async function DELETE(req: Request, props: Props) {
	try {
		const { id } = await props.params;
		const supabase = getSupabaseServiceClient();

		const { error } = await supabase.from("gift_cards").delete().eq("id", id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json({ error: error.message || "Failed to delete gift card" }, { status: 500 });
	}
}

