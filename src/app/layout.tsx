import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PL Platform — Investor Pitch',
  description:
    'Interactive presentation of our Professional Learning platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
