import { supabase as realSupabase } from "@/lib/supabase";
const supabase = realSupabase as any;
import type { Profile } from "@/types";

// ============================================================
// AUTH SERVICE
// ============================================================

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  phone?: string
): Promise<void> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone ?? null,
      },
    },
  });

  if (error) throw error;

  // Create profile record
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email,
      full_name: fullName,
      phone: phone ?? null,
      role: "citizen",
    });
    if (profileError) throw profileError;
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const redirectTo = `${import.meta.env.VITE_APP_URL}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return null;
  return data;
}
