"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SuccessPageClientProps = {
	sessionId: string;
	isAuthenticated: boolean;
};

export default function SuccessPageClient({ sessionId, isAuthenticated }: SuccessPageClientProps) {
	const [orderId, setOrderId] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function ensureOrderExists() {
			try {
				setLoading(true);
				
				// Wait a bit for webhook to process
				await new Promise((resolve) => setTimeout(resolve, 2000));

				const response = await fetch("/api/orders/create-from-session", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ session_id: sessionId }),
				});

				if (!response.ok) {
					const error = await response.json().catch(() => ({}));
					console.error("[SuccessPage] Error ensuring order exists:", error);
					setError(error.error || "Failed to create order");
					setLoading(false);
					return;
				}

				const data = await response.json();
				console.log("[SuccessPage] Order confirmed:", data.order_id);
				setOrderId(data.order_id);
				setLoading(false);
			} catch (error) {
				console.error("[SuccessPage] Error ensuring order exists:", error);
				setError("Failed to verify order");
				setLoading(false);
			}
		}

		ensureOrderExists();
	}, [sessionId]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center px-6">
				{/* Animated Background */}
				<div className="fixed inset-0 -z-10 overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
					<div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob dark:opacity-10"></div>
					<div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 dark:opacity-10"></div>
					<div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 dark:opacity-10"></div>
				</div>

				<div className="relative w-full max-w-2xl">
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl p-12 text-center">
						{/* Loading Spinner */}
						<div className="mx-auto w-20 h-20 mb-6">
							<div className="w-full h-full border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
						</div>

						<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
							Processing Your Order...
						</h1>
						<p className="text-lg text-gray-600 dark:text-gray-400">
							Please wait while we confirm your payment and create your order.
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (error || !orderId) {
		return (
			<div className="min-h-screen flex items-center justify-center px-6">
				{/* Animated Background */}
				<div className="fixed inset-0 -z-10 overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20"></div>
				</div>

				<div className="relative w-full max-w-2xl">
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl p-12 text-center">
						<div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-400 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
							<svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>

						<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
							Order Confirmation Pending
						</h1>
						<p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
							Your payment was successful, but we're still processing your order. Please check back in a few minutes.
						</p>
						{error && (
							<p className="text-sm text-red-600 dark:text-red-400 mb-6">
								Error: {error}
							</p>
						)}
						<div className="space-y-3">
							{isAuthenticated && (
								<Link
									href="/orders"
									className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
								>
									Check Your Orders
								</Link>
							)}
							<div>
								<Link
									href="/contact"
									className="text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline"
								>
									Contact Support
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
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
					<p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
						Your payment was successful. Your order has been created and will be processed shortly.
					</p>

					{/* Order Number */}
					<div className="mb-6 inline-block bg-white/30 dark:bg-white/10 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-white/20 px-8 py-4">
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order Number</p>
						<p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
							#{orderId.slice(0, 8).toUpperCase()}
						</p>
					</div>

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
						<div className="space-y-4">
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Check your email for order confirmation.
							</p>
							<Link
								href="/orders/track"
								className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
							>
								Track Your Order
							</Link>
						</div>
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
	);
}
