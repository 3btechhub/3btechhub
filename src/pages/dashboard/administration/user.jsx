import React from "react";
import { Card } from "../../../elements/card/index.jsx";
import { Input } from "../../../elements/input/index.jsx";
import { Selector } from "../../../elements/selector/index.jsx";
import { Button } from "../../../elements/button/index.jsx";
export function UserPage() { return <main className="page-shell"><Card size="large"><h1>User</h1><form className="field-stack" onSubmit={e=>e.preventDefault()}><Input label="Name" /><Input label="Email" type="email" /><Input label="Password" type="password" /><Selector label="Role" options={["Member","Admin","Visitor"]} /><div className="action-row"><Button>Create</Button><Button variant="quiet" type="reset">Cancel</Button><Button variant="quiet" disabled>Delete</Button></div></form></Card><Card><h2>Existed List</h2><p>Existing users will appear here. The permanent Owner is immutable and cannot be reassigned.</p></Card></main>; }