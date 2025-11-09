import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import Stripe from "stripe";

/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter and generate a 10% discount code
 */
export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { email } = body;

		if (!email || !/\S+@\S+\.\S+/.test(email)) {
			return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
		}

		const supabase = getSupabaseServiceClient();

		// Check if email is already subscribed
		const { data: existing } = await supabase
			.from("newsletter_subscriptions")
			.select("id, discount_code, active")
			.eq("email", email.toLowerCase())
			.maybeSingle();

		if (existing) {
			if (existing.active && existing.discount_code) {
				// Already subscribed, return existing code
				return NextResponse.json({
					success: true,
					discount_code: existing.discount_code,
					message: "You're already subscribed!",
				});
			} else {
				// Resubscribe - generate new code
				let discountCode: string;
				try {
					const { data: generatedCode, error: rpcError } = await supabase.rpc("generate_newsletter_discount_code");
					if (rpcError || !generatedCode) {
						discountCode = `WELCOME${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
					} else {
						discountCode = generatedCode;
					}
				} catch (error) {
					discountCode = `WELCOME${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
				}

				// Ensure code is unique
				let attempts = 0;
				while (attempts < 10) {
					const { data: existingCoupon } = await supabase
						.from("coupons")
						.select("id")
						.eq("code", discountCode)
						.maybeSingle();
					
					if (!existingCoupon) {
						break;
					}
					
					discountCode = `WELCOME${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
					attempts++;
				}

				// Create coupon
				await createNewsletterCoupon(discountCode);

				// Update subscription
				await supabase
					.from("newsletter_subscriptions")
					.update({
						active: true,
						discount_code: discountCode,
						subscribed_at: new Date().toISOString(),
						unsubscribed_at: null,
					})
					.eq("id", existing.id);

				return NextResponse.json({
					success: true,
					discount_code: discountCode,
				});
			}
		}

		// Generate unique discount code
		let discountCode: string;
		try {
			const { data: generatedCode, error: rpcError } = await supabase.rpc("generate_newsletter_discount_code");
			if (rpcError || !generatedCode) {
				// Fallback: generate a random code
				discountCode = `WELCOME${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
			} else {
				discountCode = generatedCode;
			}
		} catch (error) {
			// Fallback: generate a random code
			discountCode = `WELCOME${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
		}

		// Ensure code is unique
		let attempts = 0;
		while (attempts < 10) {
			const { data: existingCoupon } = await supabase
				.from("coupons")
				.select("id")
				.eq("code", discountCode)
				.maybeSingle();
			
			if (!existingCoupon) {
				break; // Code is unique
			}
			
			// Generate new code
			discountCode = `WELCOME${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
			attempts++;
		}

		// Create the 10% discount coupon
		await createNewsletterCoupon(discountCode);

		// Insert subscription
		const { data: subscription, error } = await supabase
			.from("newsletter_subscriptions")
			.insert({
				email: email.toLowerCase(),
				discount_code: discountCode,
				active: true,
			})
			.select("id, discount_code")
			.single();

		if (error) {
			console.error("[Newsletter] Error creating subscription:", error);
			return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
		}

		return NextResponse.json({
			success: true,
			discount_code: subscription.discount_code,
		});
	} catch (error: any) {
		console.error("[Newsletter] Unexpected error:", error);
		return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
	}
}

/**
 * Helper function to create a 10% discount coupon
 */
async function createNewsletterCoupon(code: string): Promise<void> {
	const supabase = getSupabaseServiceClient();

	// Check if coupon already exists
	const { data: existingCoupon } = await supabase
		.from("coupons")
		.select("id")
		.eq("code", code)
		.maybeSingle();

	if (existingCoupon) {
		console.log("[Newsletter] Coupon already exists:", code);
		return;
	}

	// Create Stripe coupon if Stripe is configured
	let stripeCouponId: string | null = null;
	if (process.env.STRIPE_SECRET_KEY) {
		try {
			const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
				apiVersion: "2025-10-29.clover",
			});

			const stripeCoupon = await stripe.coupons.create({
				id: code,
				name: "Newsletter Welcome Discount",
				percent_off: 10,
			});

			stripeCouponId = stripeCoupon.id;
		} catch (stripeError: any) {
			console.error("[Newsletter] Stripe coupon creation error:", stripeError);
			// Continue without Stripe coupon
		}
	}

	// Create coupon in database
	const { error: couponError } = await supabase.from("coupons").insert({
		code: code,
		description: "10% off your first order - Newsletter subscription",
		discount_type: "percentage",
		discount_value: 10, // 10%
		minimum_purchase_cents: 0,
		usage_limit: 1, // One-time use per user
		user_limit: 1, // Each user can use it once
		active: true,
		applies_to: "all",
		first_time_customer_only: false,
		stripe_coupon_id: stripeCouponId,
		valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 90 days
	});

	if (couponError) {
		console.error("[Newsletter] Error creating coupon:", couponError);
		// Don't fail the subscription if coupon creation fails
	}
}

