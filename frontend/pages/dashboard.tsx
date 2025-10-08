
import React, { useEffect, useState } from 'react';
import { DashboardIcon, SalonIcon, ScissorsIcon, ToothIcon, FaceIcon } from '../components/icons';
import { listSalons } from '../utils/api';

// Animation keyframes
const fadeInAnimation = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Add styles to head
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = fadeInAnimation;
  document.head.appendChild(style);
}

function MoneyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" {...props}>
      <rect x="2" y="7" width="20" height="10" rx="3" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function WarningIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" {...props}>
      <path d="M12 9v4" />
      <circle cx="12" cy="17" r="1" />
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    </svg>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    income: 0,
    percentPaid: 0,
    newThisMonth: 0,
    lastCreated: '',
    uniqueOwners: 0
  });
  const [typeStats, setTypeStats] = useState<Array<{ type: string; count: number }>>([]);
  const [loading, setLoading] = useState(false); // Removed loading states for better UX

  useEffect(() => {
    listSalons()
      .then(data => {
        const total = data.length;
        const paid = data.filter((k: any) => k.paid).length;
        const unpaid = total - paid;
        const income = paid * 500;
        const percentPaid = total > 0 ? Math.round((paid / total) * 100) : 0;
        // Nye kunder denne måned
        const now = new Date();
        const newThisMonth = data.filter((k: any) => {
          const d = new Date(k.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        // Seneste kunde
        let lastCreated = '';
        if (data.length > 0) {
          const latest = data.reduce((a: any, b: any) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b);
          const d = new Date(latest.createdAt);
          lastCreated = d.toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
        // Unikke ejere
        const uniqueOwners = new Set(data.map((k: any) => k.owner)).size;
        setStats({ total, paid, unpaid, income, percentPaid, newThisMonth, lastCreated, uniqueOwners });

        // Statistik for kundetyper
        const typeMap: Record<string, number> = {};
        data.forEach((k: any) => {
          const t = (k.type || '').toLowerCase();
          if (!t) return;
          typeMap[t] = (typeMap[t] || 0) + 1;
        });
        const typeArr = Object.entries(typeMap).map(([type, count]) => ({ type, count }));
        setTypeStats(typeArr);
      })
      .catch(error => {
        console.error('Failed to load salons:', error);
        // Even if there's an error, show the dashboard with empty data
        setStats({
          total: 0,
          paid: 0,
          unpaid: 0,
          income: 0,
          percentPaid: 0,
          newThisMonth: 0,
          lastCreated: '',
          uniqueOwners: 0
        });
        setTypeStats([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  // Vælg ikon ud fra kundetype
  function getTypeIcon(type: string) {
    const t = type.toLowerCase();
    if (t.includes('frisør') || t.includes('hair')) return <ScissorsIcon style={{ color: '#6366f1' }} />;
    if (t.includes('tand') || t.includes('dent')) return <ToothIcon style={{ color: '#f59e42' }} />;
    if (t.includes('klinik') || t.includes('skøn')) return <FaceIcon style={{ color: '#e879f9' }} />;
    return <SalonIcon style={{ color: '#a21caf' }} />;
  }

  const cards = [
    {
      label: 'Kunder',
      value: stats.total,
      icon: <SalonIcon style={{ color: '#64748b' }} />,
      bg: '#f1f5f9'
    },
    {
      label: 'Betalte kunder',
      value: stats.paid,
      icon: <DashboardIcon style={{ color: '#4ade80' }} />,
      bg: '#e0f2f1'
    },
    {
      label: 'Manglende betaling',
      value: stats.unpaid,
      icon: <WarningIcon style={{ color: '#fbbf24' }} />,
      bg: '#fef3c7'
    },
    {
      label: 'Total indkomst',
      value: stats.income + ' kr.',
      icon: <MoneyIcon style={{ color: '#f87171' }} />,
      bg: '#fee2e2'
    },
    {
      label: 'Betalingsprocent',
      value: stats.percentPaid + ' %',
      icon: <DashboardIcon style={{ color: '#60a5fa' }} />,
      bg: '#e0e7ff'
    },
    {
      label: 'Nye kunder (måned)',
      value: stats.newThisMonth,
      icon: <SalonIcon style={{ color: '#a78bfa' }} />,
      bg: '#f3e8ff'
    },
    {
      label: 'Seneste kunde',
      value: stats.lastCreated || '-',
      icon: <SalonIcon style={{ color: '#a3a3a3' }} />,
      bg: '#f4f4f5'
    },
    {
      label: 'Unikke ejere',
      value: stats.uniqueOwners,
      icon: <DashboardIcon style={{ color: '#fde68a' }} />,
      bg: '#fefce8'
    }
  ];



  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ 
        fontSize: 32, 
        fontWeight: 700, 
        marginBottom: 32,
        animation: 'fadeIn 0.5s ease-out forwards'
      }}>Dashboard</h1>
      
      {/* Kundetyper sektion */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 24,
        marginBottom: 32
      }}>
        {typeStats.map(t => (
          <div key={t.type} style={{
            background: '#f3f4f8',
            borderRadius: 14,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minHeight: 100,
            opacity: 0,
            animation: `fadeIn 0.5s ease-out ${typeStats.indexOf(t) * 0.1}s forwards`
          }}>
            <div style={{ marginBottom: 10 }}>{getTypeIcon(t.type)}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{t.type.charAt(0).toUpperCase() + t.type.slice(1)}</div>
            <div style={{ fontSize: 15, color: '#555', marginTop: 2 }}>{t.count} kunde(r)</div>
          </div>
        ))}
      </div>

      {/* Statistik kort */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 28,
        marginBottom: 32
      }}>
        {cards.map(card => (
          <div key={card.label} style={{
            background: card.bg,
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minHeight: 120,
            opacity: 0,
            animation: `fadeIn 0.5s ease-out ${(typeStats.length * 0.1) + (cards.indexOf(card) * 0.1)}s forwards`
          }}>
            <div style={{ marginBottom: 16 }}>{card.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{card.value}</div>
            <div style={{ fontSize: 16, color: '#555', marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Betalingsstatus */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 32
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          padding: 32,
          maxWidth: 420,
          minWidth: 320,
          opacity: 0,
          animation: `fadeIn 0.5s ease-out ${(typeStats.length * 0.1) + (cards.length * 0.1)}s forwards`
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 18, textAlign: 'center' }}>Betalingsstatus</h2>
          <div style={{ textAlign: 'center', fontSize: 18, marginTop: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Betalt: {stats.paid}</span>
            </div>
            <div>
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>Ikke betalt: {stats.unpaid}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
