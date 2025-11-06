import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
	const supabase = await getSupabaseServerClient();
	const { data: featuredProducts } = await supabase
		.from("products")
		.select("id, name, price_cents, image_url, description")
		.eq("active", true)
		.order("created_at", { ascending: false })
		.limit(6);

	return (
		<div className="min-h-screen">
			{/* Animated Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
				<div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob dark:opacity-10"></div>
				<div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 dark:opacity-10"></div>
				<div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 dark:opacity-10"></div>
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
			</div>

			{/* Hero Section with Glass Morphism */}
			<section className="relative min-h-screen flex items-center justify-center px-6 py-24 sm:py-32 lg:px-8">
				<div className="relative z-10 mx-auto max-w-7xl w-full">
					{/* Floating Glass Cards */}
					<div className="absolute top-20 right-10 w-72 h-72 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl rotate-12 hidden lg:block"></div>
					<div className="absolute bottom-20 left-10 w-64 h-64 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl -rotate-12 hidden lg:block"></div>

					{/* Main Hero Content */}
					<div className="relative mx-auto max-w-4xl text-center">
						{/* Glass Badge */}
						<div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/30 dark:border-white/20 shadow-lg">
							<span className="relative flex h-3 w-3">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
							</span>
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Welcome to RawNode</span>
						</div>

						<h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6">
							<span className="block text-gray-900 dark:text-white">Discover</span>
							<span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
								Premium Quality
							</span>
						</h1>

						<p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
							Experience the finest collection of premium products. Fast shipping, secure checkout, and exceptional customer service.
						</p>

						{/* Glass CTA Buttons */}
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<Link
								href="/products"
								className="group relative px-8 py-4 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/30 dark:hover:bg-white/15"
							>
								<span className="relative z-10 text-lg font-semibold text-gray-900 dark:text-white">
									Shop Now
								</span>
								<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</Link>
							<Link
								href="/products"
								className="px-8 py-4 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
							>
								<span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
									Browse Collection <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
								</span>
							</Link>
						</div>

						{/* Stats Glass Cards */}
						<div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
							<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 p-6 shadow-xl">
								<div className="text-3xl font-bold text-gray-900 dark:text-white">10K+</div>
								<div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Happy Customers</div>
							</div>
							<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 p-6 shadow-xl">
								<div className="text-3xl font-bold text-gray-900 dark:text-white">500+</div>
								<div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Premium Products</div>
							</div>
							<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 p-6 shadow-xl">
								<div className="text-3xl font-bold text-gray-900 dark:text-white">24/7</div>
								<div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Support</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Featured Products Section with Glass Cards */}
			{featuredProducts && featuredProducts.length > 0 && (
				<section className="relative py-24 sm:py-32 px-6 lg:px-8">
					<div className="relative z-10 mx-auto max-w-7xl">
						{/* Section Header */}
						<div className="text-center mb-16">
							<div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/30 dark:border-white/20 shadow-lg">
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Collection</span>
							</div>
							<h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
								Handpicked <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Selections</span>
							</h2>
							<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
								Curated products from our premium collection
							</p>
						</div>

						{/* Product Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
							{featuredProducts.map((product) => (
								<Link
									key={product.id}
									href={`/products/${product.id}`}
									className="group relative bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
								>
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
										{/* Glass Overlay on Hover */}
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

						{featuredProducts.length >= 6 && (
							<div className="mt-12 text-center">
								<Link
									href="/products"
									className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
								>
									<span className="text-lg font-semibold text-gray-900 dark:text-white">
										View All Products
									</span>
									<span className="text-xl">→</span>
								</Link>
							</div>
						)}
					</div>
				</section>
			)}

			{/* CTA Section with Glass Morphism */}
			<section className="relative py-24 sm:py-32 px-6 lg:px-8">
				<div className="relative z-10 mx-auto max-w-4xl">
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl p-12 sm:p-16 text-center">
						<h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
							Ready to start shopping?
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
							Join thousands of satisfied customers. Browse our full collection and find exactly what you&apos;re looking for.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<Link
								href="/products"
								className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:from-indigo-700 hover:to-purple-700"
							>
								Explore Products
							</Link>
							<Link
								href="/login"
								className="px-8 py-4 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
							>
								Create Account →
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
