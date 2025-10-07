import { useRouter } from 'next/router';
import ClientProfile from '../profile';
import { ProfileProvider } from '../../../contexts/ProfileContext';

export default function ClientProfileWrapper() {
  const router = useRouter();
  const { salonId } = router.query;

  return (
    <ProfileProvider salonId={salonId as string}>
      <ClientProfile salonId={salonId as string} />
    </ProfileProvider>
  );
}