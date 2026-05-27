require("dotenv").config();
const { downloadDatabase } = require("./r2");
const prisma = require("./prisma");
const { hashPassword } = require("./auth");
const app = require("./app");

const port = process.env.PORT || 4000;

async function start() {
  // Baixa o SQLite do Cloudflare R2 antes de qualquer coisa
  await downloadDatabase();
  await ensureDefaultUser();

  app.listen(port, () => {
    console.log(`PsicoAgenda API rodando em http://localhost:${port}`);
  });
}

async function ensureDefaultUser() {
  const usersCount = await prisma.user.count();
  if (usersCount > 0) {
    return;
  }

  await prisma.user.create({
    data: {
      username: "psicologa",
      password: hashPassword("senha123"),
      name: "Psicologa Dra. Luciana",
    },
  });

  console.log("Usuario padrao criado: psicologa");
}

start();
