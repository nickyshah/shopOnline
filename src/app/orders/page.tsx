import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
	const supabase = await getSupabaseServerClient();
	const { data: auth } = await supabase.auth.getUser();
	if (!auth.user) redirect("/login");

	const { data: orders } = await supabase
		.from("orders")
		.select("id, status, amount_cents, created_at")
		.order("created_at", { ascending: false });

	return (
		<div className="mx-auto max-w-4xl p-6">
			<h1 className="text-2xl font-semibold mb-4">Your orders</h1>
			<div className="space-y-3">
				{orders?.map((o) => (
					<div key={o.id} className="border rounded p-3 flex items-center justify-between">
						<div>
							<div className="font-medium">Order {o.id.slice(0, 8)}</div>
							<div className="text-sm text-gray-600">{new Date(o.created_at as any).toLocaleString()}</div>
						</div>
						<div className="text-sm">{o.status} · ${(o.amount_cents / 100).toFixed(2)}</div>
					</div>
				))}
			</div>
		</div>
	);
}


