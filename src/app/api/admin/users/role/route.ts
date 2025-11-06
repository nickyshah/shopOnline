import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST(req: Request) {
  const supabase = getSupabaseServiceClient();

  const form = await req.formData();
  const userId = String(form.get("user_id") || "");
  const role = String(form.get("role") || "").toLowerCase();

  if (!userId || !["admin", "customer"].includes(role)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Upsert role into profiles (id matches auth.users.id)
  await supabase
    .from("profiles")
    .upsert({ id: userId, role }, { onConflict: "id" });

  // Redirect back to users page
  return NextResponse.redirect(new URL("/admin/users", req.url));
}