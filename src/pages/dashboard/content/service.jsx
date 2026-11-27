import React from "react";
import { ContentManager } from "./shared-content-manager.jsx";
export function ServicePage() { return <ContentManager title="Service" fields={["Name","Slug","Description","Role","Region"]} />; }