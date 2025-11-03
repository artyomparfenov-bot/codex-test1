import { z } from "zod";
import { protectedProcedure, router } from "../../trpc";
import { runAction } from "./common";
import { db, schema } from "../../../db/client";
import { eq } from "drizzle-orm";
import { searchCompany } from "../../../integrations/googleCse";
import { extractCompanyFacts } from "../../../integrations/openai";

export const enrichCompanyRouter = router({
  trigger: protectedProcedure
    .input(z.object({ companyId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, input.companyId));
      if (!company) {
        throw new Error("Компания не найдена");
      }

      const { result, fromCache } = await runAction(input.companyId, "enrich", async () => {
        const results = await searchCompany(company.name);
        const facts = await extractCompanyFacts(results);
        await db
          .update(schema.companies)
          .set({
            website: facts.website ?? company.website,
            status: "enriched",
          })
          .where(eq(schema.companies.id, input.companyId));
        return { response: { facts }, logPayload: { results, facts } };
      });

      if (fromCache) {
        await db.update(schema.companies).set({ status: "enriched" }).where(eq(schema.companies.id, input.companyId));
      }

      return result;
    }),
});
