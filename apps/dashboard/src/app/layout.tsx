import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ThreadLine Dashboard',
  description: 'Manage your ThreadLine communities',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
