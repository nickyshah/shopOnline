"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CartRefreshHandler() {
	const router = useRouter();

	useEffect(() => {
		// Refresh the router to update cart count in header
		router.refresh();
	}, [router]);

	return null;
}

