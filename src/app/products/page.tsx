import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProductsPage({
	searchParams,
}: {
	searchParams: Promise<{ category?: string }>;
}) {
	const params = await searchParams;
	const supabase = await getSupabaseServerClient();

	// Get all categories
	const { data: categories } = await supabase
		.from("categories")
		.select("id, name, slug")
		.order("name");

	// Get products, optionally filtered by category
	let query = supabase
		.from("products")
		.select("id, name, price_cents, image_url, description, category:categories(name, slug)")
		.eq("active", true);

	if (params.category) {
		query = query.eq("category_id", params.category);
	}

	const { data: products } = await query.order("created_at", { ascending: false });

	const selectedCategoryId = params.category;

	return (
		<div className="min-h-screen">
			{/* Background with glass effect */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
			</div>

			<div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">
				{/* Header */}
				<div className="mb-12 text-center">
					<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
						Our <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Products</span>
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400">
						Browse our premium collection of quality products
					</p>
				</div>

				{/* Category Filter */}
				<div className="mb-12 flex flex-wrap items-center justify-center gap-4">
					<Link
						href="/products"
						className={`px-6 py-3 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
							!selectedCategoryId
								? "bg-white/30 dark:bg-white/15 border-white/40 dark:border-white/20 shadow-xl text-gray-900 dark:text-white font-semibold"
								: "bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10"
						}`}
					>
						All Products
					</Link>
					{categories?.map((category) => (
						<Link
							key={category.id}
							href={`/products?category=${category.id}`}
							className={`px-6 py-3 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
								selectedCategoryId === category.id
									? "bg-white/30 dark:bg-white/15 border-white/40 dark:border-white/20 shadow-xl text-gray-900 dark:text-white font-semibold"
									: "bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10"
							}`}
						>
							{category.name}
						</Link>
					))}
				</div>

				{/* Products Grid */}
				{products && products.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{products.map((product: any) => (
							<Link
								key={product.id}
								href={`/products/${product.id}`}
								className="group relative bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
							>
								{/* Category Badge */}
								{product.category && (
									<div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/30 dark:bg-white/15 backdrop-blur-sm rounded-full border border-white/40 dark:border-white/20">
										<span className="text-xs font-medium text-gray-900 dark:text-white">
											{product.category.name}
										</span>
									</div>
								)}

								{/* Product Image */}
								<div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
									{product.image_url ? (
										<img
											src={product.image_url}
											alt={product.name}
											className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
										/>
									) : (
										<div className="h-full w-full flex items-center justify-center">
											<svg
												className="h-16 w-16 text-gray-400 dark:text-gray-600"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
										</div>
									)}
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								</div>

								{/* Product Info */}
								<div className="p-6">
									<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
										{product.name}
									</h3>
									{product.description && (
										<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
											{product.description}
										</p>
									)}
									<div className="flex items-center justify-between">
										<span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
											${(product.price_cents / 100).toFixed(2)}
										</span>
										<span className="px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-white/20 dark:border-white/10 group-hover:bg-white/30 dark:group-hover:bg-white/15 transition-all">
											View →
										</span>
									</div>
								</div>

								{/* Glass Shine Effect */}
								<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
							</Link>
						))}
					</div>
				) : (
					<div className="text-center py-16">
						<p className="text-lg text-gray-600 dark:text-gray-400">No products found in this category.</p>
					</div>
				)}
			</div>
		</div>
	);
}
