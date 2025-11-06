"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOutAction } from "../actions";
import toast from "react-hot-toast";

type NavLinksProps = {
	user: any;
	userRole: string | null;
};

export default function NavLinks({ user, userRole }: NavLinksProps) {
	const pathname = usePathname();
	const router = useRouter();

	const isActive = (path: string) => {
		if (path === "/") {
			return pathname === "/";
		}
		return pathname.startsWith(path);
	};

	async function handleSignOut(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		try {
			await signOutAction();
			toast.success("Signed out successfully!");
		} catch (error) {
			toast.error("Failed to sign out");
		}
	}

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
				className={isActive("/cart") ? activeClass : inactiveClass}
			>
				Cart
			</Link>
			{user && (
				<Link
					href="/orders"
					className={isActive("/orders") ? activeClass : inactiveClass}
				>
					Orders
				</Link>
			)}
			{userRole === "admin" && (
				<Link
					href="/admin"
					className={isActive("/admin") ? activeClass : inactiveClass}
				>
					Admin
				</Link>
			)}
			{user ? (
				<form onSubmit={handleSignOut} className="inline-block">
					<button
						type="submit"
						className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105"
					>
						Sign out
					</button>
				</form>
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

