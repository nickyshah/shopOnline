"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type GiftCardFormProps = {
	giftCard?: any;
};

export default function GiftCardForm({ giftCard }: GiftCardFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		code: giftCard?.code || "",
		initial_amount_cents: giftCard?.initial_amount_cents
			? (giftCard.initial_amount_cents / 100).toFixed(2)
			: "",
		valid_from: giftCard?.valid_from
			? new Date(giftCard.valid_from).toISOString().slice(0, 16)
			: new Date().toISOString().slice(0, 16),
		valid_until: giftCard?.valid_until
			? new Date(giftCard.valid_until).toISOString().slice(0, 16)
			: "",
		active: giftCard?.active !== undefined ? giftCard.active : true,
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type } = e.target;
		if (type === "checkbox") {
			const checked = (e.target as HTMLInputElement).checked;
			setFormData({ ...formData, [name]: checked });
		} else {
			setFormData({ ...formData, [name]: value });
		}
	};

	const generateCode = () => {
		const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
		let code = "";
		for (let i = 0; i < 12; i++) {
			code += chars.charAt(Math.floor(Math.random() * chars.length));
			if (i === 3 || i === 7) code += "-";
		}
		setFormData({ ...formData, code });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (!formData.code) {
				throw new Error("Please generate or enter a gift card code");
			}

			const payload: any = {
				code: formData.code.toUpperCase().replace(/\s+/g, "-"),
				initial_amount_cents: parseInt((parseFloat(formData.initial_amount_cents as string) * 100).toString()),
				remaining_amount_cents: parseInt((parseFloat(formData.initial_amount_cents as string) * 100).toString()),
				valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : null,
				valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
				active: formData.active,
			};

			const url = giftCard ? `/api/admin/gift-cards/${giftCard.id}` : "/api/admin/gift-cards";
			const method = giftCard ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to save gift card");
			}

			toast.success(giftCard ? "Gift card updated successfully!" : "Gift card created successfully!");
			router.push("/admin/gift-cards");
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Failed to save gift card");
			console.error("Gift card form error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
						Code *
					</label>
					<div className="flex gap-2">
						<input
							type="text"
							name="code"
							required
							value={formData.code}
							onChange={handleChange}
							className="flex-1 px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="GIFT-XXXX-XXXX"
						/>
						<button
							type="button"
							onClick={generateCode}
							className="px-4 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white font-semibold hover:bg-white/30 dark:hover:bg-white/15 transition-all"
						>
							Generate
						</button>
					</div>
				</div>
				<div>
					<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
						Amount ($) *
					</label>
					<input
						type="number"
						name="initial_amount_cents"
						required
						min="0.01"
						step="0.01"
						value={formData.initial_amount_cents}
						onChange={handleChange}
						className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="100.00"
					/>
				</div>
			</div>

			<div className="border-t border-white/20 dark:border-white/10 pt-6">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Validity</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
							Valid From
						</label>
						<input
							type="datetime-local"
							name="valid_from"
							value={formData.valid_from}
							onChange={handleChange}
							className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
							Valid Until
						</label>
						<input
							type="datetime-local"
							name="valid_until"
							value={formData.valid_until}
							onChange={handleChange}
							className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					name="active"
					id="active"
					checked={formData.active}
					onChange={handleChange}
					className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
				/>
				<label htmlFor="active" className="text-sm text-gray-900 dark:text-white">
					Active
				</label>
			</div>

			<div className="flex gap-4 pt-4">
				<button
					type="submit"
					disabled={loading}
					className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? "Saving..." : giftCard ? "Update Gift Card" : "Create Gift Card"}
				</button>
				<button
					type="button"
					onClick={() => router.push("/admin/gift-cards")}
					className="px-6 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white font-semibold hover:bg-white/30 dark:hover:bg-white/15 transition-all"
				>
					Cancel
				</button>
			</div>
		</form>
	);
}

