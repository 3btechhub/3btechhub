import React from "react";
import { ContentManager } from "./shared-content-manager.jsx";
export function ContactPage() { return <ContentManager title="Contact" fields={["Type","Name","Value","Role","Region"]} />; }