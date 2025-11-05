"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function signOutAction() {
	const supabase = await getSupabaseServerClient();
	await supabase.auth.signOut();
	redirect("/");
}

export async function getSessionUser() {
	const supabase = await getSupabaseServerClient();
	const { data } = await supabase.auth.getUser();
	return data.user;
}


