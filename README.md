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

## Varredura YouTube (opcional)

Com `YOUTUBE_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`:

```bash
curl -X POST http://localhost:3000/api/scan -H "x-scan-secret: SEU_SCAN_SECRET"
```

Busca vídeos do último mês por estado e grava no Supabase (sem duplicar).

## Deploy Vercel

1. Conecte o repositório ao Vercel
2. Configure as env vars do `.env.example`
3. Deploy

Supabase: projeto **mapa_lula** (`ufmaymqyzrokabcrrpnj`).
