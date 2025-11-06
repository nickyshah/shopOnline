import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { notFound } from "next/navigation";
import AdminProductForm from "@/app/components/AdminProductForm";
import Link from "next/link";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function EditProductPage(props: Props) {
	const { id } = await props.params;
	// Use service client to access all products
	const supabase = getSupabaseServiceClient();

	const { data: product } = await supabase
		.from("products")
		.select("id, name, description, price_cents, category_id, active")
		.eq("id", id)
		.single();

	if (!product) {
		notFound();
	}

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
				<div className="mb-6">
					<Link
						href="/admin/products"
						className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 inline-block"
					>
						← Back to Products
					</Link>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
				</div>

				<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6">
					<AdminProductForm product={product} categories={categories || []} />
				</div>
			</div>
		</div>
	);
}

