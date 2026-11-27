import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../services/authentication.js";

export function AuthenticationGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <main className="page-shell"><div className="skeleton-card" aria-label="Loading page" /></main>;
  if (!user) return <Navigate to="/account/login" replace state={{ from: location.pathname }} />;
  return children;
}