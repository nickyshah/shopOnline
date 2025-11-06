"use client";

import { useEffect } from "react";

interface TermsOfServiceModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function TermsOfServiceModal({ isOpen, onClose }: TermsOfServiceModalProps) {
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
					<h2 className="text-2xl font-bold text-white">Terms of Service</h2>
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

					<TermsOfServiceContent />
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

function TermsOfServiceContent() {
	return (
		<div className="space-y-6">
			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					1. Agreement to Terms
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
					By accessing or using RawNode's website, services, or making a purchase, you agree to be bound by these
					Terms of Service ("Terms") and all applicable Australian laws and regulations. If you do not agree with any
					of these Terms, you are prohibited from using or accessing this site.
				</p>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
					These Terms are governed by the laws of Australia and the Australian Consumer Law (ACL) as set out in
					Schedule 2 of the Competition and Consumer Act 2010 (Cth). Your use of our services may also be subject to
					local, state, or national laws.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					2. Use License
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					Permission is granted to temporarily access and use RawNode's website for personal, non-commercial
					transitory viewing only. This is the grant of a license, not a transfer of title, and under this license
					you may not:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li>Modify or copy the materials;</li>
					<li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial);</li>
					<li>Attempt to decompile or reverse engineer any software contained on RawNode's website;</li>
					<li>Remove any copyright or other proprietary notations from the materials; or</li>
					<li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
				</ul>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
					This license shall automatically terminate if you violate any of these restrictions and may be terminated
					by RawNode at any time. Upon terminating your viewing of these materials or upon the termination of this
					license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					3. Account Registration
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					You may be required to register an account to access certain features of our services. When you register
					an account, you agree to:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li>Provide accurate, current, and complete information about yourself;</li>
					<li>Maintain and promptly update your account information;</li>
					<li>Maintain the security of your password and identification;</li>
					<li>Accept all responsibility for any and all activities that occur under your account;</li>
					<li>Notify us immediately of any unauthorized use of your account; and</li>
					<li>Be at least 18 years of age or have the consent of a parent or guardian.</li>
				</ul>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					4. Products and Pricing
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					All products displayed on our website are subject to availability. We reserve the right to:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li>Modify product prices, descriptions, and availability at any time without notice;</li>
					<li>Limit the quantity of products that can be purchased;</li>
					<li>Refuse or cancel any order at our discretion;</li>
					<li>Correct any errors, inaccuracies, or omissions in product descriptions or pricing.</li>
				</ul>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
					All prices are displayed in Australian Dollars (AUD) unless otherwise stated and include GST (Goods and
					Services Tax) where applicable. Prices are subject to change without notice, but we will honor the price
					at the time of order confirmation.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					5. Orders and Payment
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					When you place an order through our website, you are making an offer to purchase products subject to these
					Terms. We reserve the right to accept or reject your order for any reason, including but not limited to:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li>Product availability;</li>
					<li>Errors in pricing or product descriptions;</li>
					<li>Issues with your payment method;</li>
					<li>Suspected fraudulent or illegal activity.</li>
				</ul>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
					Payment must be made at the time of order. We accept payment via credit card, debit card, and other
					methods as displayed at checkout. All payments are processed securely through Stripe. By providing payment
					information, you represent and warrant that you are authorized to use the payment method.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					6. Shipping and Delivery
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					We will arrange for delivery of products to the address you specify. Delivery times are estimates only and
					are not guaranteed. We are not responsible for delays caused by:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li>Carrier delays;</li>
					<li>Incorrect or incomplete delivery addresses;</li>
					<li>Circumstances beyond our reasonable control;</li>
					<li>Force majeure events.</li>
				</ul>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
					Risk of loss and title to products pass to you upon delivery to the carrier. You are responsible for
					inspecting products upon delivery and reporting any damage or defects within a reasonable time.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					7. Returns and Refunds
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					Your rights under the Australian Consumer Law: Our goods come with guarantees that cannot be excluded
					under the Australian Consumer Law. You are entitled to a replacement or refund for a major failure and
					for compensation for any other reasonably foreseeable loss or damage.
				</p>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					In addition to your rights under the Australian Consumer Law, we offer the following return policy:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li>You may return unopened, unused products in original packaging within 30 days of delivery;</li>
					<li>Returned products must be in their original condition;</li>
					<li>You are responsible for return shipping costs unless the product is defective or incorrect;</li>
					<li>Refunds will be processed to the original payment method within 10 business days of receiving the returned product.</li>
				</ul>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
					To initiate a return, please contact us at support@rawnode.com with your order number and reason for return.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					8. Consumer Guarantees
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					Under the Australian Consumer Law, you have certain guarantees when you purchase goods and services from us:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li><strong>Acceptable quality:</strong> Products must be of acceptable quality, fit for purpose, and match their description;</li>
					<li><strong>Warranties:</strong> Products must match any express warranties we make;</li>
					<li><strong>Services:</strong> Services must be provided with due care and skill, within a reasonable time, and for a reasonable price (if not fixed).</li>
				</ul>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
					If a product or service fails to meet a consumer guarantee, you may be entitled to:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li>A refund or replacement;</li>
					<li>Compensation for damages or loss;</li>
					<li>Having the service performed again or the cost of having it performed again.</li>
				</ul>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					9. Intellectual Property
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
					The content on this website, including but not limited to text, graphics, logos, images, audio clips, digital
					downloads, and software, is the property of RawNode or its content suppliers and is protected by Australian and
					international copyright laws. You may not reproduce, distribute, modify, create derivative works of, publicly
					display, publicly perform, republish, download, store, or transmit any of the material on our website without
					our prior written consent.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					10. User Content and Conduct
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					You agree not to use our website or services to:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li>Violate any laws or regulations;</li>
					<li>Infringe upon the rights of others;</li>
					<li>Transmit harmful, offensive, or unlawful content;</li>
					<li>Interfere with or disrupt the website or services;</li>
					<li>Attempt to gain unauthorized access to any part of our systems;</li>
					<li>Use automated systems (bots, scrapers) to access our website without permission.</li>
				</ul>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
					We reserve the right to suspend or terminate your access to our services if you violate these Terms or engage
					in any prohibited conduct.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					11. Disclaimer of Warranties
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					To the maximum extent permitted by law, and subject to your rights under the Australian Consumer Law:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li>The materials on RawNode's website are provided on an "as is" basis;</li>
					<li>We make no warranties, expressed or implied, and hereby disclaim all warranties including, without limitation,
						implied warranties of merchantability, fitness for a particular purpose, or non-infringement of intellectual property;</li>
					<li>We do not warrant the accuracy, completeness, or reliability of any materials on our website;</li>
					<li>We do not warrant that the website will be available, secure, or error-free.</li>
				</ul>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
					Nothing in these Terms excludes, restricts, or modifies any guarantee, right, or remedy conferred by the
					Australian Consumer Law or any other applicable law that cannot be excluded, restricted, or modified.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					12. Limitation of Liability
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					To the maximum extent permitted by law, and subject to your rights under the Australian Consumer Law:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li>RawNode's total liability for any claim arising out of or relating to these Terms or our services shall not
						exceed the amount you paid to us in the 12 months preceding the claim;</li>
					<li>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including
						but not limited to loss of profits, data, or goodwill;</li>
					<li>We shall not be liable for any damages resulting from your use or inability to use our website or services.</li>
				</ul>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
					These limitations do not apply to liability for personal injury or death, or to the extent prohibited by the
					Australian Consumer Law.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					13. Indemnification
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
					You agree to indemnify, defend, and hold harmless RawNode, its officers, directors, employees, agents, and
					affiliates from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable
					legal fees) arising out of or relating to your use of our website or services, your violation of these Terms,
					or your violation of any rights of another person or entity.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					14. Privacy
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
					Your use of our website and services is also governed by our Privacy Policy, which explains how we collect,
					use, and protect your personal information in accordance with the Privacy Act 1988 (Cth) and the Australian
					Privacy Principles. Please review our Privacy Policy, which is incorporated into these Terms by reference.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					15. Dispute Resolution
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					If you have a dispute with us, we encourage you to contact us first at support@rawnode.com to attempt to
					resolve the dispute directly.
				</p>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					If we cannot resolve the dispute, you may:
				</p>
				<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
					<li>Contact the Australian Competition and Consumer Commission (ACCC) for consumer protection issues;</li>
					<li>Seek mediation or alternative dispute resolution;</li>
					<li>Commence legal proceedings in the appropriate Australian court.</li>
				</ul>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
					These Terms are governed by the laws of Australia, and you submit to the non-exclusive jurisdiction of the
					courts of Australia.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					16. Changes to Terms
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
					We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting
					the updated Terms on our website and updating the "Last updated" date. Your continued use of our services
					after such changes constitutes acceptance of the updated Terms. If you do not agree with the changes, you must
					discontinue using our services.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					17. Severability
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
					If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions
					shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary
					to make it valid and enforceable.
				</p>
			</section>

			<section>
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
					18. Contact Information
				</h3>
				<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
					If you have any questions about these Terms of Service, please contact us:
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
					These Terms of Service are governed by the laws of Australia and comply with the Competition and Consumer Act 2010 (Cth)
					and the Australian Consumer Law. Your statutory rights as a consumer are not affected by these Terms.
				</p>
			</div>
		</div>
	);
}

