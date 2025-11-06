import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	const supabase = await getSupabaseServerClient();
	const { data: auth } = await supabase.auth.getUser();
	if (!auth.user) redirect("/login");
	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", auth.user.id)
		.single();
	if (profile?.role !== "admin") redirect("/");

	return (
		<div className="min-h-screen">
			{/* Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
			</div>

			<div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-8">
				{/* Navigation */}
				<nav className="mb-8">
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-4 inline-flex gap-2">
						<Link
							href="/admin"
							className="px-4 py-2 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 transition-all"
						>
							Overview
						</Link>
						<Link
							href="/admin/products"
							className="px-4 py-2 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 transition-all"
						>
							Products
						</Link>
						<Link
							href="/admin/orders"
							className="px-4 py-2 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 transition-all"
						>
							Orders
						</Link>
					</div>
				</nav>
				{children}
			</div>
		</div>
	);
}
