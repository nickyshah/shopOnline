import Link from "next/link";

export default function AboutPage() {
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
						About RawNode
					</h1>
					<p className="text-xl text-gray-600 dark:text-gray-400">
						Your trusted source for premium fitness and wellness products
					</p>
				</div>

				{/* Main Content */}
				<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 dark:border-white/20 shadow-xl p-8 md:p-12 space-y-8">
					{/* Our Story */}
					<section>
						<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
							Our Story
						</h2>
						<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
							RawNode was founded with a simple mission: to provide premium quality fitness and wellness
							products that help individuals achieve their health and fitness goals. We believe that
							everyone deserves access to high-quality equipment and supplements that support their
							journey to better health.
						</p>
						<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
							Since our inception, we've been committed to sourcing the finest products from trusted
							manufacturers and ensuring that every item we sell meets our rigorous quality standards.
							We're not just a retailer—we're your partner in wellness.
						</p>
					</section>

					{/* Our Mission */}
					<section>
						<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
							Our Mission
						</h2>
						<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
							To empower individuals on their fitness and wellness journey by providing:
						</p>
						<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
							<li>Premium quality products that deliver real results</li>
							<li>Exceptional customer service and support</li>
							<li>Competitive pricing and value for money</li>
							<li>Fast and reliable shipping</li>
							<li>Transparent business practices and honest communication</li>
						</ul>
					</section>

					{/* Our Values */}
					<section>
						<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
							Our Values
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-white/10">
								<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
									Quality First
								</h3>
								<p className="text-gray-700 dark:text-gray-300">
									We never compromise on quality. Every product in our catalog is carefully selected
									and tested to ensure it meets our high standards.
								</p>
							</div>
							<div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-white/10">
								<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
									Customer Focus
								</h3>
								<p className="text-gray-700 dark:text-gray-300">
									Your satisfaction is our priority. We're committed to providing exceptional service
									and support throughout your shopping experience.
								</p>
							</div>
							<div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-white/10">
								<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
									Integrity
								</h3>
								<p className="text-gray-700 dark:text-gray-300">
									We conduct our business with honesty, transparency, and ethical practices. What you
									see is what you get.
								</p>
							</div>
							<div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-white/10">
								<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
									Innovation
								</h3>
								<p className="text-gray-700 dark:text-gray-300">
									We continuously seek out new and better products to help our customers achieve their
									goals more effectively.
								</p>
							</div>
						</div>
					</section>

					{/* Why Choose Us */}
					<section>
						<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
							Why Choose RawNode?
						</h2>
						<div className="space-y-4">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
									<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
										Curated Selection
									</h3>
									<p className="text-gray-700 dark:text-gray-300">
										We handpick every product, ensuring only the best items make it to our store.
									</p>
								</div>
							</div>
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
									<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
										Fast Shipping
									</h3>
									<p className="text-gray-700 dark:text-gray-300">
										We process and ship orders quickly so you can start using your products ASAP.
									</p>
								</div>
							</div>
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
									<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
										Secure Checkout
									</h3>
									<p className="text-gray-700 dark:text-gray-300">
										Your payment information is protected with industry-leading security measures.
									</p>
								</div>
							</div>
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
									<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
										Customer Support
									</h3>
									<p className="text-gray-700 dark:text-gray-300">
										Our friendly support team is here to help you with any questions or concerns.
									</p>
								</div>
							</div>
						</div>
					</section>

					{/* Contact CTA */}
					<section className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 dark:from-indigo-600/10 dark:to-purple-600/10 rounded-2xl p-8 border border-indigo-300/30 dark:border-indigo-500/20">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
							Have Questions?
						</h2>
						<p className="text-gray-700 dark:text-gray-300 mb-6">
							We'd love to hear from you! Whether you have questions about our products, need help with
							an order, or just want to say hello, we're here for you.
						</p>
						<Link
							href="/contact"
							className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
						>
							Contact Us
						</Link>
					</section>
				</div>
			</div>
		</div>
	);
}

