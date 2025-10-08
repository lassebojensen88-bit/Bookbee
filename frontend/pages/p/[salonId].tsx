import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface PublicConfigPayload {
  id: number;
  name: string;
  address: string;
  type: string;
  publicConfig: any | null;
  services: { id: number; name: string; durationMin: number; price: string; active?: boolean }[];
}

function defaultConfig(): any {
  return {
    title: 'Velkommen til vores online booking',
    subtitle: 'Professionel behandling – nemt at booke',
    introText: 'Her kan du trygt booke din næste tid. Vi glæder os til at tage imod dig og give dig en god oplevelse.',
    highlightPoints: ['Erfarne behandlere','Nem online booking','Kvalitet & tryghed'],
    termsTitle: 'Generelle vilkår',
    termsBody: 'Afbud skal ske senest 4 timer før din aftale. Udeblivelser eller for sent afbud kan medføre gebyr svarende til 50% af behandlingens pris.',
    cancellationTitle: 'Afbuds- og ændringspolitik',
    cancellationBody: 'Du kan nemt aflyse eller ændre din tid via bekræftelsesmail eller ved at kontakte os. Senere end 4 timer før – kontakt os direkte.',
    footerNote: 'Tak fordi du vælger os – vi glæder os til at se dig! ✂️',
    primaryColor: '#111827',
    accentColor: '#6366f1',
    ctaEnabled: true,
    ctaText: 'Book tid',
    ctaLink: '#',
    updatedAt: new Date().toISOString()
  };
}

export default function PublicSalonLanding() {
  const router = useRouter();
  const { salonId } = router.query;
  const [config, setConfig] = useState<any>(defaultConfig());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isClient = typeof window !== 'undefined';

  useEffect(() => {
    if (!salonId) return;
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://bookbee-backend-excw.onrender.com'}/public/salons/${salonId}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Kunne ikke hente offentlig side');
        const data: PublicConfigPayload = await res.json();
        const cfg = { ...defaultConfig(), ...(data.publicConfig || {}) };
        setConfig(cfg);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [salonId]);

  const primary = config.primaryColor || '#111827';
  const accent = config.accentColor || '#6366f1';
  const hasCover = !!config.coverImageUrl;

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: 'system-ui, sans-serif' }}>Indlæser...</div>;
  }
  if (error) {
    return <div style={{ maxWidth: 600, margin: '100px auto', fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 18px -4px rgba(0,0,0,0.08)' }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Siden kunne ikke indlæses</h1>
      <div style={{ color: '#555', marginBottom: 20 }}>{error}</div>
      <button onClick={() => router.reload()} style={{ background: '#111827', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 8, cursor: 'pointer' }}>Prøv igen</button>
    </div>;
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f1f3f7', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Hero / cover section */}
      <div style={{
        background: hasCover ? `url(${config.coverImageUrl}) center/cover` : `linear-gradient(135deg, ${primary}, ${accent})`,
        padding: hasCover ? '70px 30px 80px' : '80px 30px 90px',
        color: hasCover ? '#111' : '#fff',
        position: 'relative'
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          {config.logoUrl && (
            <div style={{ marginBottom: 28 }}>
              <img src={config.logoUrl} alt="Logo" style={{ maxHeight: 110, maxWidth: 280, objectFit: 'contain', filter: hasCover ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : 'brightness(1.05)' }} />
            </div>
          )}
          <h1 style={{ fontSize: 50, margin: '0 0 14px', letterSpacing: -1, lineHeight: 1.05 }}>{config.title}</h1>
          <p style={{ fontSize: 22, margin: '0 0 28px', opacity: 0.9 }}>{config.subtitle}</p>
          {config.ctaEnabled && (
            <a
              href={config.ctaLink || '#'}
              style={{
                display: 'inline-block',
                background: '#fff',
                color: primary,
                padding: '14px 34px',
                borderRadius: 999,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 6px 20px -4px rgba(0,0,0,0.25)',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 24px -6px rgba(0,0,0,0.35)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 20px -4px rgba(0,0,0,0.25)'; }}
            >
              {config.ctaText || 'Book tid'}
            </a>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '50px 24px 0' }}>
        <section style={{ background: '#fff', borderRadius: 28, padding: '46px 56px', boxShadow: '0 10px 40px -8px rgba(0,0,0,0.1)', marginBottom: 48 }}>
          <p style={{ fontSize: 19, lineHeight: 1.55, margin: 0 }}>{config.introText}</p>
          {config.highlightPoints.length > 0 && (
            <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px,1fr))', gap: 16, listStyle: 'none', padding: 0, marginTop: 36 }}>
              {config.highlightPoints.map((p: string, i: number) => (
                <li key={i} style={{ background: accent + '15', padding: '16px 18px', borderRadius: 14, fontWeight: 500, fontSize: 15, color: primary }}>{p}</li>
              ))}
            </ul>
          )}
        </section>
        <section style={{ display: 'grid', gap: 34, gridTemplateColumns: '1fr 1fr', marginBottom: 54 }}>
          <div style={{ background: '#fff', padding: '34px 34px', borderRadius: 24, boxShadow: '0 6px 26px -8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 24, color: primary }}>{config.termsTitle}</h2>
            <p style={{ margin: 0, whiteSpace: 'pre-line', lineHeight: 1.55, fontSize: 15 }}>{config.termsBody}</p>
          </div>
          <div style={{ background: '#fff', padding: '34px 34px', borderRadius: 24, boxShadow: '0 6px 26px -8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 24, color: primary }}>{config.cancellationTitle}</h2>
            <p style={{ margin: 0, whiteSpace: 'pre-line', lineHeight: 1.55, fontSize: 15 }}>{config.cancellationBody}</p>
          </div>
        </section>
        <footer style={{ textAlign: 'center', fontSize: 14, color: '#555', padding: 40 }}>
          <div style={{ marginBottom: 10 }}>{config.footerNote}</div>
          {/* Undgå hydration mismatch ved først at rendere tidsinfo på klienten */}
          {isClient && (
            <div style={{ fontSize: 12, color: '#777' }}>
              Sidst opdateret: {new Date(config.updatedAt).toLocaleDateString('da-DK')} kl. {new Date(config.updatedAt).toLocaleTimeString('da-DK')}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
