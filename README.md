# Nota A — Edge Functions

Proxy seguro da Anthropic API para a plataforma Nota A.

## Endpoints

| Endpoint       | Uso                          | Streaming |
|----------------|------------------------------|-----------|
| `POST /api/ai` | Todos os módulos (padrão)    | Não       |
| `POST /api/ai-stream` | IA Socrática          | Sim (SSE) |

## Segurança implementada

1. **Autenticação** — JWT do Supabase validado em toda requisição
2. **Rate limiting server-side** — consulta `uso_api_ia` no PostgreSQL
3. **Chave Anthropic nunca exposta** — permanece em variável de ambiente
4. **Validação de payload** — mensagens, tamanho, módulos permitidos
5. **max_tokens por módulo** — limita custo mesmo se o cliente pedir mais
6. **CORS restritivo** — apenas origens autorizadas
7. **Headers de segurança** — nosniff, deny frame, XSS protection

## Deploy (5 minutos)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis no Vercel Dashboard
#    Settings → Environment Variables:
#      ANTHROPIC_API_KEY     (secreta)
#      SUPABASE_URL          (pública)
#      SUPABASE_ANON_KEY     (pública)
#      SUPABASE_SERVICE_ROLE (secreta)

# 3. Deploy
vercel --prod
```

## Mudança no frontend (NotaA_Beta_Engine.js)

Trocar **apenas uma linha** no construtor do NotaAClient:

```js
// ANTES (chave exposta — apenas dev/validação)
this.endpoint = 'https://api.anthropic.com/v1/messages';

// DEPOIS (proxy seguro — produção)
this.endpoint = '/api/ai';
```

Para a socrática com streaming:
```js
// Em NotaA_Beta_App.jsx, na função socratica():
const res = await fetch('/api/ai-stream', {
  method: 'POST',
  headers: {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${supabase.auth.getSession().access_token}`,
  },
  body: JSON.stringify({ messages, system, modulo: 'socratica' }),
});

// Ler eventos SSE
const reader = res.body.getReader();
// ...processar { type:'delta', text:'...' } e { type:'done', usage:{...} }
```

## Limites por plano

| Plano  | Chamadas/dia | Chamadas/min |
|--------|-------------|--------------|
| Free   | 5           | 2            |
| Plus   | 20          | 3            |
| Escola | 50          | 5            |
| Admin  | 999         | 20           |

## Estrutura de arquivos

```
nota-a-edge/
├── api/
│   ├── ai.js           # Endpoint principal (JSON)
│   └── ai-stream.js    # Endpoint com SSE (socrática)
├── lib/
│   ├── supabase.js     # Cliente Supabase server-side
│   ├── ratelimit.js    # Verificação/registro de limite
│   └── cors.js         # Headers CORS
├── vercel.json         # Configuração Vercel
├── package.json
├── .env.example        # Template de variáveis de ambiente
└── README.md
```
