const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

function mapAppointment(a) {
  const iso = a.startsAt.toISOString();
  const date = iso.split("T")[0];
  const startTime = iso.split("T")[1].substring(0, 5);

  let paymentMethod = "pix";
  if (a.payments && a.payments.length > 0) {
    paymentMethod = a.payments[0].method;
  }

  return {
    ...a,
    date,
    startTime,
    chargeFirstSessionDeposit: a.chargeFirstDeposit,
    isRecurringWeekly: a.recurringWeekly,
    price: Number(a.price),
    paymentMethod,
  };
}

router.get("/", async (_req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { payments: true },
      orderBy: { startsAt: "asc" }
    });
    res.json({ data: appointments.map(mapAppointment) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar agendamentos." });
  }
});

router.post("/", async (req, res) => {
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

  if (!date || !startTime || !durationMinutes || !patientId || !consultationType || price === undefined) {
    return res.status(400).json({ error: "Campos obrigatorios ausentes." });
  }

  try {
    const startsAt = new Date(`${date}T${startTime}:00Z`);
    const endsAt = new Date(startsAt.getTime() + Number(durationMinutes) * 60000);

    const hasConflict = await prisma.appointment.findFirst({
      where: {
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt }
      }
    });

    if (hasConflict) {
      return res.status(409).json({ error: "Ja existe consulta nesse horario." });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        patientId,
        consultationType,
        price: Number(price),
        startsAt,
        endsAt,
        durationMinutes: Number(durationMinutes),
        status: status || "agendada",
        summary: summary || "",
        chargeFirstDeposit: Boolean(chargeFirstSessionDeposit),
        recurringWeekly: Boolean(isRecurringWeekly),
        payments: {
          create: {
            amount: Number(price),
            method: paymentMethod || "pix",
            status: "pendente",
            isDeposit: Boolean(chargeFirstSessionDeposit)
          }
        }
      },
      include: { payments: true }
    });

    return res.status(201).json(mapAppointment(newAppointment));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar agendamento." });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    date,
    startTime,
    durationMinutes,
    consultationType,
    price,
    status,
    paymentMethod,
    summary,
    chargeFirstSessionDeposit,
    isRecurringWeekly,
  } = req.body;

  try {
    const existing = await prisma.appointment.findUnique({
      where: { id },
      include: { payments: true }
    });

    if (!existing) {
      return res.status(404).json({ error: "Consulta nao encontrada." });
    }

    // Default to existing values if not provided
    const updateDate = date || existing.startsAt.toISOString().split("T")[0];
    const updateStartTime = startTime || existing.startsAt.toISOString().split("T")[1].substring(0, 5);
    const updateDuration = durationMinutes ? Number(durationMinutes) : existing.durationMinutes;

    const startsAt = new Date(`${updateDate}T${updateStartTime}:00Z`);
    const endsAt = new Date(startsAt.getTime() + updateDuration * 60000);

    const hasConflict = await prisma.appointment.findFirst({
      where: {
        id: { not: id },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt }
      }
    });

    if (hasConflict) {
      return res.status(409).json({ error: "Ja existe consulta nesse horario." });
    }

    // Update payment method if provided and there's a payment record
    if (paymentMethod && existing.payments.length > 0) {
      await prisma.payment.update({
        where: { id: existing.payments[0].id },
        data: { method: paymentMethod, amount: price !== undefined ? Number(price) : undefined }
      });
    } else if (paymentMethod && existing.payments.length === 0) {
      await prisma.payment.create({
        data: {
          appointmentId: id,
          amount: price !== undefined ? Number(price) : existing.price,
          method: paymentMethod,
          status: "pendente"
        }
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(consultationType && { consultationType }),
        ...(price !== undefined && { price: Number(price) }),
        startsAt,
        endsAt,
        durationMinutes: updateDuration,
        ...(status && { status }),
        ...(summary !== undefined && { summary }),
        ...(chargeFirstSessionDeposit !== undefined && { chargeFirstDeposit: Boolean(chargeFirstSessionDeposit) }),
        ...(isRecurringWeekly !== undefined && { recurringWeekly: Boolean(isRecurringWeekly) }),
      },
      include: { payments: true }
    });

    return res.json(mapAppointment(updatedAppointment));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar agendamento." });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Consulta nao encontrada." });
    }

    // Prisma relation handles cascading deletes if configured, but to be safe let's delete payments first
    await prisma.payment.deleteMany({ where: { appointmentId: id } });
    await prisma.clinicalNote.deleteMany({ where: { appointmentId: id } });

    await prisma.appointment.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar agendamento." });
  }
});

module.exports = router;
