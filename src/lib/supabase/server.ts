"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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

export async function getSupabaseServerClient() {
	const { supabaseUrl, supabaseAnonKey } = validateEnvVars();
	const cookieStore = await cookies();
	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			get(name: string) {
				return cookieStore.get(name)?.value;
			},
			set(name: string, value: string, options: any) {
				try {
					cookieStore.set({ name, value, ...options });
				} catch {
					// no-op on edge where setting may not be allowed
				}
			},
			remove(name: string, options: any) {
				try {
					cookieStore.set({ name, value: "", ...options });
				} catch {
					// no-op
				}
			},
		},
	});
}


