"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

type Order = {
	id: string;
	user_id: string | null;
	guest_email: string | null;
	customer_email: string | null;
	status: string;
	payment_status: string;
	amount_cents: number;
	shipping_name: string | null;
	phone: string | null;
	shipping_city: string | null;
	shipping_state: string | null;
	shipping_country: string | null;
	created_at: string;
	updated_at: string;
	order_items: Array<{
		id: string;
		quantity: number;
		unit_price_cents: number;
		product: {
			id: string;
			name: string;
		};
	}>;
};

export default function AdminOrdersClient() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({
		status: "",
		payment_status: "",
		start_date: "",
		end_date: "",
	});

	useEffect(() => {
		fetchOrders();
	}, [filters]);

	const fetchOrders = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (filters.status) params.set("status", filters.status);
			if (filters.payment_status) params.set("payment_status", filters.payment_status);
			if (filters.start_date) params.set("start_date", filters.start_date);
			if (filters.end_date) params.set("end_date", filters.end_date);

			const res = await fetch(`/api/admin/orders?${params.toString()}`);
			if (!res.ok) throw new Error("Failed to fetch orders");
			const data = await res.json();
			setOrders(data.orders || []);
		} catch (error: any) {
			toast.error(error.message || "Failed to load orders");
		} finally {
			setLoading(false);
		}
	};

	const updateOrderStatus = async (orderId: string, status: string) => {
		try {
			const res = await fetch(`/api/admin/orders/${orderId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			});
			if (!res.ok) throw new Error("Failed to update order");
			toast.success("Order status updated");
			fetchOrders();
		} catch (error: any) {
			toast.error(error.message || "Failed to update order");
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-12">
				<div className="text-gray-600 dark:text-gray-400">Loading orders...</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Filters */}
			<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
						<select
							value={filters.status}
							onChange={(e) => setFilters({ ...filters, status: e.target.value })}
							className="w-full px-4 py-2 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white"
						>
							<option value="">All</option>
							<option value="pending">Pending</option>
							<option value="processing">Processing</option>
							<option value="paid">Paid</option>
							<option value="fulfilled">Fulfilled</option>
							<option value="shipped">Shipped</option>
							<option value="completed">Completed</option>
							<option value="cancelled">Cancelled</option>
							<option value="refunded">Refunded</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Status</label>
						<select
							value={filters.payment_status}
							onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
							className="w-full px-4 py-2 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white"
						>
							<option value="">All</option>
							<option value="unpaid">Unpaid</option>
							<option value="paid">Paid</option>
							<option value="refunded">Refunded</option>
							<option value="failed">Failed</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
						<input
							type="date"
							value={filters.start_date}
							onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
							className="w-full px-4 py-2 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
						<input
							type="date"
							value={filters.end_date}
							onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
							className="w-full px-4 py-2 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white"
						/>
					</div>
				</div>
			</div>

			{/* Orders List */}
			<div className="space-y-4">
				{orders.length > 0 ? (
					orders.map((order) => (
						<div
							key={order.id}
							className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6"
						>
							<div className="flex items-start justify-between mb-4">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										<Link
											href={`/admin/orders/${order.id}`}
											className="font-bold text-lg text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
										>
											Order #{order.id.slice(0, 8).toUpperCase()}
										</Link>
										{!order.user_id && (
											<span className="px-2 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
												Guest
											</span>
										)}
									</div>
									<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
										Customer: {order.customer_email || "Unknown"}
									</div>
									{order.shipping_name && (
										<div className="text-sm text-gray-600 dark:text-gray-400">
											{order.shipping_name}
											{order.shipping_city && `, ${order.shipping_city}`}
											{order.shipping_state && `, ${order.shipping_state}`}
										</div>
									)}
									<div className="text-sm text-gray-600 dark:text-gray-400">
										{new Date(order.created_at).toLocaleString()}
									</div>
								</div>
								<div className="text-right">
									<div className="mb-2">
										<select
											value={order.status}
											onChange={(e) => updateOrderStatus(order.id, e.target.value)}
											className="px-3 py-1 rounded-lg border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white text-sm"
										>
											<option value="pending">Pending</option>
											<option value="processing">Processing</option>
											<option value="paid">Paid</option>
											<option value="fulfilled">Fulfilled</option>
											<option value="shipped">Shipped</option>
											<option value="completed">Completed</option>
											<option value="cancelled">Cancelled</option>
											<option value="refunded">Refunded</option>
										</select>
									</div>
									<div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full border border-white/30 dark:border-white/20 mb-2">
										<span className="text-xs font-semibold text-gray-900 dark:text-white capitalize">
											{order.payment_status}
										</span>
									</div>
									<div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
										${(order.amount_cents / 100).toFixed(2)}
									</div>
								</div>
							</div>
							{order.order_items && order.order_items.length > 0 && (
								<div className="mt-4 pt-4 border-t border-white/20 dark:border-white/10">
									<div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Items:</div>
									<div className="space-y-1">
										{order.order_items.map((item) => (
											<div key={item.id} className="text-sm text-gray-600 dark:text-gray-400">
												{item.product.name} × {item.quantity} - ${(item.unit_price_cents / 100).toFixed(2)}
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					))
				) : (
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-12 text-center">
						<p className="text-gray-600 dark:text-gray-400">No orders found</p>
					</div>
				)}
			</div>
		</div>
	);
}


