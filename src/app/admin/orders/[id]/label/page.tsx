import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { notFound } from "next/navigation";
import Link from "next/link";
import PrintButtonClient from "./PrintButtonClient";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function LabelPage(props: Props) {
	const { id } = await props.params;
	const supabase = getSupabaseServiceClient();

	// Get order details
	const { data: order } = await supabase
		.from("orders")
		.select(`
			id,
			shipping_name,
			shipping_address_line1,
			shipping_address_line2,
			shipping_city,
			shipping_state,
			shipping_postal_code,
			shipping_country,
			user_id,
			guest_email
		`)
		.eq("id", id)
		.single();

	if (!order) {
		notFound();
	}

	// Get user email if order has a user_id
	let customerEmail: string | null = null;
	if ((order as any).user_id) {
		const { data: userData } = await supabase.auth.admin.getUserById((order as any).user_id);
		customerEmail = userData?.user?.email || null;
	}

	const customerName = (order as any).shipping_name || customerEmail || (order as any).guest_email || "Customer";
	const addressLine1 = (order as any).shipping_address_line1 || "";
	const addressLine2 = (order as any).shipping_address_line2 || "";
	const city = (order as any).shipping_city || "";
	const state = (order as any).shipping_state || "";
	const postalCode = (order as any).shipping_postal_code || "";
	const country = (order as any).shipping_country || "";

	return (
		<>
			<PrintButtonClient />
			<div className="min-h-screen p-8 print:p-0">
				<div className="max-w-lg mx-auto border-2 border-black p-6 print:border-black bg-white">
					<div className="text-xl font-bold mb-4">Shipping Label</div>
					<div className="space-y-4">
						<div>
							<div className="font-semibold text-sm text-gray-600 mb-1">From</div>
							<div>RawNode Store</div>
							<div>123 Commerce St</div>
							<div>San Francisco, CA 94105</div>
							<div>United States</div>
						</div>
						<div className="mt-4">
							<div className="font-semibold text-sm text-gray-600 mb-1">To</div>
							<div className="font-medium">{customerName}</div>
							{addressLine1 && <div>{addressLine1}</div>}
							{addressLine2 && <div>{addressLine2}</div>}
							{(city || state || postalCode) && (
								<div>
									{city}{city && state ? ", " : ""}{state} {postalCode}
								</div>
							)}
							{country && <div>{country}</div>}
						</div>
					</div>
					<div className="mt-6 pt-4 border-t border-gray-300">
						<div className="font-semibold text-sm text-gray-600 mb-1">Order</div>
						<div className="font-mono text-sm">Order ID: {id.slice(0, 8).toUpperCase()}</div>
					</div>
					<div className="mt-4 print:hidden">
						<Link
							href={`/admin/orders/${id}`}
							className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
						>
							← Back to Order
						</Link>
					</div>
				</div>
				<style>{`
					@media print {
						@page { margin: 0.25in; }
						button, a, nav, header { display: none !important; }
						body { background: white !important; }
						.print\\:border-black { border-color: black !important; }
					}
				`}</style>
			</div>
		</>
	);
}
