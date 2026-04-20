# Signal — Dashboard

Dashboard em **React + Vite + Tailwind + Recharts** que consome uma API REST
em `http://localhost:3001` com autenticação via header `x-dashboard-token`.

Tema escuro, estilo editorial com toque agro. Paleta **ink / bone / moss / amber**,
tipografia **Fraunces** (display) + **IBM Plex Sans** (corpo) + **JetBrains Mono**
(números).

## Pré-requisitos

- Node.js **≥ 18.18** (recomendado 20+)
- API já rodando em `http://localhost:3001` com as rotas:
  - `GET /api/overview`
  - `GET /api/search-console`
  - `GET /api/ai-referrals`
  - `GET /api/ai-bots`
- Todas aceitam os query params `from=YYYY-MM-DD&to=YYYY-MM-DD` e exigem o
  header `x-dashboard-token`.

## Setup

```bash
# 1. instalar dependências
npm install

# 2. copiar variáveis de ambiente
cp .env.example .env

# 3. editar o .env e setar seu token
#    VITE_DASHBOARD_TOKEN=seu-token-real

# 4. subir em dev
npm run dev
```

A aplicação abre em http://localhost:5173 (Vite escolhe outra porta se essa
estiver ocupada).

## Scripts

| Comando            | O que faz                             |
| ------------------ | ------------------------------------- |
| `npm run dev`      | Servidor de desenvolvimento com HMR   |
| `npm run build`    | Build de produção em `dist/`          |
| `npm run preview`  | Serve o build local para smoke-test   |

## Variáveis de ambiente

Todas as variáveis precisam começar com `VITE_` para serem expostas ao bundle.

| Variável              | Default                    | Descrição                          |
| --------------------- | -------------------------- | ---------------------------------- |
| `VITE_API_BASE_URL`   | `http://localhost:3001`    | Base da API                        |
| `VITE_DASHBOARD_TOKEN`| _(vazio)_                  | Valor do header `x-dashboard-token`|

> ⚠️ O token é incorporado no bundle do cliente. Se o dashboard precisar ser
> publicado, coloque um proxy reverso (ex.: Cloudflare Worker / Nginx) que
> adiciona o header do lado servidor em vez de expor o segredo no navegador.

## Estrutura

```
dashboard-frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx            # layout + roteamento por aba + estado de range
    ├── index.css          # base, grain, tema dos charts
    ├── lib/
    │   ├── api.js         # fetch com x-dashboard-token
    │   ├── useApi.js      # hook loading/error/data
    │   ├── format.js      # fmt.int/dec/pct/delta/shortDate/longDate
    │   └── chartTheme.js  # paleta Recharts
    ├── components/
    │   ├── Sidebar.jsx
    │   ├── StatCard.jsx
    │   ├── ChartCard.jsx
    │   ├── DataTable.jsx
    │   ├── DateRangeSelect.jsx
    │   └── PageShell.jsx  # PageHeader, SectionTitle, Loading/Error
    └── pages/
        ├── Overview.jsx
        ├── SearchPage.jsx
        ├── AIChats.jsx
        └── AIBots.jsx
```

## Formato de resposta esperado

Os componentes são **defensivos**: se um campo vier nulo ou ausente, aparece
`—` na UI em vez de quebrar. O StatCard aceita tanto `campo: 42` quanto
`campo: { value: 42, delta: 3.1 }`.

### `GET /api/overview?from&to`

```jsonc
{
  "kpis": {
    "sessions":     { "value": 12843, "delta": 4.2 },
    "aiReferrals":  { "value": 384,   "delta": 22.5 },
    "searchClicks": { "value": 7612,  "delta": -1.8 },
    "botHits":      { "value": 9120,  "delta": 12.0 }
  },
  "timeseries": [
    { "date": "2026-03-18", "sessions": 412, "aiReferrals": 12, "searchClicks": 230, "botHits": 300 }
  ],
  "topSources": [
    { "name": "google", "sessions": 5400 },
    { "name": "chatgpt.com", "sessions": 240 }
  ]
}
```

### `GET /api/search-console?from&to`

```jsonc
{
  "summary": {
    "clicks":      { "value": 7612,   "delta": -1.8 },
    "impressions": { "value": 142301, "delta":  3.4 },
    "ctr":         { "value": 0.053,  "delta":  0.6 },   // aceita 0..1 ou 0..100
    "position":    { "value": 12.4,   "delta": -0.8 }
  },
  "timeseries": [
    { "date": "2026-03-18", "clicks": 230, "impressions": 4210, "ctr": 0.055, "position": 12.1 }
  ],
  "queries": [
    { "query": "cafe especial cerrado", "clicks": 120, "impressions": 2400, "ctr": 0.05, "position": 8.2 }
  ],
  "pages": [
    { "page": "https://exemplo.com/post-1", "clicks": 88, "impressions": 1500, "ctr": 0.058, "position": 6.1 }
  ]
}
```

### `GET /api/ai-referrals?from&to`

```jsonc
{
  "summary": {
    "totalReferrals": { "value": 384,  "delta": 22.5 },
    "uniquePages":    { "value": 72,   "delta":  4.0 },
    "topSource":      "chatgpt"
  },
  "bySource": [
    { "source": "chatgpt",    "referrals": 210 },
    { "source": "perplexity", "referrals":  88 },
    { "source": "claude",     "referrals":  46 },
    { "source": "gemini",     "referrals":  32 },
    { "source": "other",      "referrals":   8 }
  ],
  "timeseries": [
    { "date": "2026-03-18", "chatgpt": 12, "perplexity": 4, "claude": 2, "gemini": 1, "other": 0 }
  ],
  "topPages": [
    { "page": "https://exemplo.com/guia-de-solo", "source": "chatgpt", "referrals": 42 }
  ]
}
```

As chaves de `timeseries` são detectadas automaticamente — qualquer fonte extra
vira mais uma camada da área empilhada.

### `GET /api/ai-bots?from&to`

```jsonc
{
  "summary": {
    "totalHits":  { "value": 9120, "delta": 12.0 },
    "uniqueBots": { "value":   11, "delta":  0.0 },
    "topBot":     "gptbot"
  },
  "byBot": [
    { "bot": "gptbot",        "hits": 3800 },
    { "bot": "googlebot",     "hits": 2200 },
    { "bot": "perplexitybot", "hits":  980 },
    { "bot": "claudebot",     "hits":  620 }
  ],
  "timeseries": [
    { "date": "2026-03-18", "gptbot": 130, "googlebot": 72, "perplexitybot": 28 }
  ],
  "topPaths": [
    { "path": "/blog/como-plantar-cafe", "bot": "gptbot", "hits": 82 }
  ]
}
```

## Navegação

- As abas são refletidas no hash da URL (`#/overview`, `#/search`, `#/ai-chats`,
  `#/ai-bots`), então o link é compartilhável.
- O **range de datas é global** — ao trocar de aba, o período selecionado é
  preservado (e persistido em `localStorage`).

## Tema & customização

- Paleta e tokens tipográficos em `tailwind.config.js` (`ink-900..500`,
  `bone-50..600`, `moss-300..800`, `amber-300..700`).
- Cores de séries de gráficos em `src/lib/chartTheme.js`.
- Grain de papel editorial em `src/index.css` (`body::before`) — dá pra remover
  comentando o bloco se preferir superfície plana.
- O header da página (`PageHeader`) aceita `kicker` e `lede` para manter o tom
  jornalístico — troque os textos nas páginas para o seu contexto.

## Troubleshooting

**CORS** — Em desenvolvimento, a API em `:3001` precisa responder com
`Access-Control-Allow-Origin: http://localhost:5173` e permitir o header
`x-dashboard-token` em `Access-Control-Allow-Headers`. Alternativa: configurar
o proxy do Vite em `vite.config.js`.

**401 / 403** — Confira se `VITE_DASHBOARD_TOKEN` está no `.env` **antes** de
rodar `npm run dev` (Vite só lê env na inicialização).

**Fontes não carregam** — O `index.html` usa Google Fonts. Se você está offline
ou atrás de um proxy corporativo, substitua por `@fontsource/fraunces`,
`@fontsource/ibm-plex-sans` e `@fontsource/jetbrains-mono` importados em
`main.jsx`.

## Licença

Uso interno. Ajuste a nota conforme sua necessidade.
