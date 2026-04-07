---
story_key: 6-2-deteccao-e-apresentacao-de-conflito-entre-janelas
epic: 6
story: 2
status: done
generated: "2026-04-05"
---

# Story 6.2: Deteção e apresentação de conflito entre janelas

Status: done

## Story

Como **Eder**,  
quero **ver conflito explícito entre curto e longo prazo**,  
para **FR10 e UX-DR5**.

## Acceptance Criteria

**Given** sinais divergentes simulados entre horizontes  
**When** abro assistente  
**Then** painel de conflito mostra duas colunas com narrativa curta e severidade

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
- [x] Testes mínimos alinhados à história

### Senior Developer Review (AI)

**Outcome:** Changes Requested → Resolvido  
**Data:** 2026-04-07

### Review Follow-ups (AI)

- [x] [Review][Patch] `buildConflict`: H1/dia e H4/dia geravam conflito incorretamente — lógica refactorizada [assistant.service.ts:85]

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 6.2]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium (Cursor)

### Debug Log References

Sem bloqueios.

### Completion Notes List

- Given sinais divergentes simulados entre horizontes / When abro assistente / Then painel de conflito mostra duas colunas com narrativa curta e severidade — implementado em buildConflict() no AssistantService e renderizado em AssistantPanel com grid 2 colunas
- Severidade: "none" | "low" | "medium" | "high" com cores distintas (UX-DR5)
- Conflito "low" detectado quando timeframe curto (M15) e horizonte longo (semana/mes) coexistem
- Testes: 3 casos de conflito (low, sem conflito curto, sem conflito longo) + 2 testes UI

### File List

- apps/api/src/services/assistant/assistant.service.ts (novo — buildConflict)
- apps/api/src/services/assistant/ports.ts (novo — WindowConflict, ConflictSeverity)
- apps/web/src/domains/cockpit/ui/AssistantPanel.tsx (novo — painel de conflito)
- apps/web/src/domains/cockpit/ui/AssistantPanel.test.tsx (novo)

### Change Log

- 2026-04-07: Implementação da deteção e apresentação de conflito entre janelas (FR10, UX-DR5).
