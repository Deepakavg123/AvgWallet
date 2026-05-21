import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trust Wallet Clone',
  description: 'Multi-chain cryptocurrency wallet supporting Ethereum, Polygon, Binance, Base, Solana, and Bitcoin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="mobile-container">
          {children}
        </div>
      </body>
    </html>
  );
}
