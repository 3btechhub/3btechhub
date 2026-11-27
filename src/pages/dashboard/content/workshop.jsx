import React from "react";
import { ContentManager } from "./shared-content-manager.jsx";
export function WorkshopPage() { return <ContentManager title="Workshop" fields={["Name","Slug","Description","Location","Role","Region"]} />; }