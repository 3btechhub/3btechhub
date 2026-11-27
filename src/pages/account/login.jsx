import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signIn } from "../../services/authentication.js";
import { Card } from "../../elements/card/index.jsx";
import { Input } from "../../elements/input/index.jsx";
import { Button } from "../../elements/button/index.jsx";
import { ErrorMessage } from "../../components/error-handler/index.jsx";
export function Login() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  const location=useLocation(); const navigate=useNavigate();
  async function submit(event) { event.preventDefault(); setError(""); setBusy(true); try { await signIn(email,password); navigate(location.state?.from || "/account/profile",{replace:true}); } catch(e) { setError("Login failed. Check your email and password."); } finally { setBusy(false); } }
  return <main className="page-shell"><Card size="large"><h1>Login</h1><form className="field-stack" onSubmit={submit}><Input label="Email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} /><Input label="Password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} /><ErrorMessage>{error}</ErrorMessage><Button type="submit" disabled={busy}>{busy?"Signing in…":"Login"}</Button></form></Card></main>;
}