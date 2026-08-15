import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { TRPCContext } from "./context";
import {
  clearCookieFetchFactory,
  createCookieFetchFactory,
  getCookieFetchFactory,
} from "./utils/fetch-cookie";

/**
 * Fetch-adapter twin of ./context.ts. Produces the exact same TRPCContext shape,
 * so every route and procedure works unchanged whether it is served by express
 * or by a Next.js route handler.
 */
export async function createFetchContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions): Promise<TRPCContext> {
  const ctx: TRPCContext = {
    createCookie: createCookieFetchFactory(resHeaders),
    getCookie: getCookieFetchFactory(req),
    clearCookie: clearCookieFetchFactory(resHeaders),
    user: undefined,
  };
  return ctx;
}
