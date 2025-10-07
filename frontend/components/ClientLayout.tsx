import React from 'react';
import ClientSidebar from './ClientSidebar';

interface ClientLayoutProps {
  children: React.ReactNode;
  salonId?: string;
}

export default function ClientLayout({ children, salonId }: ClientLayoutProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: 240, borderRight: '1px solid #eee', position: 'fixed', height: '100vh' }}>
        <ClientSidebar salonId={salonId} />
      </div>
      <main style={{ marginLeft: 240, flexGrow: 1, background: '#fafafa' }}>
        {children}
      </main>
    </div>
  );
}