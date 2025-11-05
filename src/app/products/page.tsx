import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProductsPage() {
	const supabase = await getSupabaseServerClient();
	const { data: products } = await supabase
		.from("products")
		.select("id, name, price_cents, image_url, description")
		.eq("active", true)
		.order("created_at", { ascending: false });

	return (
		<div className="mx-auto max-w-6xl p-6">
			<h1 className="text-2xl font-semibold mb-4">Products</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
				{products?.map((p) => (
					<Link key={p.id} href={`/products/${p.id}`} className="border rounded p-4 group">
						{p.image_url ? (
							<img src={p.image_url} alt={p.name} className="w-full h-40 object-cover rounded mb-3" />
						) : null}
						<div className="font-medium group-hover:underline">{p.name}</div>
						<div className="text-sm text-gray-600">${(p.price_cents / 100).toFixed(2)}</div>
					</Link>
				))}
			</div>
		</div>
	);
}


