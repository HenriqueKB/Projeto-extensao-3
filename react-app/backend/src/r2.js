require("dotenv").config();
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const dbPath = path.join(__dirname, "../prisma/dev.db");

async function downloadDatabase() {
  console.log("Iniciando download do banco do R2...");
  try {
    const data = await s3.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: "dev.db",
      })
    );

    const writeStream = fs.createWriteStream(dbPath);
    await new Promise((resolve, reject) => {
      data.Body.pipe(writeStream).on("error", reject).on("close", resolve);
    });
    console.log("✅ Banco de dados baixado com sucesso do R2.");
  } catch (error) {
    if (error.name === "NoSuchKey") {
      console.log("ℹ️ Nenhum banco de dados existente encontrado no R2. Iniciando vazio.");
    } else {
      console.error("❌ Erro ao baixar banco de dados do R2:", error);
    }
  }
}

async function uploadDatabase() {
  console.log("Realizando backup do banco para o R2...");
  try {
    // É importante esperar um momentinho pro SQLite dar flush se não usar modo WAL.
    // Opcional: await new Promise(r => setTimeout(r, 100));
    const fileStream = fs.createReadStream(dbPath);
    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: "dev.db",
        Body: fileStream,
      })
    );
    console.log("✅ Backup do banco atualizado no R2.");
  } catch (error) {
    console.error("❌ Erro ao realizar backup para o R2:", error);
  }
}

module.exports = { downloadDatabase, uploadDatabase };
