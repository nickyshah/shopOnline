import { getSupabaseServerClient } from "@/lib/supabase/server";
import AdminProductForm from "@/app/components/AdminProductForm";
import ProductToggleButton from "@/app/components/ProductToggleButton";

export default async function AdminProductsPage() {
	const supabase = await getSupabaseServerClient();
	const { data: products } = await supabase
		.from("products")
		.select("id, name, price_cents, active, category:categories(name)")
		.order("created_at", { ascending: false });

	const { data: categories } = await supabase
		.from("categories")
		.select("id, name")
		.order("name");

	return (
		<div className="min-h-screen">
			{/* Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
			</div>

			<div className="relative">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Products</h1>
				
				{/* Add Product Form */}
				<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 mb-8">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Product</h2>
					<AdminProductForm categories={categories || []} />
				</div>

				{/* Products List */}
				<div className="space-y-4">
					{products && products.length > 0 ? (
						products.map((p: any) => (
							<div
								key={p.id}
								className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
							>
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<div className="font-bold text-lg text-gray-900 dark:text-white mb-1">{p.name}</div>
										<div className="text-sm text-gray-600 dark:text-gray-400">
											<span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
												${(p.price_cents / 100).toFixed(2)}
											</span>
											{p.category && (
												<span className="ml-3 px-3 py-1 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium border border-white/30 dark:border-white/20">
													{p.category.name}
												</span>
											)}
										</div>
									</div>
									<ProductToggleButton productId={p.id} isActive={p.active} />
								</div>
							</div>
						))
					) : (
						<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-12 text-center">
							<p className="text-gray-600 dark:text-gray-400">No products yet. Add your first product above.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
