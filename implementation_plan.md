# Plano de Implementação: Login, Prontuário Evolutivo e Backup Básico 🚀

Este plano detalha a implementação das três novas funcionalidades solicitadas para o projeto de extensão **PsicoAgenda**:
1. **Sistema de Login Simples**: Controle de acesso básico com usuário único e sessão via localStorage.
2. **Prontuário Evolutivo (Evoluções de Pacientes)**: Registro histórico das evoluções clínicas associadas a cada paciente.
3. **Backup Básico**: Botão para exportar/baixar o arquivo de banco de dados SQLite (`dev.db`) diretamente do painel e controle manual da sincronização com o R2.

---

## User Review Required
> [!IMPORTANT]
> - **Usuário Padrão**: No primeiro início, o backend irá detectar se a tabela de usuários está vazia e criará automaticamente o usuário `psicologa` com a senha `senha123`.
> - **Segurança Sem Dependências**: Para evitar erros de compilação no Windows do usuário, utilizaremos o módulo nativo `crypto` do Node.js (com SHA-256) para hashing de senhas e geração de tokens de sessão seguros. Não precisaremos instalar bibliotecas pesadas de criptografia como `bcrypt`.

---

## Proposed Changes

### 1. Banco de Dados e Modelos
#### [MODIFY] [schema.prisma](file:///c:/programa/PsicoAgenda/react-app/backend/prisma/schema.prisma)
- Adicionar o modelo `User` para armazenar as credenciais da psicóloga.
```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // Hash SHA-256
  name      String
  createdAt DateTime @default(now())
}
```

---

### 2. Backend (Node.js)

#### [NEW] [auth.js (Rotas de Autenticação)](file:///c:/programa/PsicoAgenda/react-app/backend/src/routes/auth.js)
- Implementar rota `POST /auth/login`: recebe `username` e `password`, calcula o hash SHA-256 da senha enviada e valida contra o banco. Emite um token assinado de forma simples pelo próprio servidor (usando HMAC nativo do Node).
- Implementar rota `GET /auth/me`: valida o token recebido no header `Authorization` e retorna as informações do usuário logado.
- Implementar o middleware `requireAuth`: interceptador que protege as rotas de pacientes, agendamentos, finanças e backup, retornando `401 Unauthorized` se o token não for enviado ou for inválido.

#### [NEW] [backup.js (Rotas de Backup)](file:///c:/programa/PsicoAgenda/react-app/backend/src/routes/backup.js)
- Implementar rota `GET /backup/export`: baixa o arquivo físico `dev.db` do SQLite como anexo no navegador da psicóloga.
- Implementar rota `POST /backup/sync`: aciona manualmente a função `uploadDatabase()` para forçar a sincronização imediata dos dados atuais com o Cloudflare R2.

#### [MODIFY] [patients.js (Evoluções de Pacientes)](file:///c:/programa/PsicoAgenda/react-app/backend/src/routes/patients.js)
- Adicionar as seguintes sub-rotas de prontuário:
  - `GET /patients/:id/notes`: recupera todas as notas clínicas (evoluções) ordenadas pela data de criação decrescente.
  - `POST /patients/:id/notes`: cria uma nova evolução clínica, capturando o ID do usuário através do token e associando opcionalmente a um agendamento.
  - `PUT /patients/:id/notes/:noteId`: edita uma evolução existente.
  - `DELETE /patients/:id/notes/:noteId`: apaga uma evolução.

#### [MODIFY] [app.js](file:///c:/programa/PsicoAgenda/react-app/backend/src/app.js)
- Importar e registrar os novos roteadores `/auth` e `/backup`.
- Aplicar o middleware `requireAuth` globalmente para todas as rotas (exceto `/auth/login` e `/health`).

#### [MODIFY] [server.js](file:///c:/programa/PsicoAgenda/react-app/backend/src/server.js)
- Após o `downloadDatabase()` e antes de iniciar o Express, verificar se a tabela de usuários está vazia. Se sim, criar o usuário padrão `psicologa` com senha `senha123` e nome `Psicóloga Dra. Luciana`.

---

### 3. Frontend (React)

#### [MODIFY] [api.js](file:///c:/programa/PsicoAgenda/react-app/src/services/api.js)
- Modificar a função base `request` para ler o token de `localStorage.getItem("psicoagenda_token")` e injetá-lo no header `Authorization: Bearer <token>`.
- Adicionar as funções de chamada para:
  - `login(username, password)`
  - `fetchClinicalNotes(patientId)`
  - `createClinicalNote(patientId, payload)`
  - `updateClinicalNote(patientId, noteId, payload)`
  - `deleteClinicalNote(patientId, noteId)`
  - `exportBackup()` (redireciona para baixar o arquivo)
  - `syncR2Backup()` (solicita sincronização forçada com o R2)

#### [NEW] [Login.js](file:///c:/programa/PsicoAgenda/react-app/src/components/Login.js)
- Criar tela de login dedicada com design moderno (gradiente combinando com o tema, efeito de vidro, feedback visual claro de erro).
- Exibir uma dica discreta "Usuário padrão: psicologa / senha123" para facilitar a apresentação/avaliação do projeto de extensão.

#### [MODIFY] [App.js](file:///c:/programa/PsicoAgenda/react-app/src/App.js)
- Controlar o estado de autenticação (`isAuthenticated`, `currentUser`).
- Se não autenticado, renderizar o componente `<Login />`.
- Se autenticado:
  - Adicionar na barra superior (header) o nome da psicóloga conectada e um botão "Sair" (Logout).
  - Adicionar na barra de utilitários (ou próximo ao painel financeiro) a seção de **Backup Básico**:
    - Botão "Baixar Cópia do Banco (Offline)"
    - Botão "Sincronizar Cloud R2" com status de carregamento.
  - Carregar os dados normais da agenda.

#### [MODIFY] [PatientList.js](file:///c:/programa/PsicoAgenda/react-app/src/components/PatientList.js)
- Atualizar a área de histórico de cada paciente para oferecer duas abas internas:
  1. **Histórico de Consultas**: Exibição atual das consultas passadas/futuras.
  2. **Prontuário Evolutivo**:
     - Visualização das notas de evolução do paciente formatadas em ordem cronológica reversa.
     - Botão "Nova Evolução" que abre um campo de texto rico para salvar o prontuário.
     - Opções de "Editar" e "Excluir" em cada evolução cadastrada.

---

## Verification Plan

### Automated/Unit Tests
- Rodaremos `npx prisma db push` e verificaremos se o banco SQLite `dev.db` atualizou a estrutura sem perdas de dados.
- Verificaremos o startup do servidor: deve criar o usuário inicial.

### Manual Verification
1. **Autenticação**:
   - Abrir o site no navegador. Deve exibir a tela de login.
   - Digitar credenciais erradas (deve falhar com alerta elegante).
   - Digitar `psicologa` / `senha123`. Deve liberar acesso e carregar a agenda.
2. **Prontuário Evolutivo**:
   - Abrir a lista de pacientes, clicar em um paciente e selecionar a aba "Prontuário Evolutivo".
   - Adicionar uma nova anotação clínica. Salvar e ver se aparece na lista.
   - Editar a nota recém-criada. Salvar e verificar a atualização.
   - Excluir a nota e validar se ela desaparece.
3. **Backup Básico**:
   - Clicar em "Baixar Cópia do Banco" e verificar se o navegador inicia o download do arquivo `backup_psicoagenda.db`.
   - Clicar em "Sincronizar Cloud R2" e verificar se o Cloudflare R2 recebe os dados modificados do banco.
