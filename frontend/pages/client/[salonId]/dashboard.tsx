import { useRouter } from 'next/router';
import { useEffect } from 'react';
import ClientDashboard from '../dashboard';

export default function DynamicDashboard() {
  const router = useRouter();
  const { salonId } = router.query;

  // Pass salonId to the main component
  return <ClientDashboard salonId={salonId as string} />;
}