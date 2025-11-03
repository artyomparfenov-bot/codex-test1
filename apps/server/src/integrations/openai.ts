import { env } from "../utils/env";
import { TokenBucket } from "../utils/rateLimit";
import { withRetry } from "../utils/retry";
import { IntegrationError, ValidationError } from "../utils/errors";
import { companyFactsSchema, contactCandidateSchema } from "@outreach/types";
import { PROMPT_EXTRACT_COMPANY, PROMPT_GENERATE_INTRO, PROMPT_FIND_LPR } from "./openai.prompts";
import type { GoogleResult } from "./googleCse";

const bucket = new TokenBucket(env.RATE_LIMIT_RPS, env.RATE_LIMIT_RPS);

type ChatResponse = {
  choices: { message: { content: string } }[];
};

async function callOpenAI(body: Record<string, unknown>) {
  bucket.take();
  return withRetry(async () => {
    const response = await fetch(`${env.OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new IntegrationError(`OpenAI error: ${response.status}`, "openai", await response.text());
    }

    return (await response.json()) as ChatResponse;
  });
}

export async function extractCompanyFacts(results: GoogleResult[]) {
  const payload = JSON.stringify(results, null, 2);
  const response = await callOpenAI({
    model: env.OPENAI_MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: PROMPT_EXTRACT_COMPANY.system },
      { role: "user", content: PROMPT_EXTRACT_COMPANY.user.replace("{{RESULTS_JSON}}", payload) },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new IntegrationError("OpenAI вернул пустой ответ", "openai");
  }

  const parsed = companyFactsSchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    throw new ValidationError("Ответ OpenAI не соответствует схеме");
  }

  return parsed.data;
}

export async function findLprCandidates(company: string, facts: unknown) {
  const response = await callOpenAI({
    model: env.OPENAI_MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: PROMPT_FIND_LPR.system },
      {
        role: "user",
        content: PROMPT_FIND_LPR.user
          .replace("{{COMPANY}}", company)
          .replace("{{FACTS_JSON}}", JSON.stringify(facts, null, 2)),
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new IntegrationError("OpenAI вернул пустой ответ", "openai");
  }

  const candidates = JSON.parse(content) as unknown;
  const parsed = contactCandidateSchema.array().safeParse(candidates);
  if (!parsed.success) {
    throw new ValidationError("Ответ OpenAI с LPR некорректен");
  }
  return parsed.data;
}

export async function generateIntro({ facts, project, tone }: { facts: Record<string, unknown>; project: string; tone: string }) {
  const response = await callOpenAI({
    model: env.OPENAI_MODEL,
    temperature: 0.5,
    messages: [
      { role: "system", content: PROMPT_GENERATE_INTRO.system },
      {
        role: "user",
        content: PROMPT_GENERATE_INTRO.user
          .replace("{{PROJECT}}", project)
          .replace("{{TONE}}", tone)
          .replace("{{FACTS_JSON}}", JSON.stringify(facts, null, 2)),
      },
    ],
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new IntegrationError("Не удалось сгенерировать интро", "openai");
  }

  return content;
}
