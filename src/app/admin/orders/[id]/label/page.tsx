"use client";

import { useEffect } from "react";

export default function LabelPage() {
	useEffect(() => {
		// Auto-open the print dialog
		window.print();
	}, []);

	// In a real setup, fetch order details and shipping info server-side.
	return (
		<div className="p-8 print:p-0">
			<div className="max-w-lg mx-auto border-2 border-black p-6 print:border-black">
				<div className="text-xl font-bold mb-4">Shipping Label</div>
				<div className="space-y-2">
					<div>
						<div className="font-semibold">From</div>
						<div>Ecommerce Store</div>
						<div>123 Commerce St</div>
						<div>San Francisco, CA 94105</div>
					</div>
					<div className="mt-4">
						<div className="font-semibold">To</div>
						<div>[Customer Name]</div>
						<div>[Address Line 1]</div>
						<div>[City, State ZIP]</div>
					</div>
				</div>
				<div className="mt-6">
					<div className="font-semibold">Order</div>
					<div>Order ID: (see URL)</div>
				</div>
			</div>
			<style>{`
				@media print {
					@page { margin: 0.25in; }
					button, a, nav, header { display: none !important; }
					body { background: white !important; }
				}
			`}</style>
		</div>
	);
}


