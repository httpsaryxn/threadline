import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ThreadLine – Embeddable Community Chat',
  description:
    'Drop a Discord-style community chat into any website in 5 minutes. Real-time messaging, channels, reactions, and DMs — no backend required.',
  openGraph: {
    title: 'ThreadLine – Embeddable Community Chat',
    description: 'Community chat for your product in 5 minutes.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
