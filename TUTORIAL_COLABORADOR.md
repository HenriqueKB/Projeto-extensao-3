# Tutorial — PsicoAgenda (colaborador)

Guia para clonar o projeto no GitHub, preparar o ambiente no Windows e terminar o que ainda falta. Pode encaminhar este arquivo para quem for ajudar no desenvolvimento.

**Repositório:** https://github.com/HenriqueKB/Projeto-extensao-3.git  
**Branch de trabalho:** `henrique/psicoagenda-baseline`

---

## 1. O que já está pronto e o que falta

| Parte | Status |
|-------|--------|
| Agenda (pacientes, consultas, views diária/semanal/mensal) | Funcionando |
| Login + sessão + alterar senha | Concluído |
| Backup offline + sync manual Cloudflare R2 | Concluído |
| **Prontuário evolutivo** (evoluções por paciente) | **Pendente — sua prioridade** |
| Testes automatizados | Opcional, não obrigatório agora |

Detalhes técnicos e checklist: arquivo `implementation_plan.md` na raiz do projeto.

### O que você precisa implementar (prontuário evolutivo)

**Backend** — em `react-app/backend/src/routes/patients.js`:

- `GET /patients/:id/notes` — listar notas (`ClinicalNote`), mais recentes primeiro
- `POST /patients/:id/notes` — criar nota (`content`, opcional `appointmentId`; `authorUserId` = `req.authUser.id`)
- `PUT /patients/:id/notes/:noteId` — editar conteúdo
- `DELETE /patients/:id/notes/:noteId` — excluir nota

O modelo `ClinicalNote` já existe em `react-app/backend/prisma/schema.prisma`.

**Frontend:**

- Funções em `react-app/src/services/api.js`: `fetchClinicalNotes`, `createClinicalNote`, `updateClinicalNote`, `deleteClinicalNote`
- Abas em `react-app/src/components/PatientList.js`: **Histórico de Consultas** | **Prontuário Evolutivo**
- Botões para nova evolução, editar e excluir cada nota

Todas as rotas de pacientes já exigem login (token no header `Authorization`).

---

## 2. Ferramentas necessárias

Instale nesta ordem:

1. **Git** — https://git-scm.com/download/win  
2. **Node.js LTS** (v18 ou v20) — https://nodejs.org/  
   - No terminal: `node -v` e `npm -v` devem responder com versões.
3. **Editor** — VS Code ou Cursor (recomendado para o projeto React + Node).

Opcional: conta no **GitHub** (para clonar e enviar alterações).

---

## 3. Pegar o projeto do GitHub (primeira vez)

Abra **PowerShell** ou **Git Bash** e escolha uma pasta (ex.: `C:\projetos`).

### 3.1 Clonar o repositório

```powershell
cd C:\projetos
git clone https://github.com/HenriqueKB/Projeto-extensao-3.git
cd Projeto-extensao-3
```

### 3.2 Entrar na branch certa

O código atual do PsicoAgenda está na branch `henrique/psicoagenda-baseline`:

```powershell
git fetch origin
git checkout henrique/psicoagenda-baseline
```

Se preferir criar sua própria branch a partir dela (recomendado para não sobrescrever o trabalho dos outros):

```powershell
git checkout -b seu-nome/prontuario-evolutivo
```

Exemplo: `git checkout -b maria/prontuario-evolutivo`

### 3.3 Atualizar antes de começar (sempre que for codar)

```powershell
git pull origin henrique/psicoagenda-baseline
```

Se estiver na sua branch:

```powershell
git pull origin henrique/psicoagenda-baseline
# ou, depois de configurar upstream:
git pull
```

---

## 4. Preparar o ambiente local

Estrutura importante:

```
Projeto-extensao-3/
├── react-app/              ← frontend React
│   ├── src/
│   └── package.json
├── react-app/backend/      ← API Node + Prisma + SQLite
│   ├── prisma/
│   ├── src/
│   └── .env.example
└── implementation_plan.md  ← plano e status
```

### 4.1 Instalar dependências

**Backend:**

```powershell
cd react-app\backend
npm install
npx prisma generate
npx prisma db push
```

**Frontend** (outro terminal ou depois):

```powershell
cd react-app
npm install
```

### 4.2 Arquivo `.env` do backend

Copie o exemplo e edite:

```powershell
cd react-app\backend
copy .env.example .env
```

Abra `.env` e configure pelo menos:

```env
DATABASE_URL="file:./dev.db"
PORT=4000
AUTH_SECRET=uma-chave-longa-e-aleatoria-aqui
```

**R2 (Cloudflare)** — só necessário se for testar backup na nuvem. Sem essas variáveis, o app ainda roda; o sync R2 pode falhar silenciosamente ou no botão de sync:

```env
R2_ENDPOINT=https://....r2.cloudflarestorage.com/...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
```

Peça as credenciais R2 a quem mantém o projeto, ou deixe em branco para desenvolver só o prontuário localmente.

### 4.3 Frontend apontando para a API

Por padrão o React usa `http://localhost:4000`. Se precisar mudar, crie `react-app/.env`:

```env
REACT_APP_API_URL=http://localhost:4000
```

---

## 5. Rodar o projeto

Use **dois terminais**.

**Terminal 1 — API:**

```powershell
cd react-app\backend
npm run dev
```

Deve aparecer algo como: `PsicoAgenda API rodando em http://localhost:4000`

**Terminal 2 — interface:**

```powershell
cd react-app
npm start
```

O navegador abre em `http://localhost:3000`.

### Login padrão (primeira execução)

Se não existir usuário no banco, o servidor cria automaticamente:

| Campo | Valor |
|-------|--------|
| Usuário | `psicologa` |
| Senha | `senha123` |

Depois você pode usar **Alterar senha** no header.

### Testar o que já funciona

1. Login com `psicologa` / `senha123`
2. Criar paciente/consulta pela agenda
3. **Baixar Cópia do Banco** — download do SQLite
4. **Sincronizar Cloud R2** — mensagem verde se o `.env` R2 estiver correto

---

## 6. Fluxo de trabalho no GitHub (dia a dia)

### 6.1 Antes de codar

```powershell
git status
git pull origin henrique/psicoagenda-baseline
```

### 6.2 Depois de alterar arquivos

Ver o que mudou:

```powershell
git status
git diff
```

Adicionar e commitar:

```powershell
git add .
git commit -m "feat: listar e criar notas do prontuario evolutivo"
```

Mensagens úteis: `feat:` (novidade), `fix:` (correção), `docs:` (documentação).

### 6.3 Enviar para o GitHub

Primeira vez na sua branch:

```powershell
git push -u origin seu-nome/prontuario-evolutivo
```

Depois:

```powershell
git push
```

### 6.4 Pedir revisão (Pull Request)

1. Acesse https://github.com/HenriqueKB/Projeto-extensao-3  
2. Aparecerá um banner **Compare & pull request** após o push, ou vá em **Pull requests** → **New pull request**  
3. Base: `henrique/psicoagenda-baseline` ← Compare: sua branch  
4. Descreva o que fez e peça review

### 6.5 Regras simples

- Não commite `.env` (senhas e chaves) — só `.env.example`  
- Não commite `node_modules/` nem `dev.db` (já estão no `.gitignore`)  
- Trabalhe em branch própria; evite commit direto na branch dos outros sem combinar  
- Se der conflito no `git pull`, peça ajuda ou resolva arquivo a arquivo no editor

---

## 7. Onde mexer no código (mapa rápido)

| Tarefa | Arquivo(s) |
|--------|------------|
| Rotas de notas clínicas | `react-app/backend/src/routes/patients.js` |
| Chamadas HTTP do React | `react-app/src/services/api.js` |
| UI do paciente / abas | `react-app/src/components/PatientList.js` |
| Autenticação (referência) | `react-app/backend/src/routes/auth.js`, `src/auth.js` |
| Schema do banco | `react-app/backend/prisma/schema.prisma` |
| Plano completo | `implementation_plan.md` |

Dica: com Cursor/VS Code, abra a pasta `Projeto-extensao-3` e use o `implementation_plan.md` como prompt de contexto para a IA.

---

## 8. Problemas comuns

| Problema | Solução |
|----------|---------|
| `npm` não reconhecido | Reinstale Node.js e reinicie o terminal |
| Erro de porta 4000 em uso | Feche outro `npm run dev` ou mude `PORT` no `.env` |
| 401 em todas as rotas | Faça login de novo; token expira em ~8h |
| Tela em branco no React | Confira se o backend está rodando na porta 4000 |
| Prisma / banco desatualizado | `cd react-app\backend` → `npx prisma db push` |
| `git pull` com conflito | Não apague código às cegas; abra os arquivos marcados com `<<<<<<<` |

---

## 9. Checklist antes de avisar que terminou

- [ ] Backend: 4 rotas de `/patients/:id/notes` funcionando (teste com Postman ou pelo frontend)
- [ ] Frontend: abas no paciente + criar/editar/excluir evolução
- [ ] Login ainda funciona após suas mudanças
- [ ] `npm run build` no `react-app` sem erro
- [ ] Commit + push na sua branch + Pull Request aberto
- [ ] Atualizou `implementation_plan.md` marcando prontuário como concluído (opcional mas ajuda o time)

---

## 10. Links úteis

- Repositório: https://github.com/HenriqueKB/Projeto-extensao-3  
- Branch: `henrique/psicoagenda-baseline`  
- Documentação Git (PT): https://git-scm.com/book/pt-br/v2  
- Prisma (SQLite): https://www.prisma.io/docs

Qualquer dúvida sobre credenciais R2 ou merge de branch, fale com quem te passou este tutorial.
