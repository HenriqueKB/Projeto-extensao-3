# PsicoAgenda - Starter Kit

Base inicial do projeto de extensao com os tres modulos:

- Agendamento
- Prontuario
- Financeiro

## O que ja foi montado

### Frontend (`src`)

- Agenda diaria/semanal/mensal em formato 24h.
- Cadastro de consulta com:
  - paciente, telefone e prontuario resumido;
  - tipo de consulta e preco editavel;
  - duracao (>= 50 min);
  - metodo de pagamento (dinheiro, cartao, pix);
  - status da consulta.
- Bloqueio de conflito de horario no mesmo dia.
- Regra de sinal (50%) no primeiro agendamento.
- Resumo financeiro basico no painel principal.

### Backend (`backend`)

- API Express inicial:
  - `GET /health`
  - `GET/POST /patients`
  - `GET/POST/DELETE /appointments`
  - `GET /finance/monthly-summary`
- Estrutura Prisma pronta para PostgreSQL em `backend/prisma/schema.prisma`.

### Documentacao (`docs`)

- Arquitetura e ERD: `docs/ARCHITECTURE.md`
- Contrato de API: `docs/API.md`
- Plano ate a deadline: `docs/ROADMAP-ATE-15-06-2026.md`

## Como rodar o frontend

```bash
npm install
npm start
```

Acesse `http://localhost:3000`.

## Como rodar o backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

API em `http://localhost:4000`.

Se quiser usar outra URL no frontend, crie `.env` na raiz com:

```bash
REACT_APP_API_URL=http://localhost:4000
```

## Proximos passos imediatos

1. Conectar frontend nos endpoints do backend (trocar localStorage por API).
2. Aplicar migrations do Prisma e persistir em PostgreSQL.
3. Implementar autenticacao e permissao de acesso ao prontuario.
4. Integrar Google Agenda e lembretes.
