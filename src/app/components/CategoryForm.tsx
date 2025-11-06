"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type CategoryFormProps = {
	category?: {
		id: string;
		name: string;
		slug: string;
		description?: string;
	};
};

export default function CategoryForm({ category }: CategoryFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: category?.name || "",
		slug: category?.slug || "",
		description: category?.description || "",
	});

	// Auto-generate slug from name
	const handleNameChange = (name: string) => {
		setFormData({
			...formData,
			name,
			slug: category?.slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
		});
	};

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		try {
			const url = category
				? `/api/admin/categories/${category.id}`
				: "/api/admin/categories";
			const method = category ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to save category");
			}

			toast.success(category ? "Category updated!" : "Category created!");
			router.refresh();
			if (category) {
				router.push("/admin/categories");
			} else {
				setFormData({ name: "", slug: "", description: "" });
			}
		} catch (error: any) {
			toast.error(error?.message || "Failed to save category");
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<input
					name="name"
					placeholder="Category Name"
					value={formData.name}
					onChange={(e) => handleNameChange(e.target.value)}
					className="w-full px-4 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					required
					disabled={loading}
				/>
			</div>
			<div>
				<input
					name="slug"
					placeholder="URL Slug (auto-generated)"
					value={formData.slug}
					onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
					className="w-full px-4 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
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
			<button
				type="submit"
				disabled={loading}
				className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? (category ? "Updating..." : "Creating...") : (category ? "Update Category" : "Create Category")}
			</button>
		</form>
	);
}

