"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type CouponFormProps = {
	coupon?: any;
	categories?: any[];
	products?: any[];
};

export default function CouponForm({ coupon, categories = [], products = [] }: CouponFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	// Initialize form data, converting cents to dollars for fixed_amount discount type
	const getInitialDiscountValue = () => {
		if (!coupon?.discount_value) return "";
		if (coupon.discount_type === "fixed_amount") {
			// Convert cents to dollars for display
			return (coupon.discount_value / 100).toFixed(2);
		}
		return coupon.discount_value.toString();
	};

	const [formData, setFormData] = useState({
		code: coupon?.code || "",
		description: coupon?.description || "",
		discount_type: coupon?.discount_type || "percentage",
		discount_value: getInitialDiscountValue(),
		minimum_purchase_cents: coupon?.minimum_purchase_cents
			? (coupon.minimum_purchase_cents / 100).toFixed(2)
			: "",
		maximum_discount_cents: coupon?.maximum_discount_cents
			? (coupon.maximum_discount_cents / 100).toFixed(2)
			: "",
		usage_limit: coupon?.usage_limit || "",
		user_limit: coupon?.user_limit || 1,
		valid_from: coupon?.valid_from
			? new Date(coupon.valid_from).toISOString().slice(0, 16)
			: new Date().toISOString().slice(0, 16),
		valid_until: coupon?.valid_until
			? new Date(coupon.valid_until).toISOString().slice(0, 16)
			: "",
		active: coupon?.active !== undefined ? coupon.active : true,
		applies_to: coupon?.applies_to || "all",
		applies_to_ids: coupon?.applies_to_ids || [],
		first_time_customer_only: coupon?.first_time_customer_only || false,
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value, type } = e.target;
		if (type === "checkbox") {
			const checked = (e.target as HTMLInputElement).checked;
			setFormData({ ...formData, [name]: checked });
		} else if (name === "applies_to_ids") {
			// Handle multi-select for applies_to_ids
			const select = e.target as HTMLSelectElement;
			const selectedIds = Array.from(select.selectedOptions).map((opt) => opt.value);
			setFormData({ ...formData, applies_to_ids: selectedIds });
		} else {
			setFormData({ ...formData, [name]: value });
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Convert discount_value: for percentage, use as-is; for fixed_amount, convert dollars to cents
			let discountValue: number;
			if (formData.discount_type === "fixed_amount") {
				// Convert dollars to cents
				discountValue = parseInt((parseFloat(formData.discount_value as string) * 100).toString());
			} else {
				// Percentage: use as-is (e.g., 20 for 20%)
				discountValue = parseInt(formData.discount_value as string);
			}

			const payload: any = {
				...formData,
				discount_value: discountValue,
				minimum_purchase_cents: formData.minimum_purchase_cents
					? parseInt((parseFloat(formData.minimum_purchase_cents as string) * 100).toString())
					: 0,
				maximum_discount_cents: formData.maximum_discount_cents
					? parseInt((parseFloat(formData.maximum_discount_cents as string) * 100).toString())
					: null,
				usage_limit: formData.usage_limit ? parseInt(formData.usage_limit as string) : null,
				user_limit: parseInt(formData.user_limit as string),
				valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : null,
				valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
				applies_to_ids: formData.applies_to === "all" ? [] : formData.applies_to_ids,
			};

			const url = coupon ? `/api/admin/coupons/${coupon.id}` : "/api/admin/coupons";
			const method = coupon ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to save coupon");
			}

			toast.success(coupon ? "Coupon updated successfully!" : "Coupon created successfully!");
			router.push("/admin/coupons");
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Failed to save coupon");
			console.error("Coupon form error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Basic Info */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
						Code *
					</label>
					<input
						type="text"
						name="code"
						required
						value={formData.code}
						onChange={handleChange}
						className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="SAVE20"
					/>
				</div>
				<div>
					<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
						Discount Type *
					</label>
					<select
						name="discount_type"
						required
						value={formData.discount_type}
						onChange={handleChange}
						className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
					>
						<option value="percentage">Percentage</option>
						<option value="fixed_amount">Fixed Amount</option>
					</select>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
						Discount Value *
					</label>
					<input
						type="number"
						name="discount_value"
						required
						min="1"
						value={formData.discount_value}
						onChange={handleChange}
						className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder={formData.discount_type === "percentage" ? "20" : "10.00"}
						step={formData.discount_type === "percentage" ? "1" : "0.01"}
					/>
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
						{formData.discount_type === "percentage"
							? "Enter percentage (e.g., 20 for 20%)"
							: "Enter amount in dollars (e.g., 10.00 for $10)"}
					</p>
				</div>
				<div>
					<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
						Description
					</label>
					<textarea
						name="description"
						value={formData.description}
						onChange={handleChange}
						rows={3}
						className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="Summer sale discount"
					/>
				</div>
			</div>

			{/* Conditions */}
			<div className="border-t border-white/20 dark:border-white/10 pt-6">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conditions</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
							Minimum Purchase ($)
						</label>
						<input
							type="number"
							name="minimum_purchase_cents"
							min="0"
							step="0.01"
							value={formData.minimum_purchase_cents}
							onChange={handleChange}
							className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="0.00"
						/>
					</div>
					{formData.discount_type === "percentage" && (
						<div>
							<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
								Maximum Discount ($)
							</label>
							<input
								type="number"
								name="maximum_discount_cents"
								min="0"
								step="0.01"
								value={formData.maximum_discount_cents}
								onChange={handleChange}
								className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
								placeholder="0.00"
							/>
						</div>
					)}
					<div>
						<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
							Usage Limit
						</label>
						<input
							type="number"
							name="usage_limit"
							min="1"
							value={formData.usage_limit}
							onChange={handleChange}
							className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Unlimited"
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
							Per Customer Limit
						</label>
						<input
							type="number"
							name="user_limit"
							min="1"
							required
							value={formData.user_limit}
							onChange={handleChange}
							className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
				</div>
			</div>

			{/* Validity */}
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

			{/* Applies To */}
			<div className="border-t border-white/20 dark:border-white/10 pt-6">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Applies To</h3>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
							Scope
						</label>
						<select
							name="applies_to"
							value={formData.applies_to}
							onChange={handleChange}
							className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
						>
							<option value="all">All Products</option>
							<option value="products">Specific Products</option>
							<option value="categories">Specific Categories</option>
						</select>
					</div>
					{(formData.applies_to === "products" || formData.applies_to === "categories") && (
						<div>
							<label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
								{formData.applies_to === "products" ? "Products" : "Categories"} *
							</label>
							<select
								name="applies_to_ids"
								multiple
								required
								size={5}
								value={formData.applies_to_ids}
								onChange={handleChange}
								className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
							>
								{(formData.applies_to === "products" ? products : categories).map((item: any) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</select>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
								Hold Ctrl/Cmd to select multiple items
							</p>
						</div>
					)}
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							name="first_time_customer_only"
							id="first_time_customer_only"
							checked={formData.first_time_customer_only}
							onChange={handleChange}
							className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
						/>
						<label htmlFor="first_time_customer_only" className="text-sm text-gray-900 dark:text-white">
							First-time customers only
						</label>
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
				</div>
			</div>

			<div className="flex gap-4 pt-4">
				<button
					type="submit"
					disabled={loading}
					className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? "Saving..." : coupon ? "Update Coupon" : "Create Coupon"}
				</button>
				<button
					type="button"
					onClick={() => router.push("/admin/coupons")}
					className="px-6 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white font-semibold hover:bg-white/30 dark:hover:bg-white/15 transition-all"
				>
					Cancel
				</button>
			</div>
		</form>
	);
}

