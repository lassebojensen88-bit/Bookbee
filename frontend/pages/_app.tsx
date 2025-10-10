import type { AppProps } from 'next/app';
import '../styles/globals.css';

import Sidebar from '../components/Sidebar';
import { useRouter } from 'next/router';
import { ProfileProvider } from '../contexts/ProfileContext';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLogin = router.pathname === '/login';
  const isClientPortal = router.pathname.startsWith('/client');
  const isPublicLanding = router.pathname.startsWith('/p/');
  const sidebarBg = "url('/background login page.jpg')";

  if (isLogin) {
    return <Component {...pageProps} />;
  }

  if (isPublicLanding) {
    // Offentlig landing page: ingen providers eller admin layout
    return <Component {...pageProps} />;
  }

  if (isClientPortal) {
    // Extract salonId from URL for salon-specific routes like /client/[salonId]/dashboard
    const salonId = router.query.salonId as string | undefined;
    
    // Client portal skal stadig have profile context men ikke admin layout
    return (
      <ProfileProvider salonId={salonId}>
        <Component {...pageProps} />
      </ProfileProvider>
    );
  }

  // Admin-side: sidebar og indhold som før
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: 220, borderRight: '1px solid #eee', position: 'fixed', height: '100vh' }}>
        <Sidebar />
      </div>
      <main style={{ marginLeft: 220, flexGrow: 1, background: '#fafafa' }}>
        <Component {...pageProps} />
      </main>
    </div>
  );
}
