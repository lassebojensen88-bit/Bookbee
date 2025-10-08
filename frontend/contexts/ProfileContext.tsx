import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Profile {
  id: number;
  salonName: string;
  ownerName: string;
  email: string;
  address: string;
  type: string;
  appointmentCount: number; // Changed from clientCount to appointmentCount
}

interface ProfileContextType {
  profile: Profile;
  loading: boolean;
  refreshProfile: () => void;
  updateProfile: (newProfile: Partial<Profile>) => void;
  updateAppointmentCount: () => void; // Changed from updateClientCount
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
    appointmentCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Use the same API base as the utils/api.ts file
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bookbee-backend-excw.onrender.com';
      console.log('🔍 Loading profile for salonId:', salonId, 'from API:', API_BASE);
      
      const response = await fetch(`${API_BASE}/salons`);
      
      if (!response.ok) {
        throw new Error(`API responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📋 All salons from API:', data);
      
      let salon;
      if (salonId) {
        // Find salon by ID
        salon = data.find((s: any) => s.id === parseInt(salonId));
        console.log('🎯 Looking for salon ID:', parseInt(salonId), 'Found:', salon);
        if (!salon) {
          throw new Error(`Salon with ID ${salonId} not found in API response`);
        }
      } else {
        // Fallback to first salon (for backward compatibility)
        salon = data[0];
        console.log('🔄 Using first salon as fallback:', salon);
      }
      
      if (salon) {
        console.log('✅ Loaded salon profile:', salon);
        
        // First set the profile data
        const newProfile = {
          id: salon.id,
          salonName: salon.name,
          ownerName: salon.owner,
          email: salon.email,
          address: salon.address,
          type: salon.type,
          appointmentCount: 0, // Temporary, will be updated by calculateAndSetAppointmentCount
        };
        
        console.log('🏪 Setting profile to:', newProfile);
        setProfile(newProfile);
        
        // Then immediately calculate appointment count to avoid showing 0
        setTimeout(() => {
          calculateAndSetAppointmentCount();
        }, 50);
      } else {
        throw new Error('No salons found in API response');
      }
    } catch (error) {
      console.error('❌ Failed to load profile:', error);
      
      // More specific fallback based on salonId
      const fallbackProfile = {
        id: parseInt(salonId || '0'),
        salonName: salonId ? `Salon ${salonId}` : 'Beauty Salon',
        ownerName: 'Anna Jensen',
        email: 'anna@beautysalon.dk',
        address: 'Hovedgaden 42, 2800 Kgs. Lyngby',
        type: 'Frisør',
        appointmentCount: 0,
      };
      
      console.log('🚨 Using fallback profile:', fallbackProfile);
      setProfile(fallbackProfile);
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

  // Calculate total appointments for the current month from salon-specific localStorage bookings
  const calculateAndSetAppointmentCount = () => {
    try {
      // Use salon-specific localStorage key
      const storageKey = salonId ? `allBookings_salon_${salonId}` : 'allBookings';
      const savedBookings = localStorage.getItem(storageKey);
      if (!savedBookings) {
        console.log('📊 No bookings found in localStorage');
        return;
      }

      const allBookingsData: Record<string, any[]> = JSON.parse(savedBookings);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      let totalAppointments = 0;
      const debugData: { date: string, name: string, service: string }[] = [];

      Object.entries(allBookingsData).forEach(([dateStr, bookings]) => {
        const date = new Date(dateStr);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          bookings.forEach((booking) => {
            totalAppointments++;
            debugData.push({ date: dateStr, name: booking.name, service: booking.service });
          });
        }
      });

      console.log('🔍 Monthly appointments debug:', {
        salonId,
        storageKey,
        totalAppointmentsThisMonth: totalAppointments,
        allAppointmentsThisMonth: debugData
      });

      setProfile(prev => ({ ...prev, appointmentCount: totalAppointments }));
    } catch (error) {
      console.error('Failed to calculate appointment count:', error);
    }
  };

  const updateAppointmentCount = calculateAndSetAppointmentCount;

  useEffect(() => {
    loadProfile();
  }, [salonId]); // Re-run when salonId changes

  // Separate effect for client count calculation
  useEffect(() => {
    // Wait a bit for profile to be set, then calculate appointment count
    const timer = setTimeout(() => {
      calculateAndSetAppointmentCount();
    }, 200);
    
    // Listen for booking updates
    const handleBookingUpdate = () => {
      console.log('📊 Booking update detected, recalculating appointment count...');
      calculateAndSetAppointmentCount();
    };
    
    window.addEventListener('bookingsUpdated', handleBookingUpdate);
    window.addEventListener('storage', handleBookingUpdate);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('bookingsUpdated', handleBookingUpdate);
      window.removeEventListener('storage', handleBookingUpdate);
    };
  }, [salonId, profile.id]); // Re-run when salonId or profile.id changes

  const value: ProfileContextType = {
    profile,
    loading,
    refreshProfile,
    updateProfile,
    updateAppointmentCount,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
export default ProfileProvider;