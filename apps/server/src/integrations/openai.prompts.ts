export const PROMPT_EXTRACT_COMPANY = {
  system: "You convert noisy web search results into a compact JSON profile of a company.",
  user: `Given web results (title, snippet, url), extract:
- website (canonical domain)
- 1–2 sentence description
- industry (1–2 words)
- geo (country/city if clear)
- sizeHint (employees or scale cue if obvious)
- pains (array of specific operational or marketing pains, 2–5 items)
Return **valid JSON** only, matching this TypeScript type:
{ "website": "...", "description": "...", "industry": "...", "geo": "...", "sizeHint": "...", "pains": ["...", "..."] }
Results:
{{RESULTS_JSON}}`,
};

export const PROMPT_GENERATE_INTRO = {
  system: "You write concise, specific first-touch outreach messages.",
  user: `Project: {{PROJECT}}
Tone: {{TONE}}
Company facts: {{FACTS_JSON}}

Write a 3–5 sentence intro with:
- 1 sharp insight referencing a fact
- concrete benefit tailored to industry
- crisp CTA (15–20 words)
Avoid fluff. Return plain text.`,
};

export const PROMPT_FIND_LPR = {
  system: "You help SDR teams identify likely decision makers from company context.",
  user: `Company: {{COMPANY}}
Facts: {{FACTS_JSON}}

Return JSON array (max 3) of contacts with keys: name, role, email, telegram, linkedin, url, confidence (0-100), notes.
If data is missing, set null.`,
};
