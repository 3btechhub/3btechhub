import React from "react";
import { Card } from "../../../elements/card/index.jsx";
import { Input } from "../../../elements/input/index.jsx";
import { Button } from "../../../elements/button/index.jsx";
import { Checklist } from "../../../elements/checklist/index.jsx";
const roles=["Owner","Admin","Member","Visitor"], regions=["Global","Bangladesh","Saudi Arabia"];
export function WorkshopPage() { return <main className="page-shell"><Card size="large"><h1>Workshop</h1><form className="field-stack" onSubmit={e=>e.preventDefault()}><Input label="Name" /><Input label="Slug" /><Input label="Description" /><Input label="Location" /><div><span className="field-label">Role</span><Checklist options={roles} value={[]} onChange={()=>{}} /></div><div><span className="field-label">Region</span><Checklist options={regions} value={[]} onChange={()=>{}} /></div><div className="action-row"><Button>Save</Button><Button type="reset" variant="quiet">Cancel</Button><Button type="button" variant="quiet" disabled>Delete</Button></div></form></Card><Card><h2>Existed List</h2><p>Records appear after the approved schema and permissions are configured.</p></Card></main>; }