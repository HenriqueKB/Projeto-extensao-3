const express = require("express");
const cors = require("cors");

const appointmentsRouter = require("./routes/appointments");
const patientsRouter = require("./routes/patients");
const financeRouter = require("./routes/finance");
const authRouter = require("./routes/auth");
const backupRouter = require("./routes/backup");
const { requireAuth } = require("./auth");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "psicoagenda-api" });
});

app.use("/auth", authRouter);
app.use(requireAuth);

app.use("/patients", patientsRouter);
app.use("/appointments", appointmentsRouter);
app.use("/finance", financeRouter);
app.use("/backup", backupRouter);

module.exports = app;
