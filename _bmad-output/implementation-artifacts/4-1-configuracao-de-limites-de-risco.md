---
story_key: 4-1-configuracao-de-limites-de-risco
epic: 4
story: 1
status: review
generated: "2026-04-05"
---

# Story 4.1: Configuração de limites de risco

Status: review

## Story

Como **Eder**,  
quero **definir limites (posição, perda diária, concentração, etc.)**,  
para **FR13, FR35**.

## Acceptance Criteria

**Given** área de definições de risco  
**When** introduzo valores válidos  
**Then** são persistidos e validados (tipos, mínimos/máximos)  
**And** labels e erros são acessíveis (UX-DR13)

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
- [x] Testes mínimos alinhados à história

### Review Findings

- [x] [Review][Patch] Completar `mergeServices` com `riskService` [`apps/api/src/app.ts:17`] — corrigido
- [x] [Review][Patch] Alinhar chave de sessão das rotas de risco com o login autenticado [`apps/api/src/routes/v1/risk.routes.ts:14`] — corrigido (`user` → `userId`)

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 4.1]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium (2026-04-06)

### Debug Log References

(sem bloqueios)

### Completion Notes List

- Tabela `risk_limits` adicionada ao schema Drizzle com campos: `max_position_size`, `max_daily_loss`, `max_concentration`, `max_total_exposure`. Migração gerada em `drizzle/migrations/0003_blushing_captain_midlands.sql`.
- `IRiskLimitsRepository` e `IRiskExceptionRepository` definidas em `services/risk/ports.ts` (DIP).
- `DrizzleRiskLimitsRepository` implementa upsert via `onConflictDoUpdate` (unique por `user_id`).
- `RiskService.setLimits` valida tipos e intervalos; lança `RISK_LIMITS_INVALID` com lista de erros acessíveis (UX-DR13).
- Rotas `GET /api/v1/risk/limits` e `PUT /api/v1/risk/limits` protegidas por sessão.
- `RiskPanel` no cockpit: formulário com labels `htmlFor` + `aria-describedby` para erros (WCAG AA); feedback de sucesso com `role="status"`.
- 18 testes unitários passam (cobrindo 4.1, 4.2, 4.3).

### File List

- `apps/api/src/db/schema.ts` (modificado — tabelas `risk_limits`, `risk_exception_log`)
- `apps/api/drizzle/migrations/0003_blushing_captain_midlands.sql` (criado)
- `apps/api/src/services/risk/ports.ts` (criado)
- `apps/api/src/services/risk/risk.service.ts` (criado)
- `apps/api/src/services/risk/risk.service.test.ts` (criado)
- `apps/api/src/repositories/drizzle-risk-limits.repository.ts` (criado)
- `apps/api/src/repositories/drizzle-risk-exception.repository.ts` (criado)
- `apps/api/src/routes/v1/risk.routes.ts` (criado)
- `apps/api/src/composition/create-app-services.ts` (modificado)
- `apps/api/src/composition/http-stack.ts` (modificado)
- `apps/web/src/domains/cockpit/ui/RiskPanel.tsx` (criado)
- `apps/web/src/domains/cockpit/ui/CockpitPage.tsx` (modificado)

### Change Log

- 2026-04-06: Implementação completa das histórias 4.1, 4.2, 4.3 — limites de risco, aderência pré-decisão e bloqueio/exceção com registo auditável.
