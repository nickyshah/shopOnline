"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Category = {
	id: string;
	name: string;
};

type AdminProductFormProps = {
	categories: Category[];
};

export default function AdminProductForm({ categories }: AdminProductFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		price_cents: "",
		category_id: "none",
	});

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		try {
			const data = new FormData();
			data.append("name", formData.name);
			data.append("price_cents", formData.price_cents);
			data.append("category_id", formData.category_id);

			const response = await fetch("/admin/products/new", {
				method: "POST",
				body: data,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to add product");
			}

			toast.success("Product added successfully!");
			setFormData({ name: "", price_cents: "", category_id: "none" });
			router.refresh();
		} catch (error: any) {
			toast.error(error?.message || "Failed to add product");
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
			<input
				name="name"
				placeholder="Product Name"
				value={formData.name}
				onChange={(e) => setFormData({ ...formData, name: e.target.value })}
				className="flex-1 min-w-[200px] px-4 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
				required
				disabled={loading}
			/>
			<input
				name="price_cents"
				placeholder="Price (cents)"
				type="number"
				value={formData.price_cents}
				onChange={(e) => setFormData({ ...formData, price_cents: e.target.value })}
				className="w-40 px-4 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
				required
				disabled={loading}
			/>
			<select
				name="category_id"
				value={formData.category_id}
				onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
				className="px-4 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
				disabled={loading}
			>
				<option value="none">No Category</option>
				{categories.map((cat) => (
					<option key={cat.id} value={cat.id}>{cat.name}</option>
				))}
			</select>
			<button
				type="submit"
				disabled={loading}
				className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? "Adding..." : "Add Product"}
			</button>
		</form>
	);
}

