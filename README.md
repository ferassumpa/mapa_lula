# Mapa Lula

Site simples com mapa do Brasil: estados em vermelho claro, carinha piscando + contador onde há manifestações, e página por estado com vídeos do YouTube.

## Stack

- **Next.js** (App Router) na **Vercel**
- **Supabase** (tabelas `ml_states`, `ml_manifestations`)
- Vídeos embutidos do **YouTube**

## Setup local

```bash
cp .env.example .env.local
# preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

## Sincronizar agenda (último mês)

Fonte principal: dados abertos [Esquerda nas Ruas](https://esquerda-nas-ruas.com.br/dados/) (`atos.json`, CC BY 4.0).

```bash
# regenera seed local a partir de scripts/atos.json
node scripts/build-seed.mjs

# importa no Supabase (precisa policy/service role)
node scripts/import-seed.mjs

# ou via API (SUPABASE_SERVICE_ROLE_KEY + SCAN_SECRET)
curl -X POST http://localhost:3000/api/scan -H "x-scan-secret: SEU_SCAN_SECRET"
```

## Deploy Vercel

1. Conecte o repositório ao Vercel
2. Configure as env vars do `.env.example`
3. Deploy

Supabase: projeto **mapa_lula** (`ufmaymqyzrokabcrrpnj`).
