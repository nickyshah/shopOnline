import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminProductsPage() {
	const supabase = await getSupabaseServerClient();
	const { data: products } = await supabase
		.from("products")
		.select("id, name, price_cents, active")
		.order("created_at", { ascending: false });

	return (
		<div>
			<h1 className="text-2xl font-semibold mb-4">Products</h1>
			<form action="/admin/products/new" method="post" className="flex items-end gap-2 mb-6">
				<input name="name" placeholder="Name" className="border rounded px-2 py-1" required />
				<input name="price_cents" placeholder="Price (cents)" type="number" className="border rounded px-2 py-1 w-40" required />
				<button className="bg-black text-white rounded px-3 py-1.5" type="submit">Add</button>
			</form>
			<div className="divide-y border rounded">
				{products?.map((p) => (
					<div key={p.id} className="flex items-center justify-between p-3">
						<div>
							<div className="font-medium">{p.name}</div>
							<div className="text-sm text-gray-600">${(p.price_cents / 100).toFixed(2)}</div>
						</div>
						<form action={`/admin/products/${p.id}/toggle`} method="post">
							<button className="underline text-sm" type="submit">{p.active ? "Deactivate" : "Activate"}</button>
						</form>
					</div>
				))}
			</div>
		</div>
	);
}


