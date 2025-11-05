export default function SuccessPage() {
	return (
		<div className="mx-auto max-w-3xl p-6">
			<h1 className="text-2xl font-semibold mb-2">Thank you!</h1>
			<p>Your payment was successful. Your order has been created.</p>
			<a className="underline mt-4 inline-block" href="/orders">View your orders</a>
		</div>
	);
}


