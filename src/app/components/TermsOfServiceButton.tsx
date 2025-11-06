"use client";

import { useState } from "react";
import TermsOfServiceModal from "./TermsOfServiceModal";

export default function TermsOfServiceButton() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<button
				onClick={() => setIsModalOpen(true)}
				className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
			>
				Terms of Service
			</button>
			<TermsOfServiceModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</>
	);
}

