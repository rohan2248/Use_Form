import { handleTRPCFetchRequest } from "@repo/trpc/server/fetch-handler";

// the router talks to postgres, so this must never be statically evaluated
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const handler = (req: Request) => handleTRPCFetchRequest(req);

export { handler as GET, handler as POST };
