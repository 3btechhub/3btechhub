import React from "react";
import { Card } from "../../../elements/card/index.jsx";
import { Selector } from "../../../elements/selector/index.jsx";
import { Checklist } from "../../../elements/checklist/index.jsx";
import { Button } from "../../../elements/button/index.jsx";
const types=["Service","Product","Workshop","Technician","Contact","Media"];
export function RelationPage() {
  return <main className="page-shell"><Card size="large"><h1>Relation</h1><p>Source Field</p><Selector label="Type" options={types} /><Selector label="Name" options={[]} /><p>Target Field</p><Checklist options={types} value={[]} onChange={()=>{}} /><div className="action-row"><Button>Save</Button><Button variant="quiet">Cancel</Button><Button variant="quiet" disabled>Delete</Button></div><small>Target selection requires loaded records. Same-type and duplicate/reversed pairs are disallowed.</small></Card></main>;
}