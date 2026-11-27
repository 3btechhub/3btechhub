import React from "react";
import { Card } from "../../../elements/card/index.jsx";
import { Input } from "../../../elements/input/index.jsx";
import { Button } from "../../../elements/button/index.jsx";
export function RolePage() { return <main className="page-shell"><Card size="large"><h1>Role</h1><form className="field-stack" onSubmit={e=>e.preventDefault()}><Input label="Name" /><p>Assign Permission — permission scope remains pending where not defined.</p><div className="action-row"><Button>Create</Button><Button variant="quiet" type="reset">Cancel</Button><Button variant="quiet" disabled>Delete</Button></div></form></Card><Card><h2>Existed List</h2><p>Existing roles will appear here. Owner assignment and transfer are prohibited.</p></Card></main>; }