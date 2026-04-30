import React, { useState } from 'react';
import { CONSULTATION_TYPES } from '../constants';

const AppointmentCard = ({ appointment, onDelete, onEdit }) => {
  const [showModal, setShowModal] = useState(false);
  const consultationType = CONSULTATION_TYPES.find((type) => type.value === appointment.consultationType);

  const handleDelete = () => {
    onDelete(appointment.id);
    setShowModal(false);
  };

  return (
    <>
      <div className="appointment">
        <button 
          className="delete-btn" 
          onClick={() => setShowModal(true)}
        >
          ×
        </button>
        <button
          className="edit-btn"
          onClick={() => onEdit(appointment)}
        >
          Editar
        </button>
        <div className="appointment-time">
          {appointment.time || appointment.startTime} - {appointment.duration || appointment.durationMinutes}min
        </div>
        <div className="appointment-patient">
          {appointment.patientName}
        </div>
        <div className="appointment-patient">
          {consultationType ? consultationType.label : appointment.consultationType} | R$ {Number(appointment.price).toFixed(2)}
        </div>
        <div className="appointment-notes">
          {appointment.status} | {appointment.paymentMethod}
        </div>
        {appointment.patientRecord && (
          <div className="appointment-notes">
            {appointment.patientRecord.substring(0, 50)}
            {appointment.patientRecord.length > 50 ? '...' : ''}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <button 
              className="close-modal" 
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2>Confirmar Exclusão</h2>
            <p>Tem certeza que deseja excluir esta consulta?</p>
            <div style={{ marginTop: '20px' }}>
              <button 
                className="btn btn-danger" 
                onClick={handleDelete}
              >
                Excluir
              </button>
              <button 
                className="btn" 
                style={{ marginLeft: '10px', background: '#6c757d', color: 'white' }}
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentCard;
