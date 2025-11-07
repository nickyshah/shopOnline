"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type CouponGiftCardInputProps = {
	cartItems: any[];
	onCouponApplied: (coupon: any) => void;
	onGiftCardApplied: (giftCard: any) => void;
	onCouponRemoved: () => void;
	onGiftCardRemoved: () => void;
};

export default function CouponGiftCardInput({
	cartItems,
	onCouponApplied,
	onGiftCardApplied,
	onCouponRemoved,
	onGiftCardRemoved,
}: CouponGiftCardInputProps) {
	const [couponCode, setCouponCode] = useState("");
	const [giftCardCode, setGiftCardCode] = useState("");
	const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
	const [appliedGiftCard, setAppliedGiftCard] = useState<any>(null);
	const [loading, setLoading] = useState(false);

	// Expose applied coupon/gift card state to parent via callbacks
	const applyCoupon = (coupon: any) => {
		setAppliedCoupon(coupon);
		onCouponApplied(coupon);
	};

	const applyGiftCard = (giftCard: any) => {
		setAppliedGiftCard(giftCard);
		onGiftCardApplied(giftCard);
	};

	const removeCoupon = () => {
		setAppliedCoupon(null);
		onCouponRemoved();
	};

	const removeGiftCard = () => {
		setAppliedGiftCard(null);
		onGiftCardRemoved();
	};

	const handleApplyCoupon = async () => {
		if (!couponCode.trim()) {
			toast.error("Please enter a coupon code");
			return;
		}

		setLoading(true);
		try {
			const response = await fetch("/api/coupons/validate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					code: couponCode,
					cartItems: cartItems.map((item: any) => ({
						product: {
							id: item.product?.id,
							price_cents: item.product?.price_cents,
							category_id: item.product?.category_id,
						},
						quantity: item.quantity,
					})),
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to validate coupon");
			}

			if (data.valid && data.coupon) {
				applyCoupon(data.coupon);
				toast.success("Coupon applied successfully!");
				setCouponCode("");
			}
		} catch (error: any) {
			toast.error(error.message || "Failed to apply coupon");
		} finally {
			setLoading(false);
		}
	};

	const handleApplyGiftCard = async () => {
		if (!giftCardCode.trim()) {
			toast.error("Please enter a gift card code");
			return;
		}

		setLoading(true);
		try {
			const response = await fetch("/api/gift-cards/validate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code: giftCardCode }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to validate gift card");
			}

			if (data.valid) {
				applyGiftCard(data.giftCard);
				toast.success("Gift card applied successfully!");
				setGiftCardCode("");
			}
		} catch (error: any) {
			toast.error(error.message || "Failed to apply gift card");
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveCoupon = () => {
		removeCoupon();
		toast.success("Coupon removed");
	};

	const handleRemoveGiftCard = () => {
		removeGiftCard();
		toast.success("Gift card removed");
	};

	return (
		<div className="space-y-4 mb-6">
			{/* Coupon Input */}
			<div>
				<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
					Have a coupon code?
				</label>
				{appliedCoupon ? (
					<div className="flex items-center justify-between px-4 py-3 bg-green-500/20 dark:bg-green-500/10 rounded-xl border border-green-300 dark:border-green-700">
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
							<span className="text-sm font-medium text-gray-900 dark:text-white">
								{appliedCoupon.code} - {appliedCoupon.description || "Applied"}
							</span>
						</div>
						<button
							type="button"
							onClick={handleRemoveCoupon}
							className="text-sm text-red-600 dark:text-red-400 hover:underline"
						>
							Remove
						</button>
					</div>
				) : (
					<div className="flex gap-2">
						<input
							type="text"
							value={couponCode}
							onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
							placeholder="Enter coupon code"
							className="flex-1 px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
							disabled={loading}
						/>
						<button
							type="button"
							onClick={handleApplyCoupon}
							disabled={loading || !couponCode.trim()}
							className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Apply
						</button>
					</div>
				)}
			</div>

			{/* Gift Card Input */}
			<div>
				<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
					Have a gift card?
				</label>
				{appliedGiftCard ? (
					<div className="flex items-center justify-between px-4 py-3 bg-green-500/20 dark:bg-green-500/10 rounded-xl border border-green-300 dark:border-green-700">
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
							<span className="text-sm font-medium text-gray-900 dark:text-white">
								Gift Card: ${(appliedGiftCard.remaining_amount_cents / 100).toFixed(2)} remaining
							</span>
						</div>
						<button
							type="button"
							onClick={handleRemoveGiftCard}
							className="text-sm text-red-600 dark:text-red-400 hover:underline"
						>
							Remove
						</button>
					</div>
				) : (
					<div className="flex gap-2">
						<input
							type="text"
							value={giftCardCode}
							onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
							placeholder="Enter gift card code"
							className="flex-1 px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
							disabled={loading}
						/>
						<button
							type="button"
							onClick={handleApplyGiftCard}
							disabled={loading || !giftCardCode.trim()}
							className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Apply
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

