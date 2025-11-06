import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OrdersPage() {
	const supabase = await getSupabaseServerClient();
	const { data: auth } = await supabase.auth.getUser();
	if (!auth.user) redirect("/login");

	const { data: orders } = await supabase
		.from("orders")
		.select("id, status, amount_cents, created_at")
		.order("created_at", { ascending: false });

	return (
		<div className="min-h-screen">
			{/* Animated Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
				<div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob dark:opacity-10"></div>
				<div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 dark:opacity-10"></div>
				<div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 dark:opacity-10"></div>
			</div>

			<div className="relative mx-auto max-w-4xl px-6 py-12 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-2">
						Your <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Orders</span>
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400">Track your order history</p>
				</div>

				{orders && orders.length > 0 ? (
					<div className="space-y-4">
						{orders.map((o) => (
							<Link
								key={o.id}
								href={`/orders/${o.id}`}
								className="block bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
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
									<div className="text-right">
										<div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full border border-white/30 dark:border-white/20 mb-2">
											<span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{o.status}</span>
										</div>
										<div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
											${(o.amount_cents / 100).toFixed(2)}
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl p-12 text-center">
						<svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<p className="text-xl text-gray-600 dark:text-gray-400 mb-4">No orders yet</p>
						<Link href="/products" className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
							Start Shopping
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
