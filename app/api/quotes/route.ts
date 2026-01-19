import { NextResponse } from 'next/server';
import { ensureDb, sql } from '@/lib/db';

export async function GET() {
  await ensureDb();
  const res = await sql`SELECT data FROM quotes ORDER BY updated_at DESC`;
  const quotes = (res.rows ?? []).map((r: any) => r.data);
  return NextResponse.json(quotes);
}

export async function POST(req: Request) {
  await ensureDb();
  const body = await req.json();
  const quotes = Array.isArray(body) ? body : [];

  for (const q of quotes) {
    if (!q?.id) continue;
    await sql`
      INSERT INTO quotes (id, data) VALUES (${q.id}, ${q}::jsonb)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
    `;
  }

  // Keep DB in sync with the UI list (handle deletions)
  const ids = quotes.map((q: any) => String(q?.id || '')).filter(Boolean);
  await sql`DELETE FROM quotes WHERE NOT (id = ANY(${ids}));`;

  return NextResponse.json({ ok: true });
}
