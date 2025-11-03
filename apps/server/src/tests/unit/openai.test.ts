import { afterEach, afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { extractCompanyFacts, findLprCandidates } from "../../integrations/openai";

const originalFetch = global.fetch;

describe("openai integration", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses company facts", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                website: "https://example.com",
                description: "Test",
                industry: "IT",
                geo: "Москва",
                pains: ["growth"],
              }),
            },
          },
        ],
      }),
    });

    const facts = await extractCompanyFacts([]);
    expect(facts.website).toBe("https://example.com");
  });

  it("parses contacts list", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify([
                { name: "Иван", role: "CEO", email: null, confidence: 80 },
              ]),
            },
          },
        ],
      }),
    });

    const contacts = await findLprCandidates("Test", {});
    expect(contacts[0]?.name).toBe("Иван");
  });
});

afterAll(() => {
  global.fetch = originalFetch;
});
