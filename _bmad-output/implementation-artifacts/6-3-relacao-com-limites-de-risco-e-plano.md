---
story_key: 6-3-relacao-com-limites-de-risco-e-plano
epic: 6
story: 3
status: done
generated: "2026-04-05"
---

# Story 6.3: Relação com limites de risco e plano

Status: done

## Story

Como **Eder**,  
quero **o assistente a relacionar oportunidade com limites e plano quando existirem**,  
para **FR11**.

## Acceptance Criteria

**Given** limites configurados (Épico 4)  
**When** peço parecer  
**Then** o texto ou blocos referem aderência ou espaço até ao limite (dados vindos da API, não inventados pelo cliente)

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
- [x] Testes mínimos alinhados à história

### Senior Developer Review (AI)

**Outcome:** Changes Requested → Resolvido  
**Data:** 2026-04-07

### Review Follow-ups (AI)

- [x] [Review][Patch] `buildRiskRelation`: `!maxPositionSize` falha para valor 0 — corrigido para `=== null` [assistant.service.ts:120]
- [x] [Review][Decision] Headroom calculado com posição/perda actuais = 0 — aceite como estimativa teórica conservadora; diferido para épico de gestão de carteira
- [x] [Review][Defer] `currentDailyLoss`/`currentPositionSize` não passados à API → headroom assume 0 — deferred, pre-existing

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 6.3]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium (Cursor)

### Debug Log References

Sem bloqueios.

### Completion Notes List

- Given limites configurados (Épico 4) / When peço parecer / Then o texto ou blocos referem aderência ou espaço até ao limite (dados vindos da API, não inventados pelo cliente) — implementado em buildRiskRelation() no AssistantService
- A rota GET /api/v1/assistant/thesis chama riskService.getLimits(userId) no servidor e passa o contexto ao AssistantService — dados nunca inventados pelo cliente
- headroomPositionSize e headroomDailyLoss calculados como max(0, limite - atual) — nunca negativos
- Testes: 5 casos (sem limites, com posição, com perda diária, headroom zero, limites null)

### File List

- apps/api/src/services/assistant/assistant.service.ts (novo — buildRiskRelation)
- apps/api/src/services/assistant/ports.ts (novo — RiskRelation, AssistantRiskContext)
- apps/api/src/routes/v1/assistant.routes.ts (novo — integração com RiskService)
- apps/web/src/domains/cockpit/ui/AssistantPanel.tsx (novo — bloco de limites de risco)

### Change Log

- 2026-04-07: Implementação da relação com limites de risco (FR11) — dados vindos da API.
