# Backend por Fases - Execucao

## Status atual

- `Fase 0`: concluida
  - definicao de stack `Neon + Vercel + Claude API`
  - politica de segredos
  - organizacao do plano

- `Fase 1`: concluida
  - fundacao reorganizada para Neon pronta

- `Fase 2`: parcialmente concluida
  - auth real e perfil do usuario ligados ao dashboard

- `Fase 3`: parcialmente concluida
  - storage privado configurado e validado em producao

- `Fase 4`: concluida
  - upload real de documentos com persistencia no Neon e download protegido

- `Fase 5`: em andamento
  - base de analise com Claude em implementacao

- `Fase 7`: em andamento
  - observabilidade, rate limiting e retencao automatica em evolucao
  - validacao operacional do job de retencao adicionada ao healthcheck

## Fase 1 - Fundacao

### Objetivo

Colocar a base minima do backend online com `Vercel + Neon`.

### Escopo

- estrutura de `api/` para Vercel Functions
- helpers de ambiente
- helpers HTTP
- conexao com Neon
- healthcheck
- schema SQL inicial
- base de autenticacao

### Entregaveis

- [x] `package.json` alinhado com Neon
- [x] helper de conexao com Neon
- [x] `api/health`
- [x] schema SQL inicial para Neon
- [x] estrategia inicial de auth

### Criterio de saida

- projeto responde `GET /api/health`
- backend consegue conectar no Neon
- banco ja tem modelo inicial para usuarios, documentos e analises

## Fase 2 - Auth real no dashboard

### Objetivo

Trocar a autenticacao fake do dashboard por autenticacao real.

### Escopo

- cadastro
- login
- logout
- sessao persistida
- protecao de acesso ao dashboard

### Entregaveis

- [x] login real no dashboard
- [x] logout real
- [x] leitura do usuario atual
- [x] configuracoes de perfil ligadas ao backend
- [ ] protecao adicional de rotas no frontend

## Fase 3 - Banco e storage

### Objetivo

Subir a estrutura real de dados e arquivos.

### Escopo

- aplicar schema no Neon
- configurar storage privado
- garantir vinculo entre usuario e documentos

### Entregaveis

- [ ] schema aplicado
- [x] storage configurado
- [x] vinculo user/document funcionando

Status:

- [x] suporte backend para storage privado S3-compatible
- [x] bucket configurado em producao
- [x] vinculo user/document validado com download real
- [x] diagnostico do healthcheck mostra exatamente quais variaveis de storage faltam

## Fase 4 - Upload real de contratos

### Objetivo

Sair da simulacao e aceitar contratos reais.

### Escopo

- endpoint de upload
- persistencia do documento
- status inicial de processamento

### Entregaveis

- [x] `POST /api/documents`
- [x] `GET /api/documents`
- [x] `GET /api/documents/:id`
- [x] `GET /api/documents/:id/file`
- [x] `GET /api/documents/:id/status`
- [x] `DELETE /api/documents/:id`

Status:

- [x] upload persistido no Neon
- [x] download protegido do arquivo bruto
- [x] exclusao com limpeza no storage

## Fase 5 - Pipeline de analise com Claude

### Objetivo

Processar contratos reais via `Claude API`.

### Escopo

- extracao de texto
- chamada server-side para Claude
- persistencia de score, resumo, riscos e clausulas

### Entregaveis

- [x] integracao base com Claude API
- [x] persistencia de analise, riscos e clausulas
- [x] estados `analyzing`, `completed`, `failed`
- [x] `POST /api/analyses`
- [x] `GET /api/analyses/:id`
- [x] `POST /api/analyses/:id/reprocess`
- [x] `GET /api/analyses/:id/risks`
- [x] `GET /api/analyses/:id/guided-review`
- [x] `GET /api/documents/:id/analysis`
- [x] extracao real para PDF e DOCX

Status:

- [x] fallback automatico de modelo para evitar quebra quando o alias configurado na Anthropic expira ou retorna `404`
- [ ] validacao final de analise completa em producao apos ajuste de resiliencia

## Fase 6 - Dashboard real

### Objetivo

Conectar o dashboard a dados reais.

### Escopo

- overview real
- documentos recentes
- riscos reais
- leitura guiada real

### Entregaveis

- [x] dashboard alimentado por APIs base
- [x] documentos reais
- [x] resultados reais renderizados no frontend
- [x] riscos reais renderizados no frontend

Status:

- [x] endpoints base de dashboard (`overview`, `recent-documents`, `risk-distribution`)
- [x] documentos reais listados por API
- [x] results e risks conectados ao payload real de analise
- [x] overview e atividade recente conectados aos dados reais do dashboard
- [x] busca do dashboard aplicada sobre documentos e estados vazios reais
- [x] filtros do dashboard por status, tipo e severidade
- [x] responsividade mobile refinada para topo, filtros e grids principais
- [x] navegacao mobile da sidebar com drawer e atalhos rapidos persistentes
- [x] exportacao e compartilhamento com feedback no fluxo de resultados
- [x] protecao de sessao expirada no frontend e onboarding inicial com CTAs
- [x] onboarding contextual apos upload inicial e atividade recente mais acionavel
- [x] comparativo no overview por tipo de contrato e faixas de score
- [x] tendencia recente de score no overview com leitura temporal das analises
- [x] exclusao de documentos pelo dashboard ligada ao delete real do backend
- [x] exclusao em lote e feedback visual de exclusao na tela de documentos
- [x] estados de carregamento e falha parcial nas acoes de exclusao do dashboard
- [x] desfazer exclusao com janela curta antes do delete definitivo
- [x] filtros temporais no dashboard por 7/30/90 dias e mes atual
- [x] lixeira temporaria server-side com restore de documentos
- [x] trilha de auditoria para trash, restore e purge de documentos
- [x] atividade recente do dashboard enriquecida com eventos de auditoria
- [x] tela dedicada de historico/auditoria com filtros por evento e documento
- [x] loading inicial e degradacao parcial mais clara quando APIs do dashboard falham
- [x] comparativo do overview aprofundado com janela filtrada e faixa observada de score
- [x] activity feed com resumo visual ligado aos filtros atuais
- [x] configuracoes com resumo real de uso e saude recente das analises
- [x] exclusao em lote com resumo de selecao e estado da lixeira temporaria
- [x] leitura em audio gratuita da explicacao simplificada na revisao guiada via `speechSynthesis`

## Fase 7 - Producao

### Objetivo

Deixar o produto pronto para uso publico.

### Escopo

- rate limiting
- logs estruturados
- monitoramento
- retencao de documentos
- revisao de seguranca

### Entregaveis

- [x] revisao de seguranca
- [ ] politica de retencao completamente validada
- [x] observabilidade minima

Status:

- [x] request IDs e logs estruturados nas rotas criticas
- [x] rate limiting server-side com fallback seguro
- [x] migration `002_operability.sql` validada no Neon
- [x] endpoint interno de retencao e agenda no `vercel.json`
- [x] limpeza automatica de documentos, sessoes e rate limits implementada
- [x] `CRON_SECRET` e janelas de retencao configurados na Vercel
- [x] `api/health` com checks operacionais de storage, cron e rate limiting
- [x] `api/health` com estado da ultima execucao do job de retencao
- [x] `api/health` com resumo operacional recente das analises e ultima falha conhecida
- [x] primeiro pacote de endurecimento de seguranca em auth e rota interna
- [x] segundo pacote de endurecimento em upload, storage e disparo de analises
- [x] resiliencia da integracao Claude contra modelo configurado invalido/descontinuado
- [x] logs estruturados do pipeline de analise com request ID, fallback e falha
- [x] validacao de UUID e trilha operacional nas rotas autenticadas mais sensiveis
