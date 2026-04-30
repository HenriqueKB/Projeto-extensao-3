import React, { useState } from 'react';
import { format } from 'date-fns';
import { CONSULTATION_TYPES, PAYMENT_METHODS, APPOINTMENT_STATUS } from '../constants';

const AppointmentForm = ({ onAdd, selectedDate }) => {
  const [formData, setFormData] = useState({
    date: format(selectedDate, 'yyyy-MM-dd'),
    time: '',
    duration: '50',
    patientName: '',
    patientPhone: '',
    consultationType: 'psicoterapia',
    price: 150,
    paymentMethod: 'pix',
    status: 'agendada',
    chargeFirstSessionDeposit: true,
    isRecurringWeekly: false,
    patientRecord: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const checked = e.target.checked;

    if (name === 'consultationType') {
      const selectedType = CONSULTATION_TYPES.find((type) => type.value === value);
      setFormData((prev) => ({
        ...prev,
        consultationType: value,
        price: selectedType ? selectedType.defaultPrice : prev.price,
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: '',
      duration: '50',
      patientName: '',
      patientPhone: '',
      consultationType: 'psicoterapia',
      price: 150,
      paymentMethod: 'pix',
      status: 'agendada',
      chargeFirstSessionDeposit: true,
      isRecurringWeekly: false,
      patientRecord: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const created = onAdd({
      ...formData,
      price: Number(formData.price),
      duration: Number(formData.duration),
    });

    Promise.resolve(created).then((success) => {
      if (success) {
        resetForm();
      }
    });
  };

  return (
    <div className="appointment-form">
      <h2>Adicionar Nova Consulta</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Data</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="time">Horário</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="duration">Duração (minutos)</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="50"
              step="5"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="patientName">Nome do Paciente</label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientPhone">Telefone do Paciente</label>
            <input
              type="tel"
              id="patientPhone"
              name="patientPhone"
              value={formData.patientPhone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="consultationType">Tipo de Consulta</label>
            <select
              id="consultationType"
              name="consultationType"
              value={formData.consultationType}
              onChange={handleChange}
            >
              {CONSULTATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Preço (R$)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="paymentMethod">Método de Pagamento</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              {APPOINTMENT_STATUS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="chargeFirstSessionDeposit"
                checked={formData.chargeFirstSessionDeposit}
                onChange={handleChange}
              />
              Cobrar 50% no primeiro agendamento
            </label>
            <label>
              <input
                type="checkbox"
                name="isRecurringWeekly"
                checked={formData.isRecurringWeekly}
                onChange={handleChange}
              />
              Sessão fixa semanal
            </label>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="patientRecord">Prontuário do Paciente</label>
          <textarea
            id="patientRecord"
            name="patientRecord"
            rows="4"
            placeholder="Descreva informações relevantes sobre o paciente..."
            value={formData.patientRecord}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">Adicionar Consulta</button>
      </form>
    </div>
  );
};

export default AppointmentForm;
