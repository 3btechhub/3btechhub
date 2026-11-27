import React from "react";
import { Card } from "../../../elements/card/index.jsx";
import { Input } from "../../../elements/input/index.jsx";
import { Button } from "../../../elements/button/index.jsx";
import { MediaUploader } from "../../../components/media-uploader/index.jsx";
export function MediaPage() { return <main className="page-shell"><Card size="large"><h1>Media</h1><form className="field-stack" onSubmit={e=>e.preventDefault()}><Input label="Name" /><Input label="Slug" /><Input label="Description" /><Input label="File Type" /><MediaUploader /><Input label="Url" /><div className="action-row"><Button>Upload</Button><Button type="reset" variant="quiet">Cancel</Button><Button type="button" variant="quiet" disabled>Delete</Button></div></form></Card><Card><h2>Existed List</h2><p>Records appear after approved upload policy and schema are configured.</p></Card></main>; }