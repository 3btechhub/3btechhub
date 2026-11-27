import React from "react";
export function Statement({ children, tone="info" }) { return <p className={`statement statement-${tone}`}>{children}</p>; }