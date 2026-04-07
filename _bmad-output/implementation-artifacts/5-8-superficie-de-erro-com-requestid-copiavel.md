---
story_key: 5-8-superficie-de-erro-com-requestid-copiavel
epic: 5
story: 8
status: review
generated: "2026-04-05"
---

# Story 5.8: Superfície de erro com requestId copiável

Status: review

## Story

Como **Eder**,  
quero **copiar requestId quando algo falha**,  
para **FR36 e UX-DR12**.

## Acceptance Criteria

**Given** erro de API com requestId  
**When** abro detalhe de erro ou toast estendido  
**Then** posso copiar o id para diagnóstico

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 5.8]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium

### Debug Log References

Corrigido: adicionado `cleanup` ao `setup.ts` do vitest para evitar contaminação entre testes.

### Completion Notes List

- Componente `ApiErrorDisplay` com exibição de `code`, `message` e `requestId` copiável.
- Botão "Copiar" usa `navigator.clipboard.writeText` com fallback para `execCommand`.
- Hook `useApiError` para extracção e gestão de erros de API em qualquer componente.
- Integrado no `CockpitPage` para erros de watchlist com requestId.
- `role="alert"` para acessibilidade.
- Testes unitários: 6 testes passam.

### File List

- `apps/web/src/shared/ui/ApiErrorDisplay.tsx` (novo)
- `apps/web/src/shared/ui/ApiErrorDisplay.test.tsx` (novo)
- `apps/web/src/shared/http/useApiError.ts` (novo)
- `apps/web/src/domains/cockpit/ui/CockpitPage.tsx` (modificado — integração ApiErrorDisplay e MetricsPanel)
- `apps/web/src/test/setup.ts` (modificado — adicionado cleanup automático)
