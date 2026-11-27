import { useEffect, useState } from "react";
import { supabase } from "../database/client.js";
import { useNavigate } from "react-router-dom";

export function resolveRole(user) {
  if (!user) return "Visitor";
  if (user.email?.toLowerCase() === "3btechhub@gmail.com") return "Owner";
  return user.app_metadata?.role || user.user_metadata?.role || "Member";
}
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => listener.subscription.unsubscribe();
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