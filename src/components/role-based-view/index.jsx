import React from "react";
import { useAuth } from "../../services/authentication.js";

export function RoleBasedView({ allow=[], children, fallback=null }) {
  const { role, loading } = useAuth();
  if (loading) return <div className="page-shell"><p>Loading access…</p></div>;
  return allow.includes(role) ? children : (fallback || <main className="page-shell"><section className="card"><h1>Access denied</h1></section></main>);
}