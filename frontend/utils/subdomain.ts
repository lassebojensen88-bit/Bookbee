// Utility functions for subdomain handling

/**
 * Extract subdomain from URL query params (set by middleware)
 */
export function getSubdomain(query: any): string | null {
  return query.subdomain || null;
}

/**
 * Check if current page is on a subdomain
 */
export function isSubdomain(query: any): boolean {
  return !!query.subdomain;
}

/**
 * Get the main domain for the current environment
 */
export function getMainDomain(): string {
  if (typeof window === 'undefined') return '';
  
  const hostname = window.location.hostname;
  
  if (hostname.includes('localhost')) {
    return 'localhost:3000';
  }
  
  if (hostname.includes('vercel.app')) {
    return 'bookbee-flame.vercel.app';
  }
  
  return 'bookbee.dk';
}

/**
 * Generate subdomain URL for a salon slug
 */
export function getSalonSubdomainUrl(slug: string): string {
  const mainDomain = getMainDomain();
  
  if (mainDomain.includes('localhost')) {
    // Local development: use subdomain.localhost pattern
    return `http://${slug}.localhost:3000`;
  }
  
  // Production: use subdomain.bookbee.dk
  return `https://${slug}.bookbee.dk`;
}
