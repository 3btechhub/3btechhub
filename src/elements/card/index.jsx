import React from "react";
export function Card({ size="medium", title, children, className="" }) {
  return <section className={`card card-${size} ${className}`}>{title && <h2>{title}</h2>}{children}</section>;
}