
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
      alignItems: 'center',
      padding: '25px 0 15px 0',
      boxSizing: 'border-box',
    }}>
      {/* Header with Logo and Title */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 10,
        marginBottom: 25,
        fontWeight: 700, 
        fontSize: 20,
        letterSpacing: 1,
        width: '100%'
      }}>
        {/* Logo Icon */}
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '2px solid #222',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#222',
          fontSize: 14,
          fontWeight: 700
        }}>
          B
        </div>
        bookbee
      </div>
      
      {/* Separator Line */}
      <div style={{ 
        height: 1, 
        background: '#e5e7eb', 
        margin: '0 18px 18px 18px',
        width: 'calc(100% - 36px)'
      }} />
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14, alignItems: 'flex-start', width: '100%', paddingLeft: '28px' }}>
        {navItems.map((item) => {
          const active = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 15px',
                transition: 'all 0.15s'
              }}
            >
              {/* Grey circle behind icon */}
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <div style={{ 
                  color: active ? '#222' : '#555',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </div>
              </div>
              {/* Text with active state */}
              <span style={{
                color: active ? '#222' : '#555',
                fontSize: 15,
                fontWeight: 500,
                background: active ? '#e5e7eb' : 'transparent',
                borderRadius: 6,
                padding: '6px 12px',
                transition: 'all 0.15s',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.04)' : undefined
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div style={{ flex: 1 }} />
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingBottom: 18 }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: '#222',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 500,
            padding: '10px 32px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'background 0.15s',
            width: 'calc(100% - 56px)'
          }}
        >
          <LogoutIcon />
          Log ud
        </button>
      </div>
    </aside>
  );
}
