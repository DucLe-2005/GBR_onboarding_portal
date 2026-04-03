import { supabase } from "@/lib/supabase";

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export async function getAccessToken() {
  const session = await getCurrentSession();
  return session?.access_token ?? null;
}
