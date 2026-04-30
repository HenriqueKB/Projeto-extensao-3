import React, { useState, useEffect } from 'react';
import './App.css';
import DailyView from './components/DailyView';
import WeeklyView from './components/WeeklyView';
import MonthlyView from './components/MonthlyView';
import AppointmentForm from './components/AppointmentForm';
import EditAppointmentModal from './components/EditAppointmentModal';
import PatientList from './components/PatientList';
import { format } from 'date-fns';
import {
  fetchPatients,
  createPatient,
  fetchAppointments,
  createAppointment,
  updateAppointmentById,
  deleteAppointmentById,
  fetchPatientHistoryById,
} from './services/api';

function App() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [activeView, setActiveView] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [historyByPatient, setHistoryByPatient] = useState({});

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const [patientsData, appointmentsData] = await Promise.all([
        fetchPatients(),
        fetchAppointments(),
      ]);
      setPatients(patientsData);
      setAppointments(appointmentsData);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addAppointment = async (appointment) => {
    try {
      setErrorMessage('');

      let patient = patients.find(
        (item) =>
          item.phone.trim() === appointment.patientPhone.trim() &&
          item.name.trim().toLowerCase() === appointment.patientName.trim().toLowerCase()
      );

      if (!patient) {
        patient = await createPatient({
          name: appointment.patientName,
          phone: appointment.patientPhone,
          defaultConsultationType: appointment.consultationType,
          customPrice: appointment.price,
        });
      }

      const payload = {
        date: appointment.date,
        startTime: appointment.time,
        durationMinutes: appointment.duration,
        patientId: patient.id,
        consultationType: appointment.consultationType,
        price: appointment.price,
        status: appointment.status,
        paymentMethod: appointment.paymentMethod,
        summary: appointment.patientRecord,
        chargeFirstSessionDeposit: appointment.chargeFirstSessionDeposit,
        isRecurringWeekly: appointment.isRecurringWeekly,
      };

      await createAppointment(payload);
      await loadData();
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    }
  };

  const deleteAppointment = async (id) => {
    try {
      setErrorMessage('');
      await deleteAppointmentById(id);
      await loadData();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const editAppointment = async (id, updates) => {
    try {
      setErrorMessage('');
      await updateAppointmentById(id, updates);
      await loadData();
      setEditingAppointment(null);
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    }
  };

  const loadPatientHistory = async (patientId) => {
    try {
      setErrorMessage('');
      const result = await fetchPatientHistoryById(patientId);
      setHistoryByPatient((prev) => ({
        ...prev,
        [patientId]: result.appointments || [],
      }));
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments
      .filter((apt) => apt.date === dateStr)
      .map((appointment) => decorateAppointmentForView(appointment, patients));
  };

  const financialSummary = appointments.reduce(
    (acc, appointment) => {
      const price = Number(appointment.price || 0);
      const deposit = appointment.chargeFirstSessionDeposit ? price * 0.5 : 0;

      if (appointment.status === 'presente') {
        acc.expectedRevenue += price;
      }
      if (appointment.status === 'cancelada') {
        acc.cancellationFees += price * 0.5;
      }
      acc.depositTotal += deposit;
      return acc;
    },
    { expectedRevenue: 0, depositTotal: 0, cancellationFees: 0 }
  );

  const renderView = () => {
    switch (activeView) {
      case 'daily':
        return <DailyView 
          appointments={getAppointmentsForDate(selectedDate)}
          onDelete={deleteAppointment}
          onEdit={setEditingAppointment}
          selectedDate={selectedDate}
        />;
      case 'weekly':
        return <WeeklyView 
          appointments={appointments.map((appointment) => decorateAppointmentForView(appointment, patients))}
          onDelete={deleteAppointment}
          onEdit={setEditingAppointment}
          selectedDate={selectedDate}
        />;
      case 'monthly':
        return <MonthlyView 
          appointments={appointments.map((appointment) => decorateAppointmentForView(appointment, patients))}
          onDelete={deleteAppointment}
          onEdit={setEditingAppointment}
          selectedDate={selectedDate}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Agenda Psicológica</h1>
        <p>Sistema de Gerenciamento de Consultas</p>
      </header>

      <div className="view-tabs">
        <button 
          className={`view-tab ${activeView === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveView('daily')}
        >
          Diário
        </button>
        <button 
          className={`view-tab ${activeView === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveView('weekly')}
        >
          Semanal
        </button>
        <button 
          className={`view-tab ${activeView === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveView('monthly')}
        >
          Mensal
        </button>
      </div>

      <main className="main-content">
        <AppointmentForm onAdd={addAppointment} selectedDate={selectedDate} />
        {isLoading && <div className="notice">Carregando dados da API...</div>}
        {errorMessage && <div className="notice notice-error">{errorMessage}</div>}
        <section className="financial-panel">
          <h2>Resumo Financeiro (MVP)</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <span>Receita prevista</span>
              <strong>R$ {financialSummary.expectedRevenue.toFixed(2)}</strong>
            </div>
            <div className="metric-card">
              <span>Sinal 50% acumulado</span>
              <strong>R$ {financialSummary.depositTotal.toFixed(2)}</strong>
            </div>
            <div className="metric-card">
              <span>Multa por cancelamento</span>
              <strong>R$ {financialSummary.cancellationFees.toFixed(2)}</strong>
            </div>
          </div>
        </section>
        <PatientList patients={patients} historyByPatient={historyByPatient} onLoadHistory={loadPatientHistory} />
        {renderView()}
      </main>
      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onSave={(updates) => editAppointment(editingAppointment.id, updates)}
        />
      )}
    </div>
  );
}

function decorateAppointmentForView(appointment, patients) {
  const patient = patients.find((item) => item.id === appointment.patientId);
  return {
    ...appointment,
    time: appointment.startTime,
    duration: appointment.durationMinutes,
    patientName: patient ? patient.name : "Paciente",
    patientPhone: patient ? patient.phone : "",
    patientRecord: appointment.summary || "",
  };
}

export default App;
