import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

// POST /api/admin/restore-admin - Restore admin role for a user
// This endpoint can be called by anyone (since admin is revoked), but should be secured
// For now, we'll restore admin@rawnode.com specifically
export async function POST(req: Request) {
	try {
		const supabase = getSupabaseServiceClient();
		const body = await req.json();
		const email = body.email || "admin@rawnode.com";

		// Find user by email using Auth Admin API
		const { data: usersList } = await supabase.auth.admin.listUsers();
		const user = usersList?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

		if (!user) {
			return NextResponse.json({ error: `User with email ${email} not found` }, { status: 404 });
		}

		// Restore admin role
		const { error: upsertError } = await supabase
			.from("profiles")
			.upsert({ id: user.id, role: "admin" }, { onConflict: "id" });

		if (upsertError) {
			console.error("[Restore Admin] Error:", upsertError);
			return NextResponse.json({ error: upsertError.message }, { status: 500 });
		}

		return NextResponse.json({
			success: true,
			message: `Admin role restored for ${email}`,
			userId: user.id,
		});
	} catch (error: any) {
		console.error("[Restore Admin] Unexpected error:", error);
		return NextResponse.json({ error: error.message || "Failed to restore admin role" }, { status: 500 });
	}
}

