'use client';

import Link from 'next/link';

export default function Nav({ children }) {
  return (
    <div>
      <nav className="navbar no-print">
        <div className="nav-links">
          <Link href="/">Panou</Link>
          <Link href="/vehicles">Mașini</Link>
          <Link href="/drivers">Șoferi</Link>
          <Link href="/trips">Foi de parcurs</Link>
          <Link href="/fuel">Alimentări</Link>
          <Link href="/consumption">Consum</Link>
          <Link href="/print">Tipărire ANAF</Link>
          <Link href="/settings">Setări</Link>
        </div>
      </nav>
      <main className="container">{children}</main>
    </div>
  );
}
