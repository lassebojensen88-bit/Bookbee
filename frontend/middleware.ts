// middleware.ts - Runs on every request to detect subdomain
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Extract subdomain
  // Examples:
  // - beebo.bookbee.dk → subdomain: "beebo"
  // - bookbee.dk → subdomain: null
  // - localhost:3000 → subdomain: null
  
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  
  // For localhost, check for subdomain pattern like beebo.localhost:3000
  if (isLocalhost) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      // Has subdomain on localhost (e.g., beebo.localhost:3000)
      const subdomain = parts[0];
      const url = request.nextUrl.clone();
      url.searchParams.set('subdomain', subdomain);
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }
  
  // Production: Extract subdomain from bookbee.dk or *.vercel.app
  const parts = hostname.split('.');
  
  // Check if it's a subdomain (more than 2 parts before TLD)
  // beebo.bookbee.dk → ["beebo", "bookbee", "dk"] → subdomain: "beebo"
  // bookbee.dk → ["bookbee", "dk"] → no subdomain
  // beebo-bookbee.vercel.app → ["beebo-bookbee", "vercel", "app"] → no subdomain (treat as main)
  
  if (parts.length >= 3) {
    const subdomain = parts[0];
    
    // Skip common subdomains
    if (subdomain === 'www' || subdomain === 'api') {
      return NextResponse.next();
    }
    
    // Rewrite to pass subdomain to pages
    const url = request.nextUrl.clone();
    url.searchParams.set('subdomain', subdomain);
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

// Run middleware on all routes except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
