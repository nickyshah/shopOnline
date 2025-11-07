"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type DeleteCouponButtonProps = {
	couponId: string;
};

export default function DeleteCouponButton({ couponId }: DeleteCouponButtonProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleDelete() {
		if (!confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) {
			return;
		}

		setLoading(true);
		try {
			const response = await fetch(`/api/admin/coupons/${couponId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete coupon");
			}

			toast.success("Coupon deleted successfully!");
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Failed to delete coupon");
			console.error("Delete coupon error:", error);
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

