---
story_key: 7-4-comparar-versoes-ou-experimentos-na-ui
epic: 7
story: 4
status: ready-for-dev
generated: "2026-04-05"
---

# Story 7.4: Comparar versões ou experimentos na UI

Status: ready-for-dev

## Story

Como **Eder**,  
quero **comparar indicadores entre corridas**,  
para **FR24**.

## Acceptance Criteria

**Given** pelo menos dois experimentos  
**When** abro comparador MVP  
**Then** vejo tabela ou cartões lado a lado com métricas definidas (ex.: profit factor proxy em demo, drawdown simulado, etc.) documentadas no produto

---

## Validação final (passo 4)

| Verificação | Resultado |
|-------------|-----------|
| Cobertura FR1–FR36 | Cada FR mapeado no mapa e endereçado em pelo menos uma história ou critério. |
| Starter / fundação | História 1.1 cobre monorepo Vite + Fastify + Postgres + Drizzle conforme arquitetura. |
| Tabelas incrementais | Esquemas aparecem nas histórias que os necessitam (2.1, não tudo na 1.1). |
| Dependências entre histórias | Ordem numérica dentro de cada épico; épicos posteriores assumem anteriores — cada épico entrega valor próprio. |
| UX-DR | UX-DR1–2 embutidos em decisões de UI nas histórias 3.x/5.x; DR3–15 cobertos nas histórias indicadas. |
| NFR | P1/P2 em 3.x e 2.4; segurança em 1.x, 2.6; integração em 2.x; acessibilidade em 4.x, 5.x, 6.x; e2e em 5.9. |

**Workflow:** concluído. Para próximos passos no BMAD, usar **bmad-help** ou **check implementation readiness** quando existir alinhamento final entre artefactos.

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 7.4]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

(preencher após implementação)

### Debug Log References

### Completion Notes List

### File List

(preencher após implementação)
