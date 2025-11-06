import Link from "next/link";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { getCurrentUserInfo } from "@/app/actions";

export default async function AdminPage() {
	// Use service client to bypass RLS and see all data
	const supabase = getSupabaseServiceClient();
	const userInfo = await getCurrentUserInfo();
	
	// Get quick stats
	const { count: productsCount } = await supabase
		.from("products")
		.select("*", { count: "exact", head: true })
		.eq("active", true);

	const { count: ordersCount } = await supabase
		.from("orders")
		.select("*", { count: "exact", head: true });

	// Count guest vs registered orders
	const { data: allOrders } = await supabase
		.from("orders")
		.select("user_id, guest_email");
	const guestOrdersCount = (allOrders || []).filter((o: any) => !o.user_id).length;
	const registeredOrdersCount = (allOrders || []).filter((o: any) => o.user_id).length;

	const { count: usersCount } = await supabase
		.from("profiles")
		.select("*", { count: "exact", head: true });

	const { count: categoriesCount } = await supabase
		.from("categories")
		.select("*", { count: "exact", head: true });

	// Sales total
	const { data: salesAgg } = await supabase
		.from("orders")
		.select("amount_cents")
		.limit(1000); // simple aggregation for demo; consider RPC for large datasets
	const totalSalesCents = (salesAgg || []).reduce((acc: number, r: any) => acc + (r.amount_cents || 0), 0);

	// Recent orders (last 7 days)
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
	const { count: recentOrdersCount } = await supabase
		.from("orders")
		.select("*", { count: "exact", head: true })
		.gte("created_at", sevenDaysAgo.toISOString());

	return (
		<div className="min-h-screen">
			{/* Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
			</div>

			<div className="relative">
				<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
				<p className="text-gray-600 dark:text-gray-400 mb-4">Manage your store from here</p>
				
				{/* Current User Info */}
				{userInfo.loggedIn && (
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/20 shadow-lg p-4 mb-6">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Logged in as:</div>
								<div className="font-semibold text-gray-900 dark:text-white">{userInfo.email}</div>
								<div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
									Role: <span className="capitalize font-medium">{userInfo.role}</span>
									{userInfo.isAdmin && (
										<span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-700 dark:text-green-400 rounded text-xs font-medium">
											Admin
										</span>
									)}
									{userInfo.isAdminEmail && (
										<span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
											Admin Email
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
						href="/admin/categories"
						className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105"
					>
						<div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
							{categoriesCount || 0}
						</div>
						<div className="text-gray-700 dark:text-gray-300 font-semibold">Categories</div>
					</Link>

					<Link
						href="/admin/orders"
						className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105"
					>
						<div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
							{ordersCount || 0}
						</div>
						<div className="text-gray-700 dark:text-gray-300 font-semibold mb-1">Total Orders</div>
						<div className="text-xs text-gray-600 dark:text-gray-400">
							{registeredOrdersCount} registered, {guestOrdersCount} guest
						</div>
					</Link>

					<Link
						href="/admin/users"
						className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105"
					>
						<div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
							{usersCount || 0}
						</div>
						<div className="text-gray-700 dark:text-gray-300 font-semibold">Registered Users</div>
					</Link>
				</div>

				{/* Metrics */}
				<div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Sales</h3>
						<div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
							${(totalSalesCents / 100).toFixed(2)}
						</div>
						<div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Sum of all order amounts</div>
					</div>
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recent Orders</h3>
						<div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
							{recentOrdersCount || 0}
						</div>
						<div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Last 7 days</div>
					</div>
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Order Breakdown</h3>
						<div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
							<div>Registered: {registeredOrdersCount}</div>
							<div>Guest: {guestOrdersCount}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
