'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUiLang, setUiLang } from '@/lib/storage';
import { useEffect, useState } from 'react';

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={`navlink ${active ? 'active' : ''}`}
    >
      {label}
    </Link>
  );
}

export default function TopNav() {
  const [lang, setLang] = useState<'ca' | 'es'>('ca');

  useEffect(() => {
    setLang(getUiLang());
  }, []);

  return (
    <div className="nav">
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#fff' }}>
            Pressupostos
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <NavLink href="/" label={lang === 'ca' ? 'Inici' : 'Inicio'} />
            <NavLink href="/clients" label={lang === 'ca' ? 'Clients' : 'Clientes'} />
            <NavLink href="/company" label={lang === 'ca' ? 'Empresa' : 'Empresa'} />
            <NavLink href="/quotes" label={lang === 'ca' ? 'Pressupostos' : 'Presupuestos'} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="small" style={{ color: 'var(--muted)' }}>
            UI
          </span>
          <select
            className="select"
            style={{ width: 110 }}
            value={lang}
            onChange={(e) => {
              const v = (e.target.value as 'ca' | 'es');
              setLang(v);
              setUiLang(v);
              // simple hard refresh to update labels everywhere
              window.location.reload();
            }}
          >
            <option value="ca">Català</option>
            <option value="es">Castellano</option>
          </select>
        </div>
      </div>
    </div>
  );
}
