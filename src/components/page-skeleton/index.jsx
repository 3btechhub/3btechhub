import React from "react";

const shapes = {
  "home-overview": ["hero", "card", "card", "card"],
  "home-list": ["heading", "row", "row", "row", "row", "row"],
  "home-detail": ["heading", "paragraph", "paragraph", "action"],
  login: ["heading", "field", "field", "action"],
  profile: ["heading", "field", "field", "field", "action"],
  dashboard: ["heading", "nav", "card", "card"],
  form: ["heading", "field", "field", "field", "field", "action"],
  generic: ["heading", "card", "card"]
};

export function PageSkeleton({ variant = "generic" }) {
  const items = shapes[variant] || shapes.generic;
  return <main className={"page-shell page-skeleton page-skeleton-" + variant} aria-label="Loading page" aria-busy="true">
    {items.map((shape, index) => <div key={index} className={"skeleton-shape skeleton-" + shape} />)}
  </main>;
}
