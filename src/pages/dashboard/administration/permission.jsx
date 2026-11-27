import React from "react";
import { Card } from "../../../elements/card/index.jsx";
import { Input } from "../../../elements/input/index.jsx";
import { Button } from "../../../elements/button/index.jsx";
export function PermissionPage() { return <main className="page-shell"><Card size="large"><h1>Permission</h1><form className="field-stack" onSubmit={e=>e.preventDefault()}><Input label="Name" /><Input label="Action" /><div className="action-row"><Button>Create</Button><Button variant="quiet" type="reset">Cancel</Button><Button variant="quiet" disabled>Delete</Button></div></form></Card><Card><h2>Existed List</h2><p>Permission matrix is pending its approved scope.</p></Card></main>; }