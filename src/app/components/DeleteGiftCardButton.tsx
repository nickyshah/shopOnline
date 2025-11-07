"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type DeleteGiftCardButtonProps = {
	giftCardId: string;
};

export default function DeleteGiftCardButton({ giftCardId }: DeleteGiftCardButtonProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleDelete() {
		if (!confirm("Are you sure you want to delete this gift card? This action cannot be undone.")) {
			return;
		}

		setLoading(true);
		try {
			const response = await fetch(`/api/admin/gift-cards/${giftCardId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete gift card");
			}

			toast.success("Gift card deleted successfully!");
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Failed to delete gift card");
			console.error("Delete gift card error:", error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<button
			onClick={handleDelete}
			disabled={loading}
			className="px-4 py-2 bg-red-500/20 text-red-700 dark:text-red-400 rounded-xl border border-red-300 dark:border-red-700 font-semibold hover:bg-red-500/30 dark:hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{loading ? "Deleting..." : "Delete"}
		</button>
	);
}

