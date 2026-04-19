# Problema com部署 na Vercel - Limite de 12 Serverless Functions

## Resumo

O projeto tem **19 endpoints de API**, mas o **plano Hobby da Vercel permite apenas 12 Serverless Functions** por deployment. Isso impede o deploy automático.

## Estrutura Original (19 arquivos)

```
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

## Tentativas de Solução

### 1. Agrupar rotas em 1 arquivo (catch-all route)

Criamos um arquivo `[...slug].js` que agrupava todas as rotas em um único endpoint.

**Problema:** O Vercel não suporta catch-all routes da mesma forma que Next.js. O roteamento `api/auth/login` não era capturado pelo `[...slug].js`.

**Erro:** `NOT_FOUND` ao tentar acessar qualquer rota.

### 2. Reduzir para 12 endpoints

Removemos 7 arquivos para ficar dentro do limite.

**Problema:** Perdemo várias funcionalidades essenciais (documents/[id]/file, analyses/[id]/risks, etc.)

**Resultado:** Funciona, mas perde features.

## Solução Necessária

Para manter todos os 19 endpoints funcionando, é necessário:

1. **Upgrade para plano Pro** (~$20/mês)
   - Remove limite de Serverless Functions
   - Suporta ilimitadas funções

2. **Alternativa:** Manter apenas 12 endpoints (funcionalidades reduzidas)

## Diferenças entre planos

| Recurso | Hobby (Free) | Pro |
|--------|-------------|-----|
| Serverless Functions | 12 | Ilimitado |
| Bandwidth | 100GB/mês | 1TB/mês |
| Tempo de execução | 10s | 60s |
| Preço | Grátis | ~$20/mês |

## Como fazer upgrade

1. Acesse https://vercel.com/gidornelas/decifradordecontratos/settings
2. Clique em "Change Plan" ou "Upgrade"
3. Escolha o plano Pro
4. Adicione método de pagamento

Após o upgrade, o próximo deploy funcionará automaticamente.

## Histórico de Commits

- `deee628` - Estado original (19 endpoints) - **funciona localmente**
- `b54a611` - Tentativa 1: agrupar em 1 arquivo (falhou)
- Tentativas de router com `[...slug].js` (não funcionou no Vercel)

## Recomendação

Fazer **upgrade para Pro** para manter todas as funcionalidades.