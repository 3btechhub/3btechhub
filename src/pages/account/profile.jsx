import React from "react";
import { useAuth } from "../../services/authentication.js";
export function Profile() { const { user, role }=useAuth(); return <main className="page-shell"><section className="card"><h1>Profile</h1><p>{user?.email}</p><p>Role: {role}</p></section></main>; }