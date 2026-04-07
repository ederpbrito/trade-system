---
story_key: 3-1-crud-da-lista-monitorizada
epic: 3
story: 1
status: done
generated: "2026-04-05"
---

# Story 3.1: CRUD da lista monitorizada

Status: done

## Story

Como **Eder**,  
quero **adicionar, editar e remover ativos da watchlist**,  
para **FR1**.

## Acceptance Criteria

**Given** cockpit autenticado  
**When** adiciono um instrumento válido do catálogo interno  
**Then** aparece na lista persistida após refresh  
**When** edito ou removo  
**Then** as alterações reflectem-se na API e na UI

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes (N/A: migração Drizzle existente `db:migrate`)
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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 3.1]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Composer (implementação única lote épico 3)

### Debug Log References

### Completion Notes List

- API `GET/POST/PATCH/DELETE /api/v1/watchlist`; catálogo `GET /api/v1/instruments`; tabela `watchlist_entries` + migração `0002_watchlist.sql`; validação de instrumento existente no POST.

### File List

- apps/api/src/db/schema.ts
- apps/api/drizzle/migrations/0002_watchlist.sql
- apps/api/drizzle/migrations/meta/_journal.json
- apps/api/src/services/watchlist/ports.ts
- apps/api/src/services/watchlist/watchlist.service.ts
- apps/api/src/repositories/drizzle-watchlist.repository.ts
- apps/api/src/routes/v1/watchlist.routes.ts
- apps/api/src/routes/v1/instruments.routes.ts
- apps/api/src/services/market-data/ports.ts
- apps/api/src/repositories/drizzle-instrument.repository.ts
- apps/api/src/repositories/drizzle-ohlc.repository.ts
- apps/api/src/composition/create-app-services.ts
- apps/api/src/composition/http-stack.ts
- apps/api/src/app.ts
- apps/api/src/routes/v1/watchlist.integration.test.ts
- apps/web/src/domains/cockpit/ui/CockpitPage.tsx

## Change Log

- 2026-04-06: CRUD watchlist persistido, UI cockpit (adicionar/editar prioridade/remover), teste de integração.

### Review Findings

**Decision needed:**
- [x] [Review][Decision] 3-2: variação de preço (delta/%) não implementada — Opção A escolhida: implementado `changePercent` via `previousClose` (query top-2 por instrumento). Resolvido 2026-04-06.

**Patch:**
- [x] [Review][Patch] `priorityLabel` definida mas nunca usada [apps/web/src/domains/cockpit/ui/CockpitPage.tsx:74]
- [x] [Review][Patch] `onAddWatchlist`/`onRemoveEntry` sem try/catch para erros de rede [apps/web/src/domains/cockpit/ui/CockpitPage.tsx:250-276]
- [x] [Review][Patch] `entryId` não validado como UUID em PATCH/DELETE [apps/api/src/routes/v1/watchlist.routes.ts:58,76]
- [x] [Review][Patch] `create()` no repositório não é atómica (insert + select separados sem transação) [apps/api/src/repositories/drizzle-watchlist.repository.ts:45-66]
- [x] [Review][Patch] PATCH route faz `listForUser` completo para devolver 1 entrada (ineficiente) [apps/api/src/routes/v1/watchlist.routes.ts:67]
- [x] [Review][Patch] `e.updatedAt?.getTime()` pode ser NaN se `updatedAt` for null [apps/api/src/services/opportunities/opportunities-candidates.service.ts:60]

**Deferred:**
- [x] [Review][Defer] `loadWatchlist`/`loadCatalog` silenciam erros sem feedback ao utilizador [CockpitPage.tsx:183,191] — deferred, pre-existing pattern no cockpit
- [x] [Review][Defer] `candidateSort` enviado à API mas ordenação feita no cliente (parâmetro redundante) [CockpitPage.tsx:196] — deferred, pre-existing
- [x] [Review][Defer] `useViewportBand` sem debounce no resize [CockpitPage.tsx:100-109] — deferred, optimização futura
- [x] [Review][Defer] `instrumentIds` com duplicados em `latestBarPerInstrumentIds` não são deduplicados [drizzle-ohlc.repository.ts] — deferred, watchlist tem unique constraint por utilizador+instrumento
