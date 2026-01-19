import Link from 'next/link';

export default function Nav() {
  return (
    <div className="nav">
      <div className="brand">
        <span className="dot" />
        <span>Pressupostos</span>
      </div>
      <div className="menu">
        <Link className="pill" href="/">Inici</Link>
        <Link className="pill" href="/clients">Clients</Link>
        <Link className="pill" href="/company">Empresa</Link>
        <Link className="pill" href="/quotes">Pressupostos</Link>
      </div>
    </div>
  );
}
