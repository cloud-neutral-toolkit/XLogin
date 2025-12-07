import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-gray-100">
        <header className="border-b border-gray-800 bg-slate-950/70 backdrop-blur sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-indigo-300">XLogin</p>
              <h1 className="text-lg font-semibold">Multi-cloud OIDC access portal</h1>
            </div>
            <nav className="flex gap-4 text-sm">
              <Link className="text-gray-300 hover:text-white" href="/">
                Dashboard
              </Link>
              <Link className="text-gray-300 hover:text-white" href="/providers">
                Providers
              </Link>
              <Link className="text-gray-300 hover:text-white" href="/callback">
                Callback
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">{children}</main>
      </body>
    </html>
  );
}
