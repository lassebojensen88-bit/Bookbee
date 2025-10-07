import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface ClientLoginProps {
  salonId?: string;
}

export default function ClientLogin({ salonId }: ClientLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Set loading overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    overlay.style.backdropFilter = 'blur(8px)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.transition = 'opacity 0.3s ease-out';

    // Create loading spinner
    const spinner = document.createElement('div');
    spinner.style.width = '40px';
    spinner.style.height = '40px';
    spinner.style.border = '3px solid #f3f3f3';
    spinner.style.borderTop = '3px solid #222';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';
    
    // Add keyframe animation for spinner
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);

    // Navigate after 1 second
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(overlay);
        // Redirect to salon-specific dashboard if salonId provided, otherwise general dashboard
        const dashboardUrl = salonId ? `/client/${salonId}/dashboard` : '/client/dashboard';
        router.push(dashboardUrl);
      }, 300);
    }, 1000);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderRadius: 18,
          border: '1.5px solid rgba(255,255,255,0.35)',
          minWidth: 320,
          padding: 36,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <h1 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 10 }}>Portal Login</h1>
        <div style={{ width: 220, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 2, width: 220, textAlign: 'left', display: 'block' }}>Mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: 220, marginBottom: 12, padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, display: 'block', boxSizing: 'border-box' }} />
          <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 2, width: 220, textAlign: 'left', display: 'block' }}>Kode</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: 220, marginBottom: 0, padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, display: 'block', boxSizing: 'border-box' }} />
          <button type="submit" style={{ marginTop: 16, background: '#222', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 0', fontWeight: 600, fontSize: 17, cursor: 'pointer', width: 220, display: 'block' }}>Log ind</button>
        </div>
        {/* Removed admin login link for security: no way back to admin from client portal */}
      </form>
    </div>
  );
}