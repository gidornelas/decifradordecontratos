# Problema de limite de Functions na Vercel

## Situação

O projeto tinha `19` arquivos `.js` dentro de `api/`.

Na prática, isso fazia o deploy estourar o limite do plano free/Hobby da Vercel para este projeto. O aplicativo funcionava localmente, mas falhava no deploy por excesso de Functions criadas.

## Causa

Este backend não é Next.js. Ele usa funções Node diretas em `api/`, então cada arquivo de rota acaba virando uma Function separada no deploy.

Estrutura antiga:

```text
api/
├── auth/
│   ├── login.js
│   ├── register.js
│   ├── me.js
│   └── logout.js
├── health.js
├── documents/
│   ├── index.js
│   ├── [id].js
│   └── [id]/
│       ├── file.js
│       ├── analysis.js
│       └── status.js
├── analyses/
│   ├── index.js
│   ├── [id].js
│   └── [id]/
│       ├── reprocess.js
│       ├── risks.js
│       └── guided-review.js
├── dashboard/
│   ├── overview.js
│   ├── recent-documents.js
│   └── risk-distribution.js
└── internal/
    └── retention.js
```

Total: `19` endpoints implementados como arquivos físicos em `api/`.

## Solução aplicada

Mantivemos as mesmas URLs públicas, mas reduzimos o número de Functions reais.

Nova estrutura em `api/`:

```text
api/
├── auth.js
├── analyses.js
├── documents.js
├── dashboard.js
├── health.js
└── internal/
    └── retention.js
```

Total atual: `6` Functions.

Os handlers antigos foram movidos para `routes-src/` e o `vercel.json` agora usa `rewrites` para mapear URLs como:

- `/api/auth/login` -> `/api/auth?action=login`
- `/api/documents/:id/file` -> `/api/documents?action=file&id=:id`
- `/api/analyses/:id/risks` -> `/api/analyses?action=risks&id=:id`

Assim, o frontend continua chamando as mesmas rotas, mas a Vercel cria menos Functions no deploy.

## Resultado esperado

- Mantém todas as funcionalidades
- Mantém as URLs existentes
- Fica dentro do plano free/Hobby
- Evita upgrade imediato para o plano Pro

## Observações

- `api/health.js` continua separado
- `api/internal/retention.js` continua separado por causa do cron
- Os `rewrites` contam como rotas de deploy, mas isso não é problema neste projeto

## Referências

- Vercel Limits: https://vercel.com/docs/limits
- Vercel Rewrites: https://vercel.com/docs/routing/rewrites
