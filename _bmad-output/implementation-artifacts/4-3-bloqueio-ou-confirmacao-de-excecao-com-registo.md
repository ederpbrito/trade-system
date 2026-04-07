---
story_key: 4-3-bloqueio-ou-confirmacao-de-excecao-com-registo
epic: 4
story: 3
status: review
generated: "2026-04-05"
---

# Story 4.3: Bloqueio ou confirmação de exceção com registo

Status: review

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

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
- [x] Testes mínimos alinhados à história

### Review Findings

- [x] [Review][Decision] Definir onde acontece o "tento avançar" da story 4.3 — resolvido: botão "Prosseguir" no resultado de aderência bloqueado até todas as violações terem exceção registada; prop `onProceed` em `RiskPanel` para ligar ao fluxo de decisão do cockpit.

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

claude-4.6-sonnet-medium (2026-04-06)

### Debug Log References

(sem bloqueios)

### Completion Notes List

- Tabela `risk_exception_log` adicionada ao schema com campos: `user_id`, `limit_key`, `proposed_value`, `limit_value`, `reason`, `context_json`, `approved`, `created_at`.
- `RiskService.recordException` — exige motivo não vazio; persiste com `approved=true`; lança `RISK_EXCEPTION_REASON_REQUIRED` se vazio.
- `RiskService.recordBlock` — persiste com `approved=false` e `reason="bloqueio-automático"` (para uso futuro por regras automáticas).
- Rota `POST /api/v1/risk/exception` — regista exceção aprovada; devolve 422 se motivo vazio.
- Rota `GET /api/v1/risk/exceptions` — trilha consultável (base para Épico 5 FR29).
- UI: após violação detectada em 4.2, botão "Registar exceção" abre formulário inline com `role="dialog"`, campo de motivo obrigatório (`aria-required`), confirmação laranja. Contexto do candidato activo é incluído em `contextJson`.
- 5 testes unitários cobrem: registo com motivo, rejeição sem motivo, bloqueio automático, delegação ao repositório.

### File List

(ver 4.1 — implementação partilhada no mesmo conjunto de ficheiros)

### Change Log

- 2026-04-06: Implementado como parte do conjunto 4.1/4.2/4.3.
