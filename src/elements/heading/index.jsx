import React from "react";
export function Heading({ level=2, children }) { const Tag = `h${Math.min(6, Math.max(1, level))}`; return <Tag>{children}</Tag>; }