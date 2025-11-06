import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPage() {
	const supabase = await getSupabaseServerClient();
	
	// Get quick stats
	const { count: productsCount } = await supabase
		.from("products")
		.select("*", { count: "exact", head: true })
		.eq("active", true);

	const { count: ordersCount } = await supabase
		.from("orders")
		.select("*", { count: "exact", head: true });

	return (
		<div className="min-h-screen">
			{/* Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
			</div>

			<div className="relative">
				<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
				<p className="text-gray-600 dark:text-gray-400 mb-8">Manage your store from here</p>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
					<Link
						href="/admin/products"
						className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105"
					>
						<div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
							{productsCount || 0}
						</div>
						<div className="text-gray-700 dark:text-gray-300 font-semibold">Active Products</div>
					</Link>

					<Link
						href="/admin/orders"
						className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105"
					>
						<div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
							{ordersCount || 0}
						</div>
						<div className="text-gray-700 dark:text-gray-300 font-semibold">Total Orders</div>
					</Link>
				</div>

				{/* Quick Actions */}
				<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6">
					<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
					<div className="flex flex-wrap gap-4">
						<Link
							href="/admin/products"
							className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
						>
							Manage Products
						</Link>
						<Link
							href="/admin/orders"
							className="px-6 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
						>
							View Orders
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
