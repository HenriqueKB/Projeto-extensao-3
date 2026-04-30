import React, { useState } from "react";
import { format } from "date-fns";

const PatientList = ({ patients, historyByPatient, onLoadHistory }) => {
  const [expandedPatientId, setExpandedPatientId] = useState("");

  const handleToggle = async (patientId) => {
    if (expandedPatientId === patientId) {
      setExpandedPatientId("");
      return;
    }

    setExpandedPatientId(patientId);
    if (!historyByPatient[patientId]) {
      await onLoadHistory(patientId);
    }
  };

  return (
    <section className="patients-panel">
      <h2>Lista de pacientes</h2>
      {patients.length === 0 ? (
        <div className="empty-slot">Nenhum paciente cadastrado.</div>
      ) : (
        <div className="patient-list">
          {patients.map((patient) => {
            const history = historyByPatient[patient.id] || [];
            return (
              <div key={patient.id} className="patient-card">
                <div className="patient-header">
                  <div>
                    <strong>{patient.name}</strong>
                    <div>{patient.phone}</div>
                  </div>
                  <button className="btn btn-secondary" onClick={() => handleToggle(patient.id)}>
                    {expandedPatientId === patient.id ? "Ocultar historico" : "Ver historico"}
                  </button>
                </div>

                {expandedPatientId === patient.id && (
                  <div className="patient-history">
                    {history.length === 0 ? (
                      <div className="empty-slot">Sem consultas registradas.</div>
                    ) : (
                      history.map((appointment) => (
                        <div key={appointment.id} className="history-item">
                          {format(new Date(`${appointment.date}T00:00:00`), "dd/MM/yyyy")} - {appointment.startTime} |{" "}
                          {appointment.status} | R$ {Number(appointment.price).toFixed(2)}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PatientList;
