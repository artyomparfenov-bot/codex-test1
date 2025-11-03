import { z } from "zod";
import { protectedProcedure, router } from "../../trpc";
import { runAction } from "./common";
import { db, schema } from "../../../db/client";
import { eq, and } from "drizzle-orm";
import { generateIntro as openAiGenerate } from "../../../integrations/openai";

export const generateIntroRouter = router({
  trigger: protectedProcedure
    .input(
      z.object({
        companyId: z.string().uuid(),
        facts: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, input.companyId));
      if (!company) {
        throw new Error("Компания не найдена");
      }

      const [toneSetting] = await db
        .select()
        .from(schema.settings)
        .where(and(eq(schema.settings.project, company.project), eq(schema.settings.key, "tone")));
      const tone = toneSetting?.value ?? "Дружелюбный";

      const { result, fromCache } = await runAction(input.companyId, "generate_intro", async () => {
        const intro = await openAiGenerate({
          facts: input.facts ?? {},
          project: company.project,
          tone,
        });

        await db.update(schema.companies).set({ status: "intro_generated" }).where(eq(schema.companies.id, input.companyId));
        return { response: { intro }, logPayload: { intro, tone } };
      });

      if (fromCache) {
        await db.update(schema.companies).set({ status: "intro_generated" }).where(eq(schema.companies.id, input.companyId));
      }

      return result;
    }),
});
