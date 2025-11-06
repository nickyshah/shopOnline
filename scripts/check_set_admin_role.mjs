import { createClient } from "@supabase/supabase-js";

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing env. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const targetEmail = "admin@rawnode.com";

  // Find the user by email using Auth Admin API
  const { data: usersList, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listError) {
    console.error("Error listing users via auth admin:", listError);
    process.exit(1);
  }
  const user = usersList?.users?.find((u) => u.email === targetEmail);
  if (!user) {
    console.log(`User ${targetEmail} not found in auth.users. Please sign up at /login first.`);
    process.exit(0);
  }

  // Check current role in profiles
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    // PGRST116 is PostgREST "Not found"
    console.error("Error querying profiles:", profileError);
    process.exit(1);
  }

  const currentRole = profile?.role ?? null;
  console.log("Current profile:", { email: user.email, userId: user.id, role: currentRole });

  if (currentRole === "admin") {
    console.log("Role already set to admin. No changes needed.");
    process.exit(0);
  }

  // Upsert profile with admin role
  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, full_name: profile?.full_name ?? "Admin User", role: "admin" }, { onConflict: "id" });

  if (upsertError) {
    console.error("Failed to set admin role:", upsertError);
    process.exit(1);
  }

  console.log("Admin role set successfully for:", targetEmail);
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});