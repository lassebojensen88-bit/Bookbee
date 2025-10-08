import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect til dashboard som standard
    router.replace('/dashboard');
  }, [router]);

  return (
    <div style={{ 
      padding: 40, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh',
      flexDirection: 'column',
      gap: 20
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #222',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ color: '#666', fontSize: 16 }}>Omdirigerer til dashboard...</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
