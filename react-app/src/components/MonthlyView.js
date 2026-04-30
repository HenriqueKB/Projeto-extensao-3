import React from 'react';
import AppointmentCard from './AppointmentCard';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MonthlyView = ({ appointments, onDelete, onEdit, selectedDate }) => {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.date === dateStr);
  };

  return (
    <div>
      <h2>Agenda Mensal</h2>
      <div className="month-grid">
        {monthDays.map(date => {
          const dayAppointments = getAppointmentsForDate(date);
          const dayName = format(date, "EEE, d 'de' MMM", { locale: ptBR });
          
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

export default MonthlyView;
