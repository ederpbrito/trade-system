---
story_key: 3-5-filtrar-e-ordenar-candidatos-por-janela
epic: 3
story: 5
status: done
generated: "2026-04-05"
---

# Story 3.5: Filtrar e ordenar candidatos por janela

Status: done

## Story

Como **Eder**,  
quero **filtrar/ordenar por combinação de timeframe e horizonte**,  
para **FR7**.

## Acceptance Criteria

**Given** múltiplos candidatos  
**When** selecciono filtro M15 + horizonte dia (exemplo)  
**Then** só vejo candidatos correspondentes  
**When** ordeno por prioridade ou tempo  
**Then** a ordem é estável e testável

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 3.5]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Composer (lote épico 3)

### Debug Log References

### Completion Notes List

- Filtros TF + horizonte na UI; ordenação por prioridade ou tempo com função estável (`candidate-sort.ts` API + `candidate-utils` web + testes).

### File List

- apps/api/src/services/opportunities/candidate-sort.ts
- apps/api/src/services/opportunities/candidate-sort.test.ts
- apps/api/src/routes/v1/opportunities.routes.ts
- apps/web/src/domains/cockpit/lib/candidate-utils.ts
- apps/web/src/domains/cockpit/lib/candidate-utils.test.ts
- apps/web/src/domains/cockpit/ui/CockpitPage.tsx

## Change Log

- 2026-04-06: Filtrar e ordenar candidatos por janela (FR7).
