# Plano de Backend - Decodificador de Contratos

## Resumo

O projeto saiu do estado frontend-only e ja possui backend operacional em producao para:

- auth real com cookie de sessao
- perfil do usuario
- upload de documentos
- storage privado via Cloudflare R2
- analise server-side com Claude
- dashboard alimentado por APIs base, secoes reais e navegacao mobile refinada
- acessibilidade da revisao guiada com leitura em audio no navegador sem custo adicional
- healthcheck operacional

O backend e o dashboard ja cobrem o ciclo principal de producao, com operabilidade e UX essencial conectadas aos dados reais.

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
- ultima execucao do job de retencao exposta no `api/health`
- pipeline de analise com logs estruturados para tentativas, fallback e falhas
- rotas autenticadas sensiveis com validacao de UUID e request logging consistente
- resumo recente de analises e ultima falha expostos no `api/health`
- dashboard com loading inicial mais claro e resiliencia a falhas parciais nas APIs de overview
- overview com comparativo mais profundo por janela filtrada, faixa de score e ritmo de conclusao
- activity feed com resumo visual coerente com busca, filtros e auditoria
- configuracoes com resumo de uso real e saude recente das analises
- exclusao em lote com resumo de selecao e lixeira temporaria mais clara
- leitura em audio da explicacao simplificada na revisao guiada usando Web Speech API nativa do navegador

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
- leitura em audio da explicacao simplificada para acessibilidade
- busca, filtros e navegacao mobile

### Operabilidade

Responsabilidades:

- healthcheck
- rate limiting
- retencao automatica
- diagnostico operacional

## Proximos Passos Recomendados

1. Validar manualmente os fluxos do dashboard em producao com massa real e ajustar microcopy se necessario

## Riscos Abertos

- a validacao final ainda depende de teste manual em navegador com dados reais
- o dashboard ainda pode evoluir com exportacoes mais profundas e comparativos historicos adicionais
- a auditoria ja possui tela dedicada de historico com filtros por evento e documento
