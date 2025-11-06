import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminNav from "@/app/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	const supabase = await getSupabaseServerClient();
	const { data: auth } = await supabase.auth.getUser();
	
	if (!auth.user) {
		console.log("[AdminLayout] No user found, redirecting to login");
		redirect("/login");
	}

	const { data: profile, error: profileError } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", auth.user.id)
		.single();

	if (profileError) {
		console.error("[AdminLayout] Error fetching profile:", profileError);
		console.log("[AdminLayout] User ID:", auth.user.id);
		console.log("[AdminLayout] User email:", auth.user.email);
	}

	// Check if role is admin (case-insensitive check)
	const userRole = profile?.role?.toLowerCase().trim();
	if (userRole !== "admin") {
		console.log("[AdminLayout] Access denied - Role:", userRole, "Expected: admin");
		console.log("[AdminLayout] Profile data:", profile);
		redirect("/");
	}

	return (
		<div className="min-h-screen">
			{/* Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
			</div>

			<div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-8">
				{/* Navigation */}
				<AdminNav />
				{children}
			</div>
		</div>
	);
}
