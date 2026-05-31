/// <reference types="@cloudflare/workers-types" />
import { Hono } from "hono";
import api from "./api";

type Bindings = {
  ASSETS: Fetcher;
  BUCKET: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

app.route("/", api);

app.get("*", async (c) => {
  const res = await c.env.ASSETS.fetch(
    new Request(new URL("/index.html", c.req.url))
  );
  if (res.status === 200) return res;
  return c.text("Not Found", 404);
});

export default app;