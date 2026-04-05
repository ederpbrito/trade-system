---
story_key: 5-2-distincao-visual-e-logica-demo-vs-producao-gate-de-producao
epic: 5
story: 2
status: ready-for-dev
generated: "2026-04-05"
---

# Story 5.2: Distinção visual e lógica demo vs produção + gate de produção

Status: ready-for-dev

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 5.2]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

(preencher após implementação)

### Debug Log References

### Completion Notes List

### File List

(preencher após implementação)
