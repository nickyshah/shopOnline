import Link from "next/link";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export default async function AdminOrdersPage() {
	// Use service client to bypass RLS and see all orders
	const supabase = getSupabaseServiceClient();
	
	// Get all orders including guest orders
	const { data: orders } = await supabase
		.from("orders")
		.select(`
			id,
			status,
			amount_cents,
			created_at,
			user_id,
			guest_email,
			stripe_payment_intent
		`)
		.order("created_at", { ascending: false });

	// Get user emails for registered orders
	const userIds = (orders || [])
		.filter((o: any) => o.user_id)
		.map((o: any) => o.user_id);
	
	const userEmailsMap: Record<string, string> = {};
	if (userIds.length > 0) {
		const { data: usersList } = await supabase.auth.admin.listUsers();
		(usersList?.users || []).forEach((u) => {
			if (u.id && u.email) {
				userEmailsMap[u.id] = u.email;
			}
		});
	}

	return (
		<div className="min-h-screen">
			{/* Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
			</div>

			<div className="relative">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">All Orders</h1>
				<div className="space-y-4">
					{orders && orders.length > 0 ? (
						orders.map((o: any) => {
							const customerEmail = o.user_id ? (userEmailsMap[o.user_id] || "Unknown") : (o.guest_email || "Unknown");
							const isGuest = !o.user_id;
							return (
								<Link
									key={o.id}
									href={`/admin/orders/${o.id}`}
									className="block bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]"
								>
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<div className="font-bold text-lg text-gray-900 dark:text-white">
													Order #{o.id.slice(0, 8).toUpperCase()}
												</div>
												{isGuest && (
													<span className="px-2 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
														Guest
													</span>
												)}
											</div>
											<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
												Customer: {customerEmail}
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
										</div>
									</div>
								</Link>
							);
						})
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
