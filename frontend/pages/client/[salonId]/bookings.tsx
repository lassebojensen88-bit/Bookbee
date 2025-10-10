import ClientBookings from '../bookings';
import { GetServerSideProps } from 'next';

interface SalonBookingsProps {
  salonId: string;
}

export default function SalonBookings({ salonId }: SalonBookingsProps) {
  return <ClientBookings salonId={salonId} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      salonId: context.params?.salonId as string,
    },
  };
};