// Plus-ikon til knapper
export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
// Saks-ikon til frisør
export function ScissorsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" {...props}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <line x1="6" y1="6" x2="20" y2="20" />
      <line x1="6" y1="18" x2="20" y2="4" />
    </svg>
  );
}

// Tand-ikon til tandlæge
export function ToothIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" {...props}>
      <path d="M12 2c3 0 7 2 7 7 0 7-2 13-7 13S5 16 5 9c0-5 4-7 7-7z" />
      <path d="M8 15c.5-2 3.5-2 4 0" />
    </svg>
  );
}

// Ansigt-ikon til skønhedsklinik
export function FaceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="9" cy="13" rx="1.5" ry="2" />
      <ellipse cx="15" cy="13" rx="1.5" ry="2" />
      <path d="M9 16c1.5 1 4.5 1 6 0" />
    </svg>
  );
}
import { SVGProps } from 'react';

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" {...props}>
      <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

export function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="7" height="9" rx="2" />
      <rect x="14" y="3" width="7" height="5" rx="2" />
      <rect x="14" y="12" width="7" height="9" rx="2" />
      <rect x="3" y="17" width="7" height="4" rx="2" />
    </svg>
  );
}

export function SalonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M16 7V5a4 4 0 0 0-8 0v2" />
    </svg>
  );
}

export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" {...props}>
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
      <path d="M12 19v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
