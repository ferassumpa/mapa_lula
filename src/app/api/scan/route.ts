import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type OpenEvent = {
  id: string;
  date: string;
  city: string;
  state: string;
  tipo?: string;
  venue?: string;
  address?: string;
  notes?: string;
  url?: string;
  officialUrl?: string | null;
};

type OpenData = {
  events: OpenEvent[];
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

  const supabase = adminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY necessária para gravar resultados" },
      { status: 400 },
    );
  }

  const res = await fetch("https://esquerda-nas-ruas.com.br/dados/atos.json", {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Falha ao baixar agenda aberta: ${res.status}` },
      { status: 502 },
    );
  }

  const data = (await res.json()) as OpenData;
  const from = new Date();
  from.setMonth(from.getMonth() - 1);

  const recent = (data.events ?? []).filter((e) => {
    const t = new Date(`${e.date}T12:00:00`);
    return t >= from;
  });

  let upserted = 0;
  for (const e of recent) {
    const tipo = e.tipo || "ato";
    const title = `${tipo.charAt(0).toUpperCase()}${tipo.slice(1)} pró-Lula em ${e.city}`;
    const description =
      [e.venue, e.address, e.notes]
        .filter(Boolean)
        .join(" · ")
        .replace(/\s+/g, " ")
        .trim() || null;

    const { error } = await supabase.from("ml_manifestations").upsert(
      {
        external_id: e.id,
        state_uf: e.state,
        title,
        description,
        youtube_id: null,
        city: e.city,
        occurred_at: e.date,
        source_url: e.url || e.officialUrl || null,
        tipo,
        venue: e.venue || null,
      },
      { onConflict: "external_id" },
    );

    if (!error) upserted += 1;
  }

  return NextResponse.json({
    ok: true,
    source: "esquerda-nas-ruas.com.br/dados/atos.json",
    found: recent.length,
    upserted,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message:
      "POST com header x-scan-secret para sincronizar a agenda aberta do último mês (Esquerda nas Ruas).",
  });
}
