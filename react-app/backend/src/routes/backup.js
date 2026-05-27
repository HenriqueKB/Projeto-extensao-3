const express = require("express");
const path = require("path");
const fs = require("fs");
const { uploadDatabase } = require("../r2");

const router = express.Router();
const dbPath = path.join(__dirname, "../../prisma/dev.db");

router.get("/export", (_req, res) => {
  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ error: "Arquivo de backup nao encontrado." });
  }

  return res.download(dbPath, "backup_psicoagenda.db");
});

router.post("/sync", async (_req, res) => {
  try {
    await uploadDatabase();
    return res.json({ ok: true, message: "Sincronizacao com R2 concluida." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Falha ao sincronizar backup com R2." });
  }
});

module.exports = router;
