import { serve } from "@hono/node-server";
import api from "./api";

const port = 3000;

console.log(`API server starting on http://localhost:${port}...`);

serve({
  fetch: api.fetch,
  port,
});
