import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
		<div className="mx-auto max-w-6xl p-6">
			<nav className="flex items-center gap-4 mb-6 text-sm">
				<a className="underline" href="/admin">Overview</a>
				<a className="underline" href="/admin/products">Products</a>
				<a className="underline" href="/admin/orders">Orders</a>
			</nav>
			{children}
		</div>
	);
}


