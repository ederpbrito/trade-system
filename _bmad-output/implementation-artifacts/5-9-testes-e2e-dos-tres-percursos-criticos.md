---
story_key: 5-9-testes-e2e-dos-tres-percursos-criticos
epic: 5
story: 9
status: ready-for-dev
generated: "2026-04-05"
---

# Story 5.9: Testes e2e dos três percursos críticos

Status: ready-for-dev

## Story

Como **Eder**,  
quero **testes automatizados dos fluxos feliz, conflito+risco e dados degradados**,  
para **UX-DR15 e confiança de release**.

## Acceptance Criteria

**Given** pipeline CI ou comando local  
**When** executo suíte e2e  
**Then** três cenários mínimos passam (definidos em linguagem de teste: happy path decisão demo, bloqueio/exceção, fonte degradada visível)

---

## Épico 6: Assistente de decisão contextual

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 5.9]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

(preencher após implementação)

### Debug Log References

### Completion Notes List

### File List

(preencher após implementação)
