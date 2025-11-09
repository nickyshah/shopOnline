import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

type Props = {
	params: Promise<{ id: string }>;
};

// Order status configuration with colors and icons
const statusConfig: Record<string, { label: string; color: string; icon: string; description: string }> = {
	pending: {
		label: "Pending",
		color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
		icon: "⏳",
		description: "Your order is being processed",
	},
	processing: {
		label: "Processing",
		color: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
		icon: "🔄",
		description: "Your order is being prepared",
	},
	paid: {
		label: "Paid",
		color: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
		icon: "✅",
		description: "Payment received",
	},
	fulfilled: {
		label: "Fulfilled",
		color: "bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30",
		icon: "📦",
		description: "Your order has been packed",
	},
	shipped: {
		label: "Shipped",
		color: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
		icon: "🚚",
		description: "Your order is on the way",
	},
	completed: {
		label: "Completed",
		color: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
		icon: "🎉",
		description: "Your order has been delivered",
	},
	cancelled: {
		label: "Cancelled",
		color: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
		icon: "❌",
		description: "This order has been cancelled",
	},
	refunded: {
		label: "Refunded",
		color: "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30",
		icon: "↩️",
		description: "This order has been refunded",
	},
};

// Payment status configuration
const paymentStatusConfig: Record<string, { label: string; color: string }> = {
	unpaid: {
		label: "Unpaid",
		color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
	},
	paid: {
		label: "Paid",
		color: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
	},
	refunded: {
		label: "Refunded",
		color: "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30",
	},
	failed: {
		label: "Failed",
		color: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
	},
};

export default async function OrderDetailPage(props: Props) {
	const { id } = await props.params;
	const supabase = await getSupabaseServerClient();
	const { data: auth } = await supabase.auth.getUser();

	if (!auth.user) {
		redirect("/login");
	}

	// Get order with items
	const { data: order, error } = await supabase
		.from("orders")
		.select(`
			id,
			user_id,
			status,
			payment_status,
			amount_cents,
			shipping_name,
			phone,
			shipping_address_line1,
			shipping_address_line2,
			shipping_city,
			shipping_state,
			shipping_postal_code,
			shipping_country,
			stripe_payment_intent,
			created_at,
			updated_at,
			order_items (
				id,
				quantity,
				unit_price_cents,
				product:products (
					id,
					name,
					image_url,
					price_cents
				)
			)
		`)
		.eq("id", id)
		.single();

	if (error || !order) {
		notFound();
	}

	// Verify user owns this order
	if (order.user_id !== auth.user.id) {
		notFound();
	}

	const statusInfo = statusConfig[order.status] || {
		label: order.status,
		color: "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30",
		icon: "📋",
		description: "Order status",
	};

	const paymentStatusInfo = paymentStatusConfig[order.payment_status] || {
		label: order.payment_status,
		color: "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30",
	};

	const orderItems = (order.order_items as any[]) || [];

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
				{/* Back Button */}
				<Link
					href="/orders"
					className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
				>
					<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
					Back to Orders
				</Link>

				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-2">
						Order <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
							#{order.id.slice(0, 8).toUpperCase()}
						</span>
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400">
						Placed on {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
					</p>
				</div>

				{/* Order Status Card */}
				<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl p-8 mb-6">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-4">
							<div className="text-4xl">{statusInfo.icon}</div>
							<div>
								<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
									{statusInfo.label}
								</h2>
								<p className="text-gray-600 dark:text-gray-400">{statusInfo.description}</p>
							</div>
						</div>
						<div className={`px-4 py-2 rounded-full border ${statusInfo.color} text-sm font-semibold`}>
							{statusInfo.label}
						</div>
					</div>

					{/* Status Timeline */}
					<div className="mt-6 space-y-4">
						{/* Pending */}
						<div className={`flex items-center gap-3 ${order.status !== "pending" ? "opacity-50" : ""}`}>
							<div className={`w-3 h-3 rounded-full ${order.status === "pending" ? "bg-yellow-500" : "bg-gray-300 dark:bg-gray-600"}`}></div>
							<span className="text-sm text-gray-600 dark:text-gray-400">Order placed</span>
							{order.status !== "pending" && (
								<span className="text-xs text-gray-500 dark:text-gray-500 ml-auto">
									{format(new Date(order.created_at), "MMM d, yyyy")}
								</span>
							)}
						</div>

						{/* Processing */}
						<div className={`flex items-center gap-3 ${!["processing", "paid", "fulfilled", "shipped", "completed"].includes(order.status) ? "opacity-50" : ""}`}>
							<div className={`w-3 h-3 rounded-full ${["processing", "paid", "fulfilled", "shipped", "completed"].includes(order.status) ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}></div>
							<span className="text-sm text-gray-600 dark:text-gray-400">Order processing</span>
						</div>

						{/* Shipped */}
						<div className={`flex items-center gap-3 ${!["shipped", "completed"].includes(order.status) ? "opacity-50" : ""}`}>
							<div className={`w-3 h-3 rounded-full ${["shipped", "completed"].includes(order.status) ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"}`}></div>
							<span className="text-sm text-gray-600 dark:text-gray-400">Order shipped</span>
						</div>

						{/* Completed */}
						<div className={`flex items-center gap-3 ${order.status !== "completed" ? "opacity-50" : ""}`}>
							<div className={`w-3 h-3 rounded-full ${order.status === "completed" ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}></div>
							<span className="text-sm text-gray-600 dark:text-gray-400">Order delivered</span>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Order Items */}
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl p-6">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Items</h2>
						<div className="space-y-4">
							{orderItems.map((item: any) => (
								<div
									key={item.id}
									className="flex items-center gap-4 p-4 bg-white/10 dark:bg-white/5 rounded-xl border border-white/20 dark:border-white/10"
								>
									{item.product.image_url && (
										<img
											src={item.product.image_url}
											alt={item.product.name}
											className="w-16 h-16 object-cover rounded-lg"
										/>
									)}
									<div className="flex-1">
										<h3 className="font-semibold text-gray-900 dark:text-white mb-1">
											{item.product.name}
										</h3>
										<div className="text-sm text-gray-600 dark:text-gray-400">
											Quantity: {item.quantity} × ${(item.unit_price_cents / 100).toFixed(2)}
										</div>
									</div>
									<div className="text-lg font-bold text-gray-900 dark:text-white">
										${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}
									</div>
								</div>
							))}
						</div>

						{/* Order Total */}
						<div className="mt-6 pt-6 border-t border-white/20 dark:border-white/10">
							<div className="flex items-center justify-between mb-2">
								<span className="text-gray-600 dark:text-gray-400">Subtotal</span>
								<span className="text-gray-900 dark:text-white">
									${(order.amount_cents / 100).toFixed(2)}
								</span>
							</div>
							<div className="flex items-center justify-between text-xl font-bold">
								<span className="text-gray-900 dark:text-white">Total</span>
								<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
									${(order.amount_cents / 100).toFixed(2)}
								</span>
							</div>
						</div>
					</div>

					{/* Shipping & Payment Info */}
					<div className="space-y-6">
						{/* Payment Status */}
						<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl p-6">
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment</h2>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-gray-600 dark:text-gray-400">Payment Status</span>
									<span className={`px-3 py-1 rounded-full border text-sm font-semibold ${paymentStatusInfo.color}`}>
										{paymentStatusInfo.label}
									</span>
								</div>
								{order.stripe_payment_intent && (
									<div className="flex items-center justify-between">
										<span className="text-gray-600 dark:text-gray-400">Payment ID</span>
										<span className="text-sm font-mono text-gray-900 dark:text-white">
											{order.stripe_payment_intent.slice(0, 20)}...
										</span>
									</div>
								)}
							</div>
						</div>

						{/* Shipping Address */}
						{order.shipping_name && (
							<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl p-6">
								<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Shipping Address</h2>
								<div className="space-y-2 text-gray-700 dark:text-gray-300">
									<p className="font-semibold">{order.shipping_name}</p>
									{order.phone && <p>{order.phone}</p>}
									{order.shipping_address_line1 && <p>{order.shipping_address_line1}</p>}
									{order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
									<p>
										{order.shipping_city}
										{order.shipping_state && `, ${order.shipping_state}`}
										{order.shipping_postal_code && ` ${order.shipping_postal_code}`}
									</p>
									{order.shipping_country && <p>{order.shipping_country}</p>}
								</div>
							</div>
						)}

						{/* Order Information */}
						<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl p-6">
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Order Information</h2>
							<div className="space-y-3 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-gray-600 dark:text-gray-400">Order ID</span>
									<span className="font-mono text-gray-900 dark:text-white">{order.id}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600 dark:text-gray-400">Order Date</span>
									<span className="text-gray-900 dark:text-white">
										{format(new Date(order.created_at), "MMM d, yyyy")}
									</span>
								</div>
								{order.updated_at && order.updated_at !== order.created_at && (
									<div className="flex items-center justify-between">
										<span className="text-gray-600 dark:text-gray-400">Last Updated</span>
										<span className="text-gray-900 dark:text-white">
											{format(new Date(order.updated_at), "MMM d, yyyy")}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

