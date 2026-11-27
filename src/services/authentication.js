import { useEffect, useState } from "react";
import { supabase } from "../database/client.js";

export function resolveRole(user) {
  if (!user) return "Visitor";
  // Role must be assigned through trusted server-side app metadata/policy.
  // Owner identity immutability and assignment controls remain backend requirements.
  const role = user.app_metadata?.role;
  return ["Owner", "Admin", "Member"].includes(role) ? role : "Member";
}
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active) { setUser(data.user); setLoading(false); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  async function signOut() { if (supabase) await supabase.auth.signOut(); setUser(null); }
  return { user, role: resolveRole(user), loading, signOut };
}
export async function signIn(email, password) {
  if (!supabase) throw new Error("Authentication is not configured.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}