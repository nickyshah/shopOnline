import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
	try {
		const supabase = await getSupabaseServerClient();
		const { data: auth } = await supabase.auth.getUser();
		const body = await req.json();
		const { code, cartItems } = body;

		if (!code) {
			return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
		}

		// Get coupon
		const { data: coupon, error: couponError } = await supabase
			.from("coupons")
			.select("*")
			.eq("code", code.toUpperCase().trim())
			.single();

		if (couponError || !coupon) {
			return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
		}

		// Check if active
		if (!coupon.active) {
			return NextResponse.json({ error: "This coupon is not active" }, { status: 400 });
		}

		// Check validity dates
		const now = new Date();
		if (coupon.valid_from && new Date(coupon.valid_from) > now) {
			return NextResponse.json({ error: "This coupon is not yet valid" }, { status: 400 });
		}
		if (coupon.valid_until && new Date(coupon.valid_until) < now) {
			return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
		}

		// Check usage limit
		if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
			return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
		}

		// Check if user has already used it (if user is logged in)
		if (auth.user && coupon.user_limit) {
			const { count } = await supabase
				.from("coupon_usage")
				.select("*", { count: "exact", head: true })
				.eq("coupon_id", coupon.id)
				.eq("user_id", auth.user.id);

			if (count && count >= coupon.user_limit) {
				return NextResponse.json({ error: "You have already used this coupon" }, { status: 400 });
			}
		}

		// Check first-time customer only
		if (coupon.first_time_customer_only && auth.user) {
			const { count } = await supabase
				.from("orders")
				.select("*", { count: "exact", head: true })
				.eq("user_id", auth.user.id);

			if (count && count > 0) {
				return NextResponse.json({ error: "This coupon is only for first-time customers" }, { status: 400 });
			}
		}

		// Calculate cart total
		let cartTotal = 0;
		if (cartItems && Array.isArray(cartItems)) {
			cartTotal = cartItems.reduce((sum: number, item: any) => {
				return sum + (item.product?.price_cents || 0) * (item.quantity || 0);
			}, 0);
		}

		// Check minimum purchase
		if (coupon.minimum_purchase_cents && cartTotal < coupon.minimum_purchase_cents) {
			return NextResponse.json(
				{
					error: `Minimum purchase of $${(coupon.minimum_purchase_cents / 100).toFixed(2)} required`,
				},
				{ status: 400 }
			);
		}

		// Check if applies to cart items and calculate applicable total
		let applicableTotal = cartTotal;
		if (coupon.applies_to !== "all" && cartItems && Array.isArray(cartItems)) {
			const applicableItems = cartItems.filter((item: any) => {
				if (coupon.applies_to === "products") {
					return coupon.applies_to_ids?.includes(item.product?.id);
				} else if (coupon.applies_to === "categories") {
					return coupon.applies_to_ids?.includes(item.product?.category_id);
				}
				return false;
			});

			if (applicableItems.length === 0) {
				return NextResponse.json(
					{ error: "This coupon does not apply to items in your cart" },
					{ status: 400 }
				);
			}

			// Calculate total from applicable items only
			applicableTotal = applicableItems.reduce((sum: number, item: any) => {
				return sum + (item.product?.price_cents || 0) * (item.quantity || 0);
			}, 0);
		}

		// Calculate discount based on applicable total
		let discountAmount = 0;
		if (coupon.discount_type === "percentage") {
			discountAmount = Math.round((applicableTotal * coupon.discount_value) / 100);
			if (coupon.maximum_discount_cents) {
				discountAmount = Math.min(discountAmount, coupon.maximum_discount_cents);
			}
		} else {
			discountAmount = coupon.discount_value;
		}
		
		// Ensure discount doesn't exceed applicable total
		discountAmount = Math.min(discountAmount, applicableTotal);

		return NextResponse.json({
			valid: true,
			coupon: {
				id: coupon.id,
				code: coupon.code,
				description: coupon.description,
				discount_type: coupon.discount_type,
				discount_value: coupon.discount_value,
				discount_amount: discountAmount,
			},
		});
	} catch (error: any) {
		console.error("[Validate Coupon] Error:", error);
		return NextResponse.json({ error: error.message || "Failed to validate coupon" }, { status: 500 });
	}
}

