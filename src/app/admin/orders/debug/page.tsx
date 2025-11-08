import { getSupabaseServiceClient } from "@/lib/supabase/service";

export default async function OrdersDebugPage() {
	const supabase = getSupabaseServiceClient();
	
	// Get all orders with full details
	const { data: orders, error } = await supabase
		.from("orders")
		.select("*")
		.order("created_at", { ascending: false });
	
	// Get order items count for each order
	const orderIds = (orders || []).map((o: any) => o.id);
	const { data: orderItems } = orderIds.length > 0
		? await supabase
			.from("order_items")
			.select("order_id")
			.in("order_id", orderIds)
		: { data: [] };
	
	const itemsCountMap: Record<string, number> = {};
	(orderItems || []).forEach((item: any) => {
		itemsCountMap[item.order_id] = (itemsCountMap[item.order_id] || 0) + 1;
	});

	return (
		<div className="min-h-screen p-8">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold mb-6">Orders Debug</h1>
				
				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						<strong>Error:</strong> {error.message}
						{error.code && <div>Code: {error.code}</div>}
						{error.details && <div>Details: {JSON.stringify(error.details)}</div>}
					</div>
				)}
				
				<div className="mb-4">
					<strong>Total Orders:</strong> {orders?.length || 0}
				</div>
				
				<div className="space-y-4">
					{(orders || []).map((order: any) => (
						<div key={order.id} className="bg-white border border-gray-300 rounded p-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<strong>ID:</strong> {order.id}
								</div>
								<div>
									<strong>Status:</strong> {order.status}
								</div>
								<div>
									<strong>User ID:</strong> {order.user_id || "NULL (Guest)"}
								</div>
								<div>
									<strong>Guest Email:</strong> {order.guest_email || "NULL"}
								</div>
								<div>
									<strong>Amount:</strong> ${(order.amount_cents / 100).toFixed(2)}
								</div>
								<div>
									<strong>Created:</strong> {new Date(order.created_at).toLocaleString()}
								</div>
								<div>
									<strong>Items Count:</strong> {itemsCountMap[order.id] || 0}
								</div>
								<div>
									<strong>Payment Intent:</strong> {order.stripe_payment_intent || "NULL"}
								</div>
							</div>
							{order.shipping_name && (
								<div className="mt-2 pt-2 border-t">
									<strong>Shipping:</strong> {order.shipping_name}
									{order.shipping_address_line1 && (
										<div className="text-sm text-gray-600">
											{order.shipping_address_line1}
											{order.shipping_city && `, ${order.shipping_city}`}
											{order.shipping_state && `, ${order.shipping_state}`}
											{order.shipping_postal_code && ` ${order.shipping_postal_code}`}
										</div>
									)}
								</div>
							)}
						</div>
					))}
				</div>
				
				{(!orders || orders.length === 0) && (
					<div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
						No orders found in database.
					</div>
				)}
			</div>
		</div>
	);
}

