"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ProfileDropdown from "./ProfileDropdown";

type NavLinksProps = {
	user: any;
	userRole: string | null;
	cartItemCount: number;
};

export default function NavLinks({ user, userRole, cartItemCount }: NavLinksProps) {
	const pathname = usePathname();
	const router = useRouter();

	const isActive = (path: string) => {
		if (path === "/") {
			return pathname === "/";
		}
		return pathname.startsWith(path);
	};


	const activeClass = "px-4 py-2 text-sm font-semibold bg-white text-gray-900 rounded-full shadow-sm transition-all duration-300";
	const inactiveClass = "px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105";

	return (
		<nav className="flex items-center gap-3 sm:gap-4">
			<Link
				href="/products"
				className={isActive("/products") ? activeClass : inactiveClass}
			>
				Products
			</Link>
			<Link
				href="/cart"
				className={`relative ${isActive("/cart") ? activeClass : inactiveClass} flex items-center justify-center`}
			>
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					aria-label="Shopping cart"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
					/>
				</svg>
				{cartItemCount > 0 && (
					<span className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
						{cartItemCount > 99 ? "99+" : cartItemCount}
					</span>
				)}
			</Link>
			{user && (
				<Link
					href="/orders"
					className={isActive("/orders") ? activeClass : inactiveClass}
				>
					Orders
				</Link>
			)}
			<Link
				href="/about"
				className={isActive("/about") ? activeClass : inactiveClass}
			>
				About
			</Link>
			<Link
				href="/contact"
				className={isActive("/contact") ? activeClass : inactiveClass}
			>
				Contact
			</Link>
			{userRole === "admin" && (
				<Link
					href="/admin"
					className={isActive("/admin") ? activeClass : inactiveClass}
				>
					Admin
				</Link>
			)}
			{user ? (
				<ProfileDropdown user={user} userRole={userRole} />
			) : (
				<Link
					href="/login"
					className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-indigo-700 hover:to-purple-700"
				>
					Sign in
				</Link>
			)}
		</nav>
	);
}

