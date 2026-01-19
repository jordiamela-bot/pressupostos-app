'use client';

export function LogoPreview({ dataUrl }: { dataUrl?: string }) {
  if (!dataUrl) return null;
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,.08)',
      borderRadius: 16,
      padding: 12,
      background: 'rgba(255,255,255,.02)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="Logo" style={{ height: 44, width: 'auto', borderRadius: 10 }} />
      <div className="small">Logo carregat</div>
    </div>
  );
}
