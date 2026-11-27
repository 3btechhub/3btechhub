import React from "react";
import { Card } from "../../elements/card/index.jsx";
export function HomeOverview() {
  return <main className="page-shell">
    <Card size="large"><h1>3B TECH HUB</h1><p>Technology services, products and support.</p></Card>
    <div className="page-grid">
      {["Service","Product","Workshop","Technician","Contact","Media"].map(name=><Card key={name}><h2>{name}</h2><p>Public content appears here according to Role and Region visibility rules.</p></Card>)}
    </div>
  </main>;
}