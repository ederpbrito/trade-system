---
story_key: 5-1-intencao-de-execucao-em-modo-demonstracao
epic: 5
story: 1
status: review
generated: "2026-04-05"
---

# Story 5.1: Intenção de execução em modo demonstração

Status: review

## Story

Como **Eder**,  
quero **submeter ordem simulada via conetor demo**,  
para **FR17**.

## Acceptance Criteria

**Given** modo demo activo e conetor demo/stub  
**When** confirmo intenção compatível  
**Then** registo de intenção e resposta do conetor é guardado sem executar produção  
**And** política de idempotência documentada se aplicável

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 5.1]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium (2026-04-07)

### Debug Log References

Sem bloqueios.

### Completion Notes List

- Implementado `DemoExecutionProvider` em `apps/api/src/connectors/demo-execution.provider.ts` — conetor stub que simula ordens sem execução real.
- Implementado `TradingModeService` em `apps/api/src/services/trading-mode/` com portas (`ports.ts`) e serviço (`trading-mode.service.ts`).
- Repositório Drizzle `DrizzleOrderIntentRepository` persiste intenções na tabela `order_intents`.
- Rota `POST /api/v1/execution/intent` submete intenção demo; rota `GET /api/v1/execution/mode` expõe modo actual.
- Idempotência implementada: se `idempotencyKey` já existir, devolve registo existente sem chamar conetor.
- Migração `0004_epic5_execution_decisions_audit.sql` cria tabelas `order_intents`, `decision_log`, `audit_events` e enum `trading_mode`.
- Testes unitários: 5 testes passam em `trading-mode.service.test.ts`.

### File List

- `apps/api/src/connectors/demo-execution.provider.ts` (novo)
- `apps/api/src/services/trading-mode/ports.ts` (novo)
- `apps/api/src/services/trading-mode/trading-mode.service.ts` (novo)
- `apps/api/src/services/trading-mode/trading-mode.service.test.ts` (novo)
- `apps/api/src/repositories/drizzle-order-intent.repository.ts` (novo)
- `apps/api/src/routes/v1/execution.routes.ts` (novo)
- `apps/api/src/routes/v1/execution.integration.test.ts` (novo)
- `apps/api/src/db/schema.ts` (modificado — tabelas order_intents, decision_log, audit_events, enum trading_mode)
- `apps/api/drizzle/migrations/0004_epic5_execution_decisions_audit.sql` (novo)
- `apps/api/src/composition/create-app-services.ts` (modificado)
- `apps/api/src/composition/http-stack.ts` (modificado)
- `apps/api/src/app.ts` (modificado)
- `apps/web/src/domains/cockpit/ui/ExecutionPanel.tsx` (novo)
- `apps/web/src/domains/cockpit/ui/CockpitPage.tsx` (modificado)

## Change Log

- 2026-04-07: Implementação completa da Story 5.1 — conetor demo, serviço de modo de negociação, repositório, rotas e UI de execução.
