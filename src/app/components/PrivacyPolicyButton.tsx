"use client";

import { useState } from "react";
import PrivacyPolicyModal from "./PrivacyPolicyModal";

export default function PrivacyPolicyButton() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<button
				onClick={() => setIsModalOpen(true)}
				className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
			>
				Privacy Policy
			</button>
			<PrivacyPolicyModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</>
	);
}

