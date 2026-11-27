import React from "react";
import { ContentManager } from "./shared-content-manager.jsx";
export function TechnicianPage() { return <ContentManager title="Technician" fields={["Name","Slug","Description","Skill","Role","Region"]} />; }