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
		<>
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-black dark:to-slate-900">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
				<div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
							Discover Quality
							<span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
								Products
							</span>
						</h1>
						<p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 sm:text-xl">
							Shop the finest collection of premium products. Fast shipping, secure checkout, and exceptional customer service.
						</p>
						<div className="mt-10 flex items-center justify-center gap-x-6">
							<Link
								href="/products"
								className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-all duration-200 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
							>
								Shop Now
							</Link>
							<Link
								href="/products"
								className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
							>
								Browse Collection <span aria-hidden="true">→</span>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Featured Products Section */}
			{featuredProducts && featuredProducts.length > 0 && (
				<section className="bg-white dark:bg-black py-24 sm:py-32">
					<div className="mx-auto max-w-7xl px-6 lg:px-8">
						<div className="mx-auto max-w-2xl text-center">
							<h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
								Featured Products
							</h2>
							<p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-400">
								Handpicked selections from our collection
							</p>
						</div>
						<div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 xl:grid-cols-3">
							{featuredProducts.map((product) => (
								<Link
									key={product.id}
									href={`/products/${product.id}`}
									className="group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
								>
									<div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
										{product.image_url ? (
											<img
												src={product.image_url}
												alt={product.name}
												className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
											/>
										) : (
											<div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
												<svg
													className="h-12 w-12 text-gray-400 dark:text-gray-600"
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
									</div>
									<div className="flex flex-1 flex-col p-6">
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
											{product.name}
										</h3>
										{product.description && (
											<p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
												{product.description}
											</p>
										)}
										<div className="mt-4 flex items-center justify-between">
											<p className="text-2xl font-bold text-gray-900 dark:text-white">
												${(product.price_cents / 100).toFixed(2)}
											</p>
											<span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
												View details →
											</span>
										</div>
									</div>
								</Link>
							))}
						</div>
						{featuredProducts.length >= 6 && (
							<div className="mt-12 text-center">
								<Link
									href="/products"
									className="inline-flex items-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-all duration-200 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
								>
									View All Products
								</Link>
							</div>
						)}
					</div>
				</section>
			)}

			{/* CTA Section */}
			<section className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900">
				<div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
							Ready to start shopping?
						</h2>
						<p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
							Join thousands of satisfied customers. Browse our full collection and find exactly what you&apos;re looking for.
						</p>
						<div className="mt-10 flex items-center justify-center gap-x-6">
							<Link
								href="/products"
								className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200"
							>
								Explore Products
							</Link>
							<Link
								href="/login"
								className="text-sm font-semibold leading-6 text-white hover:text-gray-300 transition-colors"
							>
								Create Account <span aria-hidden="true">→</span>
							</Link>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
