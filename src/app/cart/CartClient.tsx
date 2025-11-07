"use client";

import { useState } from "react";
import CheckoutButton from "../components/CheckoutButton";
import CouponGiftCardInput from "../components/CouponGiftCardInput";

type CartClientProps = {
	items: any[];
	totalCents: number;
};

export default function CartClient({ items, totalCents: initialTotalCents }: CartClientProps) {
	const [totalCents, setTotalCents] = useState(initialTotalCents);
	const [couponId, setCouponId] = useState<string | undefined>();
	const [giftCardId, setGiftCardId] = useState<string | undefined>();
	const [discountAmount, setDiscountAmount] = useState(0);
	const [giftCardAmount, setGiftCardAmount] = useState(0);
	const [appliedGiftCard, setAppliedGiftCard] = useState<any>(null);

	const handleCouponApplied = (coupon: any) => {
		setCouponId(coupon.id);
		const newDiscount = coupon.discount_amount || 0;
		setDiscountAmount(newDiscount);
		// Recalculate gift card amount if one is applied
		if (giftCardId && appliedGiftCard) {
			const remainingAfterCoupon = initialTotalCents - newDiscount;
			const newGiftCardAmount = Math.min(appliedGiftCard.remaining_amount_cents, remainingAfterCoupon);
			setGiftCardAmount(newGiftCardAmount);
			updateTotal(initialTotalCents, newDiscount, newGiftCardAmount);
		} else {
			updateTotal(initialTotalCents, newDiscount, giftCardAmount);
		}
	};

	const handleGiftCardApplied = (giftCard: any) => {
		setGiftCardId(giftCard.id);
		setAppliedGiftCard(giftCard);
		const remainingAfterCoupon = initialTotalCents - discountAmount;
		const maxGiftCardAmount = Math.min(giftCard.remaining_amount_cents, remainingAfterCoupon);
		setGiftCardAmount(maxGiftCardAmount);
		updateTotal(initialTotalCents, discountAmount, maxGiftCardAmount);
	};

	const handleCouponRemoved = () => {
		setCouponId(undefined);
		setDiscountAmount(0);
		// Recalculate gift card amount if one is applied
		if (giftCardId && appliedGiftCard) {
			const newGiftCardAmount = Math.min(appliedGiftCard.remaining_amount_cents, initialTotalCents);
			setGiftCardAmount(newGiftCardAmount);
			updateTotal(initialTotalCents, 0, newGiftCardAmount);
		} else {
			updateTotal(initialTotalCents, 0, giftCardAmount);
		}
	};

	const handleGiftCardRemoved = () => {
		setGiftCardId(undefined);
		setAppliedGiftCard(null);
		setGiftCardAmount(0);
		updateTotal(initialTotalCents, discountAmount, 0);
	};

	const updateTotal = (base: number, discount: number, giftCard: number) => {
		const newTotal = Math.max(0, base - discount - giftCard);
		setTotalCents(newTotal);
	};

	const subtotal = initialTotalCents;
	const finalTotal = Math.max(0, subtotal - discountAmount - giftCardAmount);

	return (
		<>
			{/* Cart Items */}
			<div className="space-y-4 mb-8">
				{items.map((it: any) => (
					<div
						key={it.id}
						className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 flex items-center justify-between hover:shadow-2xl transition-all duration-300"
					>
						<div className="flex items-center gap-4 flex-1">
							{it.product.image_url && (
								<img
									src={it.product.image_url}
									alt={it.product.name}
									className="w-20 h-20 object-cover rounded-xl"
								/>
							)}
							<div className="flex-1">
								<div className="font-bold text-lg text-gray-900 dark:text-white mb-1">
									{it.product.name}
								</div>
								<div className="text-sm text-gray-600 dark:text-gray-400">
									Quantity: {it.quantity}
								</div>
							</div>
						</div>
						<div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
							${((it.product.price_cents * it.quantity) / 100).toFixed(2)}
						</div>
					</div>
				))}
			</div>

			{/* Total and Checkout */}
			<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl p-8">
				{/* Coupon and Gift Card Input */}
				<CouponGiftCardInput
					cartItems={items}
					onCouponApplied={handleCouponApplied}
					onGiftCardApplied={handleGiftCardApplied}
					onCouponRemoved={handleCouponRemoved}
					onGiftCardRemoved={handleGiftCardRemoved}
				/>

				{/* Price Breakdown */}
				<div className="space-y-2 mb-6 border-t border-white/20 dark:border-white/10 pt-4">
					<div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
						<span>Subtotal</span>
						<span>${(subtotal / 100).toFixed(2)}</span>
					</div>
					{discountAmount > 0 && (
						<div className="flex items-center justify-between text-green-600 dark:text-green-400">
							<span>Discount</span>
							<span>-${(discountAmount / 100).toFixed(2)}</span>
						</div>
					)}
					{giftCardAmount > 0 && (
						<div className="flex items-center justify-between text-green-600 dark:text-green-400">
							<span>Gift Card</span>
							<span>-${(giftCardAmount / 100).toFixed(2)}</span>
						</div>
					)}
				</div>

				<div className="flex items-center justify-between mb-6">
					<div className="text-2xl font-bold text-gray-900 dark:text-white">Total</div>
					<div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
						${(finalTotal / 100).toFixed(2)}
					</div>
				</div>
				<CheckoutButton couponId={couponId} giftCardId={giftCardId} />
			</div>
		</>
	);
}

