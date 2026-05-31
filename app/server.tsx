import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import api from "~/../server/api";
import { Hono } from "hono";

const startHandler = createStartHandler(defaultStreamHandler);

const app = new Hono();

// Mount all existing API routes (they define their own /api/*, /p/*, /robots.txt paths)
app.route("/", api);

// All other routes go to TanStack Start SSR
app.all("*", (c) => startHandler(c.req.raw));

export default app;
