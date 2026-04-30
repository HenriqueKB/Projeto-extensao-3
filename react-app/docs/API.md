# API Inicial (REST)

Base URL local: `http://localhost:4000`

## Healthcheck

- `GET /health`

Resposta:

```json
{ "status": "ok", "service": "psicoagenda-api" }
```

## Pacientes

- `GET /patients`
- `POST /patients`

Payload exemplo:

```json
{
  "name": "Maria Souza",
  "phone": "11999999999",
  "defaultConsultationType": "psicoterapia",
  "customPrice": 150
}
```

## Agendamentos

- `GET /appointments`
- `POST /appointments`
- `DELETE /appointments/:id`

Payload exemplo:

```json
{
  "date": "2026-04-23",
  "startTime": "17:00",
  "durationMinutes": 50,
  "patientId": "abc123",
  "consultationType": "psicoterapia",
  "price": 150,
  "status": "agendada"
}
```

## Financeiro

- `GET /finance/monthly-summary`

Retorna estrutura inicial para dashboard mensal.

## Regras de negocio mapeadas

- Nao permitir conflito de horario.
- Cobrar 50% no primeiro agendamento (sinal).
- Cobrar 50% no cancelamento.
- Registrar metodo: `dinheiro`, `cartao`, `pix`.
- Status da consulta: `agendada`, `confirmada`, `presente`, `falta`, `cancelada`, `remarcada`.
