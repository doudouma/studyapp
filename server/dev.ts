import { serve } from "@hono/node-server";
import api from "./api";

const port = parseInt(process.env.PORT || "3000", 10);

console.log(`API server starting on http://localhost:${port}...`);

serve({
  fetch: api.fetch,
  port,
});
