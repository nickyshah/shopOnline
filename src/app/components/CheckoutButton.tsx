"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type CheckoutButtonProps = {
	couponId?: string;
	giftCardId?: string;
};

export default function CheckoutButton({ couponId, giftCardId }: CheckoutButtonProps) {
	const [loading, setLoading] = useState(false);

	async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch("/api/stripe/checkout", {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					coupon_id: couponId,
					gift_card_id: giftCardId,
				}),
			});

			if (!response.ok) {
				// Try to parse error response
				const contentType = response.headers.get("content-type");
				if (contentType && contentType.includes("application/json")) {
					const data = await response.json().catch(() => ({}));
					throw new Error(data.error || `HTTP ${response.status}: Failed to proceed to checkout`);
				} else {
					const text = await response.text().catch(() => "");
					throw new Error(text || `HTTP ${response.status}: Failed to proceed to checkout`);
				}
			}

			// Parse JSON response
			const data = await response.json().catch(() => ({}));
			if (data.url) {
				// Redirect to Stripe checkout
				window.location.href = data.url;
			} else {
				throw new Error("No checkout URL received from server");
			}
		} catch (error: any) {
			console.error("Checkout error:", error);
			toast.error(error?.message || "Failed to proceed to checkout. Please check your Stripe configuration.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleCheckout}>
			<button
				type="submit"
				disabled={loading}
				className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
			>
				{loading ? "Processing..." : "Proceed to Checkout"}
			</button>
		</form>
	);
}

