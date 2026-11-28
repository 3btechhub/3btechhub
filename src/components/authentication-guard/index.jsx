import React from "react";
import {Navigate,useLocation} from "react-router-dom";
import {useAuth} from "../../services/authentication.js";
import {PageSkeleton} from "../page-skeleton/index.jsx";
export function AuthenticationGuard({children}){const{user,profile,loading}=useAuth(),location=useLocation();if(loading)return <PageSkeleton variant="profile"/>;if(!user)return <Navigate to="/account/login" replace state={{from:location.pathname+location.search}}/>;if(!profile||profile.status!=="active")return <main className="page-shell"><section className="card"><h1>Account unavailable</h1><p>This account is inactive or has no active profile.</p></section></main>;return children;}
