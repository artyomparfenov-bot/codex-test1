import { describe, expect, it } from "vitest";
import { TokenBucket } from "../../utils/rateLimit";

describe("TokenBucket", () => {
  it("throws when exceeding capacity", () => {
    const bucket = new TokenBucket(1, 1);
    bucket.take();
    expect(() => bucket.take()).toThrowError();
  });

  it("refills over time", async () => {
    const bucket = new TokenBucket(1, 10);
    bucket.take();
    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(() => bucket.take()).not.toThrow();
  });
});
