import { NextResponse } from 'next/server';
import { ensureDb, sql } from '@/lib/db';

const COMPANY_ID = 'default';

export async function GET() {
  await ensureDb();
  const res = await sql`SELECT data FROM company WHERE id = ${COMPANY_ID} LIMIT 1`;
  const row = res.rows?.[0] as any;
  return NextResponse.json(row?.data ?? { name: '' });
}

export async function POST(req: Request) {
  await ensureDb();
  const body = await req.json();
  await sql`
    INSERT INTO company (id, data) VALUES (${COMPANY_ID}, ${body}::jsonb)
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
  `;
  return NextResponse.json({ ok: true });
}
