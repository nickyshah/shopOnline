import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminOrdersPage() {
	const supabase = await getSupabaseServerClient();
	const { data: orders } = await supabase
		.from("orders")
		.select("id, status, amount_cents, created_at")
		.order("created_at", { ascending: false });

	return (
		<div>
			<h1 className="text-2xl font-semibold mb-4">Orders</h1>
			<div className="divide-y border rounded">
				{orders?.map((o) => (
					<div key={o.id} className="flex items-center justify-between p-3">
						<div>
							<div className="font-medium">Order {o.id.slice(0, 8)}</div>
							<div className="text-sm text-gray-600">{new Date(o.created_at as any).toLocaleString()}</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="text-sm">{o.status} · ${(o.amount_cents / 100).toFixed(2)}</div>
							<Link className="underline text-sm" href={`/admin/orders/${o.id}/label`}>Print label</Link>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}


