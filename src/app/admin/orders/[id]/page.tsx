import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage(props: Props) {
	const { id } = await props.params;
	// Use service client to bypass RLS and see all orders
	const supabase = getSupabaseServiceClient();

	// Get order with customer info
	const { data: order } = await supabase
		.from("orders")
		.select(`
			id,
			status,
			amount_cents,
			created_at,
			user_id,
			guest_email,
			stripe_payment_intent,
			shipping_name,
			shipping_address_line1,
			shipping_address_line2,
			shipping_city,
			shipping_state,
			shipping_postal_code,
			shipping_country
		`)
		.eq("id", id)
		.single();

	if (!order) {
		notFound();
	}

	// Get user email if order has a user_id
	let userEmail: string | null = null;
	if ((order as any).user_id) {
		const { data: userData } = await supabase.auth.admin.getUserById((order as any).user_id);
		userEmail = userData?.user?.email || null;
	}

	// Get order items with product details
	const { data: orderItems } = await supabase
		.from("order_items")
		.select(`
			id,
			quantity,
			unit_price_cents,
			product:products(id, name, image_url)
		`)
		.eq("order_id", id);

	const customerEmail = userEmail || (order as any).guest_email || "Unknown";
	const isGuest = !(order as any).user_id;

	return (
		<div className="min-h-screen">
			{/* Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
			</div>

			<div className="relative">
				<div className="mb-6">
					<Link
						href="/admin/orders"
						className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 inline-block"
					>
						← Back to Orders
					</Link>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Order #{order.id.slice(0, 8).toUpperCase()}
					</h1>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					{/* Order Info */}
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6">
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Order Information</h2>
						<div className="space-y-3">
							<div>
								<div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
								<div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full border border-white/30 dark:border-white/20 mt-1">
									<span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{order.status}</span>
								</div>
							</div>
							<div>
								<div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
								<div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
									${(order.amount_cents / 100).toFixed(2)}
								</div>
							</div>
							<div>
								<div className="text-sm text-gray-600 dark:text-gray-400">Order Date</div>
								<div className="text-gray-900 dark:text-white">
									{new Date(order.created_at as any).toLocaleString()}
								</div>
							</div>
							{(order as any).stripe_payment_intent && (
								<div>
									<div className="text-sm text-gray-600 dark:text-gray-400">Stripe Payment Intent</div>
									<div className="text-xs font-mono text-gray-700 dark:text-gray-300">
										{(order as any).stripe_payment_intent}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Customer Info */}
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6">
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h2>
						<div className="space-y-3">
							<div>
								<div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
								<div className="text-gray-900 dark:text-white">{customerEmail}</div>
								{isGuest && (
									<span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
										Guest Order
									</span>
								)}
							</div>
							{(order as any).shipping_name && (
								<div>
									<div className="text-sm text-gray-600 dark:text-gray-400">Shipping Address</div>
									<div className="text-gray-900 dark:text-white">
										{(order as any).shipping_name}
										<br />
										{(order as any).shipping_address_line1}
										{(order as any).shipping_address_line2 && (
											<>{(order as any).shipping_address_line2}<br /></>
										)}
										{(order as any).shipping_city}, {(order as any).shipping_state} {(order as any).shipping_postal_code}
										<br />
										{(order as any).shipping_country}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Order Items */}
				<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Order Items</h2>
					<div className="space-y-4">
						{orderItems && orderItems.length > 0 ? (
							orderItems.map((item: any) => (
								<div
									key={item.id}
									className="flex items-center gap-4 p-4 bg-white/10 dark:bg-white/5 rounded-xl border border-white/20 dark:border-white/10"
								>
									{item.product?.image_url && (
										<img
											src={item.product.image_url}
											alt={item.product.name}
											className="w-16 h-16 object-cover rounded-lg"
										/>
									)}
									<div className="flex-1">
										<div className="font-semibold text-gray-900 dark:text-white">{item.product?.name || "Unknown Product"}</div>
										<div className="text-sm text-gray-600 dark:text-gray-400">
											Quantity: {item.quantity} × ${(item.unit_price_cents / 100).toFixed(2)}
										</div>
									</div>
									<div className="text-lg font-bold text-gray-900 dark:text-white">
										${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}
									</div>
								</div>
							))
						) : (
							<p className="text-gray-600 dark:text-gray-400">No items found</p>
						)}
					</div>
				</div>

				<div className="mt-6 flex gap-4">
					<Link
						href={`/admin/orders/${id}/label`}
						className="px-6 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white font-semibold hover:bg-white/30 dark:hover:bg-white/15 transition-all"
					>
						Print Shipping Label
					</Link>
				</div>
			</div>
		</div>
	);
}

