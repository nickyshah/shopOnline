"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type AddToCartButtonProps = {
	productId: string;
	productName: string;
	defaultQuantity?: number;
};

export default function AddToCartButton({ productId, productName, defaultQuantity = 1 }: AddToCartButtonProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [quantity, setQuantity] = useState(defaultQuantity);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		
		try {
			const formData = new FormData();
			formData.append("product_id", productId);
			formData.append("quantity", quantity.toString());

			const response = await fetch("/api/cart/add", {
				method: "POST",
				headers: {
					"Accept": "application/json",
				},
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to add item to cart");
			}

			toast.success(`${productName} added to cart!`);
			router.refresh();
		} catch (error: any) {
			toast.error(error?.message || "Failed to add item to cart");
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex items-center gap-4">
			<input
				type="number"
				name="quantity"
				min={1}
				value={quantity}
				onChange={(e) => setQuantity(Number(e.target.value))}
				className="w-24 px-4 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white font-semibold text-center"
				disabled={loading}
			/>
			<button
				type="submit"
				disabled={loading}
				className="flex-1 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
			>
				{loading ? "Adding..." : "Add to Cart"}
			</button>
		</form>
	);
}

