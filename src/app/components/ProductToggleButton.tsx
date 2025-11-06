"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type ProductToggleButtonProps = {
	productId: string;
	isActive: boolean;
};

export default function ProductToggleButton({ productId, isActive }: ProductToggleButtonProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleToggle(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch(`/api/admin/products/${productId}/toggle`, {
				method: "PATCH",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update product");
			}

			toast.success(`Product ${isActive ? "deactivated" : "activated"} successfully!`);
			router.refresh();
		} catch (error: any) {
			toast.error(error?.message || "Failed to update product");
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleToggle}>
			<button
				type="submit"
				disabled={loading}
				className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
					isActive
						? "bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30 hover:bg-red-500/30"
						: "bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30 hover:bg-green-500/30"
				} disabled:opacity-50 disabled:cursor-not-allowed`}
			>
				{loading ? "..." : isActive ? "Deactivate" : "Activate"}
			</button>
		</form>
	);
}

