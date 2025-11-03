import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { db, schema } from "../../db/client";
import { like, eq, and, desc, sql } from "drizzle-orm";
import { companyStatusEnum } from "@outreach/types";

const listInput = z.object({
  project: z.string().optional(),
  status: companyStatusEnum.optional(),
  q: z.string().optional(),
  page: z.number().int().min(1).default(1).optional(),
  pageSize: z.number().int().min(1).max(100).default(20).optional(),
});

const createInput = z.object({
  project: z.string(),
  name: z.string(),
  website: z.string().url().optional(),
  source: z.string().optional(),
});

const updateInput = createInput.partial().extend({ id: z.string().uuid() });

export const companiesRouter = router({
  list: protectedProcedure.input(listInput).query(async ({ input }) => {
    const { project, q, page = 1, pageSize = 20, status } = input;
    const where = [] as any[];
    if (project) {
      where.push(eq(schema.companies.project, project));
    }
    if (status) {
      where.push(eq(schema.companies.status, status));
    }
    if (q) {
      const query = `%${q}%`;
      where.push(like(schema.companies.name, query));
    }

    const countQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.companies)
      .where(where.length ? and(...where) : undefined);
    const total = countQuery[0]?.count ?? 0;

    const items = await db
      .select()
      .from(schema.companies)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(schema.companies.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return { items, total };
  }),
  create: protectedProcedure.input(createInput).mutation(async ({ input }) => {
    const [created] = await db.insert(schema.companies).values(input).returning();
    return created;
  }),
  update: protectedProcedure.input(updateInput).mutation(async ({ input }) => {
    const { id, ...patch } = input;
    const [updated] = await db
      .update(schema.companies)
      .set({ ...patch })
      .where(eq(schema.companies.id, id))
      .returning();
    return updated;
  }),
  remove: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input }) => {
    await db.delete(schema.companies).where(eq(schema.companies.id, input.id));
    return { ok: true };
  }),
});
