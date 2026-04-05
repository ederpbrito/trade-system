---
story_key: 4-3-bloqueio-ou-confirmacao-de-excecao-com-registo
epic: 4
story: 3
status: ready-for-dev
generated: "2026-04-05"
---

# Story 4.3: Bloqueio ou confirmação de exceção com registo

Status: ready-for-dev

## Story

Como **Eder**,  
quero **ser bloqueado ou forçado a confirmar exceção quando violo regras**,  
para **FR15**.

## Acceptance Criteria

**Given** decisão que viola limite  
**When** tento avançar  
**Then** o sistema bloqueia OU exige confirmação explícita com motivo de exceção registado  
**And** o evento fica na trilha auditável (ligação ao Épico 5)

---

## Épico 5: Execução em demo, registo de decisão e trilha auditável

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 4.3]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

(preencher após implementação)

### Debug Log References

### Completion Notes List

### File List

(preencher após implementação)
