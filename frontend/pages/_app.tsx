import type { AppProps } from 'next/app';
import '../styles/globals.css';

import AdminLayout from '../components/AdminLayout';
import { useRouter } from 'next/router';
import { ProfileProvider } from '../contexts/ProfileContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLogin = router.pathname === '/login';
  const isClientPortal = router.pathname.startsWith('/client');
  const isPublicLanding = router.pathname.startsWith('/p/');
  const sidebarBg = "url('/background login page.jpg')";

  if (isLogin) {
    return (
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    );
  }

  if (isPublicLanding) {
    // Offentlig landing page: ingen providers eller admin layout
    return (
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    );
  }

  if (isClientPortal) {
    // Extract salonId from URL for salon-specific routes like /client/[salonId]/dashboard
    const salonId = router.query.salonId as string | undefined;
    
    // Client portal skal stadig have profile context men ikke admin layout
    return (
      <ThemeProvider>
        <ProfileProvider salonId={salonId}>
          <Component {...pageProps} />
        </ProfileProvider>
      </ThemeProvider>
    );
  }

  // Admin-side: sidebar og indhold som før
  return (
    <ThemeProvider>
      <AdminLayout>
        <Component {...pageProps} />
      </AdminLayout>
    </ThemeProvider>
  );
}
