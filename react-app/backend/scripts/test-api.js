/**
 * Script de teste de integração da API do backend usando Express e chamadas HTTP nativas (fetch)
 */
require("dotenv").config();
const app = require("../src/app");
const prisma = require("../src/prisma");

const TEST_PORT = 4001;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Função auxiliar para gerar um CPF matematicamente válido para o teste
function generateValidCpf() {
  const num = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9) + 1);
  let sum1 = 0;
  for (let i = 0; i < 9; i++) {
    sum1 += num[i] * (10 - i);
  }
  let digit1 = (sum1 * 10) % 11;
  if (digit1 >= 10) digit1 = 0;
  
  const num2 = [...num, digit1];
  let sum2 = 0;
  for (let i = 0; i < 10; i++) {
    sum2 += num2[i] * (11 - i);
  }
  let digit2 = (sum2 * 10) % 11;
  if (digit2 >= 10) digit2 = 0;
  
  return [...num, digit1, digit2].join("");
}

async function runTests() {
  console.log("=== Iniciando Teste de Integração do Back-end ===");
  
  let server;
  try {
    // Inicia o servidor Express em uma porta de teste temporária
    server = app.listen(TEST_PORT);
    console.log(`✅ Servidor de teste iniciado em ${BASE_URL}\n`);
  } catch (err) {
    console.error("❌ Falha ao iniciar o servidor de teste:", err);
    process.exit(1);
  }

  let token = null;
  let tempPatientId = null;
  let tempNoteId = null;
  let failed = false;
  const testCpf = generateValidCpf();

  const testCases = [
    {
      name: "1. GET /health (Verificação de Saúde)",
      fn: async () => {
        const res = await fetch(`${BASE_URL}/health`);
        if (res.status !== 200) throw new Error(`Status esperado 200, recebido ${res.status}`);
        const data = await res.json();
        if (data.status !== "ok") throw new Error(`Esperado status: "ok", recebido: ${JSON.stringify(data)}`);
      }
    },
    {
      name: "2. GET /patients sem autenticação (Esperado 401)",
      fn: async () => {
        const res = await fetch(`${BASE_URL}/patients`);
        if (res.status !== 401) throw new Error(`Status esperado 401, recebido ${res.status}`);
      }
    },
    {
      name: "3. POST /auth/login com credenciais incorretas (Esperado 401/400)",
      fn: async () => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "usuario_invalido", password: "123" })
        });
        if (res.status === 200) throw new Error("Login deveria falhar para credenciais inválidas.");
      }
    },
    {
      name: "4. POST /auth/login com credenciais corretas (Esperado 200 + Token)",
      fn: async () => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "psicologa", password: "senha123" })
        });
        
        if (res.status !== 200) {
          throw new Error(`Login falhou com status ${res.status}`);
        }
        
        const data = await res.json();
        if (!data.token) {
          throw new Error("Token de autenticação não foi retornado");
        }
        
        token = data.token;
        console.log(`   [Token obtido com sucesso]`);
      }
    },
    {
      name: "5. GET /auth/me com token válido (Esperado 200)",
      fn: async () => {
        const res = await fetch(`${BASE_URL}/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.status !== 200) throw new Error(`Status esperado 200, recebido ${res.status}`);
        const data = await res.json();
        if (!data.user || data.user.username !== "psicologa") {
          throw new Error(`Nome de usuário incorreto no perfil: ${JSON.stringify(data.user)}`);
        }
      }
    },
    {
      name: "6. GET /patients com token válido (Esperado 200)",
      fn: async () => {
        const res = await fetch(`${BASE_URL}/patients`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.status !== 200) throw new Error(`Status esperado 200, recebido ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.data)) throw new Error("Dados de pacientes deveriam vir em um array sob 'data'");
      }
    },
    {
      name: "7. POST /patients para criar paciente de teste (Esperado 201)",
      fn: async () => {
        const res = await fetch(`${BASE_URL}/patients`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            name: "API Test Patient",
            cpf: testCpf,
            phone: "(11) 98765-4321",
            email: "api-test@example.com",
            notes: "Criado durante o teste de integração da API"
          })
        });
        
        if (res.status !== 201) {
          const errData = await res.json();
          throw new Error(`Criação de paciente falhou (${res.status}): ${JSON.stringify(errData)}`);
        }
        
        const data = await res.json();
        if (!data.id) throw new Error("ID do paciente não foi retornado");
        tempPatientId = data.id;
        console.log(`   [Paciente de teste criado com CPF: ${testCpf} e ID: ${tempPatientId}]`);
      }
    },
    {
      name: "8. POST /patients/:id/notes para criar evolução clínica (Esperado 201)",
      fn: async () => {
        const res = await fetch(`${BASE_URL}/patients/${tempPatientId}/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            content: "Paciente apresenta melhora significativa na ansiedade após técnicas de respiração."
          })
        });
        
        if (res.status !== 201) {
          const errData = await res.json();
          throw new Error(`Criação de prontuário falhou (${res.status}): ${JSON.stringify(errData)}`);
        }
        
        const data = await res.json();
        if (!data.id) throw new Error("ID da anotação não retornado");
        tempNoteId = data.id;
        console.log(`   [Anotação de prontuário criada com ID: ${tempNoteId}]`);
      }
    },
    {
      name: "9. GET /patients/:id/notes para listar evoluções clínicas (Esperado 200)",
      fn: async () => {
        const res = await fetch(`${BASE_URL}/patients/${tempPatientId}/notes`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.status !== 200) throw new Error(`Status esperado 200, recebido ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.data) || data.data.length === 0) {
          throw new Error("Esperado array com a evolução criada");
        }
        if (data.data[0].id !== tempNoteId) throw new Error("Evolução retornada difere do ID criado");
      }
    },
    {
      name: "10. PUT /patients/:id/notes/:noteId para editar evolução clínica (Esperado 200)",
      fn: async () => {
        const updatedContent = "Paciente apresenta melhora significativa e discutiu novas estratégias de regulação emocional.";
        const res = await fetch(`${BASE_URL}/patients/${tempPatientId}/notes/${tempNoteId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ content: updatedContent })
        });
        if (res.status !== 200) throw new Error(`Status esperado 200, recebido ${res.status}`);
        const data = await res.json();
        if (data.content !== updatedContent) throw new Error("Conteúdo atualizado incorreto");
      }
    },
    {
      name: "11. DELETE /patients/:id/notes/:noteId para apagar evolução clínica (Esperado 204)",
      fn: async () => {
        const res = await fetch(`${BASE_URL}/patients/${tempPatientId}/notes/${tempNoteId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.status !== 204) throw new Error(`Status esperado 204, recebido ${res.status}`);
      }
    },
    {
      name: "12. DELETE /patients/:id para excluir paciente de teste (Esperado 204)",
      fn: async () => {
        const res = await fetch(`${BASE_URL}/patients/${tempPatientId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.status !== 204) throw new Error(`Status esperado 204, recebido ${res.status}`);
      }
    }
  ];

  for (const test of testCases) {
    try {
      await test.fn();
      console.log(`✅ PASSED: ${test.name}`);
    } catch (err) {
      console.error(`❌ FAILED: ${test.name}`);
      console.error(`   Motivo: ${err.message || err}`);
      failed = true;
    }
  }

  console.log("\n=== Finalizando testes ===");
  if (server) {
    server.close();
    console.log("Servidor de teste parado.");
  }
  await prisma.$disconnect();

  if (failed) {
    console.log("\n❌ Falha em um ou mais casos de teste.");
    process.exit(1);
  } else {
    console.log("\n🎉 Todos os testes de integração do Back-end passaram com SUCESSO!");
    process.exit(0);
  }
}

runTests();
