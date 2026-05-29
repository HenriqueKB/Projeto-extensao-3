import React from 'react';
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfMonth,
  endOfMonth,
  isSameMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CalendarToolbar = ({
  selectedDate,
  onDateChange,
  activeView,
  appointmentCount = 0,
}) => {
  const monthLabel = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
  const year = selectedDate.getFullYear();

  const goToday = () => onDateChange(new Date());

  const goPrev = () => {
    if (activeView === 'yearly') {
      onDateChange(subYears(selectedDate, 1));
      return;
    }
    onDateChange(subMonths(selectedDate, 1));
  };

  const goNext = () => {
    if (activeView === 'yearly') {
      onDateChange(addYears(selectedDate, 1));
      return;
    }
    onDateChange(addMonths(selectedDate, 1));
  };

  const handleYearInput = (e) => {
    const value = Number(e.target.value);
    if (!Number.isFinite(value) || value < 1970 || value > 2100) {
      return;
    }
    onDateChange(new Date(value, selectedDate.getMonth(), 1));
  };

  const periodHint =
    activeView === 'yearly'
      ? `${appointmentCount} consulta(s) no ano`
      : `${appointmentCount} consulta(s) no período`;

  return (
    <div className="calendar-toolbar">
      <div className="calendar-toolbar-nav">
        <button type="button" className="btn btn-secondary" onClick={goPrev}>
          {activeView === 'yearly' ? '◀ Ano anterior' : '◀ Mês anterior'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={goToday}>
          Hoje
        </button>
        <button type="button" className="btn btn-secondary" onClick={goNext}>
          {activeView === 'yearly' ? 'Próximo ano ▶' : 'Próximo mês ▶'}
        </button>
      </div>

      <div className="calendar-toolbar-period">
        {activeView === 'yearly' ? (
          <div className="calendar-year-picker">
            <label htmlFor="calendar-year">Ano</label>
            <input
              id="calendar-year"
              type="number"
              min="1970"
              max="2100"
              value={year}
              onChange={handleYearInput}
            />
          </div>
        ) : (
          <h2 className="calendar-period-title">{monthLabel}</h2>
        )}
        <span className="calendar-period-hint">{periodHint}</span>
      </div>

      {activeView !== 'yearly' && (
        <div className="calendar-quick-months">
          {[-2, -1, 0, 1, 2].map((offset) => {
            const monthDate = addMonths(startOfMonth(selectedDate), offset);
            const isActive = isSameMonth(monthDate, selectedDate);
            const label = format(monthDate, 'MMM/yy', { locale: ptBR });
            return (
              <button
                key={offset}
                type="button"
                className={`calendar-month-chip ${isActive ? 'active' : ''} ${isSameMonth(monthDate, new Date()) ? 'today-month' : ''}`}
                onClick={() => onDateChange(monthDate)}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export function filterAppointmentsInMonth(appointments, date) {
  const start = format(startOfMonth(date), 'yyyy-MM-dd');
  const end = format(endOfMonth(date), 'yyyy-MM-dd');
  return appointments.filter((apt) => apt.date >= start && apt.date <= end);
}

export function filterAppointmentsInYear(appointments, date) {
  const year = date.getFullYear();
  return appointments.filter((apt) => apt.date.startsWith(String(year)));
}

export default CalendarToolbar;
