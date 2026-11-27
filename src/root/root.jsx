import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "../themes/theme-provider.jsx";
import { AppRoutes } from "./index.jsx";
import { ErrorBoundary } from "../components/error-handler/index.jsx";

export default function Root() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter basename="/3btechhub">
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}