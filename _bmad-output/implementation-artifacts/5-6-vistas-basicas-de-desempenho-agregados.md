---
story_key: 5-6-vistas-basicas-de-desempenho-agregados
epic: 5
story: 6
status: review
generated: "2026-04-05"
---

# Story 5.6: Vistas básicas de desempenho / agregados

Status: review

## Story

Como **Eder**,  
quero **ver agregados alinhados aos critérios do produto (ex.: contagem, aderência, métricas demo)**,  
para **FR31** (MVP simples).

## Acceptance Criteria

**Given** dados de decisões e execuções demo  
**When** abro painel de métricas MVP  
**Then** vejo pelo menos um agregado útil (ex.: taxa de aderência ao plano ou contagem de decisões por tipo) documentado

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 5.6]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium

### Debug Log References

Sem erros relevantes.

### Completion Notes List

- `MetricsService` implementado com agregados: total decisões, contagem por tipo/modo, taxa de operar, total intenções, taxa de fill, período dos dados.
- Rota `GET /api/v1/metrics/summary` protegida por sessão.
- Componente `MetricsPanel.tsx` com cards de métricas e botão de refresh.
- Integrado na terceira coluna do cockpit (desktop) e em linha (mid/narrow).
- Testes unitários: 4 testes passam.

### File List

- `apps/api/src/services/decisions/metrics.service.ts` (novo)
- `apps/api/src/services/decisions/metrics.service.test.ts` (novo)
- `apps/api/src/routes/v1/metrics.routes.ts` (novo)
- `apps/api/src/services/trading-mode/ports.ts` (modificado — adicionado `findByUserId` e `OrderIntentFilter`)
- `apps/api/src/repositories/drizzle-order-intent.repository.ts` (modificado — implementado `findByUserId`)
- `apps/api/src/composition/create-app-services.ts` (modificado — adicionado `metricsService`)
- `apps/api/src/composition/http-stack.ts` (modificado — registado `metricsRoutes`)
- `apps/api/src/app.ts` (modificado — `metricsService` no merge)
- `apps/web/src/domains/cockpit/ui/MetricsPanel.tsx` (novo)
