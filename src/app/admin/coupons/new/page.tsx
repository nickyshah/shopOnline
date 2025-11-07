import { getSupabaseServiceClient } from "@/lib/supabase/service";
import CouponForm from "@/app/components/CouponForm";
import Link from "next/link";

export default async function NewCouponPage() {
	const supabase = getSupabaseServiceClient();
	const { data: categories } = await supabase.from("categories").select("id, name").order("name");
	const { data: products } = await supabase.from("products").select("id, name").order("name");

	return (
		<div className="min-h-screen">
			<div className="relative">
				<div className="mb-6">
					<Link
						href="/admin/coupons"
						className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block"
					>
						← Back to Coupons
					</Link>
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create New Coupon</h1>
					<p className="text-gray-600 dark:text-gray-400">Configure discount conditions and rules</p>
				</div>

				<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-8">
					<CouponForm categories={categories || []} products={products || []} />
				</div>
			</div>
		</div>
	);
}

