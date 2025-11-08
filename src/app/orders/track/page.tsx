"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function TrackOrderPage() {
	const [orderId, setOrderId] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [loading, setLoading] = useState(false);
	const [order, setOrder] = useState<any>(null);

	const handleLookup = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!orderId || (!email && !phone)) {
			toast.error("Please provide order ID and either email or phone");
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("/api/orders/guest/lookup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ orderId, email, phone }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Order not found");
			}

			const data = await res.json();
			setOrder(data.order);
			toast.success("Order found!");
		} catch (error: any) {
			toast.error(error.message || "Failed to lookup order");
			setOrder(null);
		} finally {
			setLoading(false);
		}
	};

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
						Track Your <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Order</span>
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400">Enter your order details to view order status</p>
				</div>

				{/* Lookup Form */}
				<form onSubmit={handleLookup} className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl p-8 space-y-6 mb-8">
					<div>
						<label htmlFor="orderId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Order ID <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="orderId"
							required
							value={orderId}
							onChange={(e) => setOrderId(e.target.value)}
							className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							placeholder="Enter your order ID"
						/>
					</div>
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Email <span className="text-gray-500">(or phone)</span>
						</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							placeholder="your@email.com"
						/>
					</div>
					<div>
						<label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Phone <span className="text-gray-500">(or email)</span>
						</label>
						<input
							type="tel"
							id="phone"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							placeholder="+1 (555) 123-4567"
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
					>
						{loading ? "Looking up..." : "Track Order"}
					</button>
				</form>

				{/* Order Details */}
				{order && (
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl p-8">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Details</h2>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-gray-600 dark:text-gray-400">Order ID:</span>
								<span className="font-semibold text-gray-900 dark:text-white">{order.id}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-gray-600 dark:text-gray-400">Status:</span>
								<span className="px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full border border-white/30 dark:border-white/20 text-sm font-semibold text-gray-900 dark:text-white capitalize">
									{order.status}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-gray-600 dark:text-gray-400">Payment Status:</span>
								<span className="px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full border border-white/30 dark:border-white/20 text-sm font-semibold text-gray-900 dark:text-white capitalize">
									{order.payment_status}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-gray-600 dark:text-gray-400">Total:</span>
								<span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
									${(order.amount_cents / 100).toFixed(2)}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-gray-600 dark:text-gray-400">Order Date:</span>
								<span className="text-gray-900 dark:text-white">
									{new Date(order.created_at).toLocaleString()}
								</span>
							</div>
							{order.shipping_name && (
								<div className="pt-4 border-t border-white/20 dark:border-white/10">
									<div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Shipping Address:</div>
									<div className="text-gray-600 dark:text-gray-400">
										{order.shipping_name}
										{order.shipping_address_line1 && <div>{order.shipping_address_line1}</div>}
										{order.shipping_address_line2 && <div>{order.shipping_address_line2}</div>}
										<div>
											{order.shipping_city}
											{order.shipping_state && `, ${order.shipping_state}`}
											{order.shipping_postal_code && ` ${order.shipping_postal_code}`}
										</div>
										{order.shipping_country && <div>{order.shipping_country}</div>}
									</div>
								</div>
							)}
							{order.order_items && order.order_items.length > 0 && (
								<div className="pt-4 border-t border-white/20 dark:border-white/10">
									<div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Items:</div>
									<div className="space-y-2">
										{order.order_items.map((item: any) => (
											<div key={item.id} className="flex items-center justify-between text-gray-600 dark:text-gray-400">
												<span>
													{item.product.name} × {item.quantity}
												</span>
												<span>${(item.unit_price_cents / 100).toFixed(2)}</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}


