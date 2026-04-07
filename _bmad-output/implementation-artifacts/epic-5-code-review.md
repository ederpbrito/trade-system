# Code Review — Épico 5 (Stories 5-1 a 5-9)

**Data:** 2026-04-07  
**Reviewer:** bmad-code-review (3 camadas: Blind Hunter, Edge Case Hunter, Acceptance Auditor)  
**Modo:** full (spec disponível)  
**Diff:** ~39 ficheiros, ~2319 linhas

---

## Resumo

| Categoria | Contagem |
|-----------|----------|
| `decision_needed` | 1 |
| `patch` | 13 |
| `defer` | 4 |
| `dismiss` | 1 |

---

## Findings

### Decision Needed

- [x] [Review][Decision] **Idempotência: unique constraint na BD vs. bloqueio aplicacional** — RESOLVIDO: opção A aplicada. Adicionado `UNIQUE(user_id, idempotency_key)` via migração `0005_epic5_review_fixes.sql`. `findByIdempotencyKey` actualizado para filtrar por `userId`. [`apps/api/src/db/schema.ts`, `apps/api/drizzle/migrations/0005_epic5_review_fixes.sql`]

---

### Patches

- [x] [Review][Patch] **Idempotência não isolada por userId (IDOR)** — CORRIGIDO: `findByIdempotencyKey(key, userId)` agora filtra por ambos. [`apps/api/src/repositories/drizzle-order-intent.repository.ts`]

- [x] [Review][Patch] **`quantity=0` devolve INTENT_MISSING_FIELDS em vez de INTENT_INVALID_QUANTITY** — CORRIGIDO: `!body.quantity` → `body.quantity == null`. [`apps/api/src/routes/v1/execution.routes.ts`]

- [x] [Review][Patch] **`quantity` NaN/Infinity não rejeitado no serviço** — CORRIGIDO: `Number.isFinite(input.quantity)` adicionado. [`apps/api/src/services/trading-mode/trading-mode.service.ts`]

- [x] [Review][Patch] **`limit`/`offset` sem validação: NaN, negativos, sem teto máximo** — CORRIGIDO: helper `parseLimit`/`parseOffset` com `MAX_LIMIT=500`. [`apps/api/src/shared/query-params.ts`]

- [x] [Review][Patch] **Filtros `from`/`to` com `new Date()` sem validação** — CORRIGIDO: `parseDateParam` na rota + guarda `isNaN` nos repositórios. [`apps/api/src/shared/query-params.ts`, repositórios]

- [x] [Review][Patch] **`DecisionForm` e `ExecutionPanel` não expõem `requestId` copiável (FR36/UX-DR12)** — CORRIGIDO: ambos usam `ApiErrorDisplay` com `ApiError` completo. [`apps/web/src/domains/cockpit/ui/DecisionForm.tsx`, `ExecutionPanel.tsx`]

- [x] [Review][Patch] **Replay idempotente emite evento de auditoria duplicado** — CORRIGIDO: `submitIntent` devolve `{ record, idempotent }`; rota só emite auditoria quando `!idempotent`. [`apps/api/src/services/trading-mode/trading-mode.service.ts`, `execution.routes.ts`]

- [x] [Review][Patch] **`tags` não validado como array de strings** — CORRIGIDO: validação explícita na rota antes de persistir. [`apps/api/src/routes/v1/decisions.routes.ts`]

- [x] [Review][Patch] **`byDecision` e `byMode` contadores com `else` genérico** — CORRIGIDO: `else if` explícito em ambos os contadores. [`apps/api/src/services/decisions/metrics.service.ts`]

- [x] [Review][Patch] **`execCommand` fallback não verifica retorno** — CORRIGIDO: `const ok = execCommand(...)` + `if (ok)`. [`apps/web/src/shared/ui/ApiErrorDisplay.tsx`]

- [x] [Review][Patch] **`setTimeout` sem cleanup após desmontagem do componente** — CORRIGIDO: `useRef` + `useEffect` com cleanup. [`apps/web/src/shared/ui/ApiErrorDisplay.tsx`]

- [x] [Review][Patch] **Testes e2e com `test.skip()` e asserções condicionais (AC 5-9)** — CORRIGIDO: testes reescritos com asserções obrigatórias e sem `test.skip()`. [`e2e/01-happy-path-demo-decision.spec.ts`, `e2e/02-risk-block-exception.spec.ts`, `e2e/03-degraded-source-visible.spec.ts`]

- [x] [Review][Patch] **`ExecutionPanel.loadMode` sem tratamento de erro visível** — CORRIGIDO: estado `loadModeError` com mensagem e botão "Tentar novamente". [`apps/web/src/domains/cockpit/ui/ExecutionPanel.tsx`]

- [x] [Review][Patch] **`price` inválido no `ExecutionPanel` envia NaN serializado como null** — CORRIGIDO: `Number.isFinite(parsedPrice)` antes de incluir no body. [`apps/web/src/domains/cockpit/ui/ExecutionPanel.tsx`]

---

### Deferred

- [x] [Review][Defer] **Auditoria falha em silêncio (decision.created e execution.intent)** [`apps/api/src/services/decisions/decisions.service.ts:50`, `apps/api/src/routes/v1/execution.routes.ts:106`] — deferred, pre-existing design; auditoria é best-effort por design no MVP; rever em épico de resiliência
- [x] [Review][Defer] **Métricas truncadas a 1000 registos sem indicação ao utilizador** [`apps/api/src/services/decisions/metrics.service.ts:16`] — deferred, pre-existing; MVP aceitável; adicionar `isTruncated` flag em épico de métricas avançadas
- [x] [Review][Defer] **Auditoria sem `offset` (paginação incompleta além do `limit`)** [`apps/api/src/repositories/drizzle-audit.repository.ts` — `AuditFilter`] — deferred, pre-existing; adicionar cursor-based pagination em épico de auditoria
- [x] [Review][Defer] **Validação HTTP por cast em vez de schema declarativo (Zod/JSON Schema)** [`apps/api/src/routes/v1/`] — deferred, pre-existing padrão do projecto; migrar para Zod em refactoring transversal

---

## Dismissed

- **XSS potencial em `error.message`** — React faz escape automático de strings em JSX; não é vulnerabilidade. (1 dismissed)
