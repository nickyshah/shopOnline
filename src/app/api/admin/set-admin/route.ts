import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST() {
	try {
		const supabase = getSupabaseServiceClient();

		// Since we can't directly query auth.users through the client,
		// we'll need to use a database function or provide SQL instructions
		// For now, providing the SQL to run manually is the most reliable approach
		
		return NextResponse.json({
			message: "To set admin role, run this SQL in Supabase Studio:",
			note: "The 'role' column is in the 'profiles' table, not 'auth.users'",
			sql: `-- Update the role in profiles table (not auth.users)
UPDATE public.profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@rawnode.com'
);

-- Verify it worked:
SELECT u.email, p.role, p.full_name
FROM auth.users u 
JOIN public.profiles p ON u.id = p.id 
WHERE u.email = 'admin@rawnode.com';`,
			instructions: [
				"1. Open Supabase Studio: http://127.0.0.1:54333",
				"2. Go to SQL Editor",
				"3. Run the SQL query above (updates profiles.role, not auth.users)",
				"4. Or restart Supabase to apply the migration: supabase db reset"
			]
		});
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to get instructions" },
			{ status: 500 }
		);
	}
}

