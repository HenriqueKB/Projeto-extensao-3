# Backlog real (baseado no codigo atual)

## O que ja esta pronto

- Frontend React com telas de agenda (diaria/semanal/mensal), formulario de consulta e lista de pacientes.
- Integracao frontend -> backend por API (`src/services/api.js`).
- Backend Express com rotas de pacientes, consultas e resumo financeiro inicial.
- Regra de conflito de horario implementada no backend para criacao e edicao de consulta.
- Schema Prisma modelado para MVP e fase seguinte.

## Lacunas criticas (P0)

1. Persistencia de dados em banco ainda nao implementada
   - Rotas usam arrays em memoria (`backend/src/store.js`).
   - Qualquer reinicio do backend apaga tudo.
2. Prisma sem migration aplicada
   - Existe `schema.prisma`, mas nao ha pasta de migrations.
3. Financeiro ainda e placeholder
   - Endpoint `GET /finance/monthly-summary` retorna zeros fixos.
4. Controle de acesso inexistente
   - Nao ha login, autenticacao ou autorizacao para dados sensiveis.
5. Repositorio ainda sem baseline de colaboracao
   - Branch `master` sem commits e sem remote configurado.

## Pendencias importantes (P1)

1. Prontuario por sessao
   - Hoje existe apenas `summary` da consulta.
   - Sem CRUD de `ClinicalNote`.
2. Validacoes de negocio adicionais
   - Regra de sinal/multa nao gera registros financeiros reais no backend.
3. Testes automatizados
   - Nao ha suite de testes frontend/backend.
4. Integrações externas planejadas
   - Google Agenda, lembretes e assinatura digital ainda nao implementados.
5. Pipeline de CI
   - Nao ha validacao automatica de build/test em PR.

## Pendencias desejaveis (P2)

1. Melhorias de responsividade mobile e UX.
2. Observabilidade basica (logs estruturados + tratamento de erros centralizado).
3. Ambientes padronizados (dev/staging/prod) com variaveis documentadas.

## Ordem sugerida das proximas entregas

1. Persistencia real com Prisma/PostgreSQL.
2. Financeiro real (Payment + resumo mensal).
3. Prontuario por sessao.
4. Auth e permissao para psicologo.
5. Testes + CI.
6. Integracoes (Google Agenda e lembretes).
