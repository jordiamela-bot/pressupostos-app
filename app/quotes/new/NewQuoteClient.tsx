'use client';

import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import {
  getClients,
  getQuotes,
  saveQuotes,
  uid,
  type Quote,
  type QuoteLine,
  type QuoteLineType,
  getUiLang
} from '@/lib/storage';
import { t } from '@/lib/i18n';
import { lineTotals, totals } from '@/lib/calc';
import { useRouter } from 'next/navigation';

const DEFAULT_VAT = 21;

function emptyLine(): QuoteLine {
  return {
    id: uid('line'),
    type: 'product',
    concept: '',
    qty: 1,
    unitCostGross: 0,
    discountPercent: 0,
    marginPercent: 0,
    category: 'Material'
  };
}

function parseNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  const s = String(v).trim().replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

export default function NewQuoteClient({ loadId }: { loadId?: string }) {
  const router = useRouter();

  const [lang, setLang] = useState(getUiLang());
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  const [quote, setQuote] = useState<Quote>(() => ({
    id: uid('quote'),
    createdAtIso: new Date().toISOString(),
    clientId: '',
    language: 'ca',
    title: 'Pressupost',
    validityDays: 15,
    vatPercent: DEFAULT_VAT,
    lines: [emptyLine()]
  }));

  useEffect(() => {
    setLang(getUiLang());
    const cs = getClients();
    setClients(cs.map((c) => ({ id: c.id, name: c.name })));

    if (loadId) {
      const existing = getQuotes().find((q) => q.id === loadId);
      if (existing) setQuote(existing);
    }
  }, [loadId]);

  const quoteTotals = useMemo(
    () => totals(quote.lines, quote.vatPercent ?? DEFAULT_VAT),
    [quote.lines, quote.vatPercent]
  );

  function updateLine(id: string, patch: Partial<QuoteLine>) {
    setQuote((q) => ({
      ...q,
      lines: q.lines.map((l) => (l.id === id ? { ...l, ...patch } : l))
    }));
  }

  function addLine() {
    setQuote((q) => ({ ...q, lines: [...q.lines, emptyLine()] }));
  }

  function removeLine(id: string) {
    setQuote((q) => ({
      ...q,
      lines: q.lines.length > 1 ? q.lines.filter((l) => l.id !== id) : q.lines
    }));
  }

  function applyMarginToCategory(category: string, marginPercent: number) {
    setQuote((q) => ({
      ...q,
      lines: q.lines.map((l) => (l.category === category ? { ...l, marginPercent } : l))
    }));
  }

  function save() {
    if (!quote.clientId) {
      alert(lang === 'ca' ? 'Selecciona un client' : 'Selecciona un cliente');
      return;
    }
    const all = getQuotes();
    const exists = all.find((q) => q.id === quote.id);
    const next = exists ? all.map((q) => (q.id === quote.id ? quote : q)) : [...all, quote];
    saveQuotes(next);
    alert(lang === 'ca' ? 'Desat' : 'Guardado');
    router.push('/quotes');
  }

  async function onImportCsv(file: File) {
    const text = await file.text();
    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true
    });

    const rows = parsed.data || [];

    const newLines: QuoteLine[] = rows
      .map((r, idx) => {
        const rr = r as Record<string, unknown>;
        const concept = String(
          rr.concept ??
            rr.Concepto ??
            rr.Concepte ??
            rr.descripcio ??
            rr.descripcion ??
            `Línia ${idx + 1}`
        ).trim();

        const qty = parseNumber(rr.qty ?? rr.Qty ?? rr.quantitat ?? rr.cantidad ?? rr.unitats ?? rr.uts ?? 1);
        const unitCostGross = parseNumber(
          rr.unitCost ?? rr.cost ?? rr.precio ?? rr.preu ?? rr['€/Ut.'] ?? rr['€/ud'] ?? 0
        );
        const discountPercent = parseNumber(rr.discount ?? rr.desc ?? rr['Desc.'] ?? 0);
        const marginPercent = parseNumber(rr.margin ?? 0);
        const category = String(rr.category ?? rr.categoria ?? 'Material');

        const typeRaw = String(rr.type ?? 'product').toLowerCase();
        const type: QuoteLineType = (['product', 'service', 'transport', 'info'].includes(typeRaw)
          ? typeRaw
          : 'product') as QuoteLineType;

        return {
          id: uid('line'),
          type,
          concept,
          qty: qty || 0,
          unitCostGross,
          discountPercent,
          marginPercent,
          category
        };
      })
      .filter((l) => l.concept.length > 0);

    if (!newLines.length) {
      alert(
        lang === 'ca'
          ? "No s'han trobat línies al CSV. Recomanat: columnes concept, qty, unitCost, discount."
          : 'No se han encontrado líneas en el CSV. Recomendado: concept, qty, unitCost, discount.'
      );
      return;
    }

    setQuote((q) => ({ ...q, lines: newLines }));
  }

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    quote.lines.forEach((l) => set.add(l.category || 'Material'));
    return Array.from(set);
  }, [quote.lines]);

  return (
    <div className="grid">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{t(lang, 'newQuote')}</div>
            <div className="small">{t(lang, 'importHint')}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn primary" onClick={save}>
              {t(lang, 'save')}
            </button>
          </div>
        </div>

        <div style={{ height: 12 }} />

        <div className="grid grid2">
          <div>
            <div className="label">{t(lang, 'client')}</div>
            <select className="select" value={quote.clientId} onChange={(e) => setQuote({ ...quote, clientId: e.target.value })}>
              <option value="">—</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="label">{t(lang, 'languageDocument')}</div>
            <select className="select" value={quote.language} onChange={(e) => setQuote({ ...quote, language: e.target.value as any })}>
              <option value="ca">Català</option>
              <option value="es">Castellà</option>
            </select>
          </div>

          <div>
            <div className="label">{t(lang, 'title')}</div>
            <input className="input" value={quote.title ?? ''} onChange={(e) => setQuote({ ...quote, title: e.target.value })} />
          </div>

          <div className="grid grid2">
            <div>
              <div className="label">{t(lang, 'validity')}</div>
              <input
                className="input"
                type="number"
                value={quote.validityDays ?? 15}
                onChange={(e) => setQuote({ ...quote, validityDays: parseNumber(e.target.value) })}
              />
            </div>
            <div>
              <div className="label">{t(lang, 'vatPercent')}</div>
              <input
                className="input"
                type="number"
                value={quote.vatPercent ?? DEFAULT_VAT}
                onChange={(e) => setQuote({ ...quote, vatPercent: parseNumber(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div style={{ height: 12 }} />

        <div className="toast">
          <div style={{ fontWeight: 800 }}>{t(lang, 'importFile')}</div>
          <div className="small">
            CSV (header) recomanat: <code>concept,qty,unitCost,discount,category,type,margin</code>
          </div>
          <div style={{ height: 10 }} />
          <input
            className="input"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onImportCsv(f);
            }}
          />
        </div>

        <div style={{ height: 12 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{t(lang, 'lines')}</div>
          <button className="btn" onClick={addLine}>
            + {lang === 'ca' ? 'Afegir línia' : 'Añadir línea'}
          </button>
        </div>

        <div style={{ height: 10 }} />

        <table className="table">
          <thead>
            <tr>
              <th>{t(lang, 'type')}</th>
              <th>{t(lang, 'concept')}</th>
              <th>{t(lang, 'category')}</th>
              <th>{t(lang, 'qty')}</th>
              <th>{t(lang, 'unitCost')}</th>
              <th>{t(lang, 'discount')}</th>
              <th>{t(lang, 'margin')}</th>
              <th>{t(lang, 'sellUnit')}</th>
              <th>{t(lang, 'totalSell')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((l) => {
              const tot = lineTotals(l);
              return (
                <tr key={l.id}>
                  <td>
                    <select className="select" value={l.type} onChange={(e) => updateLine(l.id, { type: e.target.value as QuoteLineType })}>
                      <option value="product">producte</option>
                      <option value="service">servei</option>
                      <option value="transport">transport</option>
                      <option value="info">info</option>
                    </select>
                  </td>
                  <td>
                    <input className="input" value={l.concept} onChange={(e) => updateLine(l.id, { concept: e.target.value })} />
                  </td>
                  <td>
                    <input className="input" value={l.category} onChange={(e) => updateLine(l.id, { category: e.target.value })} />
                  </td>
                  <td>
                    <input className="input" type="number" value={l.qty} onChange={(e) => updateLine(l.id, { qty: parseNumber(e.target.value) })} />
                  </td>
                  <td>
                    <input
                      className="input"
                      type="number"
                      value={l.unitCostGross}
                      onChange={(e) => updateLine(l.id, { unitCostGross: parseNumber(e.target.value) })}
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      type="number"
                      value={l.discountPercent}
                      onChange={(e) => updateLine(l.id, { discountPercent: parseNumber(e.target.value) })}
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      type="number"
                      value={l.marginPercent}
                      onChange={(e) => updateLine(l.id, { marginPercent: parseNumber(e.target.value) })}
                    />
                  </td>
                  <td>{tot.sellUnit.toFixed(2)} €</td>
                  <td>{tot.sellTotal.toFixed(2)} €</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn danger" onClick={() => removeLine(l.id)}>
                      {t(lang, 'delete')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ height: 12 }} />

        <div className="grid grid2">
          <div className="card">
            <div style={{ fontWeight: 800, marginBottom: 8 }}>{lang === 'ca' ? 'Marges per categoria' : 'Márgenes por categoría'}</div>
            <div className="small">
              {lang === 'ca'
                ? "Posa un marge i aplica'l a totes les línies de la categoria."
                : 'Pon un margen y aplícalo a todas las líneas de la categoría.'}
            </div>
            <div style={{ height: 10 }} />
            <div className="grid" style={{ gap: 10 }}>
              {uniqueCategories.map((cat) => (
                <CategoryMarginRow key={cat} category={cat} onApply={applyMarginToCategory} />
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Totals</div>
            <div className="small">
              {lang === 'ca'
                ? 'Calculat sobre venda (les línies tipus info no sumen).'
                : 'Calculado sobre venta (las líneas tipo info no suman).'}
            </div>
            <div style={{ height: 10 }} />
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{t(lang, 'base')}</span>
                <span>{quoteTotals.base.toFixed(2)} €</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  {t(lang, 'vat')} ({quote.vatPercent ?? DEFAULT_VAT}%)
                </span>
                <span>{quoteTotals.vat.toFixed(2)} €</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900 }}>
                <span>{t(lang, 'total')}</span>
                <span>{quoteTotals.total.toFixed(2)} €</span>
              </div>
              <div style={{ height: 8 }} />
              <button className="btn" onClick={() => alert(t(lang, 'comingSoon'))}>
                {t(lang, 'exportPdf')} · {t(lang, 'comingSoon')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryMarginRow({
  category,
  onApply
}: {
  category: string;
  onApply: (category: string, marginPercent: number) => void;
}) {
  const [value, setValue] = useState<number>(0);
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <div style={{ flex: 1, fontWeight: 700 }}>{category}</div>
      <input
        className="input"
        style={{ width: 110 }}
        type="number"
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
      />
      <button className="btn" onClick={() => onApply(category, value)}>
        Aplicar
      </button>
    </div>
  );
}
