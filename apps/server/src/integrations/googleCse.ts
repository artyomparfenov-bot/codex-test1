import { env } from "../utils/env";
import { TokenBucket } from "../utils/rateLimit";
import { withRetry } from "../utils/retry";
import { IntegrationError } from "../utils/errors";

export type GoogleResult = { title: string; snippet?: string; url: string; site?: string };

const bucket = new TokenBucket(env.RATE_LIMIT_RPS, env.RATE_LIMIT_RPS);

export async function searchCompany(query: string): Promise<GoogleResult[]> {
  bucket.take();
  return withRetry(async () => {
    const params = new URLSearchParams({
      key: env.GOOGLE_API_KEY,
      cx: env.GOOGLE_CSE_ID,
      q: query,
      num: "5",
      lr: "lang_ru",
    });

    const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`);
    if (!response.ok) {
      throw new IntegrationError(`Google CSE error: ${response.status}`, "googleCse", await response.text());
    }
    const data = (await response.json()) as { items?: any[] };
    return (
      data.items?.map((item) => ({
        title: item.title as string,
        snippet: item.snippet as string | undefined,
        url: item.link as string,
        site: item.displayLink as string | undefined,
      })) ?? []
    );
  });
}
