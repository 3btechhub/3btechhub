import React from "react";
import { ContentManager } from "./shared-content-manager.jsx";
export function ProductPage() { return <ContentManager title="Product" fields={["Name","Slug","Description","Role","Region"]} />; }