import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { db, schema } from "../../db/client";
import { eq, sql } from "drizzle-orm";
import { contactCandidateSchema } from "@outreach/types";

export const contactsRouter = router({
  list: protectedProcedure
    .input(z.object({ companyId: z.string().uuid() }))
    .query(async ({ input }) => {
      return db.select().from(schema.contacts).where(eq(schema.contacts.companyId, input.companyId));
    }),
  upsert: protectedProcedure
    .input(
      z.object({
        companyId: z.string().uuid(),
        candidates: z.array(contactCandidateSchema.pick({
          name: true,
          role: true,
          email: true,
          telegram: true,
          linkedin: true,
          url: true,
          confidence: true,
          notes: true,
        })),
      }),
    )
    .mutation(async ({ input }) => {
      const payload = input.candidates.map((candidate) => ({
        ...candidate,
        companyId: input.companyId,
        confidence: candidate.confidence ?? 0,
      }));

      if (payload.length === 0) {
        return db.select().from(schema.contacts).where(eq(schema.contacts.companyId, input.companyId));
      }

      await db
        .insert(schema.contacts)
        .values(payload)
        .onDuplicateKeyUpdate({
          set: {
            name: sql`VALUES(name)`,
            role: sql`VALUES(role)`,
            email: sql`VALUES(email)`,
            telegram: sql`VALUES(telegram)`,
            linkedin: sql`VALUES(linkedin)`,
            url: sql`VALUES(url)`,
            confidence: sql`VALUES(confidence)`,
            notes: sql`VALUES(notes)`,
          },
        });

      return db.select().from(schema.contacts).where(eq(schema.contacts.companyId, input.companyId));
    }),
});
