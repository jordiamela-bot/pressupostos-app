import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="grid">
      <div className="card">
        <div style={{ fontSize: 22, fontWeight: 900 }}>Panell</div>
        <div className="small" style={{ marginTop: 6 }}>
          Gestiona clients, dades d'empresa i pressupostos.
        </div>

        <div style={{ height: 14 }} />

        <div className="grid" style={{ gap: 10 }}>
          <Link className="btn" href="/clients">Clients</Link>
          <Link className="btn" href="/company">Empresa (logo, dades)</Link>
          <Link className="btn primary" href="/quotes">Pressupostos</Link>
        </div>

        <div style={{ height: 18 }} />
        <div className="toast">
          <div style={{ fontWeight: 800 }}>Important</div>
          <div className="small">
            Tot queda desat al navegador (localStorage). Si canvies d'ordinador/navegador, caldrà exportar/importar (ho farem a V1.1).
          </div>
        </div>
      </div>
    </div>
  );
}
