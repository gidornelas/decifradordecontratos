# Backend por Fases — Execução

## Status atual

- `Fase 0`: concluída
  - definição de stack `Neon + Vercel + Claude API`
  - política de segredos
  - organização do plano

- `Fase 1`: em preparação
  - fundação reorganizada para Neon em andamento

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
