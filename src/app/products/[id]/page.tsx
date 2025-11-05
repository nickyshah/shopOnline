import { getSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function ProductDetail(props: Props) {
	const { id } = await props.params;
	const supabase = await getSupabaseServerClient();
	const { data: product } = await supabase
		.from("products")
		.select("id, name, description, price_cents, image_url")
		.eq("id", id)
		.single();

	if (!product) return notFound();

	return (
		<div className="mx-auto max-w-3xl p-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{product.image_url ? (
					<img src={product.image_url} alt={product.name} className="w-full rounded" />
				) : null}
				<div>
					<h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
					<div className="text-gray-600 mb-4">${(product.price_cents / 100).toFixed(2)}</div>
					<p className="mb-6 whitespace-pre-wrap">{product.description}</p>
					<form action={`/api/cart/add`} method="post" className="flex items-center gap-2">
						<input type="hidden" name="product_id" value={product.id} />
						<input type="number" name="quantity" min={1} defaultValue={1} className="w-20 border rounded px-2 py-1" />
						<button className="bg-black text-white rounded px-4 py-2" type="submit">Add to cart</button>
					</form>
				</div>
			</div>
		</div>
	);
}


