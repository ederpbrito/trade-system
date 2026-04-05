---
story_key: 2-2-interface-marketdataprovider-e-implementacao-mock-configuravel
epic: 2
story: 2
status: done
generated: "2026-04-05"
---

# Story 2.2: Interface MarketDataProvider e implementação mock configurável

Status: done

## Story

Como **Eder**,  
quero **ingerir dados de uma fonte mock configurável**,  
para **cumprir FR25 e testar o pipeline sem MT5 real**.

## Acceptance Criteria

**Given** configuração de fonte mock na instância  
**When** o job ou endpoint de sincronização corre  
**Then** barras OHLC são gravadas para instrumentos de teste  
**And** falhas simuladas propagam estado degradado/indisponível (FR26, FR27)

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
- [x] Testes mínimos alinhados à história

### Review Findings

_Sem achados `patch` / `decision` / `defer` específicos desta story após triagem._

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 2.2]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Cursor agent (implementação única épico 2 — stories 2-1 a 2-6)

### Debug Log References

### Completion Notes List

- Interface `MarketDataProvider` + tipos em `services/market-data/ports.ts`; implementação `MockMarketDataProvider` com `simulateFailure` none/degraded/unavailable.
- `POST /api/v1/market-data/mock/sync` (sessão + CSRF) usa `MarketDataIngestionService` e repositórios Drizzle; integração coberta em `market-data.integration.test.ts`.

### File List

- apps/api/src/services/market-data/ports.ts
- apps/api/src/services/market-data/market-data-ingestion.service.ts
- apps/api/src/connectors/mock-market-data.provider.ts
- apps/api/src/repositories/drizzle-connector-health.repository.ts
- apps/api/src/repositories/drizzle-instrument.repository.ts
- apps/api/src/repositories/drizzle-ohlc.repository.ts
- apps/api/src/routes/v1/market-data.routes.ts
- apps/api/src/composition/realtime-hub.ts
- apps/api/src/connectors/mock-market-data.provider.test.ts
- apps/api/src/routes/v1/market-data.integration.test.ts

### Change Log

- 2026-04-05: Story 2.2 implementada no âmbito do batch épico 2; estado sprint → review.
- 2026-04-05: Code review — estado → in-progress (épico 2).
- 2026-04-05: Épico 2 fechado — story `done`; `sprint-status` actualizado.
