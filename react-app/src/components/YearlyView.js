import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const YearlyView = ({
  appointments,
  selectedDate,
  onSelectMonth,
  onSelectDay,
}) => {
  const year = selectedDate.getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  const getAppointmentsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter((apt) => apt.date === dateStr);
  };

  const getMonthStats = (monthDate) => {
    const start = format(startOfMonth(monthDate), 'yyyy-MM-dd');
    const end = format(endOfMonth(monthDate), 'yyyy-MM-dd');
    const monthAppointments = appointments.filter(
      (apt) => apt.date >= start && apt.date <= end
    );
    const cancelled = monthAppointments.filter((a) => a.status === 'cancelada').length;
    const active = monthAppointments.length - cancelled;
    return { total: monthAppointments.length, active, cancelled, list: monthAppointments };
  };

  const renderMiniMonth = (monthDate) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const leadingBlanks = getDay(monthStart);

    return (
      <div className="year-mini-grid">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="year-mini-weekday">
            {label}
          </span>
        ))}
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <span key={`blank-${i}`} className="year-mini-day year-mini-day--empty" />
        ))}
        {days.map((day) => {
          const dayAppointments = getAppointmentsForDate(day);
          const hasActive = dayAppointments.some((a) => a.status !== 'cancelada');
          const hasCancelled = dayAppointments.some((a) => a.status === 'cancelada');
          const isSelected = isSameDay(day, selectedDate);

          let dayClass = 'year-mini-day';
          if (dayAppointments.length > 0) {
            dayClass += hasActive ? ' year-mini-day--busy' : ' year-mini-day--cancelled-only';
          }
          if (hasCancelled && hasActive) {
            dayClass += ' year-mini-day--mixed';
          }
          if (isSelected) {
            dayClass += ' year-mini-day--selected';
          }

          return (
            <button
              key={day.toISOString()}
              type="button"
              className={dayClass}
              title={
                dayAppointments.length
                  ? `${dayAppointments.length} consulta(s) em ${format(day, 'dd/MM/yyyy')}`
                  : format(day, 'dd/MM/yyyy')
              }
              onClick={() => onSelectDay(day)}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="yearly-view">
      <h2>Calendário anual — {year}</h2>
      <p className="yearly-view-hint">
        Visualize meses passados e futuros. Clique em um dia para abrir a agenda diária ou em
        &quot;Ver mês&quot; para o detalhamento mensal.
      </p>
      <div className="year-grid">
        {months.map((monthDate) => {
          const stats = getMonthStats(monthDate);
          const monthName = format(monthDate, 'MMMM', { locale: ptBR });

          return (
            <article key={monthDate.getMonth()} className="year-month-card">
              <header className="year-month-card-header">
                <h3>{monthName}</h3>
                <span className="year-month-count">
                  {stats.total === 0
                    ? 'Sem consultas'
                    : `${stats.total} consulta(s) · ${stats.active} ativa(s)`}
                </span>
              </header>
              {renderMiniMonth(monthDate)}
              {stats.total > 0 && (
                <ul className="year-month-summary">
                  {stats.list.slice(0, 3).map((apt) => (
                    <li key={apt.id}>
                      {format(new Date(`${apt.date}T12:00:00`), 'dd/MM')} {apt.startTime || apt.time}{' '}
                      — {apt.patientName}{' '}
                      <span className={`status-badge status-${apt.status}`}>{apt.status}</span>
                    </li>
                  ))}
                  {stats.list.length > 3 && (
                    <li className="year-month-more">+ {stats.list.length - 3} outra(s)</li>
                  )}
                </ul>
              )}
              <button
                type="button"
                className="btn btn-secondary year-month-open"
                onClick={() => onSelectMonth(monthDate)}
              >
                Ver mês
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default YearlyView;
