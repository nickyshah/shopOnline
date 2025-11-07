"use client";

import { useRouter } from "next/navigation";

type CheckoutButtonProps = {
	couponId?: string;
	giftCardId?: string;
};

export default function CheckoutButton({ couponId, giftCardId }: CheckoutButtonProps) {
	const router = useRouter();

	function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		
		// Build query params for coupon and gift card
		const params = new URLSearchParams();
		if (couponId) params.set("coupon_id", couponId);
		if (giftCardId) params.set("gift_card_id", giftCardId);
		
		// Navigate to checkout page
		const queryString = params.toString();
		router.push(`/checkout${queryString ? `?${queryString}` : ""}`);
	}

	return (
		<form onSubmit={handleCheckout}>
			<button
				type="submit"
				className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:from-indigo-700 hover:to-purple-700"
			>
				Proceed to Checkout
			</button>
		</form>
	);
}

