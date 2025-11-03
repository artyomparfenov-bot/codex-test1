import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { getSession, verifyBasicAuth } from "../utils/auth";

export type Context = {
  isAuthenticated: boolean;
};

export async function createContext({ req }: CreateHTTPContextOptions): Promise<Context> {
  const isAuthenticated = Boolean(getSession(req)) || verifyBasicAuth(req.headers.authorization);
  return { isAuthenticated };
}
