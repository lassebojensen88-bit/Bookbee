import React, { useEffect, useState, useCallback } from 'react';
import { useServices } from '../../utils/api';
import { SalonIcon } from '../../components/icons';
import ClientLayout from '../../components/ClientLayout';
import { useProfile, ProfileProvider } from '../../contexts/ProfileContext';
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
  id?: number; // optional API id when hentet fra backend
  name: string;
  price: number; // lokal brug: numeric kr.
  duration: number; // in hours
}

// --- Booking Modal Component ---
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTime: number | null;
  services: Service[];
  onBookingCreated: (booking: BookingSlot) => void;
  isTimeSlotAvailable: (startTime: number, duration: number) => boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedTime, 
  services, 
  onBookingCreated, 
  isTimeSlotAvailable 
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);

  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !selectedService || selectedTime === null) return;

    if (!isTimeSlotAvailable(selectedTime, selectedService.duration)) {
      alert('Den valgte tid overlapper med en eksisterende booking. Vælg venligst et andet tidspunkt.');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newBooking: BookingSlot = {
        start: selectedTime,
        end: selectedTime + selectedService.duration,
        name: customerName,
        service: selectedService.name,
        price: selectedService.price,
        phone: customerPhone
      };
      
      onBookingCreated(newBooking);
      setLoading(false);
      
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setSelectedService(null);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: 32,
        width: '90%',
        maxWidth: 500,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        animation: 'fadeInUp 0.3s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Ny booking
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: '#6b7280',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ 
          background: '#f0f9ff', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 24,
          border: '1px solid #e0f2fe'
        }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            Starttid: {selectedTime ? formatTime(selectedTime) : 'Ikke valgt'}
          </p>
          {selectedService && (
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#0284c7' }}>
              Sluttid: {selectedTime ? formatTime(selectedTime + selectedService.duration) : 'Ikke valgt'}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Kunde navn *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Indtast kunde navn"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: 12,
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Telefon nummer *
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Indtast telefon nummer"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: 12,
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="6" cy="6" r="3"/>
                <circle cx="6" cy="18" r="3"/>
                <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                <line x1="8.12" y1="8.12" x2="12" y2="12"/>
              </svg>
              Service *
            </label>
            <select
              value={selectedService ? `${selectedService.name}-${selectedService.price}` : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const [name, price] = e.target.value.split('-');
                  const service = services.find(s => s.name === name && s.price === parseInt(price));
                  setSelectedService(service || null);
                }
              }}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: 12,
                fontSize: 16,
                outline: 'none',
                background: 'white',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Vælg en service</option>
              {services.map((service, index) => (
                <option key={index} value={`${service.name}-${service.price}`}>
                  {service.name} - {service.price},- ({service.duration}h)
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                backgroundColor: '#6b7280',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Annuller
            </button>
            <button
              type="submit"
              disabled={loading || !customerName || !customerPhone || !selectedService}
              style={{
                flex: 1,
                backgroundColor: loading || !customerName || !customerPhone || !selectedService ? '#9ca3af' : '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 500,
                cursor: loading || !customerName || !customerPhone || !selectedService ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {!loading && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                )}
                {loading ? 'Opretter...' : 'Opret booking'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Edit Booking Modal Component ---
interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingSlot | null;
  services: Service[];
  onBookingUpdated: (oldBooking: BookingSlot, updatedBooking: BookingSlot) => void;
  onBookingDeleted: (booking: BookingSlot) => void;
  isTimeSlotAvailable: (startTime: number, duration: number, excludeBooking?: BookingSlot) => boolean;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({ 
  isOpen, 
  onClose, 
  booking, 
  services, 
  onBookingUpdated, 
  onBookingDeleted,
  isTimeSlotAvailable 
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize form with booking data when modal opens
  useEffect(() => {
    if (booking) {
      setCustomerName(booking.name);
      setCustomerPhone(booking.phone || '');
      setSelectedTime(booking.start);
      
      // Find the matching service
      const service = services.find(s => s.name === booking.service);
      setSelectedService(service || null);
    }
  }, [booking, services]);

  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !booking || selectedTime === null) return;

    setLoading(true);

    // Check if new time slot is available (excluding current booking)
    if (!isTimeSlotAvailable(selectedTime, selectedService.duration, booking)) {
      alert('Dette tidsrum er ikke ledigt!');
      setLoading(false);
      return;
    }

    const updatedBooking: BookingSlot = {
      start: selectedTime,
      end: selectedTime + selectedService.duration,
      name: customerName,
      service: selectedService.name,
      price: selectedService.price,
      phone: customerPhone || undefined
    };

    onBookingUpdated(booking, updatedBooking);
    onClose();
    
    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setSelectedService(null);
    setSelectedTime(null);
    setLoading(false);
  };

  const handleDelete = () => {
    if (!booking) return;
    
    const confirmDelete = window.confirm(`Er du sikker på at du vil slette bookingen for ${booking.name}?\n\nService: ${booking.service}\nTid: ${formatTime(booking.start)} - ${formatTime(booking.end)}`);
    
    if (confirmDelete) {
      onBookingDeleted(booking);
      onClose();
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17.5; hour += 0.5) {
      slots.push(hour);
    }
    return slots;
  };

  if (!isOpen || !booking) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 32,
        maxWidth: 480,
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m18 2 4 4-14 14H4v-4L18 2z"/>
                <path d="m14.5 5.5 4 4"/>
              </svg>
              Rediger booking
            </h2>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 20,
                cursor: 'pointer',
                color: '#6b7280',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
              Kundens navn
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
              Telefonnummer (valgfrit)
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
              Service
            </label>
            <select
              value={selectedService?.name || ''}
              onChange={(e) => {
                const service = services.find(s => s.name === e.target.value);
                setSelectedService(service || null);
              }}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            >
              <option value="">Vælg service</option>
              {services.map(service => (
                <option key={service.name} value={service.name}>
                  {service.name} - {service.price}kr ({service.duration}t)
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
              Starttidspunkt
            </label>
            <select
              value={selectedTime || ''}
              onChange={(e) => setSelectedTime(parseFloat(e.target.value))}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            >
              <option value="">Vælg tidspunkt</option>
              {generateTimeSlots().map(time => (
                <option key={time} value={time}>
                  {formatTime(time)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={loading || !selectedService || !customerName.trim() || selectedTime === null}
              style={{
                flex: 1,
                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {!loading && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                )}
                {loading ? 'Opdaterer...' : 'Opdater booking'}
              </span>
            </button>
            
            <button
              type="button"
              onClick={handleDelete}
              style={{
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                Slet
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Timeline component ---
interface BookingsTimelineProps {
  onRevenueUpdate?: (maleRevenue: number, femaleRevenue: number, totalRevenue: number) => void;
  salonId?: string;
}

const BookingsTimeline: React.FC<BookingsTimelineProps> = ({ onRevenueUpdate, salonId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [editingBooking, setEditingBooking] = useState<BookingSlot | null>(null);
  
  // Helper function to get salon-specific storage key
  const getStorageKey = () => {
    return salonId ? `allBookings_salon_${salonId}` : 'allBookings';
  };
  
  // All bookings organized by date
  const [allBookings, setAllBookings] = useState<Record<string, BookingSlot[]>>({
    // Today's bookings
    [new Date().toDateString()]: [
      { start: 9, end: 10, name: 'Marie Hansen', service: 'Dameklip', price: 349, phone: '12345678' },
      { start: 10.5, end: 13, name: 'Peter Nielsen', service: 'Herreklip + Hårfarvning', price: 599, phone: '87654321' },
      { start: 13.5, end: 14.5, name: 'Lars Olsen', service: 'Herreklip + Skægtrim', price: 329, phone: '23456789' },
      { start: 15, end: 17.5, name: 'Sofie Madsen', service: 'Balayage + Klip', price: 899, phone: '34567890' },
    ],
    // Tomorrow's bookings
    [new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()]: [
      { start: 9.5, end: 11, name: 'Anna Larsen', service: 'Dameklip', price: 349, phone: '45678901' },
      { start: 14, end: 16, name: 'Michael Jensen', service: 'Herreklip + Styling', price: 399, phone: '56789012' },
    ],
    // Yesterday's bookings  
    [new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()]: [
      { start: 10, end: 11, name: 'Lise Nielsen', service: 'Dameklip + Føn', price: 449, phone: '67890123' },
      { start: 15, end: 15.5, name: 'Tom Andersen', service: 'Herreklip', price: 249, phone: '78901234' },
    ]
  });

  // Calculate monthly revenue by gender and total
  const calculateMonthlyRevenue = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let maleRevenue = 0;
    let femaleRevenue = 0;
    let totalRevenue = 0;

    Object.entries(allBookings).forEach(([dateStr, bookings]) => {
      const date = new Date(dateStr);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        bookings.forEach((booking) => {
          const serviceName = booking.service.toLowerCase();
          
          // Determine gender based on service type
          const isMaleService = serviceName.includes('herre') || 
                               serviceName.includes('skæg') ||
                               serviceName.includes('herreklip');
          
          const isFemaleService = serviceName.includes('dame') || 
                                 serviceName.includes('dameklip') ||
                                 serviceName.includes('balayage') ||
                                 serviceName.includes('hårfarvning') ||
                                 serviceName.includes('permanent');
          
          totalRevenue += booking.price;
          
          if (isMaleService) {
            maleRevenue += booking.price;
          } else if (isFemaleService) {
            femaleRevenue += booking.price;
          } else {
            // If service type is unclear, fall back to name-based detection
            const firstName = booking.name.split(' ')[0].toLowerCase();
            const isMale = maleNames.includes(firstName);
            const isFemale = femaleNames.includes(firstName);
            
            if (isMale) {
              maleRevenue += booking.price;
            } else if (isFemale) {
              femaleRevenue += booking.price;
            }
            // If neither service nor name can determine gender, add to neither category
          }
        });
      }
    });

    return { maleRevenue, femaleRevenue, totalRevenue };
  };

  // Update revenue when bookings change
  useEffect(() => {
    const { maleRevenue, femaleRevenue, totalRevenue } = calculateMonthlyRevenue();
    onRevenueUpdate?.(maleRevenue, femaleRevenue, totalRevenue);
  }, [allBookings]); // Removed onRevenueUpdate from deps since it's stable now

  // Initial revenue calculation on mount
  useEffect(() => {
    const { maleRevenue, femaleRevenue, totalRevenue } = calculateMonthlyRevenue();
    onRevenueUpdate?.(maleRevenue, femaleRevenue, totalRevenue);
  }, []); // Run once on mount

  const bookings = allBookings[selectedDate.toDateString()] || [];
  
  // Color palettes separated by gender
  const maleColors = [
    { bg: '#e0f2fe', border: '#0891b2', text: '#0c4a6e' }, // Sky blue
    { bg: '#f0fdf4', border: '#16a34a', text: '#14532d' }, // Green
    { bg: '#f8fafc', border: '#64748b', text: '#1e293b' }, // Slate gray
    { bg: '#fef3c7', border: '#d97706', text: '#92400e' }, // Amber/brown
    { bg: '#eff6ff', border: '#3b82f6', text: '#1e3a8a' }, // Blue
    { bg: '#f0fdf4', border: '#059669', text: '#064e3b' }, // Dark green
  ];
  
  const femaleColors = [
    { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' }, // Pink
    { bg: '#f3e8ff', border: '#9333ea', text: '#581c87' }, // Purple
    { bg: '#fef7ff', border: '#c084fc', text: '#7c3aed' }, // Light purple
    { bg: '#fff1f2', border: '#f43f5e', text: '#be123c' }, // Rose
    { bg: '#f0f9ff', border: '#38bdf8', text: '#0369a1' }, // Light blue
    { bg: '#fefce8', border: '#eab308', text: '#a16207' }, // Yellow
  ];
  
  // Common Danish male names
  const maleNames = [
    'lars', 'peter', 'henrik', 'thomas', 'martin', 'anders', 'søren', 'michael', 
    'christian', 'jesper', 'morten', 'jan', 'erik', 'niels', 'jens', 'kim',
    'hans', 'ole', 'finn', 'bent', 'per', 'jørgen', 'carsten', 'brian',
    'dennis', 'daniel', 'alexander', 'kasper', 'andreas', 'jonas', 'simon',
    'benjamin', 'lucas', 'noah', 'william', 'emil', 'victor', 'anton',
    'tom', 'mark', 'john', 'david', 'jakob', 'mikkel', 'tobias', 'stefan',
    'lasse', 'bo', 'rune', 'rasmus', 'mathias', 'kristian', 'claus', 'jacob',
    'kenneth', 'jimmy', 'ronnie', 'nicklas', 'patrick', 'johnny', 'kevin',
    'frederik', 'magnus', 'gustav', 'oliver', 'sebastian', 'phillip'
  ];
  
  // Common Danish female names  
  const femaleNames = [
    'marie', 'anne', 'kirsten', 'mette', 'helle', 'susanne', 'lene', 'karen',
    'pia', 'lone', 'charlotte', 'camilla', 'louise', 'maria', 'anna', 'sara',
    'sofie', 'line', 'maja', 'julie', 'ida', 'emma', 'laura', 'clara',
    'isabella', 'victoria', 'alma', 'agnes', 'astrid', 'ellen', 'freja',
    'caroline', 'rebecca', 'mathilde', 'olivia', 'alberte', 'andrea', 'thea',
    'lise', 'inge', 'birte', 'gitte', 'tina', 'bente', 'dorte', 'jette'
  ];
  
  // Function to detect gender from name
  const detectGender = (fullName: string): 'male' | 'female' | 'unknown' => {
    const firstName = fullName.split(' ')[0].toLowerCase();
    
    if (maleNames.includes(firstName)) {
      return 'male';
    } else if (femaleNames.includes(firstName)) {
      return 'female';
    }
    return 'unknown';
  };
  
  // Get color for booking based on name and gender
  const getBookingColor = (booking: BookingSlot, bookingIndex: number) => {
    const gender = detectGender(booking.name);
    
    if (gender === 'male') {
      return maleColors[bookingIndex % maleColors.length];
    } else if (gender === 'female') {
      return femaleColors[bookingIndex % femaleColors.length];
    } else {
      // Fallback to neutral colors for unknown names
      const neutralColors = [...maleColors, ...femaleColors];
      return neutralColors[bookingIndex % neutralColors.length];
    }
  };
  
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load booking data from localStorage on component mount
  useEffect(() => {
    const storageKey = getStorageKey();
    const savedBookings = localStorage.getItem(storageKey);
    if (savedBookings) {
      try {
        const parsedBookings = JSON.parse(savedBookings);
        setAllBookings(parsedBookings);
      } catch (e) {
        console.error('Failed to parse saved bookings:', e);
      }
    } else {
      // For new salons, start with empty booking data
      // Only add mock data for the default/legacy system (no salonId)
      if (!salonId) {
        // Save initial mock data to localStorage for legacy system
        const initialBookings = {
          // Today's bookings
          [new Date().toDateString()]: [
            { start: 9, end: 10, name: 'Marie Hansen', service: 'Dameklip', price: 349, phone: '12345678' },
            { start: 10.5, end: 13, name: 'Peter Nielsen', service: 'Herreklip + Hårfarvning', price: 599, phone: '87654321' },
            { start: 13.5, end: 14.5, name: 'Lars Olsen', service: 'Herreklip + Skægtrim', price: 329, phone: '23456789' },
            { start: 15, end: 17.5, name: 'Sofie Madsen', service: 'Balayage + Klip', price: 899, phone: '34567890' },
          ],
          // Tomorrow's bookings
          [new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()]: [
            { start: 9.5, end: 11, name: 'Anna Larsen', service: 'Dameklip', price: 349, phone: '45678901' },
            { start: 14, end: 16, name: 'Michael Jensen', service: 'Herreklip + Styling', price: 399, phone: '56789012' },
          ],
          // Yesterday's bookings  
          [new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()]: [
            { start: 10, end: 11, name: 'Lise Nielsen', service: 'Dameklip + Føn', price: 449, phone: '67890123' },
            { start: 15, end: 15.5, name: 'Tom Andersen', service: 'Herreklip', price: 249, phone: '78901234' },
          ]
        };
        setAllBookings(initialBookings);
        localStorage.setItem(storageKey, JSON.stringify(initialBookings));
        window.dispatchEvent(new Event('bookingsUpdated'));
      } else if (salonId === '1') {
        // Special demo data for BeeBob salon (salon ID 1)
        const today = new Date().toDateString();
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        
        const beeBobBookings = {
          // Today's busy schedule
          [today]: [
            { start: 8, end: 9.5, name: 'Emma Christensen', service: 'Balayage + Klip', price: 1299, phone: '20123456' },
            { start: 9.5, end: 10.5, name: 'Mads Larsen', service: 'Herreklip + Skægtrim', price: 399, phone: '30234567' },
            { start: 11, end: 12.5, name: 'Isabella Hansen', service: 'Dameklip + Føn', price: 549, phone: '40345678' },
            { start: 13, end: 14, name: 'Oliver Nielsen', service: 'Herreklip', price: 299, phone: '50456789' },
            { start: 14.5, end: 16, name: 'Freja Andersen', service: 'Highlights + Klip', price: 899, phone: '60567890' },
            { start: 16, end: 17, name: 'Lucas Pedersen', service: 'Herreklip + Styling', price: 449, phone: '70678901' },
            { start: 17.5, end: 19, name: 'Sofia Madsen', service: 'Keratin behandling', price: 1599, phone: '80789012' }
          ],
          // Tomorrow's appointments
          [tomorrow]: [
            { start: 9, end: 10.5, name: 'Noah Olsen', service: 'Herreklip + Hårfarvning', price: 699, phone: '90890123' },
            { start: 11, end: 12, name: 'Alma Jensen', service: 'Dameklip', price: 399, phone: '21345678' },
            { start: 13, end: 15, name: 'William Sørensen', service: 'Balayage + Klip', price: 1199, phone: '32456789' },
            { start: 15.5, end: 16.5, name: 'Clara Møller', service: 'Dameklip + Styling', price: 599, phone: '43567890' },
            { start: 17, end: 18, name: 'Alexander Berg', service: 'Herreklip + Skægtrim', price: 449, phone: '54678901' }
          ],
          // Yesterday's completed appointments
          [yesterday]: [
            { start: 9, end: 10, name: 'Ida Rasmussen', service: 'Dameklip + Føn', price: 549, phone: '65789012' },
            { start: 10.5, end: 11.5, name: 'Viktor Thomsen', service: 'Herreklip', price: 299, phone: '76890123' },
            { start: 12, end: 13.5, name: 'Mathilde Jørgensen', service: 'Highlights + Klip', price: 899, phone: '87901234' },
            { start: 14, end: 15, name: 'Sebastian Bach', service: 'Herreklip + Styling', price: 449, phone: '98012345' },
            { start: 16, end: 17.5, name: 'Agnes Larsen', service: 'Keratin behandling', price: 1599, phone: '19123456' }
          ]
        };
        
        setAllBookings(beeBobBookings);
        localStorage.setItem(storageKey, JSON.stringify(beeBobBookings));
        window.dispatchEvent(new Event('bookingsUpdated'));
      } else {
        // For new salons, start with completely empty booking data
        setAllBookings({});
      }
    }
  }, [salonId]); // Re-run when salonId changes

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Load services dynamically from service management system
  const [services, setServices] = useState<Service[]>([]);
  
  // API integration for services (fallback til localStorage hvis API ikke tilgængelig)
  const { data: apiServices, error: apiServicesError } = useServices(salonId ? Number(salonId) : null);

  useEffect(() => {
    const mapApiServices = () => {
      if (apiServices && apiServices.length > 0) {
        const mapped: Service[] = apiServices.map(s => ({
          id: s.id,
            name: s.name,
            price: parseFloat(s.price),
            duration: s.durationMin / 60
        }));
        setServices(mapped);
        return true;
      }
      return false;
    };

    const loadLocalFallback = () => {
      const storageKey = salonId ? `services_salon_${salonId}` : 'services';
      const savedServices = localStorage.getItem(storageKey);
      if (savedServices) {
        try {
          const parsed: Service[] = JSON.parse(savedServices);
          setServices(parsed);
          return;
        } catch (e) {
          console.error('Failed to parse services from localStorage', e);
        }
      }
      const defaultServices: Service[] = [
        { name: 'Herreklip', price: 249, duration: 0.5 },
        { name: 'Dameklip', price: 349, duration: 1 },
        { name: 'Herreklip + Hårfarvning', price: 599, duration: 2 },
        { name: 'Herreklip + Skægtrim', price: 329, duration: 1 },
        { name: 'Herreklip + Styling', price: 399, duration: 1.5 },
        { name: 'Dameklip + Føn', price: 449, duration: 1.5 },
        { name: 'Balayage + Klip', price: 899, duration: 2.5 },
        { name: 'Hårfarvning', price: 599, duration: 2 }
      ];
      setServices(defaultServices);
    };

    // Forsøg API først hvis salonId findes
    if (salonId) {
      if (!mapApiServices() && apiServicesError) {
        // Kun fallback hvis fejl foreligger og ingen data
        loadLocalFallback();
      }
    } else {
      // Ikke salon-specifik -> brug local / default
      loadLocalFallback();
    }
  }, [apiServices, apiServicesError, salonId]);
  
  // Generate time slots every 30 minutes from 8:00 to 18:00
  const timeSlots = [];
  for (let h = 8; h <= 18; h += 0.5) {
    timeSlots.push(h);
  }
  
  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('da-DK', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const getBookingForTime = (time: number) => {
    return bookings.find(b => time >= b.start && time < b.end);
  };
  
  const getBookingIndexForTime = (time: number) => {
    return bookings.findIndex(b => time >= b.start && time < b.end);
  };

  const isTimeSlotAvailable = (startTime: number, duration: number) => {
    const endTime = startTime + duration;
    return !bookings.some(b => 
      (startTime >= b.start && startTime < b.end) ||
      (endTime > b.start && endTime <= b.end) ||
      (startTime <= b.start && endTime >= b.end)
    );
  };

  const handleTimeSlotClick = (time: number) => {
    const booking = getBookingForTime(time);
    if (booking) {
      // If there's a booking, show edit modal
      setEditingBooking(booking);
      setShowEditModal(true);
    } else {
      // If no booking, show create booking modal
      setSelectedTimeSlot(time);
      setShowBookingModal(true);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  
  const isCurrentTimeWithinBusinessHours = () => {
    const currentTime = getCurrentTimePosition();
    return currentTime >= 8.0 && currentTime <= 18.0;
  };
  
  const getCurrentTimePosition = () => {
    // Real time code:
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours + minutes / 60;
    
    // Demo time (commented out):
    // return 15.0;
  };

  const getTimeLinePosition = () => {
    const currentTime = getCurrentTimePosition();
    
    // If outside business hours, don't show the line
    if (currentTime < 8 || currentTime > 18) {
      return -1;
    }
    
    // Mathematical approach: calculate which slot and position within slot
    const timeSlots = [];
    for (let h = 8; h <= 18; h += 0.5) {
      timeSlots.push(h);
    }
    
    // Find the slot index (0-based)
    const slotIndex = Math.floor((currentTime - 8) / 0.5);
    
    // Position within the current slot (0 to 1)
    const positionInSlot = ((currentTime - 8) % 0.5) / 0.5;
    
    // Total position as percentage: (slotIndex + positionInSlot) / totalSlots * 100
    const totalPosition = (slotIndex + positionInSlot) / timeSlots.length;
    
    // Convert to percentage for CSS
    const percentagePosition = totalPosition * 100;
    
    // Debug info
    console.log(`Current time: ${currentTime.toFixed(2)}`);
    console.log(`Slot index: ${slotIndex}, Position in slot: ${positionInSlot.toFixed(3)}`);
    console.log(`Percentage position: ${percentagePosition.toFixed(2)}%`);
    
    return percentagePosition;
  };
  
  return (
    <div style={{ width: '100%' }}>
      {/* Calendar Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24,
        padding: '16px 24px',
        background: isToday ? '#dbeafe' : '#f8fafc',
        borderRadius: 12,
        border: isToday ? '2px solid #3b82f6' : '1px solid #e2e8f0'
      }}>
        <button 
          onClick={() => changeDate(-1)}
          style={{ 
            background: 'white', 
            border: '1px solid #d1d5db', 
            borderRadius: 8, 
            padding: '8px 16px', 
            color: '#374151', 
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500
          }}
        >
          ← Forrige
        </button>
        <div style={{ textAlign: 'center' }}>
          <h2 
            onClick={() => setShowDatePicker(true)}
            style={{ 
              margin: 0, 
              fontSize: 18, 
              fontWeight: 600, 
              textTransform: 'capitalize',
              color: isToday ? '#1e40af' : '#1f2937',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {formatDate(selectedDate)}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
          </h2>
          
          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            gap: 4,
            marginTop: 12,
            justifyContent: 'center'
          }}>
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  background: viewMode === mode ? '#222' : 'white',
                  color: viewMode === mode ? 'white' : '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {mode === 'day' ? 'Dag' : mode === 'week' ? 'Uge' : 'Måned'}
              </button>
            ))}
          </div>
          
          {isToday && (
            <div style={{ 
              fontSize: 12, 
              color: '#3b82f6', 
              fontWeight: 500, 
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4
            }}>
              🔵 I DAG - Nuværende tid: {(() => {
                const currentTime = getCurrentTimePosition();
                const hours = Math.floor(currentTime);
                const minutes = Math.round((currentTime % 1) * 60);
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
              })()}
            </div>
          )}
          {!isToday && (
            <div style={{ 
              fontSize: 12, 
              color: '#6b7280', 
              fontWeight: 500, 
              marginTop: 4
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {selectedDate > new Date() ? 'Fremtid' : 'Fortid'}
              </span>
            </div>
          )}
        </div>
        <button 
          onClick={() => changeDate(1)}
          style={{ 
            background: 'white', 
            border: '1px solid #d1d5db', 
            borderRadius: 8, 
            padding: '8px 16px', 
            color: '#374151', 
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500
          }}
        >
          Næste →
        </button>
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Only show current time indicator in day view */}
        {viewMode === 'day' && isToday && isCurrentTimeWithinBusinessHours() && (
          <div 
            style={{
              position: 'absolute',
              top: `${getTimeLinePosition()}%`,
              left: 0,
              right: 0,
              height: '2px',
              background: '#ef4444',
              zIndex: 10,
              boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)'
            }}
          >
            <div style={{
              position: 'absolute',
              left: '-6px',
              top: '-4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444'
            }} />
            <div style={{
              position: 'absolute',
              right: '-50px',
              top: '-8px',
              fontSize: '11px',
              color: '#ef4444',
              fontWeight: 600,
              background: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid #ef4444'
            }}>
              {(() => {
                const currentTime = getCurrentTimePosition();
                const hours = Math.floor(currentTime);
                const minutes = Math.round((currentTime % 1) * 60);
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
              })()}
            </div>
          </div>
        )}
        
        {/* Render different calendar views */}
        {viewMode === 'day' && (
          <div>
            {timeSlots.map(time => {
              const booking = getBookingForTime(time);
              const bookingIndex = getBookingIndexForTime(time);
              const bookingColor = booking ? getBookingColor(booking, bookingIndex) : null;
              const isBookingStart = booking && time === booking.start;
              const isBookingMiddle = booking && time > booking.start && time < booking.end;
              const isBookingEnd = booking && time + 0.5 >= booking.end && time < booking.end;
              
              return (
                <div 
                  key={time} 
                  onClick={() => handleTimeSlotClick(time)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    height: 61,
                    borderBottom: '1px solid #e5e7eb', 
                    background: booking ? bookingColor?.bg : 'white',
                    padding: '12px 20px',
                    cursor: booking && !isBookingStart ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    borderLeft: booking ? `4px solid ${bookingColor?.border}` : '4px solid transparent',
                    marginBottom: 1,
                    opacity: isBookingMiddle && !isBookingStart ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!booking) {
                      e.currentTarget.style.background = '#f8fafc';
                    } else if (isBookingStart) {
                      e.currentTarget.style.background = bookingColor?.border + '20';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!booking) {
                      e.currentTarget.style.background = 'white';
                    } else {
                      e.currentTarget.style.background = bookingColor?.bg || '#f0f9ff';
                    }
                  }}
                >
                  {/* Time Column */}
                  <div style={{ 
                    width: 80, 
                    textAlign: 'center', 
                    color: '#374151', 
                    fontSize: 14, 
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    background: '#f3f4f6',
                    borderRadius: 6,
                    padding: '6px 8px',
                    lineHeight: '1.2'
                  }}>
                    <div>{formatTime(time)}</div>
                  </div>
                  
                  {/* Content Column */}
                  <div style={{ 
                    flex: 1, 
                    fontSize: 15, 
                    fontWeight: 500, 
                    color: booking ? bookingColor?.text : '#9ca3af',
                    marginLeft: 20,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    {booking ? (
                      <>
                        <div>
                          {isBookingStart ? (
                            <>
                              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 16, color: bookingColor?.text }}>
                                {booking.name}
                              </div>
                              <div style={{ fontSize: 13, color: bookingColor?.text, opacity: 0.8, marginBottom: 2 }}>
                                {booking.service} ({formatTime(booking.start)} - {formatTime(booking.end)})
                              </div>
                              {booking.phone && (
                                <div style={{ fontSize: 12, color: bookingColor?.text, opacity: 0.7 }}>
                                  📞 {booking.phone}
                                </div>
                              )}
                            </>
                          ) : (
                            <div style={{ fontSize: 13, color: '#6b7280', fontStyle: 'italic' }}>
                              ↳ {booking.service} fortsætter...
                            </div>
                          )}
                        </div>
                        {isBookingStart && (
                          <div style={{ 
                            fontSize: 16, 
                            fontWeight: 600, 
                            color: bookingColor?.text,
                            textAlign: 'right'
                          }}>
                            {booking.price},-
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 14, color: '#6b7280' }}>Klik for at booke</span>
                        <span style={{ fontSize: 16, color: '#d1d5db' }}>•••</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {viewMode === 'week' && (
          <WeekView 
            selectedDate={selectedDate}
            allBookings={allBookings}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}
        
        {viewMode === 'month' && (
          <MonthView 
            selectedDate={selectedDate}
            allBookings={allBookings}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setViewMode('day'); // Switch to day view when date is selected
            }}
          />
        )}
      </div>

      {/* Daily Summary */}
      <div style={{ 
        marginTop: 24, 
        padding: 20, 
        background: '#f8fafc', 
        borderRadius: 12,
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 12 
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>
            Dagens omsætning:
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#059669' }}>
            {bookings.reduce((sum, b) => sum + b.price, 0)},-
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: 13, 
          color: '#6b7280' 
        }}>
          <span>Bookinger: {bookings.length}</span>
          <span>Timer booket: {bookings.reduce((sum, b) => sum + (b.end - b.start), 0)} timer</span>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal 
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          selectedTime={selectedTimeSlot}
          services={services}
          onBookingCreated={(newBooking) => {
            const dateKey = selectedDate.toDateString();
            const currentBookings = allBookings[dateKey] || [];
            const updatedBookings = {
              ...allBookings,
              [dateKey]: [...currentBookings, newBooking]
            };
            setAllBookings(updatedBookings);
            // Save to localStorage and dispatch event for live updates
            localStorage.setItem(getStorageKey(), JSON.stringify(updatedBookings));
            window.dispatchEvent(new Event('bookingsUpdated'));
            setShowBookingModal(false);
          }}
          isTimeSlotAvailable={isTimeSlotAvailable}
        />
      )}

      {/* Edit Booking Modal */}
      {showEditModal && editingBooking && (
        <EditBookingModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingBooking(null);
          }}
          booking={editingBooking}
          services={services}
          onBookingUpdated={(oldBooking, updatedBooking) => {
            const dateKey = selectedDate.toDateString();
            const currentBookings = allBookings[dateKey] || [];
            const updatedBookings = currentBookings.map(b => 
              b === oldBooking ? updatedBooking : b
            );
            const updatedAllBookings = {
              ...allBookings,
              [dateKey]: updatedBookings
            };
            setAllBookings(updatedAllBookings);
            // Save to localStorage and dispatch event for live updates
            localStorage.setItem(getStorageKey(), JSON.stringify(updatedAllBookings));
            window.dispatchEvent(new Event('bookingsUpdated'));
            setShowEditModal(false);
            setEditingBooking(null);
          }}
          onBookingDeleted={(booking) => {
            const dateKey = selectedDate.toDateString();
            const currentBookings = allBookings[dateKey] || [];
            const updatedBookings = currentBookings.filter(b => b !== booking);
            const updatedAllBookings = {
              ...allBookings,
              [dateKey]: updatedBookings
            };
            setAllBookings(updatedAllBookings);
            // Save to localStorage and dispatch event for live updates
            localStorage.setItem(getStorageKey(), JSON.stringify(updatedAllBookings));
            window.dispatchEvent(new Event('bookingsUpdated'));
            setShowEditModal(false);
            setEditingBooking(null);
          }}
          isTimeSlotAvailable={(startTime, duration, excludeBooking) => {
            const endTime = startTime + duration;
            return !bookings.some(b => 
              b !== excludeBooking && (
                (startTime >= b.start && startTime < b.end) ||
                (endTime > b.start && endTime <= b.end) ||
                (startTime <= b.start && endTime >= b.end)
              )
            );
          }}
        />
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 24,
            maxWidth: 360,
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1f2937' }}>Vælg dato</h3>
              <button
                onClick={() => setShowDatePicker(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: 4
                }}
              >
                ×
              </button>
            </div>
            
            <DatePickerCalendar 
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setShowDatePicker(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// --- Page ---
interface ClientDashboardProps {
  salonId?: string;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ salonId }) => {
  const { profile, loading, refreshProfile } = useProfile();
  const [maleRevenue, setMaleRevenue] = useState(0);
  const [femaleRevenue, setFemaleRevenue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const handleRevenueUpdate = useCallback((male: number, female: number, total: number) => {
    setMaleRevenue(male);
    setFemaleRevenue(female);
    setTotalRevenue(total);
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `@keyframes fadeInUp { from { opacity:0; transform: translateY(8px);} to {opacity:1; transform: translateY(0);} }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <ClientLayout salonId={salonId}>
      <div style={{ padding: 28, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 34, fontWeight: 700, margin: 0, animation: 'fadeInUp .45s ease-out' }}>Min Portal</h1>
        </div>
        {/* Profile Card */}
        <section style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 4px 14px rgba(0,0,0,0.07)', marginBottom: 36, animation: 'fadeInUp .5s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26 }}>
            <SalonIcon style={{ width: 46, height: 46, color: '#6366f1' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>{profile.salonName}</h2>
              <p style={{ margin: '4px 0 0', fontSize: 15, color: '#666' }}>{profile.type}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 13, letterSpacing: '.5px', textTransform: 'uppercase', color: '#888' }}>Ejer</p>
              <p style={{ margin: 0, fontSize: 15 }}>{profile.ownerName}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 13, letterSpacing: '.5px', textTransform: 'uppercase', color: '#888' }}>Email</p>
              <p style={{ margin: 0, fontSize: 15 }}>{profile.email}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 13, letterSpacing: '.5px', textTransform: 'uppercase', color: '#888' }}>Adresse</p>
              <p style={{ margin: 0, fontSize: 15 }}>{profile.address}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 13, letterSpacing: '.5px', textTransform: 'uppercase', color: '#888' }}>Kunder denne måned</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{profile.clientCount}</p>
            </div>
          </div>
        </section>
        
        {/* Timeline - Full Width */}
        <section style={{ background: '#fff', padding: 32, borderRadius: 20, boxShadow: '0 4px 14px rgba(0,0,0,0.08)', marginBottom: 36, animation: 'fadeInUp .55s ease-out' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>Dagens bookinger</h3>
          <BookingsTimeline onRevenueUpdate={handleRevenueUpdate} salonId={salonId} />
        </section>

        {/* Monthly Revenue Statistics - Full Width Below */}
        <section style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 24, 
          animation: 'fadeInUp .6s ease-out' 
        }}>
          {/* Male Revenue */}
          <div style={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
            padding: 32, 
            borderRadius: 20, 
            color: 'white',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 14, opacity: 0.9, fontWeight: 500 }}>Herre Omsætning</p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{maleRevenue.toLocaleString()} kr.</p>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                width: 56, 
                height: 56, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="5"/>
                  <path d="m20 21-2-2"/>
                  <path d="m22 19-2-2"/>
                  <path d="M14 21v-2a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
              Oktober {new Date().getFullYear()}
            </p>
            <div style={{ 
              position: 'absolute', 
              top: -20, 
              right: -20, 
              width: 100, 
              height: 100, 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '50%' 
            }}></div>
          </div>

          {/* Female Revenue */}
          <div style={{ 
            background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', 
            padding: 32, 
            borderRadius: 20, 
            color: 'white',
            boxShadow: '0 4px 14px rgba(236, 72, 153, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 14, opacity: 0.9, fontWeight: 500 }}>Dame Omsætning</p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{femaleRevenue.toLocaleString()} kr.</p>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                width: 56, 
                height: 56, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="5"/>
                  <path d="M12 13v8"/>
                  <path d="m15 16-6 0"/>
                  <path d="M14 21v-2a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
              Oktober {new Date().getFullYear()}
            </p>
            <div style={{ 
              position: 'absolute', 
              top: -20, 
              right: -20, 
              width: 100, 
              height: 100, 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '50%' 
            }}></div>
          </div>

          {/* Total Revenue */}
          <div style={{ 
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
            padding: 32, 
            borderRadius: 20, 
            color: 'white',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 14, opacity: 0.9, fontWeight: 500 }}>Total Omsætning</p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{totalRevenue.toLocaleString()} kr.</p>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                width: 56, 
                height: 56, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20m5-5l-5-5-5 5"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
              Oktober {new Date().getFullYear()}
            </p>
            <div style={{ 
              position: 'absolute', 
              top: -20, 
              right: -20, 
              width: 100, 
              height: 100, 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '50%' 
            }}></div>
          </div>
        </section>
      </div>
    </ClientLayout>
  );
};

// Date Picker Calendar Component
interface DatePickerCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const adjustedFirstDay = (firstDayOfMonth + 6) % 7; // Adjust for Monday start
  
  const today = new Date();
  const isToday = (date: number) => {
    const compareDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date);
    return compareDate.toDateString() === today.toDateString();
  };
  
  const isSelected = (date: number) => {
    const compareDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date);
    return compareDate.toDateString() === selectedDate.toDateString();
  };
  
  const monthNames = [
    'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'December'
  ];
  
  const dayNames = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
  
  const handleDateClick = (date: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date);
    onDateSelect(newDate);
  };
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  return (
    <div>
      {/* Month Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button
          onClick={goToPreviousMonth}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            color: '#6b7280',
            padding: '8px 12px',
            borderRadius: 4
          }}
        >
          ‹
        </button>
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>
        <button
          onClick={goToNextMonth}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            color: '#6b7280',
            padding: '8px 12px',
            borderRadius: 4
          }}
        >
          ›
        </button>
      </div>
      
      {/* Day Headers */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 4,
        marginBottom: 8
      }}>
        {dayNames.map(day => (
          <div key={day} style={{
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: '#6b7280',
            padding: '8px 4px'
          }}>
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 4
      }}>
        {/* Empty cells for days before month starts */}
        {Array.from({ length: adjustedFirstDay }, (_, i) => (
          <div key={`empty-${i}`} style={{ height: 40 }}></div>
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = i + 1;
          const isCurrentDay = isToday(date);
          const isSelectedDay = isSelected(date);
          
          return (
            <button
              key={date}
              onClick={() => handleDateClick(date)}
              style={{
                height: 40,
                border: 'none',
                borderRadius: 6,
                backgroundColor: isSelectedDay ? '#1e40af' : isCurrentDay ? '#dbeafe' : 'transparent',
                color: isSelectedDay ? '#fff' : isCurrentDay ? '#1e40af' : '#1f2937',
                fontSize: 14,
                fontWeight: isCurrentDay || isSelectedDay ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isSelectedDay) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelectedDay) {
                  e.currentTarget.style.backgroundColor = isCurrentDay ? '#dbeafe' : 'transparent';
                }
              }}
            >
              {date}
            </button>
          );
        })}
      </div>
      
      {/* Quick Navigation */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={() => onDateSelect(new Date())}
          style={{
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            backgroundColor: '#fff',
            color: '#374151',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
          }}
        >
          I dag
        </button>
      </div>
    </div>
  );
};

// Wrapper component that provides ProfileContext with salonId
const ClientDashboardWithProvider: React.FC<ClientDashboardProps> = ({ salonId }) => {
  return (
    <ProfileProvider salonId={salonId}>
      <ClientDashboard salonId={salonId} />
    </ProfileProvider>
  );
};

export default ClientDashboardWithProvider;