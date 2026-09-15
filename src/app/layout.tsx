import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { SITE_NAME } from '@/config/site';

import './globals.css';

export const metadata: Metadata = {
  title: SITE_NAME,
};

export const viewport: Viewport = {
  width: 'device-width',
};

/**
 * html/body classes come from the design templates (identical across all of them). The template scripts
 * (Modernizr, AOS, what-input) add attributes to <html>/<body> before React hydrates, hence suppressHydrationWarning.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-gb" className="pl" suppressHydrationWarning>
      <body className="body u-overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
