import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type AiLine = {
  concept: string;
  qty?: number;
  unitCostGross?: number;
  discountPercent?: number;
  category?: string;
  type?: 'product' | 'service' | 'transport' | 'info';
  marginPercent?: number;
};

type AiResult = {
  lines: AiLine[];
  vatPercent?: number;
  currency?: string;
  confidence?: number;
  warnings?: string[];
};

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

  if (!key) {
    return new NextResponse(
      'Falta GEMINI_API_KEY a les variables d\'entorn (Vercel → Project → Settings → Environment Variables).',
      { status: 500 }
    );
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return new NextResponse('No s\'ha rebut cap fitxer.', { status: 400 });
  }
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return new NextResponse('El fitxer ha de ser PDF.', { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const b64 = buf.toString('base64');

  const system =
    'Ets un assistent que extreu línies de pressupostos de PDFs de proveïdors.';

  const instruction = `
Tasca:
- Llegeix el PDF.
- Extreu una llista de línies (productes/serveis) amb: concept, qty, unitCostGross, discountPercent.
- Si veus un descompte global i no el pots aplicar per línia, posa'l a warnings.
- Torna NOMÉS JSON vàlid (sense markdown) amb l'estructura:
{
  "lines": [ {"concept":"...","qty":1,"unitCostGross":123.45,"discountPercent":0,"category":"Material","type":"product"} ],
  "vatPercent": 21,
  "currency": "EUR",
  "confidence": 0.0,
  "warnings": []
}

Notes:
- unitCostGross és el cost per unitat abans del nostre marge.
- qty és numèric.
- discountPercent és percentatge (0-100).
- Si no trobes IVA, deixa vatPercent sense posar.
`.trim();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(key)}`;

  const payload = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [
      {
        role: 'user',
        parts: [
          { text: instruction },
          { inline_data: { mime_type: 'application/pdf', data: b64 } }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    return new NextResponse(`Gemini error: ${res.status} ${txt}`, { status: 500 });
  }

  const json = (await res.json()) as any;
  const text: string | undefined =
    json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n');

  if (!text) {
    return new NextResponse('Gemini no ha retornat text.', { status: 500 });
  }

  // Try parse JSON directly. If Gemini wrapped extra text, extract first {...} block.
  let parsed: AiResult | null = null;
  try {
    parsed = JSON.parse(text) as AiResult;
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        parsed = JSON.parse(m[0]) as AiResult;
      } catch {
        parsed = null;
      }
    }
  }

  if (!parsed || !Array.isArray(parsed.lines)) {
    return new NextResponse('No s\'ha pogut interpretar el JSON retornat per la IA.', { status: 500 });
  }

  return NextResponse.json(parsed);
}
