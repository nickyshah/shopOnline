import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import Stripe from "stripe";

export async function POST(req: Request) {
	try {
		const supabase = getSupabaseServiceClient();
		const body = await req.json();

		// Validate required fields
		if (!body.code || !body.discount_type || !body.discount_value) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		// Check if coupon code already exists
		const { data: existing } = await supabase
			.from("coupons")
			.select("id")
			.eq("code", body.code.toUpperCase())
			.single();

		if (existing) {
			return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
		}

		// Create Stripe coupon if Stripe is configured
		let stripeCouponId: string | null = null;
		if (process.env.STRIPE_SECRET_KEY) {
			try {
				const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
					apiVersion: "2025-10-29.clover",
				});

				const stripeCouponParams: Stripe.CouponCreateParams = {
					id: body.code.toUpperCase(),
					name: body.description || body.code,
				};

				if (body.discount_type === "percentage") {
					stripeCouponParams.percent_off = body.discount_value;
					if (body.maximum_discount_cents) {
						// Stripe doesn't support max discount directly, but we'll handle it in our logic
						// We'll store it in metadata
						stripeCouponParams.metadata = {
							max_discount_cents: body.maximum_discount_cents.toString(),
						};
					}
				} else {
					stripeCouponParams.amount_off = body.discount_value;
					stripeCouponParams.currency = "usd";
				}

				if (body.usage_limit) {
					stripeCouponParams.max_redemptions = body.usage_limit;
				}

				if (body.valid_until) {
					stripeCouponParams.redeem_by = Math.floor(new Date(body.valid_until).getTime() / 1000);
				}

				const stripeCoupon = await stripe.coupons.create(stripeCouponParams);
				stripeCouponId = stripeCoupon.id;
			} catch (stripeError: any) {
				console.error("[Coupons API] Stripe coupon creation error:", stripeError);
				// Continue without Stripe coupon if it fails
				// We can still use the coupon in our system
			}
		}

		// Insert coupon into database
		const { data: coupon, error } = await supabase
			.from("coupons")
			.insert({
				code: body.code.toUpperCase(),
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
				stripe_coupon_id: stripeCouponId,
			})
			.select()
			.single();

		if (error) {
			console.error("[Coupons API] Database error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true, coupon }, { status: 201 });
	} catch (error: any) {
		console.error("[Coupons API] Unexpected error:", error);
		return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 });
	}
}

export async function GET() {
	try {
		const supabase = getSupabaseServiceClient();
		const { data: coupons, error } = await supabase
			.from("coupons")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ coupons });
	} catch (error: any) {
		return NextResponse.json({ error: error.message || "Failed to fetch coupons" }, { status: 500 });
	}
}

