---
story_key: 7-3-persistencia-de-metricas-e-artefactos-de-experimentos
epic: 7
story: 3
status: done
generated: "2026-04-05"
---

# Story 7.3: Persistência de métricas e artefactos de experimentos

Status: done

## Story

Como **Eder**,  
quero **métricas e artefactos ligados a versão de política e dataset**,  
para **FR23**.

## Acceptance Criteria

**Given** execução de experimento concluída  
**When** consulto registo  
**Then** vejo versão política, *hash* ou id de dataset, métricas principais e caminho seguro ao artefacto (armazenamento conforme arquitetura)

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 7.3]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium

### Debug Log References

### Completion Notes List

- Tabela `experiment_runs` com `policy_version`, `dataset_hash`, `metrics_json`, `artifact_path` adicionada ao schema.
- `ExperimentsService` com `getById` e `listForUser` implementados.
- Porta `IExperimentRepository` + `DrizzleExperimentRepository` implementados.
- Métricas: `profitFactorProxy`, `simulatedDrawdown`, `winRate`, `totalTrades` — armazenadas em JSON.
- `artifact_path` armazenado como caminho relativo ao servidor (nunca URL pública).
- Rotas `GET /api/v1/experiments` e `GET /api/v1/experiments/:id` com verificação de ownership.
- `TrainingJobService` cria automaticamente um `ExperimentRun` após cada job de treino bem-sucedido.
- 3 testes unitários para `ExperimentsService`.

### File List

- apps/api/src/services/experiments/ports.ts (novo)
- apps/api/src/services/experiments/experiments.service.ts (novo)
- apps/api/src/services/experiments/experiments.service.test.ts (novo)
- apps/api/src/repositories/drizzle-experiment.repository.ts (novo)
- apps/api/src/routes/v1/experiments.routes.ts (novo)
- apps/api/src/composition/create-app-services.ts (modificado)
- apps/api/src/composition/http-stack.ts (modificado)

### Change Log

- 2026-04-07: Implementação completa da história 7.3 — persistência de métricas e artefactos, rotas e testes.

### Review Findings

- [x] [Review][Patch] `artifact_path` no fluxo automático — **resolvido**: `artifacts/paper-demo/{jobId}.json` em `TrainingJobService.createAndRun` (batch 2026-04-07).
- [x] [Review][Defer] `JSON.parse(row.metricsJson)` em `drizzle-experiment.repository.ts` sem `try/catch` — métricas inválidas na BD derrubam a listagem; alinhar com hardening de parsing noutros repositórios.
