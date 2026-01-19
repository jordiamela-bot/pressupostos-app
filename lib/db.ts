import { sql } from '@vercel/postgres';

let didInit = false;

/**
 * Creates tables if they don't exist yet.
 * Safe to call on every request.
 */
export async function ensureDb(): Promise<void> {
  if (didInit) return;
  // Small race is fine: CREATE TABLE IF NOT EXISTS is idempotent.
  didInit = true;

  await sql`
    CREATE TABLE IF NOT EXISTS company (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

export { sql };
