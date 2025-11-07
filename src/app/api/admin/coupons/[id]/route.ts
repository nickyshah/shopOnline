import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import Stripe from "stripe";

type Props = { params: Promise<{ id: string }> };

export async function PUT(req: Request, props: Props) {
	try {
		const { id } = await props.params;
		const supabase = getSupabaseServiceClient();
		const body = await req.json();

		// Get existing coupon to check for Stripe coupon
		const { data: existing } = await supabase.from("coupons").select("stripe_coupon_id").eq("id", id).single();

		// Update Stripe coupon if it exists
		if (existing?.stripe_coupon_id && process.env.STRIPE_SECRET_KEY) {
			try {
				const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
					apiVersion: "2025-10-29.clover",
				});

				// Note: Stripe doesn't allow updating coupons, so we may need to delete and recreate
				// For now, we'll just update our database and handle Stripe separately if needed
			} catch (stripeError: any) {
				console.error("[Coupons API] Stripe update error:", stripeError);
			}
		}

		const { data: coupon, error } = await supabase
			.from("coupons")
			.update({
				description: body.description || null,
				discount_type: body.discount_type,
				discount_value: body.discount_value,
				minimum_purchase_cents: body.minimum_purchase_cents || 0,
				maximum_discount_cents: body.maximum_discount_cents || null,
				usage_limit: body.usage_limit || null,
				user_limit: body.user_limit || 1,
				valid_from: body.valid_from || new Date().toISOString(),
				valid_until: body.valid_until || null,
				active: body.active !== false,
				applies_to: body.applies_to || "all",
				applies_to_ids: body.applies_to_ids || [],
				first_time_customer_only: body.first_time_customer_only || false,
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true, coupon });
	} catch (error: any) {
		return NextResponse.json({ error: error.message || "Failed to update coupon" }, { status: 500 });
	}
}

export async function DELETE(req: Request, props: Props) {
	try {
		const { id } = await props.params;
		const supabase = getSupabaseServiceClient();

		// Get coupon to check for Stripe coupon
		const { data: coupon } = await supabase.from("coupons").select("stripe_coupon_id").eq("id", id).single();

		// Delete Stripe coupon if it exists
		if (coupon?.stripe_coupon_id && process.env.STRIPE_SECRET_KEY) {
			try {
				const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
					apiVersion: "2025-10-29.clover",
				});
				await stripe.coupons.del(coupon.stripe_coupon_id);
			} catch (stripeError: any) {
				console.error("[Coupons API] Stripe delete error:", stripeError);
				// Continue with database deletion even if Stripe deletion fails
			}
		}

		const { error } = await supabase.from("coupons").delete().eq("id", id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json({ error: error.message || "Failed to delete coupon" }, { status: 500 });
	}
}

