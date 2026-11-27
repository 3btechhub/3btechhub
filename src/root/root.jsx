import React from "react";
import { HashRouter } from "react-router-dom";
import { ThemeProvider } from "../themes/theme-provider.jsx";
import { AppRoutes } from "./index.jsx";
import { ErrorBoundary } from "../components/error-handler/index.jsx";
export default function Root() { return <ErrorBoundary><ThemeProvider><HashRouter><AppRoutes /></HashRouter></ThemeProvider></ErrorBoundary>; }