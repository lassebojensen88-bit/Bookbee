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
    // Client portal skal stadig have profile context men ikke admin layout
    return (
      <ProfileProvider>
        <Component {...pageProps} />
      </ProfileProvider>
    );
  }

  // Admin-side: sidebar og indhold som før
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f7f7', position: 'relative' }}>
      <div style={{ position: 'fixed', left: 0, top: 0, zIndex: 1, width: 220, height: 'calc(100vh - 40px)', margin: 20, borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', overflow: 'hidden', background: 'rgba(255,255,255,0.92)' }}>
        <Sidebar />
      </div>
      <main style={{ marginLeft: 260, flex: 1, padding: '40px 5vw' }}>
        <Component {...pageProps} />
      </main>
    </div>
  );
}
