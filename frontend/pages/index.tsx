import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSalonBySlug, Salon } from '../utils/api';
import { getSubdomain } from '../utils/subdomain';

interface HomeProps {
  subdomain: string | null;
  salon: Salon | null;
  error?: string;
}

export default function Home({ subdomain, salon, error }: HomeProps) {
  const router = useRouter();

  useEffect(() => {
    // If no subdomain, redirect to dashboard
    if (!subdomain) {
      router.replace('/dashboard');
    }
  }, [subdomain, router]);

  // Show public booking page for subdomain
  if (subdomain && salon) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '10px'
          }}>
            {salon.name}
          </h1>
          <p style={{
            color: '#666',
            fontSize: '16px',
            marginBottom: '30px'
          }}>
            📍 {salon.address}
          </p>

          <div style={{
            background: '#f9fafb',
            borderRadius: '8px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '24px',
              color: '#333',
              marginBottom: '20px'
            }}>
              Book en tid
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '20px'
            }}>
              Velkommen til vores bookingsystem!
            </p>
            <button
              onClick={() => router.push(`/p/${salon.id}`)}
              style={{
                background: '#667eea',
                color: 'white',
                padding: '15px 40px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#5568d3'}
              onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
            >
              Se ledige tider →
            </button>
          </div>

          <div style={{
            marginTop: '40px',
            padding: '20px',
            background: '#fff7ed',
            borderRadius: '8px',
            borderLeft: '4px solid #f59e0b'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#92400e',
              margin: 0
            }}>
              💡 <strong>Tip:</strong> Du kan også logge ind som salonens administrator på <a href="/client/login" style={{ color: '#f59e0b', textDecoration: 'underline' }}>admin portalen</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state for subdomain
  if (subdomain && error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f9fafb'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ fontSize: '24px', color: '#dc2626', marginBottom: '20px' }}>
            ❌ Salon ikke fundet
          </h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Vi kunne ikke finde en salon med adressen <strong>{subdomain}.bookbee.dk</strong>
          </p>
          <p style={{ color: '#999', fontSize: '14px' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Loading state (redirect happening)
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

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({ query }) => {
  const subdomain = getSubdomain(query);

  // No subdomain = main site, let client-side redirect to dashboard
  if (!subdomain) {
    return {
      props: {
        subdomain: null,
        salon: null,
      },
    };
  }

  // Subdomain detected - fetch salon data
  try {
    const salon = await getSalonBySlug(subdomain);
    return {
      props: {
        subdomain,
        salon,
      },
    };
  } catch (error: any) {
    return {
      props: {
        subdomain,
        salon: null,
        error: error.message || 'Kunne ikke hente salon data',
      },
    };
  }
};
