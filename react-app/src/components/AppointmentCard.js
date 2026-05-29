import React, { useState } from 'react';
import { CONSULTATION_TYPES } from '../constants';

const AppointmentCard = ({ appointment, onDelete, onEdit, onCancel }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const consultationType = CONSULTATION_TYPES.find((type) => type.value === appointment.consultationType);
  const isCancelled = appointment.status === 'cancelada';
  const canCancel = !isCancelled && typeof onCancel === 'function';

  const handleDelete = () => {
    onDelete(appointment.id);
    setShowDeleteModal(false);
  };

  const handleCancel = () => {
    onCancel(appointment);
    setShowCancelModal(false);
  };

  return (
    <>
      <div className={`appointment ${isCancelled ? 'appointment--cancelled' : ''}`}>
        <div className="appointment-body">
          <div className="appointment-time">
            {appointment.time || appointment.startTime} - {appointment.duration || appointment.durationMinutes}min
          </div>
          <div className="appointment-patient">{appointment.patientName}</div>
          <div className="appointment-patient">
            {consultationType ? consultationType.label : appointment.consultationType} | R${' '}
            {Number(appointment.price).toFixed(2)}
          </div>
          <div className="appointment-notes">
            <span className={`status-badge status-${appointment.status}`}>{appointment.status}</span>
            {' '}| {appointment.paymentMethod}
          </div>
          {appointment.patientRecord && (
            <div className="appointment-notes">
              {appointment.patientRecord.substring(0, 50)}
              {appointment.patientRecord.length > 50 ? '...' : ''}
            </div>
          )}
        </div>

        <div className="appointment-actions">
          {canCancel && (
            <button
              className="btn btn-warning appointment-action-unmark"
              onClick={() => setShowCancelModal(true)}
              type="button"
            >
              Desmarcar paciente
            </button>
          )}
          {isCancelled && (
            <span className="appointment-unmarked-label">Paciente desmarcado</span>
          )}
          <button className="btn btn-light appointment-action-edit" onClick={() => onEdit(appointment)} type="button">
            Editar
          </button>
          <button
            className="btn btn-danger appointment-action-delete"
            onClick={() => setShowDeleteModal(true)}
            type="button"
          >
            Excluir
          </button>
        </div>
      </div>

      {showCancelModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <button className="close-modal" onClick={() => setShowCancelModal(false)} type="button">
              ×
            </button>
            <h2>Desmarcar paciente</h2>
            <p>
              A consulta de <strong>{appointment.patientName}</strong> em{' '}
              <strong>{appointment.date}</strong> às <strong>{appointment.time || appointment.startTime}</strong>{' '}
              será marcada como <strong>cancelada</strong>. O horário continua no histórico; a consulta deixa de contar
              como agendada ativa.
            </p>
            <div className="modal-actions">
              <button className="btn btn-warning" onClick={handleCancel} type="button">
                Confirmar desmarcação
              </button>
              <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)} type="button">
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <button className="close-modal" onClick={() => setShowDeleteModal(false)} type="button">
              ×
            </button>
            <h2>Confirmar exclusão</h2>
            <p>Tem certeza que deseja excluir esta consulta permanentemente?</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={handleDelete} type="button">
                Excluir
              </button>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)} type="button">
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentCard;
