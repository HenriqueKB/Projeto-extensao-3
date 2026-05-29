import React, { useState } from "react";
import { format } from "date-fns";

const PatientList = ({ patients, historyByPatient, onLoadHistory, onCancelAppointment }) => {
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

  const handleUnmark = async (appointment) => {
    if (!onCancelAppointment) {
      return;
    }
    const confirmed = window.confirm(
      `Desmarcar ${appointment.patientName || "paciente"} da consulta em ${appointment.date} às ${appointment.startTime}?`
    );
    if (!confirmed) {
      return;
    }
    await onCancelAppointment({
      ...appointment,
      patientId: appointment.patientId || expandedPatientId,
    });
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
                      history.map((appointment) => {
                        const isCancelled = appointment.status === "cancelada";
                        return (
                          <div key={appointment.id} className="history-item history-item-row">
                            <div>
                              {format(new Date(`${appointment.date}T00:00:00`), "dd/MM/yyyy")} -{" "}
                              {appointment.startTime} |{" "}
                              <span className={`status-badge status-${appointment.status}`}>
                                {appointment.status}
                              </span>{" "}
                              | R$ {Number(appointment.price).toFixed(2)}
                            </div>
                            {!isCancelled && onCancelAppointment && (
                              <button
                                type="button"
                                className="btn btn-warning btn-sm"
                                onClick={() =>
                                  handleUnmark({ ...appointment, patientId: patient.id, patientName: patient.name })
                                }
                              >
                                Desmarcar paciente
                              </button>
                            )}
                          </div>
                        );
                      })
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
