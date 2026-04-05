---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
classification:
  projectType: web_app
  domain: fintech
  complexity: high
  projectContext: greenfield
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-tradesystem.md
  - _bmad-output/planning-artifacts/architecture.md
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
workflowType: prd
prdStatus: complete
prdCompletedAt: "2026-04-05"
---

# Product Requirements Document - tradesystem

**Author:** Eder  
**Date:** 2026-04-05

*Fluxo do documento:* visão e classificação → critérios de sucesso e âmbito → jornadas → requisitos de domínio e inovação → requisitos de *web app* → scoping por fases → requisitos funcionais (contrato de capacidades) → requisitos não funcionais.

**Alinhamento com arquitetura:** as decisões técnicas que materializam este PRD — incluindo **ADR-001** (integração MT5: *bridge*/*batch* e modelo de dados mínimo) e **ADR-002** (visão LLM, orquestração tipo LangChain, MCP e coexistência com RL) — estão em [`_bmad-output/planning-artifacts/architecture.md`](architecture.md), secção *Registos de decisão arquitetural (ADR)*.

## Executive Summary

O **tradesystem** é um sistema pessoal **web** de apoio à decisão e à execução de operações em mercados de capitais, centrado no utilizador **Eder** (investigação e operação individual). O problema endereçado é a **fadiga decisória**, a **inconsistência** entre plano e execução e a **ausência de memória estruturada** sobre erros — evitando tanto ferramentas genéricas como automação opaca sem diálogo com o operador.

A visão é um **cockpit** que monitoriza uma carteira configurável de ativos com prioridade **B3 e EUA** (com extensão a FX/dólar), identifica **oportunidades candidatas** ao longo do dia e ancora cada análise numa **janela de operação** explícita: **timeframes** de gráfico e **horizonte** (intradiário/dia, semanal, mensal). O fluxo padrão é **oportunidade + janela → análise de risco → recomendação de operar ou não**, com trilha auditável. Um **assistente** explicita alinhamentos e **conflitos entre janelas** (ex.: sinal de curto prazo contra tendência semanal); um **agente com pipeline de aprendizado** (inspirado em RL + integração operacional) melhora com dados e resultados, **validado primeiro em demo/paper** antes de produção. O sucesso é medido em **processo**, **risco controlado** e **edge mensurável** (ex.: profit factor, aderência ao plano, drawdown dentro de limites), não em promessa de lucro garantido.

### O que torna isto especial

- **Realismo de expectativas** como requisito: valor em disciplina, transparência e métricas, não em “só lucro”.
- **Duplo núcleo**: aprendizagem automática **e** apoio humano na decisão — reduz caixa-preta e mantém accountability.
- **Coerência de janela**: timeframe + horizonte (dia/semana/mês) como conceito de primeira classe, com deteção de desalinhamento entre contextos de decisão.
- **Multi-ativo / multi-mercado** com prioridade geográfica clara e caminho explícito **demo → produção** com critérios quantitativos e operacionais.

## Classificação do projeto

| Dimensão | Valor |
|----------|--------|
| **Tipo de produto** | Web app (com integrações de backend, dados e eventualmente terminais/ambientes de negociação conforme corretora) |
| **Domínio** | Fintech / mercados de capitais (trading) |
| **Complexidade** | Alta — dados sensíveis e tempo real, risco financeiro, possíveis requisitos regionais (Brasil/EUA), segurança e necessidade de auditoria de decisões |
| **Contexto** | Greenfield (sem documentação substantiva de produto pré-existente no repositório) |

## Success Criteria

### User Success

- **Clareza diária:** em cada sessão típica (ritmo principal diário), o utilizador vê oportunidades candidatas nos ativos monitorizados, cada uma **ligada a timeframe + horizonte** (dia / semana / mês).
- **Decisão informada:** o assistente ajuda a responder **operar ou não nesta janela** e evidencia **conflitos** entre janelas (ex.: curto vs. tendência semanal) e implicações de **risco e tempo de exposição**.
- **Disciplina:** redução de decisões impulsivas — medida por **taxa de aderência ao plano** e por registo consistente de **motivo de entrada / não entrada**.
- **Confiança processual:** histórico **auditável** e sensação de que o sistema **melhora ao longo do tempo** sem ocultar perdas ou variância.

### Business Success

- Uso **individual** (sem métricas de negócio B2B). “Negócio” = **validação do investimento de tempo** em construir e operar o sistema:
  - **Demo/paper:** critérios quantitativos e operacionais acordados **antes** de produção real.
  - **Produção (fase posterior):** só após validação; sem promessa de rentabilidade mínima.

### Technical Success

- **Gestão de risco aplicada:** limites configuráveis respeitados (tamanho de posição, perdas diárias, concentração, etc.); **rejeição explícita** ou alerta de trades fora de perfil.
- **Observabilidade:** logs de decisão com **timeframe e horizonte** por sinal/trade; métricas e **reprodutibilidade** de experimentos do agente (mitigar overfitting silencioso).
- **Segurança e integridade (fintech):** proteção de credenciais e dados de conta; trilhas de auditoria alinhadas ao uso pessoal; evolução consciente de requisitos regionais (B3/EUA) na camada de dados/execução.

### Measurable Outcomes

| Área | Indicadores (exemplos) |
|------|-------------------------|
| Risco | Limites respeitados; drawdown máximo dentro de faixas **definidas pelo utilizador**; rejeição/registo explícito fora de perfil |
| Consistência | Aderência ao plano; registo completo de racional de decisão |
| Performance | Profit factor; retorno ajustado ao risco; estabilidade **fora da amostra** (evitar só ajuste ao passado) |
| Aprendizado | Melhoria mensurável após erros documentados (política, features ou parâmetros) |
| Utilidade | Oportunidades visíveis multi-ativo; cada candidata com **timeframe + horizonte**; assistente útil para alinhar janela ao plano |

## Product Scope

### MVP - Minimum Viable Product

- Lista de ativos monitorizados com varredura de oportunidades (visão **diária** como ritmo principal).
- **Janela de operação** como conceito de primeira classe (timeframe(s) e horizonte dia/semana/mês); assistente apoia **operar ou não nessa janela** e alerta desalinhamentos.
- Fluxo **oportunidade + janela → risco → recomendação** com trilha de auditoria.
- Agente com pipeline de aprendizado **validado em paper/demo**.
- Módulo de **gestão de risco** configurável.
- Operação **demo-first**; instrumentação para evolução a produção.

### Growth Features (Post-MVP)

- Refinamento do formato do assistente (painéis vs. conversacional), mais mercados/ativos, integrações adicionais de dados e execução, relatórios avançados de performance e aprendizado.

### Vision (Future)

- Cockpit unificando **pesquisa, sinal, risco, execução e pós-trade** em vários mercados; agente e assistente alinhados ao estilo do utilizador, com transparência e **humildade estatística** explícita.

**Explícito fora do âmbito (até segunda ordem):** promessa de rentabilidade mínima; produção real sem critérios de validação; produto/compliance para terceiros (uso pessoal).

## User Journeys

### Jornada 1 — Eder: manhã de mercado (percurso feliz)

**Cena inicial:** Eder abre o cockpit antes da abertura relevante (B3 ou EUA). Sentia-se sobrecarregado com ecrãs soltos e decisões “no improviso”.

**Desenvolvimento:** O painel mostra a lista de ativos monitorizados com **candidatos** já **etiquetados** por timeframe sugerido e horizonte (ex.: intradiário em M15 vs. swing semanal). Escolhe um ativo; o assistente resume **tese da janela**, risco e tempo de exposição. O módulo de risco confirma que a operação cabe nos limites (tamanho, perda diária, concentração).

**Clímax:** Surge um candidato forte; o assistente indica que a oportunidade **alinha** com o plano do dia — Eder regista **“por que entro”** e executa em **demo** com trilha completa.

**Resolução:** Fim do dia com decisões **explicáveis**, sensação de **aderência ao plano** e histórico pronto para revisão — não de “adivinhação”.

*Capacidades reveladas:* dashboard multi-ativo, priorização por janela, assistente contextual, checks de risco pré-decisão, execução demo, registo de racional e auditoria.

### Jornada 2 — Eder: conflito de janelas e bloqueio de risco (caso limite)

**Cena inicial:** Alerta de oportunidade em **curto prazo**, mas a tendência **semanal** do mesmo ativo está desfavorável.

**Desenvolvimento:** O assistente **explicita o conflito** entre timeframes/horizontes e as implicações (probabilidade, tempo na posição, stress no plano). Eder tenta forçar tamanho acima do limite — o sistema **bloqueia ou exige confirmação explícita** com registo de exceção.

**Clímax:** Ou Eder **não opera** e documenta “não entrar por desalinhamento”, ou ajusta tamanho/janela dentro das regras — em ambos os casos o comportamento fica **auditável**.

**Resolução:** Menos trades “emocionais”; métricas de **consistência** e **risco** refletem a disciplina, não só P&L.

*Capacidades reveladas:* deteção de conflito entre janelas, UX de explicação de risco, enforcement configurável de limites, fluxo de exceção documentado, logs com timeframe/horizonte.

### Jornada 3 — Eder como operador do sistema (configuração e pós-trade)

**Cena inicial:** Precisa de **alterar** lista de ativos, limites de risco ou parâmetros do agente após uma sequência de perdas em demo.

**Desenvolvimento:** Acede a definições (watchlist, mercados, limites, modo demo/produção bloqueado). Revisa **métricas** (profit factor, drawdown, aderência) e **logs de experimentos** do pipeline de aprendizado. Agenda ou dispara retreino / ajuste de política conforme arquitetura.

**Clímax:** Critérios **demo → produção** ficam visíveis; decide manter-se em demo até métricas cumprirem o patamar acordado.

**Resolução:** Sensação de **controlo** sobre o sistema e sobre o “quando avançar”, alinhada ao brief.

*Capacidades reveladas:* configuração de carteira e risco, painel de métricas, gestão de experimentos/reprodutibilidade, feature flags ou gates demo/produção, segurança de credenciais nas integrações.

### Jornada 4 — Pipeline de dados e agente (integração técnica)

**Cena inicial:** Cotações ou dados de um mercado atrasam ou falham.

**Desenvolvimento:** Jobs de ingestão sinalizam falha; o cockpit mostra **estado da fonte** (degradado/indisponível). O agente **não** emite sinal “cego” — ou usa último estado válido com **incerteza explícita**, ou suprime candidatos até recuperar.

**Clímax:** Após recuperação, reconciliação de gaps e registo no log de decisões para **reprodutibilidade**.

**Resolução:** Confiança no sistema porque **falhas são visíveis**, não silenciosas.

*Capacidades reveladas:* conectores de dados multi-fonte, saúde de integrações, política de degradação de sinais, observabilidade e rastreio de experimentos, possível camada API interna entre dados ↔ motor de sinais ↔ agente.

### Journey Requirements Summary

| Área | Capacidades derivadas das jornadas |
|------|-----------------------------------|
| **Cockpit / UX** | Lista multi-ativo, filtros por timeframe/horizonte, detalhe de candidato, estados de mercado e de dados |
| **Assistente** | Explicação de janela, conflitos entre horizontes, alinhamento com plano do utilizador |
| **Risco** | Limites configuráveis, bloqueio/alerta, registo de exceções |
| **Execução** | Demo-first, trilha auditável, racional obrigatório ou estruturado |
| **Agente / ML** | Pipeline com métricas, experimentos reprodutíveis, evolução pós-erro documentado |
| **Plataforma** | Configuração, observabilidade, integrações e degradação elegante |

## Domain-Specific Requirements

### Conformidade e regulamentação

- **Uso pessoal:** o produto **não** visa, nesta fase, compliance de *offering* para terceiros; ainda assim, operações em **B3 e EUA** implicam **respeitar as regras dos mercados e intermediários** (corretoras, termos de API, restrições de automação e de dados).
- **AML/KYC e produto:** enquanto o sistema for cockpit do próprio utilizador com as suas contas, o grosso do KYC/AML recai no **intermediário**; o PRD assume **não armazenar** dados desnecessários além do necessário à decisão e à auditoria interna.
- **Privacidade e retenção:** política clara de **retenção** de logs e de dados de mercado; minimização para o essencial à reprodutibilidade e ao risco.
- **Comunicação de risco:** evitar linguagem de **garantia de retorno** ou aconselhamento a terceiros; o assistente reforça **decisão do utilizador** e **incerteza**.

### Restrições técnicas

- **Segurança:** credenciais de corretora/API em **segredos** (nunca em texto claro no repositório); controlo de acesso ao cockpit (sessão, dispositivo); **auditoria** de ações sensíveis (mudança de limites, modo demo/produção).
- **Integridade e tempo:** dados de mercado com **carimbos** e tratamento de **atrasos/gaps**; decisões do agente **ligadas** a versão de modelo e *snapshot* de inputs quando possível.
- **Disponibilidade:** para uso pessoal, metas de uptime podem ser modestas, mas **falhas visíveis** e recuperação são obrigatórias (alinhado à jornada de pipeline).
- **ML em mercados:** humildade estatística explícita — métricas **fora da amostra**, registo de experimentos, evitar *overfitting* silencioso.

### Requisitos de integração

- **Camada flexível** de dados e execução (brief): possível **MT5** para parte FX/CFD; **APIs de corretora** e feeds distintos para **ações** B3/EUA conforme escolha final.
- **Contratos estáveis** entre: ingestão → motor de sinais → agente → UI/assistente, para testes e auditoria.

### Mitigação de riscos (domínio)

| Risco | Mitigação |
|--------|-----------|
| Execução ou dados fora de conformidade com o intermediário | Validar com documentação da corretora; modo demo primeiro; logs de ordens e limites |
| Fuga de credenciais | Segredos, rotação, princípio do menor privilégio nas chaves de API |
| Sinais com dados errados ou atrasados | Estado de fonte, degradação, supressão de candidatos quando qualidade insuficiente |
| Expectativa irreal de lucro | UX e critérios de sucesso alinhados a processo e risco, não a promessa de retorno |
| Responsabilidade legal (aconselhamento) | Produto como ferramenta de apoio à decisão do titular, sem recomendação a terceiros no âmbito atual |

## Innovation & Novel Patterns

### Detected Innovation Areas

- **Interação e modelo mental:** tratamento de “operar?” como decisão **condicionada à janela** (timeframe + horizonte dia/semana/mês), com **conflitos explícitos** entre janelas — em vez de lista plana de alertas.
- **Duplo núcleo humano–máquina:** pipeline de **aprendizado** (ex.: RL/híbrido) acoplado a **assistente** que suporta *accountability* e explicação, reduzindo caixa-preta típica de sinais automáticos.
- **Produto como disciplina:** inovação de **posicionamento** — sucesso definido por processo, risco e edge mensurável, não por promessa de retorno; integra compliance de narrativa com UX de trading.
- **Opcional técnico (web):** *WebAssembly* pode ser explorado no futuro para componentes pesados (gráficos, simulação local); **não** é requisito do MVP — fica como pista do CSV para evolução.

### Market Context & Competitive Landscape

- Ofertas comuns: alertas genéricos, *bots* opacos, ou ferramentas de análise sem **fecho de loop** risco → decisão → auditoria → aprendizado.
- O **tradesystem** diferencia pela **coerência de janela**, **gestão de risco no fluxo** e **demo → produção** com critérios explícitos — mais “cockpit disciplinado” do que “sinal milagroso”.
- Pesquisa web adicional (se necessário): *web standards; WCAG guidelines* e *New interaction WebAssembly* — útil na fase de desenho de UI avançada, não bloqueante para o PRD.

### Validation Approach

- **Paper/demo:** métricas acordadas (profit factor, drawdown, aderência, estabilidade fora da amostra) antes de dinheiro real.
- **Ablation / experimentos:** versões do agente e do assistente com **logs reprodutíveis**; hipóteses documentadas antes de mudanças.
- **Testes de uso:** cenários das jornadas (conflito de janela, falha de dados, bloqueio de risco) como critérios de aceitação.

### Risk Mitigation

- **Se a parte “inovadora” falhar:** manter valor em **cockpit + risco + auditoria** mesmo com política do agente mais simples (*fallback* heurístico ou manual).
- **Sob engenharia de interação:** começar com padrões web estáveis; WASM apenas quando houver necessidade medida de performance.
- **Expectativa do utilizador:** copy e métricas alinhadas ao brief para evitar que “inovação” seja lida como garantia de ganhos.

## Web App Specific Requirements

### Project-Type Overview

O **tradesystem** é um **cockpit web autenticado** para um único utilizador, com forte necessidade de **atualização quase em tempo real** (cotações, alertas, estado de integrações) e sessões longas durante o mercado. Não é um site de *marketing* como núcleo do valor.

### Technical Architecture Considerations

- **Arquitetura front-end:** **SPA** (ou equivalente com *shell* único) para transições rápidas entre lista de ativos, detalhe de candidato, risco e assistente, mantendo **estado** e **canais em tempo real** (ex.: WebSocket ou SSE) sem recarregar página inteira.
- **APIs:** backend expõe REST/JSON para CRUD de configuração, histórico e decisões; tempo real separado em canal dedicado para não bloquear a UI.
- **Segurança web:** cookies/sessão ou token com **httpOnly** onde aplicável; **CSP** e headers básicos alinhados a fintech; sem expor segredos ao cliente.

### Browser Matrix

- **Suportados (MVP):** últimas duas versões **Chrome**, **Edge**, **Firefox** e **Safari** (desktop); **mobile:** visualização/resumo opcional — o ritmo principal é **desktop** (brief).
- **Não objetivo (MVP):** IE; browsers sem suporte a WebSocket/SSE documentado como “não suportado” com mensagem clara.

### Responsive Design

- **Desktop-first** para painéis densos (multi-coluna, tabelas, gráficos).
- **Tablet/mobile:** layout **legível** (lista de ativos, alertas, bloqueio de risco) — pode haver funções avançadas só em desktop até fase *growth*.

### Performance Targets

- **Interação:** ações principais (abrir candidato, aplicar filtro por janela) **< 200 ms** percebidos quando dados já estão em memória.
- **Tempo real:** latência de UI para *tick* ou atualização de estado dominada por rede/provedor; UI deve **nunca congelar** — atualizações incrementais e *backpressure*.
- **Carga inicial:** *first meaningful paint* aceitável em rede doméstica típica; *code splitting* para módulos pesados (gráficos) se necessário.

### SEO Strategy

- **Prioridade baixa** para área autenticada (cockpit). **SEO** relevante apenas se existirem páginas públicas (login, documentação, *landing*); nesse caso: metadados básicos, `noindex` onde não fizer sentido indexar.

### Accessibility Level

- **Objetivo:** **WCAG 2.1 nível AA** nos fluxos críticos (navegação por teclado, contraste, foco, labels em formulários de risco e decisão) — beneficia manutenção, futuras extensões e uso prolongado sob fadiga.

### Implementation Considerations

- Testes **e2e** nos percursos das jornadas (feliz, conflito de janela, falha de dados) em pelo menos um browser “principal”.
- **Observabilidade** no cliente: erros de API e queda de canal em tempo real visíveis e registados (*correlation id* com backend).
- Evolução futura: avaliar **WebAssembly** só com métrica de necessidade (passo 6), sem comprometer o MVP.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** **MVP de problema + experiência** — o mínimo para o utilizador dizer “isto é útil” é: **lista monitorizada**, **oportunidades com timeframe + horizonte**, **fluxo risco → decisão com trilha**, **demo** e **um assistente** que explique janela e conflitos (ainda que a primeira versão do agente seja **mais simples** do que o RL completo, desde que o *loop* de feedback e métricas exista em paper). **Aprendizado validado** no MVP = pipeline e critérios reprodutíveis, não necessariamente política final de produção.

**Resource Requirements:** projeto **pessoal** — tipicamente **1 pessoa full-stack** com apoio pontual em dados/ML, ou **2 perfis** (web/backend + ML) em tempo parcial. Competências: web (SPA, tempo real), integrações/APIs, modelação de risco no produto, ML/RL ou *baseline* estatístico, DevOps mínimo para segredos e ambientes.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

- Jornada 1 (manhã / percurso feliz): cockpit → candidato → risco → decisão demo com racional.
- Jornada 2 (conflito de janela / bloqueio): conflitos explícitos e enforcement de limites.
- Jornada 3 (operador): configuração de watchlist, limites e revisão de métricas básicas.
- Jornada 4 (pipeline): estado de fonte + degradação quando dados falham (pelo menos um caminho completo).

**Must-Have Capabilities:** alinhadas com **Product Scope → MVP** (lista completa nessa secção). Ênfase para o *scoping* operacional: **uma** integração mercado+fonte no MVP se o risco técnico o exigir; agente com *fallback* heurístico aceitável se o RL completo atrasar, mantendo pipeline e métricas em paper.

### Post-MVP Features

**Phase 2 (Post-MVP):**

- Segundo mercado/provedor com maturidade; assistente refinado (UX); relatórios avançados de performance e experimentos; mobile mais capaz.

**Phase 3 (Expansion):**

- Cockpit completo pesquisa → sinal → risco → execução → pós-trade multi-mercado; WASM ou componentes pesados **se** justificado por métricas; produção real só com *gates* quantitativos.

### Risk Mitigation Strategy

**Technical Risks:** começar com **uma** integração de dados/execução bem escolhida; contratos estáveis entre camadas; agente em **paper** até critérios; degradação explícita sem sinais cegos.

**Market Risks:** não aplicável a receita B2B; “mercado” = **validação pessoal** — critérios de sucesso do PRD (processo, risco, edge fora da amostra) como *gate* para confiança em produção.

**Resource Risks:** se só uma pessoa — reduzir escopo a **um mercado**, UI mais simples, política do agente mais simples, mantendo **janela + risco + auditoria** como núcleo inegociável.

## Functional Requirements

### Carteira e monitorização

- FR1: O utilizador pode definir, editar e remover ativos na lista monitorizada.
- FR2: O utilizador pode visualizar, num cockpit, o estado resumido de cada ativo monitorizado.
- FR3: O sistema pode atualizar a visão dos ativos com informação de mercado disponível nas fontes configuradas.
- FR4: O utilizador pode organizar ou filtrar a lista por critérios compatíveis com o MVP (ex.: mercado, prioridade).

### Oportunidades e janela de operação

- FR5: O sistema pode identificar e apresentar oportunidades candidatas para ativos monitorizados.
- FR6: O utilizador pode ver, para cada candidatura, o timeframe e o horizonte (dia, semana ou mês) associados ou sugeridos.
- FR7: O utilizador pode filtrar ou ordenar candidaturas por combinação de timeframe e horizonte.
- FR8: O sistema pode registar a janela de operação considerada em cada análise ou decisão.

### Assistente de decisão

- FR9: O assistente pode explicar a tese da oportunidade no contexto da janela selecionada pelo utilizador.
- FR10: O assistente pode sinalizar conflitos entre sinais ou contextos de curto prazo e de horizonte mais longo para o mesmo ativo.
- FR11: O assistente pode relacionar a oportunidade com os limites de risco e o plano do utilizador quando essa informação estiver definida.
- FR12: O utilizador pode interagir com o assistente no formato suportado pelo produto (estruturado e/ou conversacional, conforme implementação).

### Gestão de risco

- FR13: O utilizador pode configurar limites de risco (ex.: tamanho de posição, perda diária, concentração).
- FR14: O sistema pode calcular ou exibir a aderência de uma decisão proposta aos limites configurados.
- FR15: O sistema pode bloquear uma decisão que viole limites ou exigir confirmação explícita com registo de exceção, conforme regras configuradas.
- FR16: O utilizador pode consultar o estado dos limites antes e depois de uma decisão.

### Execução e modos operacionais

- FR17: O utilizador pode submeter intenções de execução compatíveis com o conetor disponível (incluindo modo demonstração).
- FR18: O utilizador pode identificar claramente quando as ações ocorrem em modo demonstração face a modo de produção, quando este último estiver disponível.
- FR19: O sistema pode impedir a execução em produção quando os critérios acordados para desbloqueio não forem cumpridos.
- FR20: O utilizador pode registar a decisão final de operar ou não operar, com racional estruturado.

### Agente e aprendizado

- FR21: O agente pode influenciar ou classificar candidaturas segundo uma política versionada e registada.
- FR22: O utilizador pode executar ou solicitar ciclos de treino e avaliação do agente em ambiente de paper ou demonstração.
- FR23: O sistema pode armazenar métricas e artefactos de experimentos de forma associável a uma versão de política e a conjuntos de dados utilizados.
- FR24: O utilizador pode comparar desempenho entre versões ou experimentos segundo indicadores definidos no produto.

### Dados, fontes e tempo quase real

- FR25: O sistema pode ingerir dados de mercado a partir de fontes configuradas pelo utilizador ou pelo administrador da instância.
- FR26: O utilizador pode ver o estado de cada fonte (operacional, degradada ou indisponível).
- FR27: O sistema pode deixar de emitir ou marcar como incertas as candidaturas quando a qualidade ou a atualidade dos dados for insuficiente.
- FR28: O utilizador pode receber na interface atualizações relevantes em tempo quase real, quando suportado pelas fontes.

### Auditoria, histórico e transparência

- FR29: O sistema pode manter trilha auditável de decisões e eventos de execução com identificação temporal e de janela de operação.
- FR30: O utilizador pode consultar histórico de decisões e racional associado.
- FR31: O utilizador pode consultar agregados ou vistas de desempenho alinhadas aos critérios de sucesso definidos para o produto.
- FR32: O sistema pode apresentar avisos explícitos sobre incerteza e ausência de garantia de resultado financeiro, onde aplicável ao produto.

### Acesso, segurança e configuração

- FR33: O utilizador pode autenticar-se para aceder ao cockpit.
- FR34: O sistema pode armazenar e utilizar credenciais de integração sem as expor na interface ou em artefactos de código versionados.
- FR35: O utilizador pode configurar parâmetros do sistema relevantes para o MVP (mercados suportados, fontes, modos e limites), dentro do desenho da instância.
- FR36: O utilizador pode correlacionar ou reportar incidentes com identificadores de pedido ou de evento fornecidos pelo sistema para apoio à resolução.

## Non-Functional Requirements

### Performance

- **Interação na UI:** ações principais do cockpit (abrir candidato, aplicar filtro por janela) completam em **menos de 200 ms** no percetível do utilizador quando os dados necessários já estão disponíveis localmente ou em *cache* da sessão.
- **Responsividade sob carga de mercado:** a interface não bloqueia durante rajadas de atualizações; o sistema aplica **atualização incremental** e limitação de taxa (*backpressure*) para manter a sessão utilizável.
- **Arranque:** o tempo até ao primeiro ecrã útil após autenticação deve ser **aceitável em ligação doméstica típica** (alvo numérico a calibrar em testes e documentar após *baseline*).

### Security

- **Transporte:** tráfego entre cliente e serviços do produto em **TLS** (versões e configuração alinhadas a boas práticas atuais).
- **Segredos:** credenciais de corretora/API armazenadas em **mecanismo de segredos** (não em repositório nem expostas ao cliente); rotação suportada ou documentada.
- **Sessão e acesso:** autenticação com política de **expiração de sessão** e proteção razoável a CSRF nas ações mutáveis, conforme modelo de *auth* escolhido.
- **Autorização:** princípio do **menor privilégio** nas chaves e permissões dos conetores.
- **Dados em repouso:** dados sensíveis da instância (credenciais, tokens, logs com dados pessoais se existirem) com **encriptação em repouso** ou equivalente do ambiente de *hosting*, documentado explicitamente.

### Accessibility

- **Norma:** fluxos críticos (login, navegação principal, formulários de risco e decisão) em conformidade com **WCAG 2.1 nível AA** (teclado, foco, contraste, nomes acessíveis).
- **Validação:** *checklist* automatizada + teste manual dos percursos críticos antes de marcar *release* MVP.

### Integration

- **Disponibilidade percecionada:** falhas de fontes externas tornam-se **visíveis na UI** em **menos de 30 segundos** após deteção (ou intervalo configurável documentado), sem silêncio prolongado.
- **Resiliência:** políticas de **timeout**, **retentativas** e *circuit breaker* (ou equivalente) para chamadas a provedores de dados e execução, configuráveis ou documentadas por conetor.
- **Rastreio:** pedidos entre camadas com **identificador de correlação** comum para diagnóstico de falhas de integração.
- **Contratos:** alterações nos conetores externas **testáveis** com *fixtures* ou ambientes de *sandbox* quando o provedor o permitir.
