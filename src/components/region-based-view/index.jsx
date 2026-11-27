import React from "react";
export function RegionBasedView({ region, detectedRegion, children }) {
  if (!region || region === "Global") return children;
  if (!detectedRegion) return null;
  return region === detectedRegion ? children : null;
}