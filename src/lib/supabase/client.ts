"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function validateEnvVars() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl) {
		throw new Error(
			"Missing NEXT_PUBLIC_SUPABASE_URL environment variable. " +
			"Please check your .env.local file and ensure it's set correctly."
		);
	}

	if (!supabaseAnonKey) {
		throw new Error(
			"Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. " +
			"Please check your .env.local file and ensure it's set correctly."
		);
	}

	return { supabaseUrl, supabaseAnonKey };
}

export function getSupabaseBrowserClient() {
	// Use singleton pattern for browser client
	if (browserClient) {
		return browserClient;
	}

	const { supabaseUrl, supabaseAnonKey } = validateEnvVars();

	// Log configuration in development for debugging
	if (process.env.NODE_ENV === "development") {
		console.log("[Supabase Client] Initializing with URL:", supabaseUrl);
	}

	browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
		auth: {
			persistSession: true,
			autoRefreshToken: true,
			detectSessionInUrl: true,
		},
	});

	return browserClient;
}


