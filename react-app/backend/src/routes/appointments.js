const express = require("express");
const { appointments } = require("../store");

const router = express.Router();

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

router.get("/", (_req, res) => {
  res.json({ data: appointments });
});

router.post("/", (req, res) => {
  const {
    date,
    startTime,
    durationMinutes,
    patientId,
    consultationType,
    price,
    status,
    paymentMethod,
    summary,
    chargeFirstSessionDeposit,
    isRecurringWeekly,
  } = req.body;

  if (!date || !startTime || !durationMinutes || !patientId || !consultationType || !price) {
    return res.status(400).json({ error: "Campos obrigatorios ausentes." });
  }

  const start = toMinutes(startTime);
  const end = start + Number(durationMinutes);

  const hasConflict = appointments.some((appointment) => {
    if (appointment.date !== date) return false;
    const existingStart = toMinutes(appointment.startTime);
    const existingEnd = existingStart + Number(appointment.durationMinutes);
    return start < existingEnd && end > existingStart;
  });

  if (hasConflict) {
    return res.status(409).json({ error: "Ja existe consulta nesse horario." });
  }

  const newAppointment = {
    id: Date.now().toString(),
    date,
    startTime,
    durationMinutes: Number(durationMinutes),
    patientId,
    consultationType,
    price: Number(price),
    status: status || "agendada",
    paymentMethod: paymentMethod || "pix",
    summary: summary || "",
    chargeFirstSessionDeposit: Boolean(chargeFirstSessionDeposit),
    isRecurringWeekly: Boolean(isRecurringWeekly),
    createdAt: new Date().toISOString(),
  };

  appointments.push(newAppointment);
  return res.status(201).json(newAppointment);
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const index = appointments.findIndex((appointment) => appointment.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Consulta nao encontrada." });
  }

  const current = appointments[index];
  const next = { ...current, ...req.body };
  const date = next.date;
  const startTime = next.startTime;
  const durationMinutes = Number(next.durationMinutes);

  if (!date || !startTime || !durationMinutes) {
    return res.status(400).json({ error: "Campos obrigatorios ausentes para edicao." });
  }

  const start = toMinutes(startTime);
  const end = start + durationMinutes;

  const hasConflict = appointments.some((appointment) => {
    if (appointment.id === id) return false;
    if (appointment.date !== date) return false;
    const existingStart = toMinutes(appointment.startTime);
    const existingEnd = existingStart + Number(appointment.durationMinutes);
    return start < existingEnd && end > existingStart;
  });

  if (hasConflict) {
    return res.status(409).json({ error: "Ja existe consulta nesse horario." });
  }

  appointments[index] = {
    ...current,
    ...req.body,
    durationMinutes,
    price: Number(next.price),
  };

  return res.json(appointments[index]);
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const index = appointments.findIndex((appointment) => appointment.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Consulta nao encontrada." });
  }

  appointments.splice(index, 1);
  return res.status(204).send();
});

module.exports = router;
