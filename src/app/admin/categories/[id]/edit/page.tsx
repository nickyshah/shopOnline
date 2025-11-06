import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { notFound } from "next/navigation";
import CategoryForm from "@/app/components/CategoryForm";
import Link from "next/link";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function EditCategoryPage(props: Props) {
	const { id } = await props.params;
	// Use service client to access all categories
	const supabase = getSupabaseServiceClient();

	const { data: category } = await supabase
		.from("categories")
		.select("id, name, slug, description")
		.eq("id", id)
		.single();

	if (!category) {
		notFound();
	}

	return (
		<div className="min-h-screen">
			{/* Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
			</div>

			<div className="relative">
				<div className="mb-6">
					<Link
						href="/admin/categories"
						className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 inline-block"
					>
						← Back to Categories
					</Link>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Category</h1>
				</div>

				<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6">
					<CategoryForm category={category} />
				</div>
			</div>
		</div>
	);
}

