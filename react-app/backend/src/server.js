require("dotenv").config();
const { downloadDatabase } = require("./r2");
const app = require("./app");

const port = process.env.PORT || 4000;

async function start() {
  // Baixa o SQLite do Cloudflare R2 antes de qualquer coisa
  await downloadDatabase();

  app.listen(port, () => {
    console.log(`PsicoAgenda API rodando em http://localhost:${port}`);
  });
}

start();
