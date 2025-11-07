import Link from "next/link";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import DeleteCouponButton from "@/app/components/DeleteCouponButton";
import { format } from "date-fns";

export default async function AdminCouponsPage() {
	const supabase = getSupabaseServiceClient();
	const { data: coupons } = await supabase
		.from("coupons")
		.select("*")
		.order("created_at", { ascending: false });

	const formatDiscount = (coupon: any) => {
		if (coupon.discount_type === "percentage") {
			return `${coupon.discount_value}%`;
		}
		// For fixed_amount, discount_value is stored in cents
		return `$${(coupon.discount_value / 100).toFixed(2)}`;
	};

	const isActive = (coupon: any) => {
		if (!coupon.active) return false;
		const now = new Date();
		if (coupon.valid_from && new Date(coupon.valid_from) > now) return false;
		if (coupon.valid_until && new Date(coupon.valid_until) < now) return false;
		if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) return false;
		return true;
	};

	return (
		<div className="min-h-screen">
			<div className="relative">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Coupons</h1>
						<p className="text-gray-600 dark:text-gray-400">Manage discount coupons and promotions</p>
					</div>
					<Link
						href="/admin/coupons/new"
						className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
					>
						+ Create Coupon
					</Link>
				</div>

				{coupons && coupons.length > 0 ? (
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 space-y-4">
						{coupons.map((coupon: any) => (
							<div
								key={coupon.id}
								className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/10 p-6"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-3">
											<div className="font-bold text-xl text-gray-900 dark:text-white">
												{coupon.code}
											</div>
											{isActive(coupon) ? (
												<span className="px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-400 rounded text-xs font-medium">
													Active
												</span>
											) : (
												<span className="px-2 py-1 bg-red-500/20 text-red-700 dark:text-red-400 rounded text-xs font-medium">
													Inactive
												</span>
											)}
											<span className="px-2 py-1 bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded text-xs font-medium">
												{formatDiscount(coupon)}
											</span>
										</div>
										{coupon.description && (
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
												{coupon.description}
											</p>
										)}
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
											<div>
												<div className="text-gray-500 dark:text-gray-500 mb-1">Type</div>
												<div className="text-gray-900 dark:text-white font-medium capitalize">
													{coupon.discount_type}
												</div>
											</div>
											<div>
												<div className="text-gray-500 dark:text-gray-500 mb-1">Usage</div>
												<div className="text-gray-900 dark:text-white font-medium">
													{coupon.usage_count || 0}
													{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
												</div>
											</div>
											<div>
												<div className="text-gray-500 dark:text-gray-500 mb-1">Valid Until</div>
												<div className="text-gray-900 dark:text-white font-medium">
													{coupon.valid_until
														? format(new Date(coupon.valid_until), "MMM d, yyyy")
														: "No expiry"}
												</div>
											</div>
											<div>
												<div className="text-gray-500 dark:text-gray-500 mb-1">Min Purchase</div>
												<div className="text-gray-900 dark:text-white font-medium">
													{coupon.minimum_purchase_cents > 0
														? `$${(coupon.minimum_purchase_cents / 100).toFixed(2)}`
														: "No minimum"}
												</div>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-3 ml-4">
										<Link
											href={`/admin/coupons/${coupon.id}/edit`}
											className="px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white font-semibold hover:bg-white/30 dark:hover:bg-white/15 transition-all"
										>
											Edit
										</Link>
										<DeleteCouponButton couponId={coupon.id} />
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-12 text-center">
						<p className="text-gray-600 dark:text-gray-400 mb-6">No coupons created yet.</p>
						<Link
							href="/admin/coupons/new"
							className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
						>
							Create Your First Coupon
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}

