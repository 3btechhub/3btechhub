import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../services/authentication.js";

export function Navigation() {
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const dashboardPath = location.pathname.startsWith("/dashboard");
  const accountPath = location.pathname.startsWith("/account");
  return <header className="site-header">
    <NavLink className="brand" to="/home/overview">3B TECH HUB</NavLink>
    <nav aria-label="Main navigation" className="main-nav">
      {!location.pathname.startsWith("/home") && <NavLink to="/home/overview">Home</NavLink>}
      {!accountPath && <NavLink to={user ? "/account/profile" : "/account/login"}>Account</NavLink>}
      {user && ["Owner", "Admin"].includes(role) && !dashboardPath && <NavLink to="/dashboard/general/overview">Dashboard</NavLink>}
      {user && <button className="button button-small button-quiet" onClick={signOut}>Logout</button>}
    </nav>
  </header>;
}