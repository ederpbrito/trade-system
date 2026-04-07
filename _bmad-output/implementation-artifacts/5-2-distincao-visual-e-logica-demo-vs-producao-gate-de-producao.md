---
story_key: 5-2-distincao-visual-e-logica-demo-vs-producao-gate-de-producao
epic: 5
story: 2
status: review
generated: "2026-04-05"
---

# Story 5.2: Distinção visual e lógica demo vs produção + gate de produção

Status: review

## Story

Como **Eder**,  
quero **saber sempre em que modo estou e não operar em produção sem critérios**,  
para **FR18, FR19, UX-DR6**.

## Acceptance Criteria

**Given** interface de execução  
**When** estou em demo  
**Then** barra ou *badge* persistente indica DEMO (UX-DR6)  
**When** produção está bloqueada por gates  
**Then** não consigo submeter ordem real e vejo mensagem com critérios pendentes (FR19)

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 5.2]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium (2026-04-07)

### Debug Log References

Sem bloqueios.

### Completion Notes List

- Badge DEMO persistente implementado em `ExecutionPanel.tsx` (UX-DR6): barra amarela com badge "DEMO" sempre visível na área de execução.
- Badge de PRODUÇÃO com cor vermelha quando modo for production.
- Gate de produção (FR19): rota `POST /api/v1/execution/intent` devolve 403 com `PRODUCTION_GATE_BLOCKED` e lista de critérios pendentes quando modo é production.
- UI mostra mensagem de bloqueio com critérios pendentes quando modo é production.
- Rota `GET /api/v1/execution/mode` expõe modo actual para a UI.

### File List

- `apps/web/src/domains/cockpit/ui/ExecutionPanel.tsx` (novo — badge DEMO/PRODUÇÃO + gate UI)
- `apps/api/src/routes/v1/execution.routes.ts` (novo — gate de produção FR19)

## Change Log

- 2026-04-07: Implementação completa da Story 5.2 — badge DEMO persistente, gate de produção com mensagem de critérios pendentes.
