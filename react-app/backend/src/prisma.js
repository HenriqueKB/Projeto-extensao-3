const { PrismaClient } = require('@prisma/client');
const { uploadDatabase } = require('./r2');

const prismaClient = new PrismaClient();

const prisma = prismaClient.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const result = await query(args);

        const writeOperations = [
          'create',
          'createMany',
          'update',
          'updateMany',
          'delete',
          'deleteMany',
          'upsert',
        ];

        if (writeOperations.includes(operation)) {
          // Dispara o backup de forma assíncrona para não travar a resposta da API
          uploadDatabase().catch((err) =>
            console.error("Erro no backup assíncrono pro R2:", err)
          );
        }

        return result;
      },
    },
  },
});

module.exports = prisma;
