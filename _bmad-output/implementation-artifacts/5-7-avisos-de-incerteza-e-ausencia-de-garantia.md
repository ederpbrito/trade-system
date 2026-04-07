---
story_key: 5-7-avisos-de-incerteza-e-ausencia-de-garantia
epic: 5
story: 7
status: review
generated: "2026-04-05"
---

# Story 5.7: Avisos de incerteza e ausência de garantia

Status: review

## Story

Como **Eder**,  
quero **avisos explícitos onde o produto não garante resultado financeiro**,  
para **FR32 e UX-DR14**.

## Acceptance Criteria

**Given** fluxos de análise e execução  
**When** utilizo funcionalidades de sinal/assistente  
**Then** copy e componente de aviso aparecem conforme UX spec  
**And** passam verificação manual de contraste/leitura (UX-DR13 onde aplicável)

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 5.7]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium

### Debug Log References

Sem erros relevantes.

### Completion Notes List

- Componente `UncertaintyDisclaimer` com 3 variantes: `banner`, `inline` (default), `compact`.
- Contraste WCAG AA: texto `#78350f` sobre fundo âmbar claro `#fffbeb` (UX-DR13).
- Integrado em `ExecutionPanel` (variante compact) e `DecisionForm` (variante compact com contexto do símbolo).
- `role="note"` e `aria-label` para acessibilidade.
- Testes unitários: 6 testes passam.

### File List

- `apps/web/src/shared/ui/UncertaintyDisclaimer.tsx` (novo)
- `apps/web/src/shared/ui/UncertaintyDisclaimer.test.tsx` (novo)
- `apps/web/src/domains/cockpit/ui/ExecutionPanel.tsx` (modificado — aviso compact adicionado)
- `apps/web/src/domains/cockpit/ui/DecisionForm.tsx` (modificado — aviso compact com contexto)
