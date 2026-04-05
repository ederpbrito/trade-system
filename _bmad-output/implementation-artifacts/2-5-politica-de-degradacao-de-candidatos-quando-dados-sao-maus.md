---
story_key: 2-5-politica-de-degradacao-de-candidatos-quando-dados-sao-maus
epic: 2
story: 5
status: done
generated: "2026-04-05"
---

# Story 2.5: Política de degradação de candidatos quando dados são maus

Status: done

## Story

Como **Eder**,  
quero **que candidatos não sejam apresentados como certos com dados inválidos/atrasados**,  
para **FR27**.

## Acceptance Criteria

**Given** fonte em estado degradado ou dados fora de limiar de atualidade  
**When** o motor de oportunidades corre  
**Then** candidatos são suprimidos ou marcados como incertos conforme regra configurável  
**And** o motivo é registado para auditoria técnica (*logs*)

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
- [x] Testes mínimos alinhados à história

### Review Findings

- [x] [Review][Patch] N+1 eliminado: `IOhlcBarRepository.latestTsOpenForInstrumentIds` com `SELECT DISTINCT ON` numa única ida à BD. [`apps/api/src/repositories/drizzle-ohlc.repository.ts`, `apps/api/src/services/opportunities/opportunities-preview.service.ts`]

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 2.5]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Cursor agent (implementação única épico 2 — stories 2-1 a 2-6)

### Debug Log References

### Completion Notes List

- Função pura `evaluateCandidates` + `OpportunitiesPreviewService` (combina pior estado de `connector_health` e *staleness* das barras vs `MARKET_DATA_MAX_STALENESS_MS`); *staleness* via `latestTsOpenForInstrumentIds` (uma query `DISTINCT ON`).
- Política `OPPORTUNITY_DEGRADATION_POLICY`: `suppress` | `uncertain` (env).
- `GET /api/v1/opportunities/candidates/preview` regista evento estruturado `opportunity_degradation` via `request.log.info` quando aplicável.
- UI: bloco de pré-visualização no cockpit; testes unitários `degradation.test.ts`.

### File List

- apps/api/src/config/env.ts
- apps/api/src/services/opportunities/degradation.ts
- apps/api/src/services/opportunities/degradation.test.ts
- apps/api/src/services/opportunities/opportunities-preview.service.ts
- apps/api/src/services/market-data/ports.ts
- apps/api/src/repositories/drizzle-ohlc.repository.ts
- apps/api/src/routes/v1/opportunities.routes.ts
- apps/api/src/composition/create-app-services.ts
- apps/web/src/domains/cockpit/ui/CockpitPage.tsx
- .env.example

### Change Log

- 2026-04-05: Story 2.5 implementada no âmbito do batch épico 2; estado sprint → review.
- 2026-04-05: Code review — estado → in-progress (épico 2).
- 2026-04-05: Correcção review — query única `latestTsOpenForInstrumentIds`; sprint → review.
- 2026-04-05: Épico 2 fechado — story `done`; `sprint-status` actualizado.
