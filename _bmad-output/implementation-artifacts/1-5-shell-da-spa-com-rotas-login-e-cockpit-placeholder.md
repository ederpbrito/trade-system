---
story_key: 1-5-shell-da-spa-com-rotas-login-e-cockpit-placeholder
epic: 1
story: 5
status: review
generated: "2026-04-05"
---

# Story 1.5: Shell da SPA com rotas login e cockpit (placeholder)

Status: review

## Story

Como **Eder**,  
quero **navegação básica entre login e cockpit vazio**,  
para **ter o esqueleto onde os épicos seguintes encaixam (UX-DR11 *empty state*)**.

## Acceptance Criteria

**Given** utilizador autenticado  
**When** acedo à rota cockpit  
**Then** vejo *empty state* orientador (ex.: “Adicionar ativo” ou “Configurar fonte”) sem erros de consola  
**Given** não autenticado  
**When** tento aceder ao cockpit  
**Then** sou redireccionado para login

---

## Épico 2: Fontes de mercado, ingestão e tempo quase real

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 1.5]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Cursor Agent

### Debug Log References

### Completion Notes List

- React Router 7: rotas `/login`, `/cockpit`, redireccionamento de `/` para `/cockpit`.
- `RequireAuth` redirecciona utilizadores não autenticados para `/login` (com estado `from`).
- `CockpitPage`: *empty state* orientador (adicionar ativo / configurar fonte), sem dependências que gerem erros de consola na carga inicial.
- Teste `RequireAuth.test.tsx` para redireccionamento.

### File List

- `apps/web/src/App.tsx`, `apps/web/src/main.tsx`, `apps/web/src/routes/RequireAuth.tsx`, `apps/web/src/routes/RequireAuth.test.tsx`
- `apps/web/src/features/cockpit/CockpitPage.tsx`, `apps/web/src/features/auth/LoginPage.tsx`
- `apps/web/vite.config.ts` (proxy `/api`)

### Change Log

- 2026-04-05: Shell da SPA, rotas protegidas e *placeholder* do cockpit com *empty state*.
