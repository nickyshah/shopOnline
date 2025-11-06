import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminOrdersPage() {
	const supabase = await getSupabaseServerClient();
	const { data: orders } = await supabase
		.from("orders")
		.select("id, status, amount_cents, created_at")
		.order("created_at", { ascending: false });

	return (
		<div className="min-h-screen">
			{/* Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
			</div>

			<div className="relative">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Orders</h1>
				<div className="space-y-4">
					{orders && orders.length > 0 ? (
						orders.map((o) => (
							<div
								key={o.id}
								className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
							>
								<div className="flex items-center justify-between">
									<div>
										<div className="font-bold text-lg text-gray-900 dark:text-white mb-1">
											Order #{o.id.slice(0, 8).toUpperCase()}
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-400">
											{new Date(o.created_at as any).toLocaleString()}
										</div>
									</div>
									<div className="flex items-center gap-4">
										<div className="text-right">
											<div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full border border-white/30 dark:border-white/20 mb-2">
												<span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{o.status}</span>
											</div>
											<div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
												${(o.amount_cents / 100).toFixed(2)}
											</div>
										</div>
										<Link
											href={`/admin/orders/${o.id}/label`}
											className="px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white font-semibold hover:bg-white/30 dark:hover:bg-white/15 transition-all"
										>
											Print Label
										</Link>
									</div>
								</div>
							</div>
						))
					) : (
						<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-12 text-center">
							<p className="text-gray-600 dark:text-gray-400">No orders yet</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
