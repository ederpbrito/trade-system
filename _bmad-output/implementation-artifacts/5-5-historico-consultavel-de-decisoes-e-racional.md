---
story_key: 5-5-historico-consultavel-de-decisoes-e-racional
epic: 5
story: 5
status: review
generated: "2026-04-05"
---

# Story 5.5: Histórico consultável de decisões e racional

Status: review

## Story

Como **Eder**,  
quero **listar decisões passadas com racional**,  
para **FR30**.

## Acceptance Criteria

**Given** decisões registadas  
**When** abro histórico  
**Then** posso filtrar por ativo/data e abrir detalhe com racional

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 5.5]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium (2026-04-07)

### Debug Log References

Sem bloqueios.

### Completion Notes List

- Rota `GET /api/v1/decisions` com filtros: `symbolInternal`, `from` (ISO date), `to` (ISO date), `limit`, `offset`.
- Rota `GET /api/v1/decisions/:id` para detalhe de uma decisão (com verificação de ownership).
- `DecisionHistoryPanel.tsx` tab "Decisões (FR30)": lista com filtros por ativo e intervalo de datas, detalhe expansível com racional, tags e nota.
- Detalhe mostra: tipo de decisão (badge colorido), modo, símbolo, janela (TF/horizonte), data, racional completo, tags e nota.
- Filtros aplicados no servidor; UI envia query params.

### File List

- `apps/api/src/routes/v1/decisions.routes.ts` (novo — GET /api/v1/decisions com filtros)
- `apps/web/src/domains/cockpit/ui/DecisionHistoryPanel.tsx` (novo — histórico com filtros e detalhe)

## Change Log

- 2026-04-07: Implementação completa da Story 5.5 — histórico consultável de decisões com filtros por ativo/data e detalhe com racional.
