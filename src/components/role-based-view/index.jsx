import React from "react";
import { useAuth } from "../../services/authentication.js";
import { PageSkeleton } from "../page-skeleton/index.jsx";
export function RoleBasedView({ allow=[], children, fallback=null }) {
  const { role, loading } = useAuth();
  if (loading) return <PageSkeleton variant="dashboard"/>;
  return allow.includes(role) ? children : (fallback || <main className="page-shell"><section className="card"><h1>Access denied</h1></section></main>);
}
