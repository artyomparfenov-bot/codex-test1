import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { db, schema } from "../../db/client";
import { eq, and, desc, sql } from "drizzle-orm";
import { logActionEnum, logStatusEnum } from "@outreach/types";

export const logsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        companyId: z.string().uuid().optional(),
        action: logActionEnum.optional(),
        status: logStatusEnum.optional(),
        page: z.number().int().min(1).default(1).optional(),
        pageSize: z.number().int().min(1).max(100).default(20).optional(),
      }),
    )
    .query(async ({ input }) => {
      const filters = [] as any[];
      if (input.companyId) {
        filters.push(eq(schema.enrichmentLogs.companyId, input.companyId));
      }
      if (input.action) {
        filters.push(eq(schema.enrichmentLogs.action, input.action));
      }
      if (input.status) {
        filters.push(eq(schema.enrichmentLogs.status, input.status));
      }

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.enrichmentLogs)
        .where(filters.length ? and(...filters) : undefined);
      const total = countResult[0]?.count ?? 0;

      const items = await db
        .select()
        .from(schema.enrichmentLogs)
        .where(filters.length ? and(...filters) : undefined)
        .orderBy(desc(schema.enrichmentLogs.createdAt))
        .limit(input.pageSize ?? 20)
        .offset(((input.page ?? 1) - 1) * (input.pageSize ?? 20));

      return { items, total };
    }),
});
