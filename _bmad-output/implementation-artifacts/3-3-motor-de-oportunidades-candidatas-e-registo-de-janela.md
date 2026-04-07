---
story_key: 3-3-motor-de-oportunidades-candidatas-e-registo-de-janela
epic: 3
story: 3
status: done
generated: "2026-04-05"
---

# Story 3.3: Motor de oportunidades candidatas e registo de janela

Status: done

## Story

Como **Eder**,  
quero **ver oportunidades geradas para os meus ativos com janela registada**,  
para **FR5, FR8**.

## Acceptance Criteria

**Given** dados de mercado disponíveis (mock ou real)  
**When** o motor corre  
**Then** candidatos são listados com referência ao instrumento  
**And** cada candidatura persiste ou expõe `timeframe` e `horizonte` (FR6 base)  
**And** ao seleccionar para análise, a janela considerada fica associada ao contexto de decisão (FR8)

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 3.3]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Composer (lote épico 3)

### Debug Log References

### Completion Notes List

- `GET /api/v1/opportunities/candidates`: candidatos por entradas da watchlist, com `timeframe`/`horizonte`; política de degradação alinhada ao preview; selecção na UI define contexto de decisão (FR8).

### File List

- apps/api/src/services/opportunities/opportunities-candidates.service.ts
- apps/api/src/services/opportunities/degradation.ts
- apps/api/src/routes/v1/opportunities.routes.ts
- apps/api/src/composition/create-app-services.ts
- apps/api/src/routes/v1/watchlist.integration.test.ts
- apps/web/src/domains/cockpit/ui/CockpitPage.tsx

## Change Log

- 2026-04-06: Motor de candidatos por watchlist + registo de janela na UI.
