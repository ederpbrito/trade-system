---
story_key: 2-6-armazenamento-seguro-de-credenciais-de-integracao
epic: 2
story: 6
status: ready-for-dev
generated: "2026-04-05"
---

# Story 2.6: Armazenamento seguro de credenciais de integração

Status: ready-for-dev

## Story

Como **Eder**,  
quero **guardar credenciais de fontes/conetores sem aparecerem na UI nem no git**,  
para **FR34 e NFR-S2/S5**.

## Acceptance Criteria

**Given** formulário de configuração de fonte no servidor  
**When** guardo credenciais  
**Then** são persistidas encriptadas ou via segredo do ambiente conforme documentação  
**And** nunca são devolvidas em texto claro à API de leitura para o cliente  
**And** `.env.example` lista apenas chaves necessárias, sem valores secretos

---

## Épico 3: Cockpit, lista monitorizada e oportunidades com janela de operação

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 2.6]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

(preencher após implementação)

### Debug Log References

### Completion Notes List

### File List

(preencher após implementação)
