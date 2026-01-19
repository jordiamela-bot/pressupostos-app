'use client';

import { useEffect, useState } from 'react';
import { getCompany, saveCompany, type Company } from '@/lib/storage';

export default function CompanyPage() {
  const [company, setCompany] = useState<Company>({ name: '' });

  useEffect(() => {
    setCompany(getCompany());
  }, []);

  function onSave() {
    saveCompany(company);
    alert('Desat');
  }

  async function onLogo(file: File) {
    const dataUrl = await readFileAsDataUrl(file);
    setCompany((c) => ({ ...c, logoDataUrl: dataUrl }));
  }

  return (
    <div className="grid">
      <div className="card">
        <div style={{ fontSize: 20, fontWeight: 900 }}>Dades d'empresa</div>
        <div className="small" style={{ marginTop: 6 }}>
          Aquestes dades s'utilitzaran al PDF del pressupost.
        </div>

        <div style={{ height: 14 }} />

        <div className="grid grid2">
          <Field label="Nom" value={company.name} onChange={(v) => setCompany({ ...company, name: v })} />
          <Field label="NIF" value={company.taxId ?? ''} onChange={(v) => setCompany({ ...company, taxId: v })} />
          <Field label="Email" value={company.email ?? ''} onChange={(v) => setCompany({ ...company, email: v })} />
          <Field label="Tel" value={company.phone ?? ''} onChange={(v) => setCompany({ ...company, phone: v })} />
          <Field label="Adreça" value={company.address ?? ''} onChange={(v) => setCompany({ ...company, address: v })} />
        </div>

        <div style={{ height: 14 }} />

        <div className="card" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Logo</div>
          <input className="input" type="file" accept="image/*" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onLogo(f);
          }} />
          <div style={{ height: 10 }} />
          {company.logoDataUrl ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={company.logoDataUrl} alt="logo" style={{ height: 56, width: 'auto', borderRadius: 10, border: '1px solid var(--border)', background: '#fff', padding: 8 }} />
              <button className="btn danger" onClick={() => setCompany((c) => ({ ...c, logoDataUrl: undefined }))}>Eliminar logo</button>
            </div>
          ) : (
            <div className="small" style={{ color: 'var(--muted)' }}>Cap logo desat.</div>
          )}
        </div>

        <div style={{ height: 14 }} />

        <button className="btn primary" onClick={onSave}>Desar</button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="label">{label}</div>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error('Error llegint fitxer'));
    r.onload = () => resolve(String(r.result || ''));
    r.readAsDataURL(file);
  });
}
