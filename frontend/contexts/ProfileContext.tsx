import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Profile {
  id: number;
  salonName: string;
  ownerName: string;
  email: string;
  address: string;
  type: string;
  clientCount: number;
}

interface ProfileContextType {
  profile: Profile;
  loading: boolean;
  refreshProfile: () => void;
  updateProfile: (newProfile: Partial<Profile>) => void;
  updateClientCount: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
  salonId?: string;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children, salonId }) => {
  const [profile, setProfile] = useState<Profile>({
    id: 0,
    salonName: '',
    ownerName: '',
    email: '',
    address: '',
    type: '',
    clientCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/salons');
      const data = await response.json();
      
      let salon;
      if (salonId) {
        // Find salon by ID
        salon = data.find((s: any) => s.id === parseInt(salonId));
        if (!salon) {
          throw new Error(`Salon with ID ${salonId} not found`);
        }
      } else {
        // Fallback to first salon (for backward compatibility)
        salon = data[0];
      }
      
      if (salon) {
        setProfile({
          id: salon.id,
          salonName: salon.name,
          ownerName: salon.owner,
          email: salon.email,
          address: salon.address,
          type: salon.type,
          clientCount: 0, // Will be calculated from bookings
        });
      } else {
        // Create default salon if none exists
        const defaultSalon = {
          name: 'Random Hair Salon',
          owner: 'Anna Demo',
          email: 'anna@randomsalon.dk',
          address: 'Hovedgaden 123, 2800 Kgs. Lyngby',
          type: 'Frisør',
        };
        
        const createResponse = await fetch('http://localhost:4000/salons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultSalon)
        });
        
        const newSalon = await createResponse.json();
        setProfile({
          id: newSalon.id,
          salonName: newSalon.name,
          ownerName: newSalon.owner,
          email: newSalon.email,
          address: newSalon.address,
          type: newSalon.type,
          clientCount: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Fallback to default values on error
      setProfile({
        id: 0,
        salonName: 'Beauty Salon',
        ownerName: 'Anna Jensen',
        email: 'anna@beautysalon.dk',
        address: 'Hovedgaden 42, 2800 Kgs. Lyngby',
        type: 'Frisør',
        clientCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = () => {
    loadProfile();
  };

  const updateProfile = (newProfile: Partial<Profile>) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
  };

  // Calculate unique clients for the current month from salon-specific localStorage bookings
  const updateClientCount = () => {
    try {
      // Use salon-specific localStorage key
      const storageKey = salonId ? `allBookings_salon_${salonId}` : 'allBookings';
      const savedBookings = localStorage.getItem(storageKey);
      if (!savedBookings) return;

      const allBookingsData: Record<string, any[]> = JSON.parse(savedBookings);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const uniqueClients = new Set<string>();
      const debugData: { date: string, name: string, phone: string }[] = [];

      Object.entries(allBookingsData).forEach(([dateStr, bookings]) => {
        const date = new Date(dateStr);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          bookings.forEach((booking) => {
            // Use phone number as unique identifier (same as clients page)
            if (booking.phone) {
              uniqueClients.add(booking.phone);
              debugData.push({ date: dateStr, name: booking.name, phone: booking.phone });
            }
          });
        }
      });

      console.log('🔍 Monthly clients debug:', {
        totalThisMonth: uniqueClients.size,
        uniquePhones: Array.from(uniqueClients),
        allBookingsThisMonth: debugData
      });

      const clientCount = uniqueClients.size;
      setProfile(prev => ({ ...prev, clientCount }));
    } catch (error) {
      console.error('Failed to calculate client count:', error);
    }
  };

  useEffect(() => {
    loadProfile();
    
    // Calculate initial client count
    setTimeout(() => updateClientCount(), 100);
    
    // Listen for booking updates
    const handleBookingUpdate = () => updateClientCount();
    window.addEventListener('bookingsUpdated', handleBookingUpdate);
    window.addEventListener('storage', handleBookingUpdate);
    
    return () => {
      window.removeEventListener('bookingsUpdated', handleBookingUpdate);
      window.removeEventListener('storage', handleBookingUpdate);
    };
  }, [salonId]); // Re-run when salonId changes

  const value: ProfileContextType = {
    profile,
    loading,
    refreshProfile,
    updateProfile,
    updateClientCount,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
export default ProfileProvider;