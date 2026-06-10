/**
 * Script de teste simples do banco de dados (Prisma + SQLite)
 */
require("dotenv").config();
const prisma = require("../src/prisma");

async function testDatabase() {
  console.log("=== Iniciando Teste de Conexão com o Banco de Dados ===");
  
  try {
    // 1. Contagem de registros nas tabelas principais
    console.log("\n1. Verificando tabelas...");
    
    const usersCount = await prisma.user.count();
    console.log(`- Usuários cadastrados: ${usersCount}`);
    
    const patientsCount = await prisma.patient.count();
    console.log(`- Pacientes cadastrados: ${patientsCount}`);
    
    const appointmentsCount = await prisma.appointment.count();
    console.log(`- Consultas cadastradas: ${appointmentsCount}`);
    
    const notesCount = await prisma.clinicalNote.count();
    console.log(`- Prontuários (ClinicalNote) cadastrados: ${notesCount}`);
    
    // 2. Tentar buscar o usuário padrão
    console.log("\n2. Buscando usuário padrão...");
    const defaultUser = await prisma.user.findFirst({
      where: { username: "psicologa" }
    });
    
    if (defaultUser) {
      console.log(`✅ Usuário padrão "psicologa" encontrado. ID: ${defaultUser.id}, Nome: ${defaultUser.name}`);
    } else {
      console.log("⚠️ Usuário padrão não encontrado. (Será criado ao rodar o servidor)");
    }
    
    // 3. Teste rápido de inserção/leitura/exclusão (Rollback opcional, mas vamos criar um paciente de teste e apagar)
    console.log("\n3. Executando operação de escrita/leitura/exclusão...");
    const testPatient = await prisma.patient.create({
      data: {
        name: "Paciente de Teste Temporário",
        cpf: "999.999.999-99",
        phone: "(00) 00000-0000",
        email: "teste@temp.com",
        notes: "Criado pelo script de teste automático."
      }
    });
    console.log(`✅ Paciente temporário criado com ID: ${testPatient.id}`);
    
    const fetchedPatient = await prisma.patient.findUnique({
      where: { id: testPatient.id }
    });
    console.log(`✅ Paciente temporário recuperado com sucesso: ${fetchedPatient.name}`);
    
    await prisma.patient.delete({
      where: { id: testPatient.id }
    });
    console.log("✅ Paciente temporário excluído com sucesso.");
    
    console.log("\n🎉 Conexão e integridade do banco de dados (SQLite + Prisma) testadas com SUCESSO!");
  } catch (error) {
    console.error("\n❌ Falha no teste do banco de dados:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
