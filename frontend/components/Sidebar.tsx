
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DashboardIcon, SalonIcon, LogoutIcon } from './icons';
import React from 'react';

export default function Sidebar() {
  const router = useRouter();
  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <DashboardIcon />
    },
    {
      label: 'Kunder',
      href: '/salons',
      icon: <SalonIcon />
    }
  ];

  function handleLogout() {
    // Her kan du tilføje rigtig logout-logik hvis du får auth senere
    router.push('/login');
  }

  return (
    <aside style={{
      width: '100%',
      height: '100%',
      background: 'transparent',
      color: '#222',
      display: 'flex',
      flexDirection: 'column',
      padding: '30px 0 18px 0',
      boxSizing: 'border-box',
    }}>
      <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 40, textAlign: 'center', letterSpacing: 1 }}>
        BookR
      </div>
  <nav style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        {navItems.map((item) => {
          const active = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                color: active ? '#222' : '#555',
                textDecoration: 'none',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontWeight: 500,
                background: active ? '#e5e7eb' : 'transparent',
                borderRadius: 10,
                padding: '10px 18px',
                transition: 'background 0.15s',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.04)' : undefined
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ flex: 1 }} />
      <button
        onClick={handleLogout}
        style={{
          margin: '0 auto 20px auto', // 20px fra bunden og centreret
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: '#222',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          fontSize: 18,
          fontWeight: 500,
          padding: '10px 32px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'background 0.15s',
          width: 'fit-content',
        }}
      >
        <LogoutIcon />
        Log ud
      </button>
    </aside>
  );
}
