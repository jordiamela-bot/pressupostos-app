'use client';

import { useEffect, useState } from 'react';
import { getClients, saveClients, uid, type Client } from '@/lib/storage';

function emptyClient(): Client {
  return { id: uid('client'), name: '' };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [draft, setDraft] = useState<Client>(emptyClient());

  useEffect(() => {
    setClients(getClients());
  }, []);

  function persist(next: Client[]) {
    setClients(next);
    saveClients(next);
  }

  function add() {
    if (!draft.name.trim()) {
      alert('Introdueix un nom');
      return;
    }
    persist([...clients, { ...draft, name: draft.name.trim() }]);
    setDraft(emptyClient());
  }

  function remove(id: string) {
    if (!confirm('Eliminar client?')) return;
    persist(clients.filter(c => c.id !== id));
  }

  return (
    <div className="grid">
      <div className="card">
        <div style={{ fontSize: 22, fontWeight: 900 }}>Clients</div>
        <div className="small" style={{ marginTop: 6 }}>
          Desa'ls i reutilitza'ls als pressupostos.
        </div>

        <div style={{ height: 14 }} />

        <div className="grid grid2">
          <div>
            <div className="label">Nom</div>
            <input className="input" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div>
            <div className="label">NIF</div>
            <input className="input" value={draft.taxId ?? ''} onChange={e => setDraft({ ...draft, taxId: e.target.value })} />
          </div>
          <div>
            <div className="label">Email</div>
            <input className="input" value={draft.email ?? ''} onChange={e => setDraft({ ...draft, email: e.target.value })} />
          </div>
          <div>
            <div className="label">Telèfon</div>
            <input className="input" value={draft.phone ?? ''} onChange={e => setDraft({ ...draft, phone: e.target.value })} />
          </div>
          <div className="grid" style={{ gridColumn: '1 / -1' }}>
            <div className="label">Adreça</div>
            <input className="input" value={draft.address ?? ''} onChange={e => setDraft({ ...draft, address: e.target.value })} />
          </div>
        </div>

        <div style={{ height: 10 }} />
        <button className="btn primary" onClick={add}>Afegir client</button>

        <div style={{ height: 18 }} />

        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>NIF</th>
              <th>Email</th>
              <th>Tel.</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.taxId ?? ''}</td>
                <td>{c.email ?? ''}</td>
                <td>{c.phone ?? ''}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn danger" onClick={() => remove(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!clients.length && (
              <tr><td colSpan={5} className="small">Encara no hi ha clients.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
