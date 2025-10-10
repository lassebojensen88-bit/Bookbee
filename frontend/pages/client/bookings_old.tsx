import React, { useEffect, useState, useCallback } from 'react';
import ClientLayout from '../../components/ClientLayout';
import { GetServerSideProps } from 'next';
import { useServices } from '../../utils/api';
import WeekView from '../../components/WeekView';
import MonthView from '../../components/MonthView';

// --- Types ---

interface BookingSlot { 
  start: number; 
  end: number; 
  name: string; 
  service: string;
  price: number;
  phone?: string;
}

interface Service {
  id?: number;
  name: string;
  price: number;
  duration: number; // in hours
}

interface ClientBookingsProps {
  salonId?: string;
}

export default function ClientBookings({ salonId }: ClientBookingsProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    loadBookingsForDate(selectedDate);
  }, [selectedDate, salonId]);

  const loadBookingsForDate = (date: string) => {
    try {
      // Use salon-specific localStorage key if salonId exists
      const storageKey = salonId ? `allBookings_salon_${salonId}` : 'allBookings';
      const savedBookings = localStorage.getItem(storageKey);
      
      if (savedBookings) {
        const allBookingsData: Record<string, Booking[]> = JSON.parse(savedBookings);
        const dayBookings = allBookingsData[date] || [];
        setBookings(dayBookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
      setBookings([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'completed': return '#6366f1';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Bekræftet';
      case 'pending': return 'Afventer';
      case 'completed': return 'Gennemført';
      default: return status;
    }
  };

  return (
    <ClientLayout salonId={salonId}>
      <div style={{ padding: '32px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: '#1f2937' }}>
            Bookings
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280' }}>
            Administrer dagens bookings og se oversigt over alle aftaler
          </p>
        </div>

        {/* Date Picker */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ 
            display: 'block', 
            fontSize: 14, 
            fontWeight: 600, 
            marginBottom: 8, 
            color: '#374151' 
          }}>
            Vælg dato:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '12px 16px',
              fontSize: 16,
              border: '2px solid #e5e7eb',
              borderRadius: 8,
              backgroundColor: '#fff',
              color: '#1f2937',
              fontWeight: 500,
              minWidth: 200
            }}
          />
        </div>

        {/* Bookings List */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1f2937', margin: 0 }}>
              Bookings for {new Date(selectedDate).toLocaleDateString('da-DK', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0 0' }}>
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''} i alt
            </p>
          </div>

          {bookings.length === 0 ? (
            <div style={{ padding: '48px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>
                Ingen bookings denne dag
              </h3>
              <p style={{ fontSize: 14, color: '#6b7280' }}>
                Der er ingen bookings planlagt for den valgte dato.
              </p>
            </div>
          ) : (
            <div style={{ padding: '0' }}>
              {bookings.map((booking, index) => (
                <div
                  key={booking.id || index}
                  style={{
                    padding: '20px 32px',
                    borderBottom: index < bookings.length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 18,
                      fontWeight: 700
                    }}>
                      {booking.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', margin: '0 0 4px 0' }}>
                        {booking.name}
                      </h4>
                      <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
                        {booking.service}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
                        {booking.time}
                      </div>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: getStatusColor(booking.status),
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {getStatusText(booking.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      salonId: context.params?.salonId || null,
    },
  };
};