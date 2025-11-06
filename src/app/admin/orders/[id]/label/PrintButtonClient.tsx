"use client";

import { useEffect } from "react";

export default function PrintButtonClient() {
	useEffect(() => {
		// Auto-open print dialog after a short delay
		const timer = setTimeout(() => {
			window.print();
		}, 500);

		return () => clearTimeout(timer);
	}, []);

	return null;
}

