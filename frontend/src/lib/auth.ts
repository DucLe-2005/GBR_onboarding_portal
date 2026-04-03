import type { Session } from "@supabase/supabase-js";

import { getCurrentUserProfile } from "@/lib/api/users";
import { supabase } from "@/lib/supabase";
import {
  getAccessToken as getStoredAccessToken,
  getCurrentSession as getStoredCurrentSession,
} from "@/lib/session";

export type AuthStateListener = (session: Session | null) => void | Promise<void>;

/** Returns an unsubscribe function. All auth reads/writes should go through this module when possible. */
export function subscribeToAuthStateChange(callback: AuthStateListener) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
    await callback(nextSession);
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentSession() {
  return getStoredCurrentSession();
}

export async function getCurrentUser() {
  return getCurrentUserProfile();
}

export async function getAccessToken() {
  return getStoredAccessToken();
}
