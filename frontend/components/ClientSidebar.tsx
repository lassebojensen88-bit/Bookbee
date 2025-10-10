import Link from 'next/link';
import { useRouter } from 'next/router';
import { DashboardIcon, SalonIcon, LogoutIcon, UserIcon } from './icons';
import { useProfile } from '../contexts/ProfileContext';
import { useTheme } from '../contexts/ThemeContext';
import React from 'react';

interface ClientSidebarProps {
  salonId?: string;
}

export default function ClientSidebar({ salonId }: ClientSidebarProps) {
  const router = useRouter();
  const { profile } = useProfile();
  const { isDark, toggleTheme } = useTheme();
  
  // Generate salon-specific or legacy routes
  const getRoute = (path: string) => {
    if (salonId) {
      return `/client/${salonId}/${path}`;
    }
    return `/client/${path}`;
  };
  
  const profileItem = {
    label: 'Min Profil',
    href: getRoute('profile'),
    icon: <UserIcon />,
    isProfile: true
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: getRoute('dashboard'),
      icon: <DashboardIcon />
    },
    {
      label: 'Bookings',
      href: getRoute('bookings'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      )
    },
    {
      label: 'Kunder',
      href: getRoute('clients'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    },
    {
      label: 'Services',
      href: getRoute('services'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      )
    }
  ];

  function handleLogout() {
    // Redirect to salon-specific login if salonId exists
    const loginRoute = salonId ? `/client/${salonId}/login` : '/client/login';
    router.push(loginRoute);
  }

  // Profile Avatar Component
  const ProfileAvatar = ({ name, imageUrl }: { name: string; imageUrl?: string }) => {
    // Use profile image from context if available
    const displayImage = profile?.profileImage || imageUrl;
    
    if (displayImage) {
      return (
        <div style={{
          width: 28, // Reduced from 32px to match logo
          height: 28,
          borderRadius: '50%',
          backgroundImage: `url(${displayImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
      );
    }
    
    const initial = name.charAt(0).toUpperCase();
    return (
      <div style={{
        width: 28, // Reduced from 32px
        height: 28,
        borderRadius: '50%',
        backgroundColor: '#111827',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: 12, // Reduced from 14px
        fontWeight: 700
      }}>
        {initial}
      </div>
    );
  };

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
      
      {/* Profile Section */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18, width: '100%' }}>
        <Link
          href={profileItem.href}
          style={{
            color: router.asPath === profileItem.href ? '#6366f1' : (isDark ? '#f3f4f6' : '#222'),
            textDecoration: 'none',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontWeight: 600,
            background: 'transparent',
            borderRadius: 10,
            padding: '10px',
            transition: 'all 0.2s'
          }}
        >
          <ProfileAvatar name={profile.salonName} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{profileItem.label}</div>
            <div style={{ fontSize: 10, color: isDark ? '#9ca3af' : '#6b7280', fontWeight: 400 }}>
              {profile.salonName}
            </div>
          </div>
        </Link>
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
          const exactMatch = router.asPath === item.href;
          const patternMatch = salonId && router.pathname.includes(item.href.split('/').pop() || '');
          const active = exactMatch || patternMatch;
          
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