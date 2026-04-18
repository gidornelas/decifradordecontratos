# Plano de Backend — Decodificador de Contratos

## Resumo

Este projeto hoje está em estado **frontend-first**:

- a landing page é estática em `index.html`
- o dashboard é estático em `dashboard.html`
- a autenticação atual é simulada em `js/dashboard.js`
- o upload e a análise são simulados no frontend
- ainda não existe backend operacional para usuários reais

O backend precisa transformar o projeto em um produto online com:

- login real
- sessões seguras
- upload real de contratos
- persistência por usuário
- análise via `Claude API`
- histórico de análises
- dashboard alimentado por dados reais

## Decisão de arquitetura

### Stack escolhida

- **Frontend e deploy:** `Vercel`
- **Banco principal:** `Neon Postgres`
- **Backend HTTP:** `Vercel Functions`
- **Auth:** `auth próprio no backend` com sessões e cookies seguros
- **Storage de arquivos:** `Cloudflare R2` ou equivalente S3-compatible
- **IA:** `Claude API`
- **Jobs assíncronos:** começar simples com processamento server-side; evoluir para worker dedicado quando necessário

### Por que Neon

- mantém o projeto em `Postgres`
- funciona muito bem com `Vercel`
- combina com schema relacional para documentos, análises, riscos e cláusulas
- é uma troca mais natural em relação ao que já planejamos antes
- reduz retrabalho de modelagem comparado a migrar para Firestore ou MongoDB

## O Que O Frontend Já Pede Do Backend

Pelos fluxos e telas atuais, o backend precisa sustentar:

1. Autenticação e conta
   - cadastro
   - login
   - logout
   - manter conectado
   - perfil
   - configurações

2. Documentos
   - upload de PDF, DOCX e TXT
   - listagem
   - histórico
   - status de processamento

3. Análise
   - extração de texto
   - classificação do contrato
   - resumo executivo
   - score de risco

4. Riscos
   - lista de riscos
   - severidade
   - justificativa
   - recomendação

5. Leitura guiada
   - cláusula original
   - explicação simplificada
   - impacto
   - confiança

6. Dashboard
   - KPIs
   - análises recentes
   - distribuição de risco
   - busca e filtros

## Arquitetura Proposta

### Visão de alto nível

```text
Frontend (landing + dashboard) on Vercel
        |
        v
Vercel Functions / API Layer
        |
        +-- Auth Module
        +-- Users Module
        +-- Documents Module
        +-- Analyses Module
        +-- Risks Module
        +-- Guided Review Module
        +-- Dashboard Module
        |
        +-- Neon Postgres
        +-- Object Storage (R2 / S3-compatible)
        +-- Claude API
        +-- Optional worker for heavy processing
```

### Padrão de processamento

1. usuário envia contrato
2. backend valida tipo e tamanho
3. arquivo é salvo no storage
4. documento é criado no Neon com status `uploaded`
5. backend cria análise pendente
6. função ou worker extrai texto
7. função ou worker chama a Claude API
8. backend salva análise estruturada
9. documento muda para `completed` ou `failed`
10. frontend consulta status e exibe o resultado

## Módulos de Backend

### 1. Auth Module

Responsabilidades:

- cadastro
- login
- logout
- renovação de sessão
- manter conectado

Abordagem recomendada:

- senhas com hash `bcrypt` ou `argon2`
- sessão em tabela própria
- cookie HttpOnly com token de sessão
- persistência controlada por expiração da sessão

Endpoints MVP:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### 2. Users Module

Responsabilidades:

- perfil
- preferências
- plano
- limites de uso

Endpoints MVP:

- `GET /api/users/me`
- `PATCH /api/users/me`

### 3. Documents Module

Responsabilidades:

- upload
- listagem
- metadados
- status do processamento
- exclusão

Endpoints MVP:

- `POST /api/documents/upload`
- `GET /api/documents`
- `GET /api/documents/:id`
- `DELETE /api/documents/:id`
- `GET /api/documents/:id/status`

### 4. Analyses Module

Responsabilidades:

- orquestrar a análise
- salvar resultado estruturado
- permitir reprocessamento
- guardar qual modelo foi usado

Endpoints MVP:

- `POST /api/analyses`
- `GET /api/analyses/:id`
- `GET /api/documents/:id/analysis`
- `POST /api/analyses/:id/reprocess`

### 5. Risks Module

Responsabilidades:

- listar riscos por análise
- filtrar por severidade
- agrupar por categoria

Endpoints MVP:

- `GET /api/analyses/:id/risks`

### 6. Guided Review Module

Responsabilidades:

- servir a leitura guiada por cláusula

Endpoints MVP:

- `GET /api/analyses/:id/guided-review`
- `GET /api/analyses/:id/clauses`

### 7. Dashboard Module

Responsabilidades:

- KPIs
- documentos recentes
- distribuição de risco
- visão geral por usuário

Endpoints MVP:

- `GET /api/dashboard/overview`
- `GET /api/dashboard/recent-documents`
- `GET /api/dashboard/risk-distribution`

## Modelo de Dados Inicial

### Tabelas principais

- `users`
- `sessions`
- `plans`
- `documents`
- `analyses`
- `analysis_risks`
- `analysis_clauses`
- `usage_events`

### Relacionamentos

- um `user` possui muitas `sessions`
- um `user` possui muitos `documents`
- um `document` possui zero ou uma `analysis` principal
- uma `analysis` possui muitos `analysis_risks`
- uma `analysis` possui muitas `analysis_clauses`

## Pipeline de IA

### Etapas recomendadas

1. Ingestão
   - validar arquivo
   - detectar mime type

2. Extração
   - converter PDF, DOCX ou TXT em texto bruto

3. Pré-processamento
   - limpar texto
   - segmentar em cláusulas/parágrafos
   - limitar tamanho por chunks

4. Análise LLM
   - identificar tipo de contrato
   - extrair cláusulas relevantes
   - classificar riscos
   - gerar explicação simplificada
   - gerar recomendações

5. Pós-processamento
   - validar schema JSON
   - normalizar severidades
   - calcular score agregado

6. Persistência
   - salvar análise, riscos e cláusulas

### Provedor de IA

Para este projeto, a análise dos contratos deve usar a `Claude API`.

Regra:

- a `CLAUDE_API_KEY` deve existir apenas no backend
- o navegador nunca deve falar direto com a Claude
- o backend deve validar e normalizar a saída antes de salvar

## Segurança e Compliance

### Mínimo necessário para MVP sério

- hash de senha com `bcrypt` ou `argon2`
- cookies `HttpOnly`, `Secure` e `SameSite`
- rate limit em login e upload
- validação de tipo e tamanho de arquivo
- controle estrito por `user_id`
- logs de auditoria para login, upload e exclusão

### Cuidados com documentos

- não expor URL pública do arquivo
- usar URL assinada ou proxy backend
- bucket privado no storage
- política de retenção e exclusão

### Observação legal

Se houver contratos sensíveis:

- LGPD
- política de privacidade
- termo de uso
- consentimento para processamento por IA

## Contratos de API para o Front Atual

### Login

Hoje:

- validação fake no navegador
- sessão local simulada

Deve virar:

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Upload e análise

Hoje:

- progresso simulado
- análise mockada

Deve virar:

1. `POST /api/documents/upload`
2. `POST /api/analyses`
3. `GET /api/documents/:id/status`
4. `GET /api/documents/:id/analysis`

### Dashboard

Hoje:

- dados fixos no HTML

Deve virar:

- `GET /api/dashboard/overview`
- `GET /api/documents`
- `GET /api/dashboard/risk-distribution`

## Fases de Implementação

### Fase 1 — Fundação

- estrutura de backend na Vercel
- conexão com Neon
- healthcheck
- schema inicial
- base de auth

### Fase 2 — Auth real

- cadastro
- login
- logout
- sessão persistida
- proteção do dashboard

### Fase 3 — Banco e storage

- tabelas reais no Neon
- storage privado configurado
- vínculos entre usuário e documentos

### Fase 4 — Upload real

- upload funcional
- persistência do documento
- status inicial de processamento

### Fase 5 — Análise com Claude

- extração de texto
- chamada server-side para Claude
- persistência de análise
- riscos e cláusulas

### Fase 6 — Dashboard real

- KPIs reais
- documentos reais
- riscos reais
- leitura guiada real

### Fase 7 — Produção

- rate limit
- monitoramento
- logs
- retenção de documentos
- revisão de segurança

## Endpoints MVP Sugeridos

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/users/me
PATCH  /api/users/me

POST   /api/documents/upload
GET    /api/documents
GET    /api/documents/:id
DELETE /api/documents/:id
GET    /api/documents/:id/status

POST   /api/analyses
GET    /api/analyses/:id
POST   /api/analyses/:id/reprocess
GET    /api/documents/:id/analysis
GET    /api/analyses/:id/risks
GET    /api/analyses/:id/guided-review

GET    /api/dashboard/overview
GET    /api/dashboard/recent-documents
GET    /api/dashboard/risk-distribution
```

## Infraestrutura Recomendada

### Ambientes

- `local`
- `staging`
- `production`

### Serviços mínimos

- Vercel
- Neon Postgres
- storage privado
- funções backend
- worker opcional para análises pesadas

## Riscos Técnicos

### 1. Extração de texto inconsistente

Mitigação:

- guardar texto extraído
- guardar status de confiança
- diferenciar falha de upload e falha de extração

### 2. Saída inconsistente da Claude

Mitigação:

- schema validation
- retries controlados
- fallback de parsing

### 3. Tempo de processamento

Mitigação:

- estados intermediários
- polling no MVP
- worker quando necessário

### 4. Segurança de documentos

Mitigação:

- storage privado
- acesso por usuário
- retenção definida

## Decisões Que Vale Fechar Antes de Implementar

1. O auth será totalmente próprio ou vamos usar um provedor externo depois?
2. O storage será `Cloudflare R2`, `S3` ou `UploadThing`?
3. O score final será `0 a 100` ou `0 a 10`?
4. Haverá upload apenas de arquivo ou também texto colado no MVP?
5. O relatório em PDF entra no MVP ou fica para a fase seguinte?

## Recomendação Final

Minha recomendação para este projeto:

- publicar o site e o dashboard na `Vercel`
- usar `Neon` como banco principal
- manter auth e API nas `Vercel Functions`
- usar storage privado separado
- integrar a `Claude API` apenas no backend
- evoluir para worker dedicado quando o volume crescer

Isso conversa melhor com seu objetivo de colocar o produto online com uma base sólida em Postgres e menos risco de travar por limite de plataforma no plano gratuito.
