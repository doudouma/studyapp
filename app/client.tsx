import { createRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

console.log("[client] Starting hydration...");
const rootEl = document.getElementById("root");
console.log("[client] root element:", rootEl ? "found" : "missing");

if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<StartClient />);
  console.log("[client] render called");
} else {
  console.error("[client] root element not found!");
}