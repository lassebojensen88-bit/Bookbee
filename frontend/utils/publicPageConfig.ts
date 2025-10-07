export interface PublicPageConfig {
  title: string;
  subtitle: string;
  introText: string;
  highlightPoints: string[];
  termsTitle: string;
  termsBody: string;
  cancellationTitle: string;
  cancellationBody: string;
  footerNote: string;
  // Branding & visual
  logoUrl?: string; // base64 eller ekstern URL
  coverImageUrl?: string; // hero section baggrund
  primaryColor?: string; // hovedfarve til knapper / links
  accentColor?: string; // sekundær accent / highlights
  // CTA
  ctaEnabled?: boolean;
  ctaText?: string;
  ctaLink?: string;
  updatedAt: string; // ISO string
}

const DEFAULT_CONFIG: PublicPageConfig = {
  title: 'Velkommen til vores online booking',
  subtitle: 'Professionel behandling – nemt at booke',
  introText: 'Her kan du trygt booke din næste tid. Vi glæder os til at tage imod dig og give dig en god oplevelse.',
  highlightPoints: [
    'Erfarne behandlere',
    'Nem online booking',
    'Kvalitet & tryghed'
  ],
  termsTitle: 'Generelle vilkår',
  termsBody: 'Afbud skal ske senest 4 timer før din aftale. Udeblivelser eller for sent afbud kan medføre gebyr svarende til 50% af behandlingens pris.',
  cancellationTitle: 'Afbuds- og ændringspolitik',
  cancellationBody: 'Du kan nemt aflyse eller ændre din tid via bekræftelsesmail eller ved at kontakte os. Senere end 4 timer før – kontakt os direkte.',
  footerNote: 'Tak fordi du vælger os – vi glæder os til at se dig! ✂️',
  // Branding defaults
  logoUrl: undefined,
  coverImageUrl: undefined,
  primaryColor: '#111827', // Tailwind gray-900
  accentColor: '#6366f1',  // Indigo-500
  // CTA defaults
  ctaEnabled: true,
  ctaText: 'Book tid',
  ctaLink: '#',
  updatedAt: new Date().toISOString()
};

function storageKey(salonId: string) {
  return `publicPageConfig:${salonId}`;
}

export function loadPublicPageConfig(salonId: string | undefined): PublicPageConfig {
  if (!salonId) return DEFAULT_CONFIG;
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(storageKey(salonId));
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    // Backwards kompatibilitet: merge med defaults så nye felter udfyldes
    return { ...DEFAULT_CONFIG, ...parsed } as PublicPageConfig;
  } catch (e) {
    console.warn('Failed to parse public page config, using defaults', e);
    return DEFAULT_CONFIG;
  }
}

export function savePublicPageConfig(salonId: string | undefined, cfg: Partial<PublicPageConfig>) {
  if (!salonId) return;
  if (typeof window === 'undefined') return;
  const existing = loadPublicPageConfig(salonId);
  const merged: PublicPageConfig = { ...existing, ...cfg, updatedAt: new Date().toISOString() };
  localStorage.setItem(storageKey(salonId), JSON.stringify(merged));
  return merged;
}

export function resetPublicPageConfig(salonId: string | undefined) {
  if (!salonId) return;
  if (typeof window === 'undefined') return;
  localStorage.removeItem(storageKey(salonId));
}
