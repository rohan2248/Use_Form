import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  return c({
    // same-origin by default: Next serves the router at /trpc, so the auth
    // cookie is first-party and needs no CORS. Point NEXT_PUBLIC_API_URL at a
    // standalone express instance only if you want to bypass that.
    url: env.NEXT_PUBLIC_API_URL ?? "/trpc",
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
