import { Pool } from "pg";

/**
 * A single pool per serverless container. Vercel keeps the module alive
 * between invocations, so creating the pool at module scope reuses
 * connections instead of opening one per request.
 */
let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    const raw = process.env.DATABASE_URL;
    if (!raw) {
      throw new Error("DATABASE_URL is not set");
    }
    // Neon's string carries sslmode=require. pg parses that into its own
    // ssl setting, which overrides the explicit one below and, from pg 9,
    // stops verifying the certificate. Strip it and say what we mean.
    const url = new URL(raw);
    url.searchParams.delete("sslmode");
    url.searchParams.delete("channel_binding");
    const connectionString = url.toString();
    pool = new Pool({
      connectionString,
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      ssl: { rejectUnauthorized: true },
    });
  }
  return pool;
}

export async function query<T extends Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}
