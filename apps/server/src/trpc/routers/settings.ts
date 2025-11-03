import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { db, schema } from "../../db/client";
import { eq, and } from "drizzle-orm";

export const settingsRouter = router({
  list: protectedProcedure
    .input(z.object({ project: z.string() }))
    .query(async ({ input }) => {
      return db.select().from(schema.settings).where(eq(schema.settings.project, input.project));
    }),
  set: protectedProcedure
    .input(z.object({ project: z.string(), key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      const [existing] = await db
        .select()
        .from(schema.settings)
        .where(and(eq(schema.settings.project, input.project), eq(schema.settings.key, input.key)));

      if (existing) {
        const [updated] = await db
          .update(schema.settings)
          .set({ value: input.value })
          .where(eq(schema.settings.id, existing.id))
          .returning();
        return updated;
      }

      const [created] = await db.insert(schema.settings).values(input).returning();
      return created;
    }),
});
