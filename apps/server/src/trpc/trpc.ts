import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.isAuthenticated) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Требуется авторизация" });
  }
  return next({ ctx });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const mergeRouters = t.mergeRouters;
