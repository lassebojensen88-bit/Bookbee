import { useRouter } from 'next/router';
import ClientClients from '../clients';

export default function DynamicClients() {
  const router = useRouter();
  const { salonId } = router.query;

  return <ClientClients salonId={salonId as string} />;
}