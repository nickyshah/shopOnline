"use client";

import { useState } from "react";
import Link from "next/link";
import CartRefreshHandler from "./CartRefreshHandler";
import SuccessPageClient from "./SuccessPageClient";

type SuccessPageWrapperProps = {
	stripeSessionId?: string;
	isAuthenticated: boolean;
};

export default function SuccessPageWrapper({ stripeSessionId, isAuthenticated }: SuccessPageWrapperProps) {
	const [orderId, setOrderId] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const handleOrderCreated = (id: string) => {
		setOrderId(id);
		setLoading(false);
	};

	const handleError = () => {
		setError(true);
		setLoading(false);
	};

	return (
		<>
			{/* Client component to refresh cart count and ensure order is created */}
			<CartRefreshHandler />
			{stripeSessionId && !orderId && !error && (
				<SuccessPageClient 
					sessionId={stripeSessionId} 
					onOrderCreated={handleOrderCreated}
					onError={handleError}
				/>
			)}
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
						{loading && !error ? (
							// Loading state
							<>
								<div className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl animate-pulse">
									<svg className="w-12 h-12 text-white animate-spin" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								</div>
								<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
									Processing...
								</h1>
								<p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
									Your payment was successful. We're creating your order now.
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-500">
									Please wait a moment...
								</p>
							</>
						) : error ? (
							// Error state
							<>
								<div className="mx-auto w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
									<svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
									</svg>
								</div>
								<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
									Payment Received
								</h1>
								<p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
									Your payment was successful, but there was an issue creating your order. Please contact support with your payment confirmation.
								</p>
								<div className="mt-8">
									<Link
										href="/contact"
										className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
									>
										Contact Support
									</Link>
								</div>
							</>
						) : (
							// Success state
							<>
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
								
								{orderId && (
									<div className="mb-6">
										<div className="inline-block bg-white/30 dark:bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/40 dark:border-white/30">
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order Number</p>
											<p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
												#{orderId.slice(0, 8).toUpperCase()}
											</p>
										</div>
									</div>
								)}

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
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

