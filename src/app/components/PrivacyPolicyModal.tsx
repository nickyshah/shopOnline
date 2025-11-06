"use client";

import { useEffect } from "react";

interface PrivacyPolicyModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
	// Close on Escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden"; // Prevent background scrolling
		}
		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			onClick={onClose}
		>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

			{/* Modal */}
			<div
				className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between border-b border-white/20">
					<h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
					<button
						onClick={onClose}
						className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white/10"
						aria-label="Close"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto px-6 py-6">
					<div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
						Last updated: {new Date().toLocaleDateString("en-AU", {
							year: "numeric",
							month: "long",
							day: "numeric"
						})}
					</div>

					<PrivacyPolicyContent />
				</div>

				{/* Footer */}
				<div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
					<button
						onClick={onClose}
						className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}

function PrivacyPolicyContent() {
	return (
		<div className="space-y-6">
			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					1. Introduction
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
					RawNode ("we", "us", "our") is committed to protecting your privacy in accordance with the
					Australian Privacy Principles (APPs) contained in the Privacy Act 1988 (Cth) ("Privacy Act").
					This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information
					when you visit our website, use our services, or make a purchase.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					2. Collection of Personal Information
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					We collect personal information that is reasonably necessary for our functions and activities.
					The types of personal information we may collect include:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li>Name and contact details (email address, phone number, postal address)</li>
					<li>Payment information (processed securely through Stripe - we do not store full credit card details)</li>
					<li>Order history and purchase preferences</li>
					<li>Account credentials (username, password - encrypted)</li>
					<li>Shipping and billing addresses</li>
					<li>Browser and device information (IP address, browser type, operating system)</li>
					<li>Usage data (pages visited, time spent on site, click patterns)</li>
				</ul>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					3. How We Collect Personal Information
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					We collect personal information in several ways:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li><strong>Directly from you:</strong> When you register for an account, place an order, subscribe to our newsletter, or contact us</li>
					<li><strong>Automatically:</strong> Through cookies and similar technologies when you browse our website</li>
					<li><strong>From third parties:</strong> Such as payment processors (Stripe) and shipping providers</li>
				</ul>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					4. Purpose of Collection
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					We collect, hold, and use your personal information for the following purposes:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li>Processing and fulfilling your orders</li>
					<li>Managing your account and providing customer support</li>
					<li>Communicating with you about your orders, account, or inquiries</li>
					<li>Improving our website, products, and services</li>
					<li>Preventing fraud and ensuring security</li>
					<li>Complying with legal obligations</li>
					<li>Marketing communications (with your consent, which you can withdraw at any time)</li>
				</ul>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					5. Use and Disclosure of Personal Information
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					We will not use or disclose your personal information for any purpose other than those for which
					it was collected, except as required or permitted by law. We may disclose your personal information to:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li><strong>Service providers:</strong> Third parties who assist us in operating our business (e.g., payment processors, shipping companies, IT service providers)</li>
					<li><strong>Legal requirements:</strong> When required by law, court order, or government regulation</li>
					<li><strong>Business transfers:</strong> In connection with any merger, sale of assets, or acquisition</li>
				</ul>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
					We take reasonable steps to ensure that third parties who receive your personal information are bound
					by confidentiality and privacy obligations consistent with this Privacy Policy.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					6. Direct Marketing
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					We may send you marketing communications about our products, services, and special offers if you have
					consented to receive such communications. You can opt-out of receiving marketing communications at any time by:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li>Clicking the "unsubscribe" link in any marketing email</li>
					<li>Contacting us at support@rawnode.com</li>
					<li>Updating your account preferences</li>
				</ul>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					7. Data Quality and Security
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					We take reasonable steps to:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li><strong>Ensure data accuracy:</strong> Keep your personal information accurate, complete, and up-to-date</li>
					<li><strong>Protect your information:</strong> Implement technical and organizational security measures to protect against unauthorized access, alteration, disclosure, or destruction</li>
					<li><strong>Secure storage:</strong> Store personal information securely using encryption and access controls</li>
					<li><strong>Data retention:</strong> Retain personal information only for as long as necessary to fulfill the purposes for which it was collected or as required by law</li>
				</ul>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
					However, no method of transmission over the internet or electronic storage is 100% secure. While we strive
					to protect your personal information, we cannot guarantee absolute security.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					8. Cookies and Tracking Technologies
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic,
					and understand user preferences. Types of cookies we use include:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li><strong>Essential cookies:</strong> Required for the website to function properly</li>
					<li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our website</li>
					<li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
				</ul>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
					You can control cookies through your browser settings. However, disabling cookies may affect the functionality
					of our website.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					9. Access and Correction Rights
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					You have the right to:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li><strong>Access your personal information:</strong> Request a copy of the personal information we hold about you</li>
					<li><strong>Correct inaccurate information:</strong> Request correction of any inaccurate, incomplete, or out-of-date information</li>
					<li><strong>Request deletion:</strong> Request deletion of your personal information, subject to legal and contractual obligations</li>
				</ul>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
					To exercise these rights, please contact us at support@rawnode.com. We will respond to your request within
					a reasonable time frame and in accordance with the Privacy Act.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					10. Overseas Disclosure
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
					Some of our service providers may be located overseas, including data hosting and payment processing services.
					By using our services, you consent to the transfer of your personal information to these overseas recipients.
					We take reasonable steps to ensure that overseas recipients of your personal information comply with privacy
					obligations similar to those under the Privacy Act.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					11. Complaints
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					If you have a complaint about how we have handled your personal information, please contact us at
					support@rawnode.com. We will investigate your complaint and respond within a reasonable time frame.
				</p>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					If you are not satisfied with our response, you may lodge a complaint with the Office of the Australian
					Information Commissioner (OAIC):
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li><strong>Website:</strong> <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">www.oaic.gov.au</a></li>
					<li><strong>Phone:</strong> 1300 363 992</li>
					<li><strong>Email:</strong> enquiries@oaic.gov.au</li>
				</ul>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					12. Changes to This Privacy Policy
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
					We may update this Privacy Policy from time to time to reflect changes in our practices or for legal,
					operational, or regulatory reasons. We will notify you of any material changes by posting the updated
					Privacy Policy on our website and updating the "Last updated" date. Your continued use of our services
					after such changes constitutes acceptance of the updated Privacy Policy.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					13. Contact Us
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					If you have any questions, concerns, or requests regarding this Privacy Policy or our handling of your
					personal information, please contact us:
				</p>
				<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
					<p className="text-gray-700 dark:text-gray-300 mb-2">
						<strong>RawNode</strong>
					</p>
					<p className="text-gray-700 dark:text-gray-300 mb-1">
						<strong>Email:</strong>{" "}
						<a href="mailto:support@rawnode.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
							support@rawnode.com
						</a>
					</p>
					<p className="text-gray-700 dark:text-gray-300">
						<strong>Address:</strong> 123 Commerce St, San Francisco, CA 94105, United States
					</p>
				</div>
			</section>

			<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
				<p className="text-sm text-gray-600 dark:text-gray-400 italic">
					This Privacy Policy is governed by the laws of Australia and complies with the Privacy Act 1988 (Cth)
					and the Australian Privacy Principles.
				</p>
			</div>
		</div>
	);
}

