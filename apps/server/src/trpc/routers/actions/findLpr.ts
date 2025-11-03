import { z } from "zod";
import { protectedProcedure, router } from "../../trpc";
import { runAction } from "./common";
import { db, schema } from "../../../db/client";
import { eq, sql } from "drizzle-orm";
import { findLprCandidates } from "../../../integrations/openai";

export const findLprRouter = router({
  trigger: protectedProcedure
    .input(z.object({ companyId: z.string().uuid(), facts: z.record(z.any()).optional() }))
    .mutation(async ({ input }) => {
      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, input.companyId));
      if (!company) {
        throw new Error("Компания не найдена");
      }

      const { result, fromCache } = await runAction(input.companyId, "find_lpr", async () => {
        const facts = input.facts ?? {};
        const contacts = await findLprCandidates(company.name, facts);
        if (contacts.length) {
          await db
            .insert(schema.contacts)
            .values(
              contacts.map((contact) => ({
                ...contact,
                companyId: input.companyId,
                confidence: contact.confidence ?? 50,
              })),
            )
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
        }
        await db.update(schema.companies).set({ status: "lpr_found" }).where(eq(schema.companies.id, input.companyId));
        return { response: { contacts }, logPayload: { contacts } };
      });

      if (fromCache) {
        await db.update(schema.companies).set({ status: "lpr_found" }).where(eq(schema.companies.id, input.companyId));
      }

      return result;
    }),
});
