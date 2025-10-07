import Link from 'next/link';
import React from 'react';

export default function NavBar() {
  return (
    <nav style={{ background: '#222', color: '#fff', padding: '10px 30px', marginBottom: 30 }}>
      <Link href="/" style={{ color: '#fff', marginRight: 20, textDecoration: 'none' }}>Home</Link>
      <Link href="/dashboard" style={{ color: '#fff', marginRight: 20, textDecoration: 'none' }}>Dashboard</Link>
      <Link href="/salons" style={{ color: '#fff', marginRight: 20, textDecoration: 'none' }}>Salons</Link>
      <Link href="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
    </nav>
  );
}
