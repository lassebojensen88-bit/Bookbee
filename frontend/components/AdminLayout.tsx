import React from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '../contexts/ThemeContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isDark } = useTheme();
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: isDark ? '#111827' : '#ffffff' }}>
      <div style={{ 
        width: 220, 
        borderRight: `1px solid ${isDark ? '#374151' : '#eee'}`, 
        position: 'fixed', 
        height: '100vh',
        background: isDark ? '#1f2937' : '#ffffff'
      }}>
        <Sidebar />
      </div>
      <main style={{ 
        marginLeft: 220, 
        flexGrow: 1, 
        background: isDark ? '#111827' : '#fafafa',
        minHeight: '100vh'
      }}>
        {children}
      </main>
    </div>
  );
}
