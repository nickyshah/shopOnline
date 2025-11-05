"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const supabase = getSupabaseBrowserClient();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [mode, setMode] = useState<"signin" | "signup">("signin");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			if (mode === "signin") {
				const { error: err } = await supabase.auth.signInWithPassword({
					email,
					password,
				});
				if (err) throw err;
			} else {
				const { error: err } = await supabase.auth.signUp({
					email,
					password,
				});
				if (err) throw err;
			}
			router.push("/");
		} catch (err: any) {
			setError(err?.message ?? "Authentication failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-sm p-6">
			<h1 className="text-2xl font-semibold mb-4">
				{mode === "signin" ? "Sign in" : "Create account"}
			</h1>
			<form onSubmit={onSubmit} className="space-y-3">
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full border rounded px-3 py-2"
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full border rounded px-3 py-2"
					required
				/>
				<button
					type="submit"
					disabled={loading}
					className="w-full bg-black text-white rounded px-3 py-2 disabled:opacity-50"
				>
					{loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
				</button>
			</form>
			{error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
			<div className="mt-4 text-sm">
				{mode === "signin" ? (
					<button
						onClick={() => setMode("signup")}
						className="underline"
					>
						Need an account? Sign up
					</button>
				) : (
					<button
						onClick={() => setMode("signin")}
						className="underline"
					>
						Already have an account? Sign in
					</button>
				)}
			</div>
		</div>
	);
}


