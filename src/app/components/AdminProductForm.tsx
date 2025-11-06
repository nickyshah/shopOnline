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
	product?: {
		id: string;
		name: string;
		description?: string;
		price_cents: number;
		category_id?: string;
		active?: boolean;
	};
};

export default function AdminProductForm({ categories, product }: AdminProductFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: product?.name || "",
		description: product?.description || "",
		price_cents: product?.price_cents?.toString() || "",
		category_id: product?.category_id || "none",
	});

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		try {
			const url = product
				? `/api/admin/products/${product.id}`
				: "/api/admin/products";
			const method = product ? "PUT" : "POST";

			const data = new FormData();
			data.append("name", formData.name);
			data.append("description", formData.description);
			data.append("price_cents", formData.price_cents);
			data.append("category_id", formData.category_id);

			const response = await fetch(url, {
				method,
				body: data,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || `Failed to ${product ? "update" : "add"} product`);
			}

			toast.success(`Product ${product ? "updated" : "added"} successfully!`);
			if (!product) {
				setFormData({ name: "", description: "", price_cents: "", category_id: "none" });
			}
			router.refresh();
			if (product) {
				router.push("/admin/products");
			}
		} catch (error: any) {
			toast.error(error?.message || `Failed to ${product ? "update" : "add"} product`);
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<input
					name="name"
					placeholder="Product Name"
					value={formData.name}
					onChange={(e) => setFormData({ ...formData, name: e.target.value })}
					className="w-full px-4 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					required
					disabled={loading}
				/>
			</div>
			<div>
				<textarea
					name="description"
					placeholder="Description (optional)"
					value={formData.description}
					onChange={(e) => setFormData({ ...formData, description: e.target.value })}
					rows={3}
					className="w-full px-4 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
					disabled={loading}
				/>
			</div>
			<div className="flex flex-wrap items-end gap-4">
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
					{loading ? (product ? "Updating..." : "Adding...") : (product ? "Update Product" : "Add Product")}
				</button>
			</div>
		</form>
	);
}

