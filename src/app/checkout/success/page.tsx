import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCartSessionId } from "@/lib/cart";
import Link from "next/link";
import CartRefreshHandler from "./CartRefreshHandler";

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

	// Clear cart as a backup (webhook should handle this, but this ensures it happens)
	if (stripeSessionId) {
		try {
			let cartId: string | null = null;

			if (user) {
				// Authenticated user - find their cart
				const { data: cart } = await supabase
					.from("carts")
					.select("id")
					.eq("user_id", user.id)
					.maybeSingle();
				cartId = cart?.id || null;
			} else {
				// Guest user - find cart by session ID
				const sessionId = await getCartSessionId();
				if (sessionId) {
					const { data: cart } = await supabase
						.from("carts")
						.select("id")
						.eq("session_id", sessionId)
						.maybeSingle();
					cartId = cart?.id || null;
				}
			}

			// Clear cart items if cart exists
			if (cartId) {
				const { error } = await supabase
					.from("cart_items")
					.delete()
					.eq("cart_id", cartId);

				if (error) {
					console.error("[SuccessPage] Error clearing cart:", error);
				} else {
					console.log("[SuccessPage] Cart cleared successfully");
				}
			}
		} catch (error) {
			console.error("[SuccessPage] Error processing cart clear:", error);
			// Don't fail the page if cart clearing fails - webhook should handle it
		}
	}

	return (
		<>
			{/* Client component to refresh cart count */}
			<CartRefreshHandler />
			<div className="min-h-screen flex items-center justify-center px-6">
				{/* Animated Background */}
				<div className="fixed inset-0 -z-10 overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
					<div className="absolute top-0 -left-4 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob dark:opacity-10"></div>
					<div className="absolute top-0 -right-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 dark:opacity-10"></div>
					<div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 dark:opacity-10"></div>
				</div>

				{/* Success Card */}
				<div className="relative w-full max-w-2xl">
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl p-12 text-center">
						{/* Success Icon */}
						<div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
							<svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
							</svg>
						</div>

						<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
							Thank You!
						</h1>
						<p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
							Your payment was successful. Your order has been created and will be processed shortly.
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
							Your cart has been cleared.
						</p>

						{isAuthenticated ? (
							<Link
								href="/orders"
								className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
							>
								View Your Orders
							</Link>
						) : (
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Check your email for order confirmation.
							</p>
						)}

						<div className="mt-8">
							<Link
								href="/products"
								className="text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline"
							>
								Continue Shopping
							</Link>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

