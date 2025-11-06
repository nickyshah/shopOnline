import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DebugUserPage() {
	const supabase = await getSupabaseServerClient();
	const { data: auth } = await supabase.auth.getUser();

	if (!auth.user) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="bg-white/20 backdrop-blur-md rounded-xl p-8">
					<h1 className="text-2xl font-bold mb-4">Not Logged In</h1>
					<p className="mb-4">Please log in first at <Link href="/login" className="text-blue-500 underline">/login</Link></p>
				</div>
			</div>
		);
	}

	const { data: profile, error: profileError } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", auth.user.id)
		.single();

	return (
		<div className="min-h-screen p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-6">User & Admin Access Debug</h1>
				
				<div className="bg-white/20 backdrop-blur-md rounded-xl p-6 mb-4">
					<h2 className="text-xl font-semibold mb-4">User Info</h2>
					<div className="space-y-2 font-mono text-sm">
						<div><strong>Email:</strong> {auth.user.email}</div>
						<div><strong>User ID:</strong> {auth.user.id}</div>
					</div>
				</div>

				<div className="bg-white/20 backdrop-blur-md rounded-xl p-6 mb-4">
					<h2 className="text-xl font-semibold mb-4">Profile Info</h2>
					{profileError ? (
						<div className="text-red-500">
							<strong>Error:</strong> {profileError.message}
							<div className="mt-2 text-sm">
								Profile might not exist. The trigger should create it on signup.
							</div>
						</div>
					) : profile ? (
						<div className="space-y-2 font-mono text-sm">
							<div><strong>Profile ID:</strong> {profile.id}</div>
							<div><strong>Full Name:</strong> {profile.full_name || "Not set"}</div>
							<div><strong>Role:</strong> 
								<span className={`ml-2 px-2 py-1 rounded ${profile.role === 'admin' ? 'bg-green-500/20 text-green-700' : 'bg-gray-500/20 text-gray-700'}`}>
									{profile.role || "Not set"}
								</span>
							</div>
							<div><strong>Created At:</strong> {profile.created_at}</div>
						</div>
					) : (
						<div className="text-yellow-500">
							Profile not found. This might be why admin access is denied.
						</div>
					)}
				</div>

				<div className="bg-white/20 backdrop-blur-md rounded-xl p-6 mb-4">
					<h2 className="text-xl font-semibold mb-4">Access Status</h2>
					{profile?.role === "admin" ? (
						<div className="text-green-600 font-semibold">
							✅ You have admin access! You should be able to visit <Link href="/admin" className="underline">/admin</Link>
						</div>
					) : (
						<div className="text-red-600 font-semibold">
							❌ Admin access denied. Current role: "{profile?.role || "Not set"}"
							<div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
								<p className="mb-2">To fix this, run this SQL in Supabase Studio (http://127.0.0.1:54333):</p>
								<pre className="bg-gray-900 dark:bg-gray-800 text-green-400 p-4 rounded mt-2 overflow-x-auto">
{`UPDATE public.profiles 
SET role = 'admin' 
WHERE id = '${auth.user.id}';

-- Or if you know the email:
UPDATE public.profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = '${auth.user.email}'
);`}
								</pre>
							</div>
						</div>
					)}
				</div>

				<div className="mt-6">
					<Link href="/" className="text-blue-500 underline">← Back to Home</Link>
				</div>
			</div>
		</div>
	);
}

