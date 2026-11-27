import React from "react";
import { ContentManager } from "./shared-content-manager.jsx";
export function MediaPage() { return <ContentManager title="Media" fields={["Name","Slug","Description","File Type","File Picker","Url"]} />; }