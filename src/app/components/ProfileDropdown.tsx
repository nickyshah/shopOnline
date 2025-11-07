"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { signOutAction } from "../actions";
import toast from "react-hot-toast";

type ProfileDropdownProps = {
	user: {
		email?: string | null;
		id: string;
	};
	userRole: string | null;
};

export default function ProfileDropdown({ user, userRole }: ProfileDropdownProps) {
	async function handleSignOut(e: React.FormEvent) {
		e.preventDefault();
		try {
			await signOutAction();
			// signOutAction uses redirect() which throws a NEXT_REDIRECT error
			// This is expected behavior, so we don't show an error
		} catch (error: any) {
			// Next.js redirect() throws a special error that we should ignore
			if (error?.digest?.startsWith("NEXT_REDIRECT") || error?.message?.includes("NEXT_REDIRECT")) {
				toast.success("Signed out successfully!");
				return;
			}
			console.error("Sign out error:", error);
			toast.error("Failed to sign out");
		}
	}

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button
					className="relative w-10 h-10 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full border border-white/30 dark:border-white/20 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/15 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					aria-label="User profile menu"
				>
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					className="min-w-[220px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-white/30 dark:border-white/20 backdrop-blur-xl p-2 z-50"
					sideOffset={8}
					align="end"
				>
					{/* User Info */}
					<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 mb-2">
						<div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
							{user.email || "User"}
						</div>
						{userRole && (
							<div className="text-xs text-gray-600 dark:text-gray-400">
								Role: <span className="capitalize font-medium">{userRole}</span>
							</div>
						)}
					</div>

					{/* Menu Items */}
					<DropdownMenu.Item className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer outline-none transition-colors">
						<button
							onClick={handleSignOut}
							className="w-full text-left flex items-center gap-2"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/>
							</svg>
							Sign Out
						</button>
					</DropdownMenu.Item>

					<DropdownMenu.Arrow className="fill-white dark:fill-gray-900" />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}

