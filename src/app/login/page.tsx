"use client";

import { useState, useMemo, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
	const supabase = useMemo(() => getSupabaseBrowserClient(), []);
	const router = useRouter();
	const searchParams = useSearchParams();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [mode, setMode] = useState<"signin" | "signup">("signin");
	const [loading, setLoading] = useState(false);

	// Check Supabase connection on mount
	useEffect(() => {
		const checkConnection = async () => {
			const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
			if (!supabaseUrl) {
				console.error("[Login] Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
				return;
			}

			try {
				// Try to fetch the Supabase health endpoint
				const response = await fetch(`${supabaseUrl}/rest/v1/`, {
					method: "HEAD",
					headers: {
						apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
					},
				});
				if (!response.ok && response.status !== 404) {
					console.warn("[Login] Supabase connection check failed:", response.status);
				}
			} catch (error) {
				console.error("[Login] Cannot reach Supabase. Ensure:", {
					error: error instanceof Error ? error.message : "Unknown error",
					checklist: [
						"Docker is running",
						"Supabase is started (run 'supabase start')",
						"Environment variables are set correctly",
						`URL is correct: ${supabaseUrl}`,
					],
				});
			}
		};

		checkConnection();
	}, []);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		try {
			if (mode === "signin") {
				const { data, error: err } = await supabase.auth.signInWithPassword({
					email,
					password,
				});
				if (err) {
					// Provide more helpful error messages
					if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
						throw new Error(
							"Cannot connect to Supabase. Please ensure:\n" +
							"1. Supabase is running locally (run 'supabase start')\n" +
							"2. Your .env.local has the correct NEXT_PUBLIC_SUPABASE_URL (should be http://localhost:54331)\n" +
							"3. Your environment variables are set correctly"
						);
					}
					if (err.message.includes("Invalid login credentials") || err.message.includes("Invalid credentials")) {
						throw new Error(
							"Invalid email or password.\n" +
							"If you just reset the database, you need to sign up again.\n" +
							"Click 'Sign up' to create a new account."
						);
					}
					throw err;
				}
				if (!data.user) {
					throw new Error("Sign in failed - no user returned");
				}
				toast.success("Successfully signed in!");
			} else {
				const { data, error: err } = await supabase.auth.signUp({
					email,
					password,
				});
				if (err) {
					// Provide more helpful error messages
					if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
						throw new Error(
							"Cannot connect to Supabase. Please ensure:\n" +
							"1. Supabase is running locally (run 'supabase start')\n" +
							"2. Your .env.local has the correct NEXT_PUBLIC_SUPABASE_URL (should be http://localhost:54331)\n" +
							"3. Your environment variables are set correctly"
						);
					}
					throw err;
				}
				if (!data.user) {
					throw new Error("Sign up failed - no user returned");
				}
				
				// If signing up as admin@rawnode.com, set admin role
				if (email.toLowerCase() === "admin@rawnode.com") {
					try {
						const response = await fetch("/api/profiles/ensure", {
							method: "POST",
						});
						if (response.ok) {
							const result = await response.json();
							if (result.role === "admin") {
								toast.success("Admin account created successfully!");
							} else {
								toast.success("Account created! Setting admin role...");
								// Try to set admin role via API
								setTimeout(async () => {
									await fetch("/api/admin/set-admin", { method: "POST" });
								}, 500);
							}
						} else {
							toast.success("Account created successfully!");
						}
					} catch {
						toast.success("Account created successfully!");
					}
				} else {
					toast.success("Account created successfully!");
				}
			}

			// Wait a moment for session to be established, then redirect
			await new Promise(resolve => setTimeout(resolve, 150));
			const redirectParam = searchParams.get("redirect");
			const target = redirectParam || (email.toLowerCase() === "admin@rawnode.com" ? "/admin" : "/");
			router.push(target);
			router.refresh();
		} catch (err: any) {
			// Show error message - handle multiline messages from our custom errors
			const errorMessage = err?.message ?? "Authentication failed";
			toast.error(errorMessage);
			console.error("Auth error:", err);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center px-6">
			{/* Animated Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
				<div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob dark:opacity-10"></div>
				<div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 dark:opacity-10"></div>
				<div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 dark:opacity-10"></div>
			</div>

			{/* Glass Card */}
			<div className="relative w-full max-w-md">
				<div className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl p-8 sm:p-10">
					<div className="text-center mb-8">
						<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
							{mode === "signin" ? "Welcome Back" : "Create Account"}
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							{mode === "signin" ? "Sign in to your account" : "Join RawNode today"}
						</p>
					</div>

					<form onSubmit={onSubmit} className="space-y-5">
						<div>
							<input
								type="email"
								placeholder="Email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
								required
							/>
						</div>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-4 py-3 pr-12 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
								required
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword ? (
									<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
									</svg>
								) : (
									<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
								)}
							</button>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
						>
							{loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
						</button>
					</form>

					<div className="mt-6 text-center">
						<button
							onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
							className="text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline"
						>
							{mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
