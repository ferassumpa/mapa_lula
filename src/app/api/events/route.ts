import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { BRAZIL_STATES } from "@/lib/data";
import { getSupabase } from "@/lib/supabase";

const UFS = new Set(BRAZIL_STATES.map((s) => s.uf));

function todayInBrazil(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function clampDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const today = todayInBrazil();
  const min = new Date(`${today}T12:00:00`);
  min.setDate(min.getDate() - 45);
  const max = new Date(`${today}T12:00:00`);
  max.setDate(max.getDate() + 7);
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime()) || d < min || d > max) return null;
  return value;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const stateUf = String(body.state_uf ?? "")
    .trim()
    .toUpperCase();
  const city = String(body.city ?? "").trim();
  const venue = String(body.venue ?? "").trim();
  const notes = String(body.description ?? "").trim();
  const occurredAt = clampDate(String(body.occurred_at ?? "").trim());

  if (!UFS.has(stateUf)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }
  if (city.length < 2 || city.length > 120) {
    return NextResponse.json({ error: "Informe a cidade" }, { status: 400 });
  }
  if (!occurredAt) {
    return NextResponse.json(
      { error: "Data inválida (até 45 dias atrás ou 7 dias à frente)" },
      { status: 400 },
    );
  }
  if (venue.length > 200) {
    return NextResponse.json({ error: "Local muito longo" }, { status: 400 });
  }
  if (notes.length > 1000) {
    return NextResponse.json({ error: "Descrição muito longa" }, { status: 400 });
  }

  const title = `Ato pró-Lula em ${city}`;
  const description =
    [venue, notes].filter(Boolean).join(" · ").replace(/\s+/g, " ").trim() || null;
  const externalId = `user-${crypto.randomUUID()}`;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ml_manifestations")
    .insert({
      external_id: externalId,
      state_uf: stateUf,
      title,
      description,
      youtube_id: null,
      city,
      occurred_at: occurredAt,
      source_url: null,
      tipo: "contribuicao",
      venue: venue || null,
    })
    .select("id, state_uf, city, occurred_at")
    .single();

  if (error) {
    console.error("event insert failed", error);
    return NextResponse.json(
      { error: "Não foi possível salvar o evento" },
      { status: 500 },
    );
  }

  revalidatePath("/");
  revalidatePath(`/estado/${stateUf}`);

  return NextResponse.json({ ok: true, event: data });
}
