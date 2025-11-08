"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function CheckoutPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const couponId = searchParams.get("coupon_id") || undefined;
	const giftCardId = searchParams.get("gift_card_id") || undefined;

	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		fullName: "",
		phone: "",
		addressLine1: "",
		addressLine2: "",
		city: "",
		state: "",
		postalCode: "",
		country: "US",
	});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Validate required fields
			if (!formData.email || !formData.fullName || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode) {
				toast.error("Please fill in all required fields");
				setLoading(false);
				return;
			}

			// Validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				toast.error("Please enter a valid email address");
				setLoading(false);
				return;
			}

			// Call Stripe checkout API with customer information
			const response = await fetch("/api/stripe/checkout", {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					coupon_id: couponId,
					gift_card_id: giftCardId,
					customer: {
						email: formData.email,
						name: formData.fullName,
						phone: formData.phone,
						address: {
							line1: formData.addressLine1,
							line2: formData.addressLine2 || undefined,
							city: formData.city,
							state: formData.state,
							postal_code: formData.postalCode,
							country: formData.country,
						},
					},
				}),
			});

			if (!response.ok) {
				const contentType = response.headers.get("content-type");
				if (contentType && contentType.includes("application/json")) {
					const data = await response.json().catch(() => ({}));
					const statusText = String(response.status || "Unknown");
					throw new Error(data.error || `HTTP ${statusText}: Failed to proceed to checkout`);
				} else {
					const text = await response.text().catch(() => "");
					const statusText = String(response.status || "Unknown");
					throw new Error(text || `HTTP ${statusText}: Failed to proceed to checkout`);
				}
			}

			const data = await response.json().catch(() => ({}));
			if (data.url) {
				// Redirect to Stripe checkout
				window.location.href = data.url;
			} else {
				throw new Error("No checkout URL received from server");
			}
		} catch (error: any) {
			console.error("Checkout error:", error);
			toast.error(error?.message || "Failed to proceed to checkout. Please try again.");
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<div className="min-h-screen">
			{/* Animated Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
				<div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob dark:opacity-10"></div>
				<div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 dark:opacity-10"></div>
				<div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 dark:opacity-10"></div>
			</div>

			<div className="relative mx-auto max-w-2xl px-6 py-12 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-2">
						Checkout <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Information</span>
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400">Please provide your details to complete your order</p>
				</div>

				{/* Checkout Form */}
				<form onSubmit={handleSubmit} className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl p-8 space-y-6">
					{/* Contact Information */}
					<div>
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
						<div className="space-y-4">
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Email Address <span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									id="email"
									name="email"
									required
									value={formData.email}
									onChange={handleChange}
									className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									placeholder="your@email.com"
								/>
							</div>
							<div>
								<label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Full Name <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									id="fullName"
									name="fullName"
									required
									value={formData.fullName}
									onChange={handleChange}
									className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									placeholder="John Doe"
								/>
							</div>
							<div>
								<label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Phone Number <span className="text-red-500">*</span>
								</label>
								<input
									type="tel"
									id="phone"
									name="phone"
									required
									value={formData.phone}
									onChange={handleChange}
									className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									placeholder="+1 (555) 123-4567"
								/>
							</div>
						</div>
					</div>

					{/* Shipping Address */}
					<div>
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Shipping Address</h2>
						<div className="space-y-4">
							<div>
								<label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Address Line 1 <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									id="addressLine1"
									name="addressLine1"
									required
									value={formData.addressLine1}
									onChange={handleChange}
									className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									placeholder="123 Main Street"
								/>
							</div>
							<div>
								<label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Address Line 2 (Optional)
								</label>
								<input
									type="text"
									id="addressLine2"
									name="addressLine2"
									value={formData.addressLine2}
									onChange={handleChange}
									className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									placeholder="Apartment, suite, etc."
								/>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										City <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										id="city"
										name="city"
										required
										value={formData.city}
										onChange={handleChange}
										className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										placeholder="New York"
									/>
								</div>
								<div>
									<label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										State/Province <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										id="state"
										name="state"
										required
										value={formData.state}
										onChange={handleChange}
										className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										placeholder="NY"
									/>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Postal Code <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										id="postalCode"
										name="postalCode"
										required
										value={formData.postalCode}
										onChange={handleChange}
										className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										placeholder="10001"
									/>
								</div>
								<div>
									<label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Country <span className="text-red-500">*</span>
									</label>
									<select
										id="country"
										name="country"
										required
										value={formData.country}
										onChange={handleChange}
										className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									>
										<option value="US">United States</option>
										<option value="AU">Australia</option>
										<option value="CA">Canada</option>
										<option value="GB">United Kingdom</option>
										<option value="NZ">New Zealand</option>
									</select>
								</div>
							</div>
						</div>
					</div>

					{/* Submit Button */}
					<div className="pt-4">
						<button
							type="submit"
							disabled={loading}
							className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
						>
							{loading ? "Processing..." : "Proceed to Payment"}
						</button>
						<button
							type="button"
							onClick={() => router.back()}
							className="w-full mt-3 px-8 py-3 bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-xl text-gray-900 dark:text-white font-semibold hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300"
						>
							Back to Cart
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

