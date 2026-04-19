# Plano de Backend - Decodificador de Contratos

## Resumo

O projeto saiu do estado frontend-only e ja possui backend operacional em producao para:

- auth real com cookie de sessao
- perfil do usuario
- upload de documentos
- storage privado via Cloudflare R2
- analise server-side com Claude
- dashboard alimentado por APIs base e seções de results/risks ligadas à análise real
- healthcheck operacional

Ainda faltam refinamentos para fechar o ciclo de producao, principalmente em operabilidade, revisao de seguranca e renderizacao final do dashboard.

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

### Operabilidade

Responsabilidades:

- healthcheck
- rate limiting
- retencao automatica
- diagnostico operacional

## Proximos Passos Recomendados

1. Adicionar uma validacao operacional simples para o job de retencao
2. Consolidar monitoramento de erro e execucao em producao
3. Revisar UX de exportacao e compartilhamento dos resultados
4. Fechar protecoes adicionais de rotas no frontend
5. Melhorar navegacao mobile da sidebar e dos atalhos do dashboard

## Riscos Abertos

- o job de retencao depende de configuracao correta de `CRON_SECRET`
- a UX final do dashboard ainda precisa refletir todos os dados reais das APIs
- a navegacao mobile ainda pode evoluir com uma sidebar mais dedicada e atalhos mais compactos
