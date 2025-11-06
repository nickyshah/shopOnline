import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCartSessionId } from "@/lib/cart";

export default async function CartPage() {
	const supabase = await getSupabaseServerClient();
	const { data: auth } = await supabase.auth.getUser();
	const user = auth.user;

	let items: any[] = [];
	if (user) {
		// Authenticated user
		const { data: cart } = await supabase
			.from("carts")
			.select("id")
			.eq("user_id", user.id)
			.maybeSingle();
		
		if (cart) {
			const { data } = await supabase
				.from("cart_items")
				.select("id, quantity, product:products(id, name, price_cents, image_url)")
				.eq("cart_id", cart.id);
			items = data || [];
		}
	} else {
		// Guest user - only read session ID (cookie is set in API routes)
		const sessionId = await getCartSessionId();
		if (sessionId) {
			const { data: cart } = await supabase
				.from("carts")
				.select("id")
				.eq("session_id", sessionId)
				.maybeSingle();
			
			if (cart) {
				const { data } = await supabase
					.from("cart_items")
					.select("id, quantity, product:products(id, name, price_cents, image_url)")
					.eq("cart_id", cart.id);
				items = data || [];
			}
		}
	}

	const totalCents = items.reduce((sum: number, it: any) => sum + it.quantity * it.product.price_cents, 0);

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
						Your <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Cart</span>
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400">Review your selected items</p>
				</div>

				{items.length === 0 ? (
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl p-12 text-center">
						<svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
						</svg>
						<p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Your cart is empty</p>
						<a href="/products" className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
							Continue Shopping
						</a>
					</div>
				) : (
					<>
						{/* Cart Items */}
						<div className="space-y-4 mb-8">
							{items.map((it: any) => (
								<div
									key={it.id}
									className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 flex items-center justify-between hover:shadow-2xl transition-all duration-300"
								>
									<div className="flex items-center gap-4 flex-1">
										{it.product.image_url && (
											<img
												src={it.product.image_url}
												alt={it.product.name}
												className="w-20 h-20 object-cover rounded-xl"
											/>
										)}
										<div className="flex-1">
											<div className="font-bold text-lg text-gray-900 dark:text-white mb-1">
												{it.product.name}
											</div>
											<div className="text-sm text-gray-600 dark:text-gray-400">
												Quantity: {it.quantity}
											</div>
										</div>
									</div>
									<div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
										${((it.product.price_cents * it.quantity) / 100).toFixed(2)}
									</div>
								</div>
							))}
						</div>

						{/* Total and Checkout */}
						<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl p-8">
							<div className="flex items-center justify-between mb-6">
								<div className="text-2xl font-bold text-gray-900 dark:text-white">Total</div>
								<div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
									${(totalCents / 100).toFixed(2)}
								</div>
							</div>
							<form action="/api/stripe/checkout" method="post">
								<button
									type="submit"
									className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:from-indigo-700 hover:to-purple-700"
								>
									Proceed to Checkout
								</button>
							</form>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
