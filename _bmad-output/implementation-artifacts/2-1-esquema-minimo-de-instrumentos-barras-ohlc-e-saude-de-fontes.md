---
story_key: 2-1-esquema-minimo-de-instrumentos-barras-ohlc-e-saude-de-fontes
epic: 2
story: 1
status: done
generated: "2026-04-05"
---

# Story 2.1: Esquema mínimo de instrumentos, barras OHLC e saúde de fontes

Status: done

## Story

Como **Eder**,  
quero **tabelas alinhadas à ADR-001 para instrumentos, ohlc_bars e connector_health**,  
para **persistir dados de mercado de forma normalizada**.

## Acceptance Criteria

**Given** migrações Drizzle  
**When** aplico migrações  
**Then** existem tabelas com chaves e timestamps UTC documentados (instrument_id, timeframe, ts_open, quality_flag, etc.)  
**And** `connector_health` suporta estados operacional/degradada/indisponível (FR26)

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
- [x] Testes mínimos alinhados à história

### Review Findings

- [x] [Review][Defer] A migração `0001_market_data.sql` inclui `ALTER TABLE users` sobre `created_at` — ruído/lock de deploy gerado pelo Drizzle; não bloqueia funcionalidade. [`apps/api/drizzle/migrations/0001_market_data.sql`]

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 2.1]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Cursor agent (implementação única épico 2 — stories 2-1 a 2-6)

### Debug Log References

### Completion Notes List

- Esquema Drizzle: `instruments`, `ohlc_bars`, `connector_health` com enum PostgreSQL `connector_state` (operational | degraded | unavailable), `timestamptz` em timestamps, índice único em (`instrument_id`, `timeframe`, `ts_open`).
- Migração gerada: `apps/api/drizzle/migrations/0001_market_data.sql`.

### File List

- apps/api/src/db/schema.ts
- apps/api/drizzle/migrations/0001_market_data.sql
- apps/api/drizzle/migrations/meta/0001_snapshot.json
- apps/api/drizzle/migrations/meta/_journal.json

### Change Log

- 2026-04-05: Story 2.1 implementada no âmbito do batch épico 2; estado sprint → review.
- 2026-04-05: Code review — estado → in-progress (ação pendente noutras stories do mesmo épico).
- 2026-04-05: Épico 2 fechado — story `done`; `sprint-status` actualizado.
