import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VIDDL — Universal Video Downloader',
  description: 'Fast, legal, temporary public video URL downloader and media analyzer.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}>
        <Navbar />
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500 glass-panel">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>© {new Date().getFullYear()} VIDDL. All rights reserved.</span>
            <span>Fast • Simple • Temporary • Secure</span>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
