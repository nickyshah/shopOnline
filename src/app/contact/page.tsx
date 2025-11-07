"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// In a real application, you would send this to your backend API
			// For now, we'll simulate an API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Show success message
			toast.success("Thank you for contacting us! We'll get back to you soon.");
			
			// Reset form
			setFormData({
				name: "",
				email: "",
				subject: "",
				message: "",
			});
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
			console.error("Contact form error:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen">
			{/* Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
			</div>

			<div className="relative mx-auto max-w-4xl px-6 py-16 lg:px-8">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
						Contact Us
					</h1>
					<p className="text-xl text-gray-600 dark:text-gray-400">
						We're here to help! Get in touch with our team
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Contact Information */}
					<div className="lg:col-span-1 space-y-6">
						<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6">
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
								Get in Touch
							</h2>
							
							<div className="space-y-6">
								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
										<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
									</div>
									<div>
										<h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
										<a
											href="mailto:support@rawnode.com"
											className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
										>
											support@rawnode.com
										</a>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
										<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
										</svg>
									</div>
									<div>
										<h3 className="font-semibold text-gray-900 dark:text-white mb-1">Address</h3>
										<p className="text-gray-700 dark:text-gray-300">
											123 Commerce St<br />
											San Francisco, CA 94105<br />
											United States
										</p>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
										<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<div>
										<h3 className="font-semibold text-gray-900 dark:text-white mb-1">Response Time</h3>
										<p className="text-gray-700 dark:text-gray-300">
											We typically respond within 24-48 hours during business days.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Contact Form */}
					<div className="lg:col-span-2">
						<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-8">
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
								Send us a Message
							</h2>
							
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label htmlFor="name" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
											Name *
										</label>
										<input
											type="text"
											id="name"
											name="name"
											required
											value={formData.name}
											onChange={handleChange}
											className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
											placeholder="Your name"
										/>
									</div>
									<div>
										<label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
											Email *
										</label>
										<input
											type="email"
											id="email"
											name="email"
											required
											value={formData.email}
											onChange={handleChange}
											className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
											placeholder="your.email@example.com"
										/>
									</div>
								</div>

								<div>
									<label htmlFor="subject" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
										Subject *
									</label>
									<select
										id="subject"
										name="subject"
										required
										value={formData.subject}
										onChange={handleChange}
										className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
									>
										<option value="">Select a subject</option>
										<option value="product-inquiry">Product Inquiry</option>
										<option value="order-support">Order Support</option>
										<option value="shipping">Shipping Question</option>
										<option value="return">Return/Refund</option>
										<option value="general">General Question</option>
										<option value="feedback">Feedback</option>
									</select>
								</div>

								<div>
									<label htmlFor="message" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
										Message *
									</label>
									<textarea
										id="message"
										name="message"
										required
										rows={6}
										value={formData.message}
										onChange={handleChange}
										className="w-full px-4 py-3 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
										placeholder="Tell us how we can help..."
									/>
								</div>

								<button
									type="submit"
									disabled={isSubmitting}
									className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
								>
									{isSubmitting ? "Sending..." : "Send Message"}
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

