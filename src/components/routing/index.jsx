import { Navigate } from "react-router-dom";
export function DefaultRoute({ to="/home/overview" }) { return <Navigate to={to} replace />; }