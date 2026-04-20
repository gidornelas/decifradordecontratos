# Plano de Backend - Decodificador de Contratos

## Resumo

O projeto saiu do estado frontend-only e ja possui backend operacional em producao para:

- auth real com cookie de sessao
- perfil do usuario
- upload de documentos
- storage privado via Cloudflare R2
- analise server-side com Claude
- dashboard alimentado por APIs base, secoes reais e navegacao mobile refinada
- healthcheck operacional

Ainda faltam refinamentos para fechar o ciclo de producao, principalmente em operabilidade, revisao de seguranca e refinamentos finais de UX no dashboard.

## Arquitetura Atual

- **Frontend e deploy:** `Vercel`
- **Banco principal:** `Neon Postgres`
- **Backend HTTP:** `Vercel Functions`
- **Auth:** sessao propria com cookie HttpOnly
- **Storage de arquivos:** `Cloudflare R2`
- **IA:** `Claude API`

## Estado Atual das APIs

Implementado:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `POST /api/documents`
- `GET /api/documents`
- `GET /api/documents/:id`
- `DELETE /api/documents/:id`
- `GET /api/documents/:id/status`
- `GET /api/documents/:id/file`
- `POST /api/analyses`
- `GET /api/analyses/:id`
- `POST /api/analyses/:id/reprocess`
- `GET /api/analyses/:id/risks`
- `GET /api/analyses/:id/guided-review`
- `GET /api/documents/:id/analysis`
- `GET /api/dashboard/overview`
- `GET /api/dashboard/recent-documents`
- `GET /api/dashboard/risk-distribution`
- `GET /api/health`
- `GET/POST /api/internal/retention`

## Validado em Producao

- cadastro e login de usuario
- sessao persistida por cookie
- upload de TXT com persistencia no Neon
- gravacao do arquivo bruto em bucket privado
- download protegido do arquivo pelo dono
- exclusao de documento com limpeza no storage
- healthcheck com diagnostico de storage
- fallback automatico de modelo Claude quando o alias configurado nao existe mais
- `CRON_SECRET` configurado e refletido no `api/health`

## Modulos

### Auth

Responsabilidades:

- cadastro
- login
- logout
- leitura da sessao atual

### Users

Responsabilidades:

- leitura do perfil
- atualizacao de nome no dashboard

### Documents

Responsabilidades:

- upload
- listagem
- leitura por id
- status
- download protegido
- exclusao

### Analyses

Responsabilidades:

- criar analise
- consultar analise
- reprocessar
- servir riscos e leitura guiada

### Dashboard

Responsabilidades:

- overview
- documentos recentes
- distribuicao de risco
- resultados, riscos e leitura guiada reais
- busca, filtros e navegacao mobile

### Operabilidade

Responsabilidades:

- healthcheck
- rate limiting
- retencao automatica
- diagnostico operacional

## Proximos Passos Recomendados

1. Adicionar uma validacao operacional simples para o job de retencao
2. Consolidar monitoramento de erro e execucao em producao
3. Melhorar estados de carregamento e resiliencia das acoes do dashboard
4. Refinar o dashboard com historico comparativo mais profundo e cortes por periodo
5. Revisar refinamentos finais de UX com foco em activity feed, perfil de uso e fluxos de exclusao em lote

## Riscos Abertos

- a UX final do dashboard ainda precisa refletir todos os dados reais das APIs
- o dashboard ainda pode evoluir com filtros temporais e historico comparativo por periodo
- as acoes destrutivas do dashboard ainda podem evoluir com lixeira temporaria server-side e trilha de auditoria
