---
story_key: 2-3-api-e-ui-de-estado-das-fontes
epic: 2
story: 3
status: done
generated: "2026-04-05"
---

# Story 2.3: API e UI de estado das fontes

Status: done

## Story

Como **Eder**,  
quero **ver o estado de cada fonte no cockpit**,  
para **FR26 e UX-DR7**.

## Acceptance Criteria

**Given** pelo menos uma fonte configurada  
**When** abro o cockpit ou painel de estado  
**Then** vejo indicador operacional/degradada/indisponível por fonte ou ativo afetado  
**And** mudança de estado para degradado torna-se visível no UI dentro do alvo NFR-I1 (30s ou documentado)

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
- [x] Testes mínimos alinhados à história

### Review Findings

_Sem achados `patch` / `decision` / `defer` após triagem (NFR-I1 coberto por *polling* 15s documentado)._

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 2.3]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Cursor agent (implementação única épico 2 — stories 2-1 a 2-6)

### Debug Log References

### Completion Notes List

- API: `GET /api/v1/data-sources/health` (autenticada) via `DataSourcesService`.
- UI: secção «Estado das fontes» em `CockpitPage` com *polling* 15s (NFR-I1 ≤30s documentado no comentário do componente); etiquetas Operacional/Degradada/Indisponível.
- Teste web: `CockpitPage.test.tsx` com `fetch` mock.

### File List

- apps/api/src/services/data-sources/data-sources.service.ts
- apps/api/src/routes/v1/data-sources.routes.ts
- apps/web/src/domains/cockpit/ui/CockpitPage.tsx
- apps/web/src/domains/cockpit/ui/CockpitPage.test.tsx

### Change Log

- 2026-04-05: Story 2.3 implementada no âmbito do batch épico 2; estado sprint → review.
- 2026-04-05: Code review — estado → in-progress (épico 2).
- 2026-04-05: Épico 2 fechado — story `done`; `sprint-status` actualizado.
