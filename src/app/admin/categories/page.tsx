import { getSupabaseServiceClient } from "@/lib/supabase/service";
import CategoryForm from "@/app/components/CategoryForm";
import DeleteCategoryButton from "@/app/components/DeleteCategoryButton";
import Link from "next/link";

export default async function AdminCategoriesPage() {
	// Use service client to bypass RLS
	const supabase = getSupabaseServiceClient();
	const { data: categories } = await supabase
		.from("categories")
		.select("id, name, slug, description, created_at")
		.order("name");

	return (
		<div className="min-h-screen">
			{/* Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
			</div>

			<div className="relative">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Categories</h1>

				{/* Add Category Form */}
				<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 mb-8">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Category</h2>
					<CategoryForm />
				</div>

				{/* Categories List */}
				<div className="space-y-4">
					{categories && categories.length > 0 ? (
						categories.map((cat: any) => (
							<div
								key={cat.id}
								className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
							>
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<div className="font-bold text-lg text-gray-900 dark:text-white mb-1">{cat.name}</div>
										<div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
											Slug: <span className="font-mono">{cat.slug}</span>
										</div>
										{cat.description && (
											<div className="text-sm text-gray-600 dark:text-gray-400">{cat.description}</div>
										)}
									</div>
									<div className="flex items-center gap-3">
										<Link
											href={`/admin/categories/${cat.id}/edit`}
											className="px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white font-semibold hover:bg-white/30 dark:hover:bg-white/15 transition-all"
										>
											Edit
										</Link>
										<DeleteCategoryButton categoryId={cat.id} />
									</div>
								</div>
							</div>
						))
					) : (
						<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-12 text-center">
							<p className="text-gray-600 dark:text-gray-400">No categories yet. Add your first category above.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

