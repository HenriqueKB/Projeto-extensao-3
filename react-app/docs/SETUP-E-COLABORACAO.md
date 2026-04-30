# Setup local e colaboracao em equipe

## 1) Rodar no desktop (Windows)

### Pre-requisitos

- Node.js LTS (18 ou 20)
- npm (vem com Node)
- PostgreSQL 14+ (local)

### Backend

1. Abra terminal em `react-app/backend`.
2. Instale dependencias:
   - `npm install`
3. Copie variaveis:
   - `copy .env.example .env`
4. Garanta que o PostgreSQL esteja ativo e aceite a URL de `DATABASE_URL`.
5. Gere cliente Prisma:
   - `npm run prisma:generate`
6. Crie primeira migration:
   - `npm run prisma:migrate -- --name init`
7. Suba API:
   - `npm run dev`

### Frontend

1. Abra terminal em `react-app`.
2. Instale dependencias:
   - `npm install`
3. (Opcional) configure API:
   - crie `.env` com `REACT_APP_API_URL=http://localhost:4000`
4. Rode app:
   - `npm start`

## 2) Publicar para o time colaborar com commits

### Passo a passo GitHub

1. Crie um repositorio vazio no GitHub (sem README inicial).
2. No seu projeto local (`C:/programa/PsicoAgenda`):
   - `git add .`
   - `git commit -m "chore: baseline do projeto psicoagenda"`
3. Configure remote:
   - `git remote add origin <URL_DO_REPO>`
4. Envie branch principal:
   - `git push -u origin master`

### Fluxo recomendado para equipe

- Branch principal protegida: `master` (ou migrar para `main`).
- Cada dev trabalha em branch de feature:
  - `feat/<tema>`, `fix/<tema>`, `chore/<tema>`
- Merge via Pull Request obrigatorio.
- Exigir no minimo 1 review antes de merge.

### Padrao de trabalho (simples e pratico)

1. `git checkout master`
2. `git pull`
3. `git checkout -b feat/nome-da-tarefa`
4. Desenvolver + testar localmente
5. `git add . && git commit -m "<tipo>: <descricao>"`
6. `git push -u origin feat/nome-da-tarefa`
7. Abrir PR no GitHub

## 3) Proximos passos de maturidade (curto prazo)

1. Adicionar CI (build frontend + smoke de backend em PR).
2. Definir `.env.example` tambem no frontend.
3. Documentar estrategia de migrations para evitar conflitos.
4. Definir "Definition of Done" para fechar backlog com criterio claro.
