import { getSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/app/components/AddToCartButton";

type Props = { params: Promise<{ id: string }> };

export default async function ProductDetail(props: Props) {
	const { id } = await props.params;
	const supabase = await getSupabaseServerClient();
	const { data: product } = await supabase
		.from("products")
		.select("id, name, description, price_cents, image_url, category:categories(id, name, slug)")
		.eq("id", id)
		.single();

	if (!product) return notFound();

	return (
		<div className="min-h-screen">
			{/* Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
			</div>

			<div className="relative mx-auto max-w-6xl px-6 py-12 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Product Image */}
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl overflow-hidden">
						{product.image_url ? (
							<img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
						) : (
							<div className="h-96 w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
								<svg className="h-24 w-24 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
						)}
					</div>

					{/* Product Info */}
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl p-8">
						{/* Category Badge */}
						{product.category && (
							<Link
								href={`/products?category=${product.category.id}`}
								className="inline-block mb-4 px-4 py-2 bg-white/30 dark:bg-white/15 backdrop-blur-sm rounded-full border border-white/40 dark:border-white/20"
							>
								<span className="text-sm font-medium text-gray-900 dark:text-white">{product.category.name}</span>
							</Link>
						)}

						<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>
						
						<div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
							${(product.price_cents / 100).toFixed(2)}
						</div>

						{product.description && (
							<p className="text-lg text-gray-700 dark:text-gray-300 mb-8 whitespace-pre-wrap leading-relaxed">
								{product.description}
							</p>
						)}

						<AddToCartButton productId={product.id} productName={product.name} />
					</div>
				</div>
			</div>
		</div>
	);
}


