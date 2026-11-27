import React from "react";
import { Card } from "../../../elements/card/index.jsx";
import { Input } from "../../../elements/input/index.jsx";
import { Button } from "../../../elements/button/index.jsx";
import { Checklist } from "../../../elements/checklist/index.jsx";
import { MediaUploader } from "../../../components/media-uploader/index.jsx";
const roles=["Owner","Admin","Member","Visitor"];
const regions=["Global","Bangladesh","Saudi Arabia"];
export function ContentManager({title,fields}) {
  return <main className="page-shell"><Card size="large"><h1>{title}</h1><form className="field-stack" onSubmit={e=>e.preventDefault()}>
    {fields.map(field => field==="Role" ? <div key={field}><span className="field-label">Role</span><Checklist options={roles} value={[]} onChange={()=>{}} /></div> : field==="Region" ? <div key={field}><span className="field-label">Region</span><Checklist options={regions} value={[]} onChange={()=>{}} /></div> : field==="File Picker" ? <MediaUploader key={field} /> : <Input key={field} label={field} />)}
    <div className="action-row"><Button type="submit">Save</Button><Button type="reset" variant="quiet">Cancel</Button><Button type="button" variant="quiet" disabled>Delete</Button></div>
  </form></Card><Card><h2>Existed List</h2><p>Records will appear after the approved database schema and permissions are configured.</p></Card></main>;
}