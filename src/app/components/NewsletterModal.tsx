"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import toast from "react-hot-toast";

export default function NewsletterModal() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [subscribed, setSubscribed] = useState(false);
	const [discountCode, setDiscountCode] = useState("");

	useEffect(() => {
		// Don't show modal on admin pages, checkout pages, login pages, or order pages
		const excludedPaths = ["/admin", "/checkout", "/login", "/orders/track"];
		const isExcluded = excludedPaths.some((path) => pathname.startsWith(path));
		
		if (isExcluded) {
			return;
		}

		// Check if user has already seen the modal (using localStorage)
		const hasSeenModal = localStorage.getItem("newsletter_modal_seen");
		if (!hasSeenModal) {
			// Show modal after a short delay (2 seconds) for better UX
			const timer = setTimeout(() => {
				setOpen(true);
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [pathname]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !/\S+@\S+\.\S+/.test(email)) {
			toast.error("Please enter a valid email address");
			return;
		}

		setLoading(true);
		try {
			const response = await fetch("/api/newsletter/subscribe", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to subscribe");
			}

			// Mark modal as seen
			localStorage.setItem("newsletter_modal_seen", "true");
			
			setSubscribed(true);
			setDiscountCode(data.discount_code || "");
			toast.success("Successfully subscribed! Check your discount code below.");
		} catch (error: any) {
			toast.error(error?.message || "Failed to subscribe. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setOpen(false);
		// Mark as seen even if they close without subscribing
		localStorage.setItem("newsletter_modal_seen", "true");
	};

	if (!open) return null;

	return (
		<Dialog.Root open={open} onOpenChange={(isOpen) => {
			setOpen(isOpen);
			if (!isOpen) {
				handleClose();
			}
		}}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-in fade-in" />
				<Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl z-[100] p-8 animate-in fade-in zoom-in-95 duration-300">
					{!subscribed ? (
						<>
							<Dialog.Title className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
								🎉 Welcome to RawNode!
							</Dialog.Title>
							<Dialog.Description className="text-center text-gray-600 dark:text-gray-400 mb-6">
								Subscribe to our newsletter and get <span className="font-bold text-indigo-600 dark:text-indigo-400">10% OFF</span> your first order!
							</Dialog.Description>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="Enter your email address"
										required
										className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									/>
								</div>
								<button
									type="submit"
									disabled={loading}
									className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
								>
									{loading ? "Subscribing..." : "Subscribe & Get 10% Off"}
								</button>
							</form>

							<button
								onClick={handleClose}
								className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
								aria-label="Close"
							>
								<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</>
					) : (
						<div className="text-center">
							<div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
								<svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
								Thank You for Subscribing! 🎉
							</Dialog.Title>
							<Dialog.Description className="text-gray-600 dark:text-gray-400 mb-6">
								Check your email for confirmation. Here's your discount code:
							</Dialog.Description>
							
							{discountCode && (
								<div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-6">
									<p className="text-white text-sm mb-2">Your 10% Discount Code</p>
									<div className="flex items-center justify-center gap-3">
										<code className="text-2xl font-bold text-white bg-white/20 px-4 py-2 rounded-lg">
											{discountCode}
										</code>
										<button
											onClick={() => {
												navigator.clipboard.writeText(discountCode);
												toast.success("Code copied to clipboard!");
											}}
											className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
											aria-label="Copy code"
										>
											<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
											</svg>
										</button>
									</div>
									<p className="text-white/80 text-xs mt-3">Use this code at checkout to get 10% off!</p>
								</div>
							)}

							<button
								onClick={handleClose}
								className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
							>
								Start Shopping
							</button>
						</div>
					)}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

