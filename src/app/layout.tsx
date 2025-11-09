import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import NavLinks from "./components/NavLinks";
import Toaster from "./components/Toaster";
import NewsletterModal from "./components/NewsletterModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RawNode - Premium Products",
  description: "Shop the finest collection of premium products. Fast shipping, secure checkout, and exceptional customer service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Simple header */}
        <Header />
        <main className="flex flex-col min-h-screen">{children}</main>
        <Footer />
        <Toaster />
        <NewsletterModal />
      </body>
    </html>
  );
}

async function Header() {
  const { getSessionUser, getCartItemCount } = await import("./actions");
  const { getSupabaseServerClient } = await import("@/lib/supabase/server");
  const user = await getSessionUser();
  let userRole: string | null = null;
  if (user) {
    const supabase = await getSupabaseServerClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    userRole = profile?.role || null;
  }
  const cartItemCount = await getCartItemCount();
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glass Header with backdrop */}
      <div className="absolute inset-0 bg-white/20 dark:bg-white/10 backdrop-blur-xl border-b border-white/30 dark:border-white/20 shadow-lg"></div>
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 hover:scale-105"
          >
            RawNode
          </Link>
          <NavLinks user={user} userRole={userRole} cartItemCount={cartItemCount} />
        </div>
      </div>
    </header>
  );
}
