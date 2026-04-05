---
story_key: 3-6-layout-cockpit-tres-colunas-desktop-com-degradacao-responsiva
epic: 3
story: 6
status: ready-for-dev
generated: "2026-04-05"
---

# Story 3.6: Layout cockpit três colunas (desktop) com degradação responsiva

Status: ready-for-dev

## Story

Como **Eder**,  
quero **layout recomendado pela UX em desktop e uso legível em tablet/mobile**,  
para **UX-DR9**.

## Acceptance Criteria

**Given** viewport ≥ 1024px  
**When** abro o cockpit com candidato seleccionado  
**Then** lista | detalhe | assistente (ou placeholder do assistente) coexistem sem sobreposição crítica  
**Given** viewport inferior a 768px  
**When** uso o cockpit  
**Then** prioridade é lista + alertas conforme UX spec

---

## Épico 4: Gestão de risco configurável no fluxo de decisão

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 3.6]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

(preencher após implementação)

### Debug Log References

### Completion Notes List

### File List

(preencher após implementação)
