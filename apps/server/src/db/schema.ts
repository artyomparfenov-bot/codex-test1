import { mysqlTable, varchar, mysqlEnum, datetime, text, json, int, index, uniqueIndex } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const companies = mysqlTable("companies", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(uuid())`),
  project: varchar("project", { length: 191 }).notNull(),
  name: varchar("name", { length: 191 }).notNull(),
  website: varchar("website", { length: 191 }),
  source: varchar("source", { length: 191 }),
  status: mysqlEnum("status", ["new", "enriched", "lpr_found", "intro_generated"]).notNull().default("new"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const contacts = mysqlTable(
  "contacts",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`(uuid())`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 191 }),
    role: varchar("role", { length: 191 }),
    email: varchar("email", { length: 191 }),
    telegram: varchar("telegram", { length: 191 }),
    linkedin: varchar("linkedin", { length: 191 }),
    url: varchar("url", { length: 191 }),
    confidence: int("confidence").default(0).notNull(),
    notes: text("notes"),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  },
  (table) => ({
    emailCompanyIdx: uniqueIndex("contacts_company_email_unique").on(table.companyId, table.email),
    urlCompanyIdx: uniqueIndex("contacts_company_url_unique").on(table.companyId, table.url),
  }),
);

export const settings = mysqlTable(
  "settings",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`(uuid())`),
    project: varchar("project", { length: 191 }).notNull(),
    key: varchar("key", { length: 191 }).notNull(),
    value: text("value").notNull(),
    updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  },
  (table) => ({
    projectKeyIdx: index("settings_project_key_idx").on(table.project, table.key),
  }),
);

export const enrichmentLogs = mysqlTable(
  "enrichment_logs",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`(uuid())`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    action: mysqlEnum("action", ["enrich", "find_lpr", "generate_intro"]).notNull(),
    status: mysqlEnum("status", ["queued", "running", "succeeded", "failed", "partial"]).notNull(),
    payloadIn: json("payload_in").$type<Record<string, unknown>>().notNull(),
    payloadOut: json("payload_out").$type<Record<string, unknown> | null>(),
    error: text("error"),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    companyActionIdx: index("enrichment_logs_company_action_created_idx").on(table.companyId, table.action, table.createdAt),
  }),
);
