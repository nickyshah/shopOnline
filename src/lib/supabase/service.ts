import { createClient } from "@supabase/supabase-js";

function validateEnvVars() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl) {
		throw new Error(
			"Missing NEXT_PUBLIC_SUPABASE_URL environment variable. " +
			"Please check your .env.local file and ensure it's set correctly."
		);
	}

	if (!serviceRoleKey) {
		throw new Error(
			"Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
			"Please check your .env.local file and ensure it's set correctly."
		);
	}

	return { supabaseUrl, serviceRoleKey };
}

// Service role client for admin operations (bypasses RLS)
// The service role key automatically bypasses RLS policies
export function getSupabaseServiceClient() {
	const { supabaseUrl, serviceRoleKey } = validateEnvVars();
	return createClient(supabaseUrl, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
		// Service role key automatically bypasses RLS, no additional config needed
	});
}

