"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
	const pathname = usePathname();

	const isActive = (path: string) => {
		if (path === "/admin") {
			return pathname === "/admin";
		}
		return pathname.startsWith(path);
	};

	const activeClass = "px-4 py-2 rounded-xl font-semibold bg-white text-gray-900 shadow-sm transition-all duration-300";
	const inactiveClass = "px-4 py-2 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300";

	return (
		<nav className="mb-8">
			<div className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/20 shadow-xl p-4 inline-flex gap-2 flex-wrap">
				<Link
					href="/admin"
					className={isActive("/admin") ? activeClass : inactiveClass}
				>
					Overview
				</Link>
				<Link
					href="/admin/products"
					className={isActive("/admin/products") ? activeClass : inactiveClass}
				>
					Products
				</Link>
				<Link
					href="/admin/categories"
					className={isActive("/admin/categories") ? activeClass : inactiveClass}
				>
					Categories
				</Link>
				<Link
					href="/admin/orders"
					className={isActive("/admin/orders") ? activeClass : inactiveClass}
				>
					Orders
				</Link>
				<Link
					href="/admin/users"
					className={isActive("/admin/users") ? activeClass : inactiveClass}
				>
					Users
				</Link>
				<Link
					href="/admin/aliexpress"
					className={isActive("/admin/aliexpress") ? activeClass : inactiveClass}
				>
					AliExpress
				</Link>
				<Link
					href="/admin/coupons"
					className={isActive("/admin/coupons") ? activeClass : inactiveClass}
				>
					Coupons
				</Link>
				<Link
					href="/admin/gift-cards"
					className={isActive("/admin/gift-cards") ? activeClass : inactiveClass}
				>
					Gift Cards
				</Link>
			</div>
		</nav>
	);
}

