import LRUCache from "lru-cache";
import { db, schema } from "../../../db/client";
import { eq } from "drizzle-orm";
import { logger } from "../../../utils/logger";

type CachedPayload = Record<string, unknown> & { response: unknown };

const cache = new LRUCache<string, CachedPayload>({
  max: 500,
  ttl: 1000 * 60 * 60 * 24,
});

type ActionResult<T> = { response: T; logPayload: Record<string, unknown> };

export async function runAction<T>(
  companyId: string,
  action: "enrich" | "find_lpr" | "generate_intro",
  execute: () => Promise<ActionResult<T>>,
): Promise<{ result: T; fromCache: boolean }> {
  const cacheKey = `${companyId}:${action}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    await db.insert(schema.enrichmentLogs).values({
      companyId,
      action,
      status: "succeeded",
      payloadIn: { cache: true },
      payloadOut: cached,
      error: null,
    });
    return { result: cached.response as T, fromCache: true };
  }

  const [log] = await db
    .insert(schema.enrichmentLogs)
    .values({ companyId, action, status: "queued", payloadIn: {}, payloadOut: null, error: null })
    .returning();

  const logId = log?.id;
  try {
    if (logId) {
      await db.update(schema.enrichmentLogs).set({ status: "running" }).where(eq(schema.enrichmentLogs.id, logId));
    }
    const { response, logPayload } = await execute();
    const storedPayload: CachedPayload = { ...logPayload, response };
    cache.set(cacheKey, storedPayload);
    if (logId) {
      await db
        .update(schema.enrichmentLogs)
        .set({ status: "succeeded", payloadOut: storedPayload })
        .where(eq(schema.enrichmentLogs.id, logId));
    }
    return { result: response, fromCache: false };
  } catch (error) {
    logger.error("Action failed", { companyId, action, error });
    if (logId) {
      await db
        .update(schema.enrichmentLogs)
        .set({ status: "failed", error: error instanceof Error ? error.message : "Unknown" })
        .where(eq(schema.enrichmentLogs.id, logId));
    }
    throw error;
  }
}
