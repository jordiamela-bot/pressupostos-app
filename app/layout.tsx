import './globals.css';
import TopNav from '@/components/TopNav';

export const metadata = {
  title: 'Pressupostos',
  description: 'App de pressupostos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca">
      <body>
        <TopNav />
        <div className="wrap" style={{ padding: '18px 0 60px' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
