import Link from "next/link";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import DeleteGiftCardButton from "@/app/components/DeleteGiftCardButton";
import { format } from "date-fns";

export default async function AdminGiftCardsPage() {
	const supabase = getSupabaseServiceClient();
	const { data: giftCards } = await supabase
		.from("gift_cards")
		.select("*")
		.order("created_at", { ascending: false });

	const isActive = (card: any) => {
		if (!card.active) return false;
		const now = new Date();
		if (card.valid_from && new Date(card.valid_from) > now) return false;
		if (card.valid_until && new Date(card.valid_until) < now) return false;
		if (card.remaining_amount_cents <= 0) return false;
		return true;
	};

	return (
		<div className="min-h-screen">
			<div className="relative">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Gift Cards</h1>
						<p className="text-gray-600 dark:text-gray-400">Manage gift cards and their balances</p>
					</div>
					<Link
						href="/admin/gift-cards/new"
						className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
					>
						+ Create Gift Card
					</Link>
				</div>

				{giftCards && giftCards.length > 0 ? (
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6 space-y-4">
						{giftCards.map((card: any) => (
							<div
								key={card.id}
								className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/10 p-6"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-3">
											<div className="font-bold text-xl text-gray-900 dark:text-white">
												{card.code}
											</div>
											{isActive(card) ? (
												<span className="px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-400 rounded text-xs font-medium">
													Active
												</span>
											) : (
												<span className="px-2 py-1 bg-red-500/20 text-red-700 dark:text-red-400 rounded text-xs font-medium">
													Inactive
												</span>
											)}
											{card.remaining_amount_cents <= 0 && (
												<span className="px-2 py-1 bg-gray-500/20 text-gray-700 dark:text-gray-400 rounded text-xs font-medium">
													Used
												</span>
											)}
										</div>
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
											<div>
												<div className="text-gray-500 dark:text-gray-500 mb-1">Initial Amount</div>
												<div className="text-gray-900 dark:text-white font-medium">
													${(card.initial_amount_cents / 100).toFixed(2)}
												</div>
											</div>
											<div>
												<div className="text-gray-500 dark:text-gray-500 mb-1">Remaining</div>
												<div className="text-gray-900 dark:text-white font-medium">
													${(card.remaining_amount_cents / 100).toFixed(2)}
												</div>
											</div>
											<div>
												<div className="text-gray-500 dark:text-gray-500 mb-1">Valid Until</div>
												<div className="text-gray-900 dark:text-white font-medium">
													{card.valid_until
														? format(new Date(card.valid_until), "MMM d, yyyy")
														: "No expiry"}
												</div>
											</div>
											<div>
												<div className="text-gray-500 dark:text-gray-500 mb-1">Created</div>
												<div className="text-gray-900 dark:text-white font-medium">
													{format(new Date(card.created_at), "MMM d, yyyy")}
												</div>
											</div>
										</div>
										<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
											<div
												className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
												style={{
													width: `${(card.remaining_amount_cents / card.initial_amount_cents) * 100}%`,
												}}
											></div>
										</div>
									</div>
									<div className="flex items-center gap-3 ml-4">
										<DeleteGiftCardButton giftCardId={card.id} />
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-12 text-center">
						<p className="text-gray-600 dark:text-gray-400 mb-6">No gift cards created yet.</p>
						<Link
							href="/admin/gift-cards/new"
							className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
						>
							Create Your First Gift Card
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}

