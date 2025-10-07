import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { loadPublicPageConfig } from '../../utils/publicPageConfig';

export default function PublicSalonLanding() {
  const router = useRouter();
  const { salonId } = router.query;
  const [config, setConfig] = useState(() => loadPublicPageConfig((salonId as string) || undefined));
  const isClient = typeof window !== 'undefined';

  useEffect(() => {
    if (salonId) {
      setConfig(loadPublicPageConfig(salonId as string));
    }
  }, [salonId]);

  const primary = config.primaryColor || '#111827';
  const accent = config.accentColor || '#6366f1';
  const hasCover = !!config.coverImageUrl;

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
              {config.highlightPoints.map((p,i) => (
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
