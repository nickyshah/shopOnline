"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

type OrderSuccessContainerProps = {
	sessionId: string;
	isAuthenticated: boolean;
};

type Order = {
	id: string;
	status: string;
	payment_status: string;
	amount_cents: number;
	created_at: string;
};

export default function OrderSuccessContainer({ sessionId, isAuthenticated }: OrderSuccessContainerProps) {
	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);
	const [attempts, setAttempts] = useState(0);
	const maxAttempts = 5; // Try 5 times with delays

	useEffect(() => {
		async function checkAndCreateOrder() {
			// First, try to find existing order
			try {
				const lookupResponse = await fetch(`/api/orders/lookup-by-session?session_id=${sessionId}`);
				if (lookupResponse.ok) {
					const { order: foundOrder } = await lookupResponse.json();
					if (foundOrder) {
						console.log("[OrderSuccess] Order found:", foundOrder.id);
						setOrder(foundOrder);
						setLoading(false);
						return;
					}
				}
			} catch (error) {
				console.error("[OrderSuccess] Error looking up order:", error);
			}

			// If order not found, wait a bit for webhook, then try fallback creation
			if (attempts < maxAttempts) {
				const delay = attempts === 0 ? 2000 : 1000; // 2s first wait, then 1s intervals
				
				setTimeout(async () => {
					setAttempts((prev) => prev + 1);
					
					// Try lookup again (webhook might have processed)
					try {
						const lookupResponse = await fetch(`/api/orders/lookup-by-session?session_id=${sessionId}`);
						if (lookupResponse.ok) {
							const { order: foundOrder } = await lookupResponse.json();
							if (foundOrder) {
								console.log("[OrderSuccess] Order found after wait:", foundOrder.id);
								setOrder(foundOrder);
								setLoading(false);
								return;
							}
						}
					} catch (error) {
						console.error("[OrderSuccess] Error looking up order:", error);
					}

					// If still not found and this is the last attempt, create it
					if (attempts === maxAttempts - 1) {
						console.log("[OrderSuccess] Creating order via fallback...");
						try {
							const createResponse = await fetch("/api/orders/create-from-session", {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({ session_id: sessionId }),
							});

							if (!createResponse.ok) {
								const errorText = await createResponse.text().catch(() => "");
								let errorData;
								try {
									errorData = JSON.parse(errorText);
								} catch {
									errorData = { error: errorText || `HTTP ${createResponse.status}` };
								}
								console.error("[OrderSuccess] Error creating order:", {
									status: createResponse.status,
									statusText: createResponse.statusText,
									error: errorData,
								});
								toast.error(errorData.error || "Order creation is taking longer than expected. Please check your orders page.");
								setLoading(false);
								return;
							}

							const data = await createResponse.json().catch(() => ({}));
							if (data.order_id || data.already_exists) {
								// Wait a moment for order to be fully saved, then fetch it
								await new Promise((resolve) => setTimeout(resolve, 500));
								
								// Fetch the created order
								const lookupResponse = await fetch(`/api/orders/lookup-by-session?session_id=${sessionId}`);
								if (lookupResponse.ok) {
									const { order: createdOrder } = await lookupResponse.json();
									if (createdOrder) {
										console.log("[OrderSuccess] Order created successfully:", createdOrder.id);
										setOrder(createdOrder);
										setLoading(false);
										return;
									}
								}
								// If lookup fails but order was created, try one more time
								console.log("[OrderSuccess] Order created but lookup failed, retrying...");
								await new Promise((resolve) => setTimeout(resolve, 1000));
								const retryLookup = await fetch(`/api/orders/lookup-by-session?session_id=${sessionId}`);
								if (retryLookup.ok) {
									const { order: retryOrder } = await retryLookup.json();
									if (retryOrder) {
										setOrder(retryOrder);
										setLoading(false);
										return;
									}
								}
							}
							
							// If we get here, order creation didn't work as expected
							console.error("[OrderSuccess] Order creation response unexpected:", data);
							toast.error("Order creation is taking longer than expected. Please check your orders page.");
							setLoading(false);
						} catch (error: any) {
							console.error("[OrderSuccess] Error creating order:", {
								message: error?.message,
								stack: error?.stack,
								error,
							});
							toast.error("Failed to create order. Please contact support.");
							setLoading(false);
						}
					}
				}, delay);
			} else {
				// Max attempts reached, stop loading
				setLoading(false);
			}
		}

		checkAndCreateOrder();
	}, [sessionId, attempts]);

	// Show loading state
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center px-6">
				<div className="fixed inset-0 -z-10 overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
				</div>
				<div className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl p-12 text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
					<p className="text-lg text-gray-600 dark:text-gray-400">Processing your order...</p>
				</div>
			</div>
		);
	}

	// Show error state if no order found after all attempts
	if (!order) {
		return (
			<div className="min-h-screen flex items-center justify-center px-6">
				<div className="fixed inset-0 -z-10 overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
				</div>
				<div className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl p-12 text-center">
					<div className="mx-auto w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-6">
						<svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>
					<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
						Order Processing
					</h1>
					<p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
						Your payment was successful, but we're still processing your order. Please check back in a few moments.
					</p>
					{isAuthenticated ? (
						<Link
							href="/orders"
							className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
						>
							Check Your Orders
						</Link>
					) : (
						<Link
							href="/orders/track"
							className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
						>
							Track Your Order
						</Link>
					)}
				</div>
			</div>
		);
	}

	// Show success state with order number
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
					<div className="mb-6 p-4 bg-white/30 dark:bg-white/10 rounded-xl border border-white/30 dark:border-white/20">
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order Number</p>
						<p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
							#{order.id.slice(0, 8).toUpperCase()}
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
							Total: ${(order.amount_cents / 100).toFixed(2)}
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

