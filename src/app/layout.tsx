import { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'P2P Trading OS',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" class="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased touch-manipulation pb-20">
        {children}
      </body>
    </html>
  );
}