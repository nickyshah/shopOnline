import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCartSessionId } from "@/lib/cart";
import CartRefreshHandler from "./CartRefreshHandler";
import OrderSuccessContainer from "./OrderSuccessContainer";

export default async function SuccessPage({
	searchParams,
}: {
	searchParams: Promise<{ session_id?: string }>;
}) {
	const supabase = await getSupabaseServerClient();
	const { data: auth } = await supabase.auth.getUser();
	const user = auth.user;
	const isAuthenticated = !!user;

	const params = await searchParams;
	const stripeSessionId = params?.session_id;

	// NOTE: Do NOT clear cart here! The webhook needs the cart items to create the order.
	// The webhook will clear the cart after successfully creating the order.
	// If we clear it here, the webhook will fail to find cart items.

	// If no session ID, show error
	if (!stripeSessionId) {
		return (
			<div className="min-h-screen flex items-center justify-center px-6">
				<div className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl p-12 text-center">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
						Invalid Session
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mb-8">
						No session ID provided. Please return to the cart and try again.
					</p>
					<a
						href="/cart"
						className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
					>
						Return to Cart
					</a>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Client component to refresh cart count */}
			<CartRefreshHandler />
			{/* Client component that verifies order exists and shows success with order number */}
			<OrderSuccessContainer sessionId={stripeSessionId} isAuthenticated={isAuthenticated} />
		</>
	);
}

