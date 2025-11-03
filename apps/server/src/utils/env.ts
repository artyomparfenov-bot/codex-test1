import { config } from "dotenv";
import { z } from "zod";

config({ path: process.env.NODE_ENV === "test" ? ".env.test" : undefined });

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(6),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_BASE_URL: z.string().url(),
  OPENAI_MODEL: z.string().min(1),
  GOOGLE_CSE_ID: z.string().min(1),
  GOOGLE_API_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  RATE_LIMIT_RPS: z.coerce.number().int().min(1).default(3),
  MAX_RETRIES: z.coerce.number().int().min(1).default(3),
  RETRY_BACKOFF_MS: z.coerce.number().int().min(50).default(500),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("[env] Ошибка валидации переменных окружения", parsed.error.flatten().fieldErrors);
  throw new Error("Некорректные переменные окружения");
}

export const env = parsed.data;
