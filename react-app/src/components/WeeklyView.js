import React from 'react';
import AppointmentCard from './AppointmentCard';
import { format, startOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const WeeklyView = ({ appointments, onDelete, onEdit, selectedDate }) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      days.push(date);
    }
    return days;
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.date === dateStr);
  };

  const weekDays = getWeekDays();

  return (
    <div>
      <h2>Agenda Semanal</h2>
      <div className="week-grid">
        {weekDays.map(date => {
          const dayAppointments = getAppointmentsForDate(date);
          const dayName = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
          
          return (
            <div key={date.toISOString()} className="day-card">
              <h3>{dayName}</h3>
              {dayAppointments.length > 0 ? (
                dayAppointments.map(apt => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))
              ) : (
                <div className="empty-slot">Nenhuma consulta</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyView;
