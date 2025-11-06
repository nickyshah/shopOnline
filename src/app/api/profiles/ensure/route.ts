import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Ensures a profile row exists for the currently authenticated user.
// If none exists, it creates one with role 'customer'. If the email is
// 'admin@rawnode.com', it sets role 'admin'.
export async function POST() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = auth.user.id;
    const email = (auth.user.email || "").toLowerCase();

    // Check if profile exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();

    // Determine desired role
    const desiredRole = email === "admin@rawnode.com" ? "admin" : (existing?.role || "customer");

    // Upsert profile
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert({ id: userId, role: desiredRole }, { onConflict: "id" });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, role: desiredRole });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to ensure profile" }, { status: 500 });
  }
}