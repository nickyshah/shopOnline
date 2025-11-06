import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If envs are missing, allow the request but log in console (during dev)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[middleware] Missing Supabase envs; skipping auth checks");
    return res;
  }

  // Create a Supabase client bound to request/response cookies so auth tokens refresh
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        res.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // Always attempt to hydrate/refresh session cookies
  const { data: auth } = await supabase.auth.getUser();

  // Admin route gate
  const pathname = req.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    // Require login
    if (!auth.user) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .maybeSingle();

    const role = profile?.role?.toLowerCase().trim();
    const isAdmin = role === "admin" || auth.user.email === "admin@rawnode.com";
    if (!isAdmin) {
      // Not an admin: redirect home
      const homeUrl = new URL("/", req.nextUrl.origin);
      return NextResponse.redirect(homeUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    
    // Apply to all pages so session cookies stay fresh, but skip static assets/APIs
    "/((?!_next/static|_next/image|favicon.ico|public|api/stripe/webhook).*)",
  ],
};