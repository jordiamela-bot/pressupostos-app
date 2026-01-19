import { NextResponse } from 'next/server';
import { ensureDb, sql } from '@/lib/db';

export async function GET() {
  await ensureDb();
  const res = await sql`SELECT data FROM clients ORDER BY updated_at DESC`;
  const clients = (res.rows ?? []).map((r: any) => r.data);
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  await ensureDb();
  const body = await req.json();
  const clients = Array.isArray(body) ? body : [];

  // Upsert each client (simple and safe for small datasets)
  for (const c of clients) {
    if (!c?.id) continue;
    await sql`
      INSERT INTO clients (id, data) VALUES (${c.id}, ${c}::jsonb)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
    `;
  }

  // IMPORTANT: keep DB in sync with the client state.
  // If the user deletes a client on the UI, we must delete it from DB too,
  // otherwise it will come back on the next refresh.
  const ids = clients.map((c: any) => String(c?.id || '')).filter(Boolean);
  await sql`DELETE FROM clients WHERE NOT (id = ANY(${ids}));`;

  return NextResponse.json({ ok: true });
}
