import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../utils/env";
import * as schema from "./schema";

const pool = mysql.createPool({
  uri: env.DATABASE_URL,
  connectionLimit: 10,
  ssl: env.DATABASE_URL.includes("ssl=") ? { rejectUnauthorized: true } : undefined,
});

export const db = drizzle(pool, { schema });
export type Database = typeof db;
export { schema };
