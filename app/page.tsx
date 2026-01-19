import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="grid">
      <div className="card">
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.2 }}>Panell</div>
        <div className="small" style={{ marginTop: 6, maxWidth: 740 }}>
          Gestiona clients, dades d'empresa i pressupostos. Les dades queden desades a la <b>BBDD de Vercel (Postgres)</b>
          i també al navegador (cache), perquè les puguis recuperar des de qualsevol ordinador.
        </div>

        <div style={{ height: 14 }} />

        <div className="grid" style={{ gap: 10 }}>
          <Link className="btn" href="/clients">Clients</Link>
          <Link className="btn" href="/company">Empresa (logo, dades)</Link>
          <Link className="btn primary" href="/quotes">Pressupostos</Link>
        </div>

        <div style={{ height: 18 }} />
        <div className="toast">
          <div style={{ fontWeight: 800 }}>Consell</div>
          <div className="small">
            Si en algun moment veus que "no es desa", gairebé sempre és perquè falta configurar la BBDD a Vercel.
            A Vercel: <b>Project → Storage → Postgres</b> i assegura't que tens les variables d'entorn.
          </div>
        </div>
      </div>
    </div>
  );
}
