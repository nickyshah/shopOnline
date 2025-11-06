import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
	try {
		const supabase = await getSupabaseServerClient();
		const { data: auth } = await supabase.auth.getUser();
		
		if (!auth.user) {
			return NextResponse.json({ 
				loggedIn: false,
				message: "No user is currently logged in"
			});
		}

		// Get user profile to check role
		const { data: profile } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", auth.user.id)
			.single();

		return NextResponse.json({
			loggedIn: true,
			email: auth.user.email,
			userId: auth.user.id,
			role: profile?.role || "customer",
			isAdmin: profile?.role === "admin",
			isAdminEmail: auth.user.email === "admin@rawnode.com",
		});
	} catch (error: any) {
		return NextResponse.json({
			error: error.message || "Failed to check user",
		}, { status: 500 });
	}
}

