
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DashboardIcon, SalonIcon, LogoutIcon } from './icons';
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function Sidebar() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  
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
      background: isDark ? '#1f2937' : 'transparent',
      color: isDark ? '#f3f4f6' : '#222',
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
          border: `2px solid ${isDark ? '#f3f4f6' : '#222'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDark ? '#f3f4f6' : '#222',
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
        background: isDark ? '#374151' : '#e5e7eb', 
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
                background: isDark ? '#374151' : '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <div style={{ 
                  color: active ? (isDark ? '#f3f4f6' : '#222') : (isDark ? '#9ca3af' : '#555'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </div>
              </div>
              {/* Text with active state */}
              <span style={{
                color: active ? (isDark ? '#f3f4f6' : '#222') : (isDark ? '#9ca3af' : '#555'),
                fontSize: 15,
                fontWeight: 500,
                background: active ? (isDark ? '#374151' : '#e5e7eb') : 'transparent',
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
      
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: isDark ? '#374151' : '#f3f4f6',
          color: isDark ? '#f3f4f6' : '#222',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
          padding: '10px 20px',
          cursor: 'pointer',
          transition: 'all 0.15s',
          width: 'calc(100% - 56px)',
          marginBottom: 12
        }}
        title={isDark ? 'Skift til lyst tema' : 'Skift til mørkt tema'}
      >
        {isDark ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            Lyst tema
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            Mørkt tema
          </>
        )}
      </button>
      
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingBottom: 18 }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: isDark ? '#111827' : '#222',
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
