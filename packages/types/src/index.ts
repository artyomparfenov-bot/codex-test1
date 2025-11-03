import { z } from "zod";

export const companyStatusEnum = z.enum([
  "new",
  "enriched",
  "lpr_found",
  "intro_generated",
]);

export const companySchema = z.object({
  id: z.string().uuid(),
  project: z.string(),
  name: z.string(),
  website: z.string().url().nullable(),
  source: z.string().nullable(),
  status: companyStatusEnum,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const contactSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  name: z.string().nullable(),
  role: z.string().nullable(),
  email: z.string().email().nullable(),
  telegram: z.string().nullable(),
  linkedin: z.string().nullable(),
  url: z.string().nullable(),
  confidence: z.number().int(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const contactCandidateSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  email: z.string().email().nullable().optional(),
  telegram: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  confidence: z.number().int().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export const settingSchema = z.object({
  id: z.string().uuid(),
  project: z.string(),
  key: z.string(),
  value: z.string(),
  updatedAt: z.string(),
});

export const logActionEnum = z.enum([
  "enrich",
  "find_lpr",
  "generate_intro",
]);

export const logStatusEnum = z.enum([
  "queued",
  "running",
  "succeeded",
  "failed",
  "partial",
]);

export const enrichmentLogSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  action: logActionEnum,
  status: logStatusEnum,
  payloadIn: z.any(),
  payloadOut: z.any().nullable(),
  error: z.string().nullable(),
  createdAt: z.string(),
});

export const companyFactsSchema = z.object({
  website: z.string().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  geo: z.string().optional(),
  sizeHint: z.string().optional(),
  pains: z.array(z.string()).optional(),
});

export const introPayloadSchema = z.object({
  facts: companyFactsSchema,
  project: z.string(),
  tone: z.string(),
});

export type Company = z.infer<typeof companySchema>;
export type Contact = z.infer<typeof contactSchema>;
export type ContactCandidate = z.infer<typeof contactCandidateSchema>;
export type Setting = z.infer<typeof settingSchema>;
export type EnrichmentLog = z.infer<typeof enrichmentLogSchema>;
export type CompanyFacts = z.infer<typeof companyFactsSchema>;

export const paginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1).optional(),
  pageSize: z.number().int().min(1).max(100).default(20).optional(),
});

export * from "./trpc";
