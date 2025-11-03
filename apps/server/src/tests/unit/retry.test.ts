import { describe, expect, it } from "vitest";
import { withRetry } from "../../utils/retry";

describe("withRetry", () => {
  it("retries specified times", async () => {
    let attempts = 0;
    await expect(
      withRetry(async () => {
        attempts += 1;
        if (attempts < 2) {
          throw new Error("fail");
        }
        return "ok";
      }),
    ).resolves.toBe("ok");
    expect(attempts).toBe(2);
  });
});
