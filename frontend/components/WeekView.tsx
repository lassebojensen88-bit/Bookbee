import React, { useState, useEffect } from 'react';

interface BookingSlot {
  start: number;
  end: number;
  name: string;
  service: string;
  price: number;
  phone?: string;
}

interface WeekViewProps {
  selectedDate: Date;
  allBookings: Record<string, BookingSlot[]>;
  onTimeSlotClick: (time: number, date: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ selectedDate, allBookings, onTimeSlotClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);
  // Get the start of the week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  const timeSlots = [];
  for (let hour = 8; hour <= 17.5; hour += 0.5) {
    timeSlots.push(hour);
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('da-DK', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    });
  };

  const getBookingForTimeAndDate = (time: number, date: Date) => {
    const dateKey = date.toDateString();
    const dayBookings = allBookings[dateKey] || [];
    return dayBookings.find(booking => 
      time >= booking.start && time < booking.end
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Calculate current time position for the red line
  const getCurrentTimeDecimal = () => {
    const now = currentTime;
    return now.getHours() + now.getMinutes() / 60;
  };

  const getCurrentTimePosition = () => {
    const currentDecimal = getCurrentTimeDecimal();
    const startHour = 8;
    const endHour = 17.5;
    
    if (currentDecimal < startHour || currentDecimal > endHour) {
      return null; // Don't show line outside business hours
    }
    
    // Calculate position relative to the grid
    const totalSlots = timeSlots.length;
    const slotHeight = 41; // 40px min height + 1px gap
    const position = ((currentDecimal - startHour) / 0.5) * slotHeight;
    
    return position;
  };

  const shouldShowCurrentTimeLine = (day: Date) => {
    return isToday(day);
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
      {/* Week header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px repeat(7, 1fr)',
        gap: 1,
        marginBottom: 1,
        background: '#f8fafc'
      }}>
        <div style={{ padding: '12px 8px', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
          Tid
        </div>
        {weekDays.map((day, index) => (
          <div 
            key={index}
            style={{
              padding: '12px 8px',
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'center',
              background: isToday(day) ? '#dbeafe' : '#f8fafc',
              color: isToday(day) ? '#1e40af' : '#374151',
              border: isToday(day) ? '2px solid #3b82f6' : '1px solid #e2e8f0'
            }}
          >
            {formatDate(day)}
          </div>
        ))}
      </div>

      {/* Time slots grid container */}
      <div style={{ position: 'relative' }}>
        {/* Current time indicator lines */}
        {weekDays.map((day, dayIndex) => {
          if (!shouldShowCurrentTimeLine(day)) return null;
          const timePosition = getCurrentTimePosition();
          if (timePosition === null) return null;

          return (
            <div
              key={`timeline-${dayIndex}`}
              style={{
                position: 'absolute',
                left: `calc(80px + ${dayIndex} * (100% - 80px) / 7)`,
                width: `calc((100% - 80px) / 7)`,
                top: timePosition + 50, // Offset for header height
                height: 2,
                background: '#ef4444',
                zIndex: 10,
                pointerEvents: 'none',
                boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)'
              }}
            >
              {/* Time label on the line */}
              <div style={{
                position: 'absolute',
                left: -70,
                top: -10,
                background: '#ef4444',
                color: 'white',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {formatTime(getCurrentTimeDecimal())}
              </div>
            </div>
          );
        })}

        {/* Time slots */}
        {timeSlots.map(time => (
          <div
            key={time}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px repeat(7, 1fr)',
              gap: 1,
              marginBottom: 1,
              minHeight: 40
            }}
          >
            {/* Time column */}
            <div style={{
              padding: '8px',
              fontSize: 12,
              fontWeight: 600,
              textAlign: 'center',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {formatTime(time)}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => {
              const booking = getBookingForTimeAndDate(time, day);
              const isBookingStart = booking && time === booking.start;
              
              return (
                <div
                  key={dayIndex}
                  onClick={() => onTimeSlotClick(time, day)}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #e5e7eb',
                    background: booking ? '#f0f9ff' : 'white',
                    cursor: 'pointer',
                    minHeight: 36,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 12,
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!booking) {
                      e.currentTarget.style.background = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!booking) {
                      e.currentTarget.style.background = 'white';
                    }
                  }}
                >
                  {isBookingStart && (
                    <div style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: '#1e40af',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {booking.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;