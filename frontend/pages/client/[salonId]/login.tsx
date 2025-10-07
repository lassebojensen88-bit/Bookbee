import { useRouter } from 'next/router';
import ClientLogin from '../login';

export default function DynamicLogin() {
  const router = useRouter();
  const { salonId } = router.query;

  return <ClientLogin salonId={salonId as string} />;
}