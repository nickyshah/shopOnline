import GiftCardForm from "@/app/components/GiftCardForm";
import Link from "next/link";

export default function NewGiftCardPage() {
	return (
		<div className="min-h-screen">
			<div className="relative">
				<div className="mb-6">
					<Link
						href="/admin/gift-cards"
						className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block"
					>
						← Back to Gift Cards
					</Link>
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create New Gift Card</h1>
					<p className="text-gray-600 dark:text-gray-400">Generate a new gift card with a unique code</p>
				</div>

				<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-8">
					<GiftCardForm />
				</div>
			</div>
		</div>
	);
}

