const express = require("express");
const cors = require("cors");

const appointmentsRouter = require("./routes/appointments");
const patientsRouter = require("./routes/patients");
const financeRouter = require("./routes/finance");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "psicoagenda-api" });
});

app.use("/patients", patientsRouter);
app.use("/appointments", appointmentsRouter);
app.use("/finance", financeRouter);

module.exports = app;
