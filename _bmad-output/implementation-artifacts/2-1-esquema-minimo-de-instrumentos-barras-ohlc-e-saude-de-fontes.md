---
story_key: 2-1-esquema-minimo-de-instrumentos-barras-ohlc-e-saude-de-fontes
epic: 2
story: 1
status: ready-for-dev
generated: "2026-04-05"
---

# Story 2.1: Esquema mínimo de instrumentos, barras OHLC e saúde de fontes

Status: ready-for-dev

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

- [ ] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [ ] Actualizar documentação em README se novos comandos/composes
- [ ] Testes mínimos alinhados à história

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

(preencher após implementação)

### Debug Log References

### Completion Notes List

### File List

(preencher após implementação)
