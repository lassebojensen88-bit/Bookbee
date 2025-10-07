import React from 'react';

interface BookingSlot {
  start: number;
  end: number;
  name: string;
  service: string;
  price: number;
  phone?: string;
}

interface MonthViewProps {
  selectedDate: Date;
  allBookings: Record<string, BookingSlot[]>;
  onDateSelect?: (date: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ selectedDate, allBookings, onDateSelect }) => {
  const getMonthCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from Monday of the week containing the first day
    const startDate = new Date(firstDay);
    const day = startDate.getDay();
    startDate.setDate(startDate.getDate() - (day === 0 ? 6 : day - 1));
    
    // Generate 6 weeks (42 days) to fill the calendar grid
    const calendar = [];
    const currentDate = new Date(startDate);
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        weekDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      calendar.push(weekDays);
    }
    
    return calendar;
  };

  const monthCalendar = getMonthCalendar(selectedDate);
  const currentMonth = selectedDate.getMonth();
  
  const formatDate = (date: Date) => {
    return date.getDate().toString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  const getBookingCount = (date: Date) => {
    const dateKey = date.toDateString();
    const dayBookings = allBookings[dateKey] || [];
    return dayBookings.length;
  };

  const getTotalRevenue = (date: Date) => {
    const dateKey = date.toDateString();
    const dayBookings = allBookings[dateKey] || [];
    return dayBookings.reduce((sum, booking) => sum + booking.price, 0);
  };

  const weekdays = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

  return (
    <div style={{ width: '100%' }}>
      {/* Month header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 1,
        marginBottom: 8
      }}>
        {weekdays.map((day) => (
          <div
            key={day}
            style={{
              padding: '12px 8px',
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'center',
              background: '#f8fafc',
              color: '#374151'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {monthCalendar.map((week, weekIndex) => (
        <div
          key={weekIndex}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
            marginBottom: 1
          }}
        >
          {week.map((date, dayIndex) => {
            const bookingCount = getBookingCount(date);
            const revenue = getTotalRevenue(date);
            const isCurrentMonthDate = isCurrentMonth(date);
            const isTodayDate = isToday(date);
            
            return (
              <div
                key={dayIndex}
                onClick={() => onDateSelect?.(date)}
                style={{
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  background: isTodayDate ? '#dbeafe' : 'white',
                  cursor: onDateSelect ? 'pointer' : 'default',
                  minHeight: 80,
                  opacity: isCurrentMonthDate ? 1 : 0.3,
                  position: 'relative',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (onDateSelect && !isTodayDate) {
                    e.currentTarget.style.background = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (onDateSelect && !isTodayDate) {
                    e.currentTarget.style.background = 'white';
                  }
                }}
              >
                {/* Date number */}
                <div style={{
                  fontSize: 14,
                  fontWeight: isTodayDate ? 700 : 500,
                  color: isTodayDate ? '#1e40af' : isCurrentMonthDate ? '#111827' : '#9ca3af',
                  marginBottom: 4
                }}>
                  {formatDate(date)}
                </div>

                {/* Booking indicators */}
                {isCurrentMonthDate && bookingCount > 0 && (
                  <div style={{ fontSize: 10, color: '#6b7280' }}>
                    <div style={{
                      background: '#f0f9ff',
                      padding: '2px 4px',
                      borderRadius: 4,
                      marginBottom: 2,
                      border: '1px solid #7dd3fc'
                    }}>
                      📅 {bookingCount} booking{bookingCount > 1 ? 'er' : ''}
                    </div>
                    {revenue > 0 && (
                      <div style={{
                        background: '#f0fdf4',
                        padding: '2px 4px',
                        borderRadius: 4,
                        color: '#166534',
                        fontWeight: 500,
                        border: '1px solid #86efac'
                      }}>
                        {revenue} kr
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MonthView;