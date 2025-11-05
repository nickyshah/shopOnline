import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function CartPage() {
	const supabase = await getSupabaseServerClient();
	const { data: auth } = await supabase.auth.getUser();
	const user = auth.user;
	if (!user) {
		return (
			<div className="mx-auto max-w-3xl p-6">
				<h1 className="text-2xl font-semibold mb-2">Your cart</h1>
				<p className="mb-4">Please sign in to view your cart.</p>
				<a className="underline" href="/login">Sign in</a>
			</div>
		);
	}

	const { data: items } = await supabase
		.from("cart_items")
		.select("id, quantity, product:products(id, name, price_cents, image_url)")
		.eq("cart_user_id", user.id);

	const totalCents = (items ?? []).reduce((sum: number, it: any) => sum + it.quantity * it.product.price_cents, 0);

	return (
		<div className="mx-auto max-w-3xl p-6">
			<h1 className="text-2xl font-semibold mb-4">Your cart</h1>
			<div className="space-y-4">
				{items?.map((it: any) => (
					<div key={it.id} className="flex items-center justify-between border rounded p-3">
						<div>
							<div className="font-medium">{it.product.name}</div>
							<div className="text-sm text-gray-600">Qty: {it.quantity}</div>
						</div>
						<div>${((it.product.price_cents * it.quantity) / 100).toFixed(2)}</div>
					</div>
				))}
			</div>
			<div className="flex items-center justify-between mt-6">
				<div className="text-lg font-semibold">Total: ${ (totalCents / 100).toFixed(2) }</div>
				<form action="/api/stripe/checkout" method="post">
					<button className="bg-black text-white rounded px-4 py-2" type="submit">Checkout</button>
				</form>
			</div>
		</div>
	);
}


