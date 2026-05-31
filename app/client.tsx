import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

const router = getRouter();
const rootEl = document.getElementById("root")!;
const root = createRoot(rootEl);
root.render(<RouterProvider router={router} />);
