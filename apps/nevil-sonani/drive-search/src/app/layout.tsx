import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Topbar } from '@/components/Topbar';
import { appStatus } from '@/lib/queries';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Folders on WhipScribe',
  description: 'Google Drive folders in, searchable transcripts out.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ffffff' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const status = appStatus();
  return (
    <html lang="en">
      <body>
        <Suspense>
          <Topbar initial={status} />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
