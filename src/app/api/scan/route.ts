import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const STATE_QUERIES: { uf: string; q: string }[] = [
  { uf: "SP", q: "manifestação ato pró Lula São Paulo" },
  { uf: "RJ", q: "manifestação ato pró Lula Rio de Janeiro" },
  { uf: "MG", q: "manifestação ato pró Lula Minas Gerais" },
  { uf: "BA", q: "manifestação ato pró Lula Bahia" },
  { uf: "PE", q: "manifestação ato pró Lula Pernambuco Recife" },
  { uf: "CE", q: "manifestação ato pró Lula Ceará Fortaleza" },
  { uf: "PR", q: "manifestação ato pró Lula Paraná Curitiba" },
  { uf: "RS", q: "manifestação ato pró Lula Porto Alegre" },
  { uf: "DF", q: "manifestação ato pró Lula Brasília Esplanada" },
  { uf: "PA", q: "manifestação ato pró Lula Belém Pará" },
  { uf: "MA", q: "manifestação ato pró Lula Maranhão" },
  { uf: "GO", q: "manifestação ato pró Lula Goiânia" },
  { uf: "AM", q: "manifestação ato pró Lula Manaus" },
  { uf: "SC", q: "manifestação ato pró Lula Santa Catarina" },
  { uf: "AL", q: "manifestação ato pró Lula Maceió" },
];

type YTItem = {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelTitle: string;
  };
};

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  const secret = process.env.SCAN_SECRET;
  const provided = req.headers.get("x-scan-secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ytKey = process.env.YOUTUBE_API_KEY;
  if (!ytKey) {
    return NextResponse.json(
      {
        error: "YOUTUBE_API_KEY não configurada",
        hint: "Defina YOUTUBE_API_KEY para varredura automática. O seed inicial já foi populado no Supabase.",
      },
      { status: 400 },
    );
  }

  const supabase = adminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY necessária para gravar resultados" },
      { status: 400 },
    );
  }

  const publishedAfter = new Date();
  publishedAfter.setMonth(publishedAfter.getMonth() - 1);

  let inserted = 0;
  const details: { uf: string; found: number; inserted: number }[] = [];

  for (const { uf, q } of STATE_QUERIES) {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "5");
    url.searchParams.set("order", "date");
    url.searchParams.set("relevanceLanguage", "pt");
    url.searchParams.set("regionCode", "BR");
    url.searchParams.set("publishedAfter", publishedAfter.toISOString());
    url.searchParams.set("q", q);
    url.searchParams.set("key", ytKey);

    const res = await fetch(url);
    if (!res.ok) {
      details.push({ uf, found: 0, inserted: 0 });
      continue;
    }

    const json = (await res.json()) as { items?: YTItem[] };
    const items = json.items ?? [];
    let stateInserted = 0;

    for (const item of items) {
      const youtubeId = item.id.videoId;
      const title = item.snippet.title;
      const description = item.snippet.description?.slice(0, 400) || null;
      const occurredAt = item.snippet.publishedAt.slice(0, 10);

      const { error } = await supabase.from("ml_manifestations").upsert(
        {
          state_uf: uf,
          title,
          description,
          youtube_id: youtubeId,
          city: null,
          occurred_at: occurredAt,
          source_url: `https://www.youtube.com/watch?v=${youtubeId}`,
        },
        { onConflict: "youtube_id,state_uf", ignoreDuplicates: true },
      );

      if (!error) {
        stateInserted += 1;
        inserted += 1;
      }
    }

    details.push({ uf, found: items.length, inserted: stateInserted });
  }

  return NextResponse.json({ ok: true, inserted, details });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "POST com header x-scan-secret para varrer YouTube do último mês.",
  });
}
