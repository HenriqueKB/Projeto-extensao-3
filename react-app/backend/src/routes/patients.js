const express = require("express");
const { patients, appointments } = require("../store");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ data: patients });
});

router.post("/", (req, res) => {
  const { name, phone, defaultConsultationType, customPrice } = req.body;

  if (!name || !phone || !defaultConsultationType) {
    return res.status(400).json({ error: "Campos obrigatorios ausentes." });
  }

  const newPatient = {
    id: Date.now().toString(),
    name,
    phone,
    defaultConsultationType,
    customPrice: Number(customPrice || 0),
    createdAt: new Date().toISOString(),
  };

  patients.push(newPatient);
  return res.status(201).json(newPatient);
});

router.get("/:id/history", (req, res) => {
  const { id } = req.params;
  const patient = patients.find((item) => item.id === id);

  if (!patient) {
    return res.status(404).json({ error: "Paciente nao encontrado." });
  }

  const history = appointments
    .filter((appointment) => appointment.patientId === id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return res.json({
    patient,
    appointments: history,
  });
});

module.exports = router;
