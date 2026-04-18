# Configuração de Variáveis de Ambiente

## Objetivo

Este arquivo define:

- quais variáveis o projeto precisa
- onde cada variável deve ser configurada
- quais são públicas
- quais são privadas

Stack considerada:

- `Vercel`
- `Neon`
- `Claude API`

## Regra Mais Importante

Nunca colocar segredos reais em:

- `dashboard.html`
- `index.html`
- JavaScript executado no navegador
- commits do repositório
- prints, chats ou prompts

## Classificação das Variáveis

### Públicas

Podem aparecer no frontend apenas quando necessário:

- `APP_URL`

### Privadas

Devem existir apenas no backend:

- `CLAUDE_API_KEY`
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `AUTH_SECRET`

## Arquivos Locais

### `.env`

Uso:

- desenvolvimento local

Status:

- **não versionar**
- já protegido no `.gitignore`

Exemplo:

```env
CLAUDE_API_KEY=your_claude_api_key_here
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:password@host/db?sslmode=require
AUTH_SECRET=generate_a_long_random_secret_here
APP_URL=http://localhost:3000
```

### `.env.example`

Uso:

- documentação
- onboarding

Status:

- **pode versionar**
- deve ter apenas placeholders

## Configuração na Vercel

No painel da Vercel, em `Project Settings > Environment Variables`, cadastrar:

```text
CLAUDE_API_KEY
DATABASE_URL
DATABASE_URL_UNPOOLED
AUTH_SECRET
APP_URL
```

### `APP_URL`

- local: `http://localhost:3000`
- produção: `https://seu-dominio.vercel.app`
- custom domain: `https://seudominio.com.br`

## Configuração no Neon

No painel do Neon, você vai usar principalmente:

- string de conexão pooled
- string de conexão direta/unpooled

### Onde encontrar

No projeto Neon:

- connection string principal → `DATABASE_URL`
- connection string direta → `DATABASE_URL_UNPOOLED`

## Uso Correto de Cada Variável

### `CLAUDE_API_KEY`

Uso:

- chamadas server-side para análise de contratos

Nunca usar:

- browser
- HTML
- código público

### `DATABASE_URL`

Uso:

- backend
- queries normais
- funções da Vercel

### `DATABASE_URL_UNPOOLED`

Uso:

- migrations
- tarefas administrativas
- operações que precisem de conexão direta

### `AUTH_SECRET`

Uso:

- assinar sessão
- validar cookies/tokens internos

Nunca usar:

- frontend

### `APP_URL`

Uso:

- redirects
- links absolutos
- callbacks e links internos

## Convenção Recomendada

### No frontend

Permitir apenas:

- `APP_URL` quando necessário

### No backend

Permitir:

- `CLAUDE_API_KEY`
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `AUTH_SECRET`
- `APP_URL`

## Fluxo Recomendado de Segredos

1. localmente, usar `.env`
2. no repositório, manter apenas `.env.example`
3. em produção, configurar tudo na `Vercel`
4. nunca copiar segredos para arquivos do frontend
5. nunca chamar a Claude direto do navegador

## Checklist

- [ ] `.env` criado localmente
- [ ] `.env` fora do Git
- [ ] `.env.example` com placeholders apenas
- [ ] variáveis cadastradas na Vercel
- [ ] `CLAUDE_API_KEY` usada só no backend
- [ ] `DATABASE_URL` usada só no backend
- [ ] `AUTH_SECRET` usada só no backend

## Próximo Passo Recomendado

Depois deste arquivo, o próximo passo ideal é:

- criar schema inicial do Neon
- definir estratégia final de auth
- integrar login real no dashboard
