import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import api from "~/../server/api";

const startHandler = createStartHandler(defaultStreamHandler);

export default {
  fetch: async (req: Request): Promise<Response> => {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/p/") || url.pathname === "/robots.txt") {
      return api.fetch(req);
    }

    return startHandler(req);
  },
};
