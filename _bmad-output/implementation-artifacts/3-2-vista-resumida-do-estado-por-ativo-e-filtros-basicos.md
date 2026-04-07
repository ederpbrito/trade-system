---
story_key: 3-2-vista-resumida-do-estado-por-ativo-e-filtros-basicos
epic: 3
story: 2
status: done
generated: "2026-04-05"
---

# Story 3.2: Vista resumida do estado por ativo e filtros básicos

Status: done

## Story

Como **Eder**,  
quero **ver estado resumido e filtrar por mercado/prioridade**,  
para **FR2, FR4**.

## Acceptance Criteria

**Given** watchlist com vários ativos  
**When** abro o cockpit  
**Then** cada linha mostra resumo (preço/alteração ou placeholder alimentado por dados disponíveis)  
**When** aplico filtro por mercado ou prioridade  
**Then** a lista actualiza em menos de 200 ms com dados já em cache (NFR-P1)

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes (N/A)
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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 3.2]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Composer (lote épico 3)

### Debug Log References

### Completion Notes List

- Resumo por linha: último `close` OHLC ou tick WS; mercado = `venue` ou `connectorId`; filtros mercado/prioridade em `useMemo` (NFR-P1 com dados em cache no cliente).

### File List

- apps/api/src/services/watchlist/watchlist.service.ts
- apps/api/src/repositories/drizzle-ohlc.repository.ts
- apps/api/src/services/market-data/ports.ts
- apps/web/src/domains/cockpit/ui/CockpitPage.tsx
- apps/web/src/domains/cockpit/ui/CockpitPage.test.tsx

## Change Log

- 2026-04-06: Vista resumida e filtros básicos no cockpit.
