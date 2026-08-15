import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { serverRouter } from "./index";
import { createFetchContext } from "./fetch-context";

/**
 * Serves the whole serverRouter from a Web Fetch API request, for use inside a
 * Next.js route handler. Lives here rather than in the web app so that
 * `@trpc/server` stays a dependency of this package only.
 */
export function handleTRPCFetchRequest(req: Request, endpoint = "/trpc") {
  return fetchRequestHandler({
    endpoint,
    req,
    router: serverRouter,
    createContext: createFetchContext,
  });
}
