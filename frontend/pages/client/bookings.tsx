import React, { useEffect, useState } from 'react';
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
    }, 500);
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
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
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
              padding: 4
            }}
          >
            ×
          </button>
        </div>

        <div style={{ 
          background: '#f0f9ff', 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 24,
          border: '1px solid #e0f2fe'
        }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0369a1' }}>
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
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
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
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
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
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
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
                cursor: 'pointer'
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
                cursor: loading || !customerName || !customerPhone || !selectedService ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Opretter...' : 'Opret booking'}
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

  useEffect(() => {
    if (booking) {
      setCustomerName(booking.name);
      setCustomerPhone(booking.phone || '');
      setSelectedTime(booking.start);
      
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
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#1f2937' }}>
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
                padding: 4
              }}
            >
              ×
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
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Opdaterer...' : 'Opdater booking'}
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
                cursor: 'pointer'
              }}
            >
              Slet
            </button>
          </div>
        </form>
      </div>
    </div>
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
  const adjustedFirstDay = (firstDayOfMonth + 6) % 7;
  
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
          ◄
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
          ►
        </button>
      </div>
      
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
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 4
      }}>
        {Array.from({ length: adjustedFirstDay }, (_, i) => (
          <div key={`empty-${i}`} style={{ height: 40 }}></div>
        ))}
        
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {date}
            </button>
          );
        })}
      </div>
      
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
            cursor: 'pointer'
          }}
        >
          I dag
        </button>
      </div>
    </div>
  );
};

// Main Component
export default function ClientBookings({ salonId }: ClientBookingsProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [editingBooking, setEditingBooking] = useState<BookingSlot | null>(null);
  
  const getStorageKey = () => {
    return salonId ? `allBookings_salon_${salonId}` : 'allBookings';
  };
  
  const [allBookings, setAllBookings] = useState<Record<string, BookingSlot[]>>({});

  useEffect(() => {
    const savedBookings = localStorage.getItem(getStorageKey());
    if (savedBookings) {
      try {
        setAllBookings(JSON.parse(savedBookings));
      } catch (e) {
        console.error('Failed to parse bookings:', e);
        const initialBookings = {
          [new Date().toDateString()]: [
            { start: 9, end: 10, name: 'Marie Hansen', service: 'Dameklip', price: 349, phone: '12345678' },
            { start: 10.5, end: 13, name: 'Peter Nielsen', service: 'Herreklip + Hårfarvning', price: 599, phone: '87654321' },
          ],
        };
        setAllBookings(initialBookings);
        localStorage.setItem(getStorageKey(), JSON.stringify(initialBookings));
      }
    } else {
      const initialBookings = {
        [new Date().toDateString()]: [
          { start: 9, end: 10, name: 'Marie Hansen', service: 'Dameklip', price: 349, phone: '12345678' },
          { start: 10.5, end: 13, name: 'Peter Nielsen', service: 'Herreklip + Hårfarvning', price: 599, phone: '87654321' },
        ],
      };
      setAllBookings(initialBookings);
      localStorage.setItem(getStorageKey(), JSON.stringify(initialBookings));
    }
  }, [salonId]);

  useEffect(() => {
    if (Object.keys(allBookings).length > 0) {
      localStorage.setItem(getStorageKey(), JSON.stringify(allBookings));
    }
  }, [allBookings, salonId]);

  const bookings = allBookings[selectedDate.toDateString()] || [];
  
  const [services, setServices] = useState<Service[]>([]);
  const { data: apiServices } = useServices(salonId ? Number(salonId) : null);
  
  useEffect(() => {
    if (apiServices && apiServices.length > 0) {
      const mapped: Service[] = apiServices.map(s => ({
        id: s.id,
        name: s.name,
        price: parseFloat(s.price),
        duration: s.durationMin / 60
      }));
      setServices(mapped);
    } else {
      const defaultServices: Service[] = [
        { name: 'Herreklip', price: 249, duration: 0.5 },
        { name: 'Dameklip', price: 349, duration: 1 },
        { name: 'Herreklip + Hårfarvning', price: 599, duration: 2 },
        { name: 'Herreklip + Skægtrim', price: 329, duration: 1 },
      ];
      setServices(defaultServices);
    }
  }, [apiServices, salonId]);
  
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

  const isTimeSlotAvailable = (startTime: number, duration: number, excludeBooking?: BookingSlot) => {
    const endTime = startTime + duration;
    return !bookings.some(b => 
      b !== excludeBooking && (
        (startTime >= b.start && startTime < b.end) ||
        (endTime > b.start && endTime <= b.end) ||
        (startTime <= b.start && endTime >= b.end)
      )
    );
  };

  const handleTimeSlotClick = (time: number) => {
    const booking = getBookingForTime(time);
    if (booking) {
      setEditingBooking(booking);
      setShowEditModal(true);
    } else {
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

  return (
    <ClientLayout salonId={salonId}>
      <div style={{ padding: 28, maxWidth: 1400, margin: '0 auto' }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, marginBottom: 32 }}>Booking Kalender</h1>
        
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
                borderRadius: '6px'
              }}
            >
              {formatDate(selectedDate)}
            </h2>
            
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
                marginTop: 8
              }}>
                📅 I DAG
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

        {/* Calendar Views */}
        <div style={{ background: '#fff', padding: 32, borderRadius: 20, boxShadow: '0 4px 14px rgba(0,0,0,0.08)', marginBottom: 36 }}>
          {viewMode === 'day' && (
            <div>
              {timeSlots.map(time => {
                const booking = getBookingForTime(time);
                const isBookingStart = booking && time === booking.start;
                
                return (
                  <div 
                    key={time} 
                    onClick={() => handleTimeSlotClick(time)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      height: 61,
                      borderBottom: '1px solid #e5e7eb', 
                      background: booking ? '#f0f9ff' : 'white',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderLeft: booking ? `4px solid #3b82f6` : '4px solid transparent',
                      marginBottom: 1
                    }}
                  >
                    <div style={{ 
                      width: 80, 
                      textAlign: 'center', 
                      color: '#374151', 
                      fontSize: 14, 
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      background: '#f3f4f6',
                      borderRadius: 6,
                      padding: '6px 8px'
                    }}>
                      {formatTime(time)}
                    </div>
                    
                    <div style={{ 
                      flex: 1, 
                      fontSize: 15, 
                      fontWeight: 500, 
                      color: booking ? '#0369a1' : '#9ca3af',
                      marginLeft: 20,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      {booking && isBookingStart ? (
                        <>
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 16 }}>
                              {booking.name}
                            </div>
                            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>
                              {booking.service} ({formatTime(booking.start)} - {formatTime(booking.end)})
                            </div>
                            {booking.phone && (
                              <div style={{ fontSize: 12, opacity: 0.7 }}>
                                📞 {booking.phone}
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 600 }}>
                            {booking.price},-
                          </div>
                        </>
                      ) : booking ? (
                        <div style={{ fontSize: 13, fontStyle: 'italic', color: '#6b7280' }}>
                          ↓ {booking.service} fortsætter...
                        </div>
                      ) : (
                        <>
                          <span style={{ fontSize: 14, color: '#6b7280' }}>Klik for at booke</span>
                          <span style={{ fontSize: 16, color: '#d1d5db' }}>···</span>
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
                setViewMode('day');
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
            <span>Timer booket: {bookings.reduce((sum, b) => sum + (b.end - b.start), 0).toFixed(1)} timer</span>
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
              setAllBookings({
                ...allBookings,
                [dateKey]: [...currentBookings, newBooking]
              });
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
              setAllBookings({
                ...allBookings,
                [dateKey]: updatedBookings
              });
              setShowEditModal(false);
              setEditingBooking(null);
            }}
            onBookingDeleted={(booking) => {
              const dateKey = selectedDate.toDateString();
              const currentBookings = allBookings[dateKey] || [];
              const updatedBookings = currentBookings.filter(b => b !== booking);
              setAllBookings({
                ...allBookings,
                [dateKey]: updatedBookings
              });
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
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
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
