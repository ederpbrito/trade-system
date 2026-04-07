---
story_key: 6-1-explicacao-da-tese-da-oportunidade-na-janela-assistantservice-regras
epic: 6
story: 1
status: done
generated: "2026-04-05"
---

# Story 6.1: Explicação da tese da oportunidade na janela (AssistantService regras)

Status: done

## Story

Como **Eder**,  
quero **explicação estruturada da tese no contexto da janela seleccionada**,  
para **FR9**.

## Acceptance Criteria

**Given** candidato e janela seleccionados  
**When** solicito parecer do assistente  
**Then** recebo secções estáveis (ex.: resumo, fatores, incerteza) geradas por regras/templates ou serviço configurável  
**And** o contrato JSON é versionável sem mudar a UI

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
- [x] Testes mínimos alinhados à história

### Senior Developer Review (AI)

**Outcome:** Changes Requested → Resolvido  
**Data:** 2026-04-07  
**Action Items:** 6 patch + 1 decision (resolvido) + 4 defer

### Review Follow-ups (AI)

- [x] [Review][Patch] `buildRiskRelation`: `!maxPositionSize` falha para valor 0 — corrigido para `=== null` [assistant.service.ts:120]
- [x] [Review][Patch] `buildConflict`: H1/dia e H4/dia geravam conflito incorretamente — lógica refactorizada para detectar apenas divergência real (M15 + horizonte longo) [assistant.service.ts:85]
- [x] [Review][Patch] Race condition em mudanças rápidas de candidato — adicionado `AbortController` [AssistantPanel.tsx:116]
- [x] [Review][Patch] ID `asst-title` hardcoded podia duplicar — substituído por `useId()` [AssistantPanel.tsx:104]
- [x] [Review][Patch] `adherenceSummary` null sem guarda quando `hasLimits=true` — adicionada verificação [AssistantPanel.tsx:318]
- [x] [Review][Patch] Teste de preservação de estado com asserção fraca — verificação de conteúdo visível adicionada [AssistantPanel.test.tsx:227]
- [x] [Review][Decision] Headroom calculado com posição/perda actuais = 0 — aceite como estimativa teórica conservadora; diferido para épico de gestão de carteira
- [x] [Review][Defer] Tipos duplicados API/web sem partilha via `packages/shared` — deferred, pre-existing
- [x] [Review][Defer] Sem validação de valores permitidos para `timeframe`/`horizonte` na rota — deferred, pre-existing
- [x] [Review][Defer] `instrumentId` não validado contra DB — deferred, pre-existing
- [x] [Review][Defer] Sem fallback para `schemaVersion` desconhecida na UI — deferred, pre-existing

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 6.1]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium (Cursor)

### Debug Log References

Sem bloqueios durante a implementação.

### Completion Notes List

- Given candidato e janela seleccionados / When solicito parecer / Then recebo secções estáveis (resumo, fatores, incerteza) — implementado em AssistantService.generateThesis() com buildSections()
- And o contrato JSON é versionável sem mudar a UI — implementado via campo `schemaVersion` ("1.0") no tipo AssistantThesisResponse
- AssistantService é fachada (ADR-002) substituível por LLM/MCP sem alterar UI
- 12 testes unitários passam no AssistantService (FR9, FR10, FR11)

### File List

- apps/api/src/services/assistant/ports.ts (novo)
- apps/api/src/services/assistant/assistant.service.ts (novo)
- apps/api/src/services/assistant/assistant.service.test.ts (novo)
- apps/api/src/routes/v1/assistant.routes.ts (novo)
- apps/api/src/composition/create-app-services.ts (modificado)
- apps/api/src/composition/http-stack.ts (modificado)

### Change Log

- 2026-04-07: Implementação inicial do AssistantService (FR9) com portas, serviço de regras/templates, rota API GET /api/v1/assistant/thesis e testes unitários.
