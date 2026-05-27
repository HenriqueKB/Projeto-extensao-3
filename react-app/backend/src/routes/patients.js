const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

function mapAppointment(a) {
  // convert startsAt to UTC ISO string to safely extract date and time
  const iso = a.startsAt.toISOString();
  const date = iso.split("T")[0];
  const startTime = iso.split("T")[1].substring(0, 5);

  return {
    ...a,
    date,
    startTime,
    chargeFirstSessionDeposit: a.chargeFirstDeposit,
    isRecurringWeekly: a.recurringWeekly,
    price: Number(a.price),
  };
}

router.get("/", async (_req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ data: patients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar pacientes no banco de dados." });
  }
});

router.post("/", async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Campos obrigatorios ausentes." });
  }

  try {
    const newPatient = await prisma.patient.create({
      data: {
        name,
        phone,
      },
    });
    return res.status(201).json(newPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar paciente no banco de dados." });
  }
});

router.get("/:id/history", async (req, res) => {
  const { id } = req.params;

  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return res.status(404).json({ error: "Paciente nao encontrado." });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: id },
      orderBy: { startsAt: "desc" },
    });

    return res.json({
      patient,
      appointments: appointments.map(mapAppointment),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar historico do paciente." });
  }
});

module.exports = router;
