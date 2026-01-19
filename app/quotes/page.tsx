'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getClients, getQuotes, loadClientsFromDb, loadQuotesFromDb, saveQuotesToDb, type Quote } from '@/lib/storage';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clientsMap, setClientsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const applyClients = (cs: any[]) => {
      const map: Record<string, string> = {};
      cs.forEach(c => { map[c.id] = c.name; });
      setClientsMap(map);
    };

    // cache first
    applyClients(getClients());
    setQuotes(getQuotes().sort((a,b)=> (b.createdAtIso||'').localeCompare(a.createdAtIso||'')));

    // then refresh from DB
    loadClientsFromDb().then(applyClients).catch(console.warn);
    loadQuotesFromDb().then(qs => setQuotes(qs.sort((a,b)=> (b.createdAtIso||'').localeCompare(a.createdAtIso||'')))).catch(console.warn);
  }, []);

  const hasClients = useMemo(() => Object.keys(clientsMap).length > 0, [clientsMap]);

  async function del(id: string) {
    if (!confirm('Eliminar?')) return;
    const next = quotes.filter(q => q.id !== id);
    setQuotes(next);
    try {
      await saveQuotesToDb(next);
    } catch (e) {
      console.warn(e);
      alert('No s\'ha pogut eliminar a la BBDD.');
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>Pressupostos</div>
            <div className="small">Crea, edita i exporta (PDF properament).</div>
          </div>
          <Link className="btn primary" href={hasClients ? '/quotes/new' : '/clients'}>
            + Nou pressupost
          </Link>
        </div>

        {!hasClients && (
          <div style={{ height: 12 }}>
            <div className="toast">
              <div style={{ fontWeight: 800 }}>Primer crea un client</div>
              <div className="small">Per generar un pressupost necessitem dades del client.</div>
            </div>
          </div>
        )}

        <div style={{ height: 14 }} />

        {quotes.length === 0 ? (
          <div className="small">Encara no tens pressupostos.</div>
        ) : (
          <div className="tablewrap">
            <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Títol</th>
                <th>Client</th>
                <th style={{ width: 180 }}></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id}>
                  <td className="small">{(q.createdAtIso || '').slice(0,10)}</td>
                  <td>{q.title || 'Pressupost'}</td>
                  <td className="small">{clientsMap[q.clientId] || '—'}</td>
                  <td style={{ textAlign:'right', whiteSpace:'nowrap' }}>
                    <Link className="btn" href={`/quotes/new?load=${encodeURIComponent(q.id)}`}>Editar</Link>
                    <button className="btn danger" onClick={() => del(q.id)} style={{ marginLeft: 8 }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
