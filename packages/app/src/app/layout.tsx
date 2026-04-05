import { GeneralProvider } from '@/infrastructure/presentation/providers/GeneralProvider';
import { AppLayout } from '@/infrastructure/presentation/components/layout/AppLayout';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DM Manager',
  description: 'Manage your RPG campaigns',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950`}
      >
        <GeneralProvider>
          <AppLayout>{children}</AppLayout>
        </GeneralProvider>
      </body>
    </html>
  );
}
