# Backend por Fases — Execução

## Status atual

- `Fase 0`: concluída
  - definição de stack `Neon + Vercel + Claude API`
  - política de segredos
  - organização do plano

- `Fase 1`: concluída
  - fundação reorganizada para Neon pronta

- `Fase 2`: parcialmente concluída
  - auth real ligada ao dashboard

- `Fase 4`: parcialmente concluída
  - upload real de documentos com persistência no Neon

- `Fase 5`: em andamento
  - base de análise com Claude em implementação

- `Fase 7`: em andamento
  - observabilidade, rate limiting e reten??o autom?tica em evolu??o

## Fase 1 — Fundação

### Objetivo

Colocar a base mínima do backend online com `Vercel + Neon`.

### Escopo

- estrutura de `api/` para Vercel Functions
- helpers de ambiente
- helpers HTTP
- conexão com Neon
- healthcheck
- schema SQL inicial
- base de autenticação

### Entregáveis

- [x] `package.json` alinhado com Neon
- [x] helper de conexão com Neon
- [x] `api/health`
- [x] schema SQL inicial para Neon
- [x] estratégia inicial de auth

### Critério de saída

- projeto responde `GET /api/health`
- backend consegue conectar no Neon
- banco já tem modelo inicial para usuários, documentos e análises

## Fase 2 — Auth real no dashboard

### Objetivo

Trocar a autenticação fake do dashboard por autenticação real.

### Escopo

- cadastro
- login
- logout
- sessão persistida
- proteção de acesso ao dashboard

### Entregáveis

- [ ] login real no dashboard
- [ ] logout real
- [ ] proteção de acesso
- [ ] leitura do usuário atual

Status:

- [x] login real no dashboard
- [x] logout real
- [x] leitura do usuário atual
- [ ] proteção adicional de rotas no frontend

## Fase 3 — Banco e storage

### Objetivo

Subir a estrutura real de dados e arquivos.

### Escopo

- aplicar schema no Neon
- configurar storage privado
- garantir vínculo entre usuário e documentos

### Entregáveis

- [ ] schema aplicado
- [ ] storage configurado
- [ ] vínculo user/document funcionando

Status:

- [x] suporte backend para storage privado S3-compatible
- [ ] bucket configurado em produção
- [ ] vínculo user/document validado com download real

## Fase 4 — Upload real de contratos

### Objetivo

Sair da simulação e aceitar contratos reais.

### Escopo

- endpoint de upload
- persistência do documento
- status inicial de processamento

### Entregáveis

- [ ] `POST /api/documents/upload`
- [ ] `GET /api/documents`
- [ ] `GET /api/documents/:id`

- [x] `GET /api/documents/:id`
- [x] `GET /api/documents/:id/status`
- [x] `DELETE /api/documents/:id`

Status:

- [x] `POST /api/documents` para upload persistido no Neon
- [x] `GET /api/documents`
- [ ] `GET /api/documents/:id`

## Fase 5 — Pipeline de análise com Claude

### Objetivo

Processar contratos reais via `Claude API`.

### Escopo

- extração de texto
- chamada server-side para Claude
- persistência de score, resumo, riscos e cláusulas

### Entregáveis

- [ ] integração com Claude API
- [ ] persistência de análise
- [ ] estados `extracting`, `analyzing`, `completed`, `failed`

Status:

- [x] integração base com Claude API
- [x] persistência de análise, riscos e cláusulas
- [x] estados `analyzing`, `completed`, `failed`
- [x] `POST /api/analyses`
- [x] `GET /api/analyses/:id`
- [x] `POST /api/analyses/:id/reprocess`
- [x] `GET /api/analyses/:id/risks`
- [x] `GET /api/analyses/:id/guided-review`
- [x] `GET /api/documents/:id/analysis`
- [x] extra??o real para PDF e DOCX

## Fase 6 — Dashboard real

### Objetivo

Conectar o dashboard a dados reais.

### Escopo

- overview real
- documentos recentes
- riscos reais
- leitura guiada real

### Entregáveis

- [ ] dashboard alimentado por API
- [ ] documentos reais
- [ ] resultados reais
- [ ] riscos reais

Status:

- [x] endpoints base de dashboard (`overview`, `recent-documents`, `risk-distribution`)
- [x] documentos reais listados por API
- [ ] resultados reais renderizados no frontend
- [ ] riscos reais renderizados no frontend

## Fase 7 — Produção

### Objetivo

Deixar o produto pronto para uso público.

### Escopo

- rate limiting
- logs estruturados
- monitoramento
- retenção de documentos
- revisão de segurança

### Entregáveis

- [ ] revisão de segurança
- [ ] política de retenção
- [ ] observabilidade mínima


Status:

- [x] request IDs e logs estruturados nas rotas cr?ticas
- [x] rate limiting server-side com fallback seguro
- [ ] migration `002_operability.sql` aplicada no Neon
- [x] endpoint interno de reten??o e agenda no `vercel.json`
- [x] limpeza autom?tica de documentos, sess?es e rate limits implementada
- [ ] `CRON_SECRET` e janelas de reten??o configurados na Vercel
