import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
	return (
		<div className="min-h-screen">
			{/* Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
			</div>

			<div className="relative">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">All Orders</h1>
				<AdminOrdersClient />
			</div>
		</div>
	);
}
