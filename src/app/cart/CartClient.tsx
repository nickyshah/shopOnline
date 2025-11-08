"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CheckoutButton from "../components/CheckoutButton";
import CouponGiftCardInput from "../components/CouponGiftCardInput";

type CartClientProps = {
	items: any[];
	totalCents: number;
};

export default function CartClient({ items: initialItems, totalCents: initialTotalCents }: CartClientProps) {
	const router = useRouter();
	const [items, setItems] = useState(initialItems);
	const [totalCents, setTotalCents] = useState(initialTotalCents);
	const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
	const [couponId, setCouponId] = useState<string | undefined>();
	const [giftCardId, setGiftCardId] = useState<string | undefined>();
	const [discountAmount, setDiscountAmount] = useState(0);
	const [giftCardAmount, setGiftCardAmount] = useState(0);
	const [appliedGiftCard, setAppliedGiftCard] = useState<any>(null);

	const getCurrentSubtotal = () => {
		return items.reduce((sum: number, it: any) => sum + it.product.price_cents * it.quantity, 0);
	};

	const handleCouponApplied = (coupon: any) => {
		setCouponId(coupon.id);
		const newDiscount = coupon.discount_amount || 0;
		setDiscountAmount(newDiscount);
		const currentSubtotal = getCurrentSubtotal();
		// Recalculate gift card amount if one is applied
		if (giftCardId && appliedGiftCard) {
			const remainingAfterCoupon = currentSubtotal - newDiscount;
			const newGiftCardAmount = Math.min(appliedGiftCard.remaining_amount_cents, remainingAfterCoupon);
			setGiftCardAmount(newGiftCardAmount);
			updateTotal(currentSubtotal, newDiscount, newGiftCardAmount);
		} else {
			updateTotal(currentSubtotal, newDiscount, giftCardAmount);
		}
	};

	const handleGiftCardApplied = (giftCard: any) => {
		setGiftCardId(giftCard.id);
		setAppliedGiftCard(giftCard);
		const currentSubtotal = getCurrentSubtotal();
		const remainingAfterCoupon = currentSubtotal - discountAmount;
		const maxGiftCardAmount = Math.min(giftCard.remaining_amount_cents, remainingAfterCoupon);
		setGiftCardAmount(maxGiftCardAmount);
		updateTotal(currentSubtotal, discountAmount, maxGiftCardAmount);
	};

	const handleCouponRemoved = () => {
		setCouponId(undefined);
		setDiscountAmount(0);
		const currentSubtotal = getCurrentSubtotal();
		// Recalculate gift card amount if one is applied
		if (giftCardId && appliedGiftCard) {
			const newGiftCardAmount = Math.min(appliedGiftCard.remaining_amount_cents, currentSubtotal);
			setGiftCardAmount(newGiftCardAmount);
			updateTotal(currentSubtotal, 0, newGiftCardAmount);
		} else {
			updateTotal(currentSubtotal, 0, giftCardAmount);
		}
	};

	const handleGiftCardRemoved = () => {
		setGiftCardId(undefined);
		setAppliedGiftCard(null);
		setGiftCardAmount(0);
		const currentSubtotal = getCurrentSubtotal();
		updateTotal(currentSubtotal, discountAmount, 0);
	};

	const updateTotal = (base: number, discount: number, giftCard: number) => {
		const newTotal = Math.max(0, base - discount - giftCard);
		setTotalCents(newTotal);
	};

	const handleQuantityChange = async (cartItemId: string, productId: string, currentQuantity: number, newQuantity: number) => {
		if (newQuantity < 1) {
			toast.error("Quantity must be at least 1");
			return;
		}

		setUpdatingItems((prev) => new Set(prev).add(cartItemId));

		try {
			const response = await fetch("/api/cart/update", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
				body: JSON.stringify({
					cart_item_id: cartItemId,
					quantity: newQuantity,
				}),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				throw new Error(data.error || "Failed to update quantity");
			}

			// Update local state
			setItems((prevItems) =>
				prevItems.map((item: any) =>
					item.id === cartItemId ? { ...item, quantity: newQuantity } : item
				)
			);

			// Recalculate total
			const newSubtotal = items.reduce((sum: number, it: any) => {
				if (it.id === cartItemId) {
					return sum + it.product.price_cents * newQuantity;
				}
				return sum + it.product.price_cents * it.quantity;
			}, 0);

			setTotalCents(newSubtotal);
			
			// Recalculate discounts if applied
			if (couponId || giftCardId) {
				// Trigger recalculation with updated subtotal
				const updatedItems = items.map((item: any) =>
					item.id === cartItemId ? { ...item, quantity: newQuantity } : item
				);
				const updatedSubtotal = updatedItems.reduce((sum: number, it: any) => sum + it.product.price_cents * it.quantity, 0);
				
				if (giftCardId && appliedGiftCard) {
					const remainingAfterCoupon = updatedSubtotal - discountAmount;
					const newGiftCardAmount = Math.min(appliedGiftCard.remaining_amount_cents, remainingAfterCoupon);
					setGiftCardAmount(newGiftCardAmount);
					updateTotal(updatedSubtotal, discountAmount, newGiftCardAmount);
				} else {
					updateTotal(updatedSubtotal, discountAmount, giftCardAmount);
				}
			}
			
			router.refresh();
		} catch (error: any) {
			toast.error(error?.message || "Failed to update quantity");
		} finally {
			setUpdatingItems((prev) => {
				const newSet = new Set(prev);
				newSet.delete(cartItemId);
				return newSet;
			});
		}
	};

	const handleDecrease = (cartItemId: string, productId: string, currentQuantity: number) => {
		if (currentQuantity <= 1) return;
		handleQuantityChange(cartItemId, productId, currentQuantity, currentQuantity - 1);
	};

	const handleIncrease = (cartItemId: string, productId: string, currentQuantity: number) => {
		handleQuantityChange(cartItemId, productId, currentQuantity, currentQuantity + 1);
	};

	// Calculate final total from current items state
	const finalTotal = Math.max(0, getCurrentSubtotal() - discountAmount - giftCardAmount);

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
								{/* Quantity Selector */}
								<div className="flex items-center gap-2 mt-2">
									<button
										type="button"
										onClick={() => handleDecrease(it.id, it.product.id, it.quantity)}
										disabled={it.quantity <= 1 || updatingItems.has(it.id)}
										className="w-8 h-8 flex items-center justify-center bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-lg border border-white/30 dark:border-white/20 text-gray-900 dark:text-white font-semibold hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										−
									</button>
									<div className="w-12 h-8 flex items-center justify-center bg-white/30 dark:bg-white/10 backdrop-blur-sm rounded-lg border border-white/30 dark:border-white/20 text-gray-900 dark:text-white font-semibold">
										{it.quantity}
									</div>
									<button
										type="button"
										onClick={() => handleIncrease(it.id, it.product.id, it.quantity)}
										disabled={updatingItems.has(it.id)}
										className="w-8 h-8 flex items-center justify-center bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-lg border border-white/30 dark:border-white/20 text-gray-900 dark:text-white font-semibold hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										+
									</button>
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
						<span>${(getCurrentSubtotal() / 100).toFixed(2)}</span>
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

