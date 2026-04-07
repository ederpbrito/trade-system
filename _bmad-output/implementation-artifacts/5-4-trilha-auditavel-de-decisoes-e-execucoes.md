---
story_key: 5-4-trilha-auditavel-de-decisoes-e-execucoes
epic: 5
story: 4
status: review
generated: "2026-04-05"
---

# Story 5.4: Trilha auditável de decisões e execuções

Status: review

## Story

Como **Eder**,  
quero **trilha com tempo e janela de operação**,  
para **FR29**.

## Acceptance Criteria

**Given** decisão ou execução  
**When** consulto evento na trilha  
**Then** registo inclui timestamp UTC, utilizador, janela (TF+horizonte), modo demo/prod, ids de correlação relevantes

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
- [x] Testes mínimos alinhados à história

## Dev Notes

### Referências de arquitetura (obrigatório seguir)

- Monorepo `pnpm`, `apps/web` (Vite+React+TS), `apps/api` (Fastify), `packages/shared`, PostgreSQL+Drizzle, REST `/api/v1`, WebSocket envelope `{ type, payload, ts }`.
- Naming: DB `snake_case`, JSON `camelCase`; erros `{ error: { code, message, requestId } }`.
- Conetores em `apps/api/src/connectors/`; domínio em `services/`; rotas em `routes/v1/`.
- Ver `_bmad-output/planning-artifacts/architecture.md` (ADR-001 MT5, ADR-002 LLM/MCP).
- UX: `_bmad-output/planning-artifacts/ux-design-specification.md` (componentes cockpit, WCAG AA, layout 3 colunas).
### Notas para o agente de desenvolvimento

- Não reinventar pastas: seguir árvore em `architecture.md` » Project Structure.
- Não expor segredos ao cliente; credenciais só servidor.
- Testes: Vitest (web/api conforme pacote); contract tests em conetores quando aplicável.


### Referências explícitas

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 5.4]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium (2026-04-07)

### Debug Log References

Sem bloqueios.

### Completion Notes List

- Tabela `audit_events` append-only com campos: userId, eventType, mode, timeframe, horizonte, correlationId (requestId do pedido HTTP), entityId, entityType, payloadJson, occurredAt (timestamp UTC).
- `DrizzleAuditRepository` persiste e consulta eventos com filtros (eventType, from, to, limit).
- Eventos emitidos automaticamente em `DecisionsService.recordDecision` (tipo `decision.created`) e em `execution.routes.ts` (tipo `execution.intent`).
- Rota `GET /api/v1/audit/events` expõe trilha auditável com filtros.
- UI em `DecisionHistoryPanel.tsx` tab "Trilha (FR29)" mostra eventos com timestamp UTC, modo, janela e ids de correlação.
- Falha de auditoria não bloqueia a operação principal (catch silencioso com log).

### File List

- `apps/api/src/repositories/drizzle-audit.repository.ts` (novo)
- `apps/api/src/routes/v1/audit.routes.ts` (novo)
- `apps/api/src/db/schema.ts` (modificado — tabela audit_events)
- `apps/web/src/domains/cockpit/ui/DecisionHistoryPanel.tsx` (novo — tab trilha)

## Change Log

- 2026-04-07: Implementação completa da Story 5.4 — trilha auditável append-only com timestamp UTC, janela, modo e ids de correlação.
