import React from 'react';
import AppointmentCard from './AppointmentCard';

const DailyView = ({ appointments, onDelete, onEdit, selectedDate }) => {
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const getSlotAppointments = (time) => {
    return appointments.filter(apt => {
      const aptTime = apt.time || apt.startTime;
      const [aptHour, aptMinute] = aptTime.split(':').map(Number);
      const [slotHour, slotMinute] = time.split(':').map(Number);
      const duration = parseInt(apt.duration || apt.durationMinutes, 10);
      
      const aptStartMinutes = aptHour * 60 + aptMinute;
      const aptEndMinutes = aptStartMinutes + duration;
      const slotMinutes = slotHour * 60 + slotMinute;
      
      return slotMinutes >= aptStartMinutes && slotMinutes < aptEndMinutes;
    });
  };

  const timeSlots = generateTimeSlots();

  return (
    <div>
      <h2>Agenda de Hoje</h2>
      <div className="schedule-grid">
        {timeSlots.map(time => (
          <React.Fragment key={time}>
            <div className="time-slot">{time}</div>
            <div className="appointment-slot">
              {getSlotAppointments(time).length > 0 ? (
                getSlotAppointments(time).map(apt => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))
              ) : (
                <div className="empty-slot">Livre</div>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default DailyView;
