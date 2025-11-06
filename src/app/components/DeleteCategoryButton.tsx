"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type DeleteCategoryButtonProps = {
	categoryId: string;
};

export default function DeleteCategoryButton({ categoryId }: DeleteCategoryButtonProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		
		if (!confirm("Are you sure you want to delete this category? Products with this category will have their category set to null.")) {
			return;
		}

		setLoading(true);

		try {
			const response = await fetch(`/api/admin/categories/${categoryId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete category");
			}

			toast.success("Category deleted successfully!");
			router.refresh();
		} catch (error: any) {
			toast.error(error?.message || "Failed to delete category");
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleDelete} className="inline">
			<button
				type="submit"
				disabled={loading}
				className="px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-500/30 text-red-700 dark:text-red-400 font-semibold hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? "Deleting..." : "Delete"}
			</button>
		</form>
	);
}

