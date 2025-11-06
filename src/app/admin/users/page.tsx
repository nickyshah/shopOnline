import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = getSupabaseServiceClient();

  // List auth users via Admin API
  const { data: usersList } = await supabase.auth.admin.listUsers();
  const users = usersList?.users ?? [];
  const userIds = users.map((u) => u.id);

  // Fetch profiles for roles
  let profiles: Record<string, { role: string | null; full_name: string | null }> = {};
  if (userIds.length > 0) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .in("id", userIds);
    for (const p of profileRows || []) {
      profiles[p.id] = { role: p.role, full_name: p.full_name } as any;
    }
  }

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
      </div>

      <div className="relative">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Users</h1>

        <div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6">
          {users.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-400">No users found.</div>
          ) : (
            <div className="space-y-4">
              {users.map((u) => {
                const profile = profiles[u.id] || { role: null, full_name: null };
                const role = (profile.role || "customer").toLowerCase();
                return (
                  <div
                    key={u.id}
                    className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{u.email}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{u.id}</div>
                        {profile.full_name && (
                          <div className="text-sm text-gray-700 dark:text-gray-300">{profile.full_name}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${role === "admin" ? "bg-green-500/20 text-green-700 border-green-400/40" : "bg-gray-500/20 text-gray-700 border-gray-400/40"}`}>
                          {role}
                        </span>
                        <form action="/api/admin/users/role" method="POST">
                          <input type="hidden" name="user_id" value={u.id} />
                          <input type="hidden" name="role" value={role === "admin" ? "customer" : "admin"} />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 text-gray-900 dark:text-white font-semibold hover:bg-white/30 dark:hover:bg-white/15 transition-all"
                          >
                            {role === "admin" ? "Revoke Admin" : "Make Admin"}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}