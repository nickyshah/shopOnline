"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export default function Toaster() {
	return (
		<HotToaster
			position="top-right"
			toastOptions={{
				className: "",
				duration: 4000,
				style: {
					background: "rgba(255, 255, 255, 0.2)",
					backdropFilter: "blur(12px)",
					border: "1px solid rgba(255, 255, 255, 0.3)",
					borderRadius: "1rem",
					padding: "1rem",
					color: "#1f2937",
					boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
				},
				success: {
					iconTheme: {
						primary: "#10b981",
						secondary: "#fff",
					},
					style: {
						background: "rgba(255, 255, 255, 0.2)",
						backdropFilter: "blur(12px)",
						border: "1px solid rgba(16, 185, 129, 0.3)",
					},
				},
				error: {
					iconTheme: {
						primary: "#ef4444",
						secondary: "#fff",
					},
					style: {
						background: "rgba(255, 255, 255, 0.2)",
						backdropFilter: "blur(12px)",
						border: "1px solid rgba(239, 68, 68, 0.3)",
					},
				},
			}}
		/>
	);
}

