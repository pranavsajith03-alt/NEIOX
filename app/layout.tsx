
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import RootLayoutClient from './RootLayoutClient';

/* ── Font loading via next/font ───────────────────────────────────────────
   next/font self-hosts fonts — no external network request at runtime.
   Cal Sans isn't on Google Fonts so we load it via a <link> tag below.
─────────────────────────────────────────────────────────────────────────*/
const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
});

export const metadata: Metadata = {
  title: {
    default:  'NEIOX — Sustainability Research Portal',
    template: '%s | NEIOX',
  },
  description:
    'A deep greenery sustainability portal connecting founders, researchers, ' +
    'staff and interns around shared environmental missions.',
  keywords: ['sustainability', 'research', 'greenery', 'environmental', 'portal'],
  authors:  [{ name: 'NEIOX' }],
  openGraph: {
    type:        'website',
    title:       'NEIOX — Sustainability Research Portal',
    description: 'One platform for your entire sustainability team.',
    siteName:    'NEIOX',
  },
  icons: {
    icon:  '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Cal Sans — display font for headings, not on Google Fonts */}
        <link
          rel="preconnect"
          href="https://fonts.cdnfonts.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.cdnfonts.com/css/cal-sans"
          rel="stylesheet"
        />
        {/* JetBrains Mono — monospace for terminal/code elements */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-forest-950 font-sans antialiased">
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}