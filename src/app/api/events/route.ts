import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { BRAZIL_STATES } from "@/lib/data";
import { getSupabase } from "@/lib/supabase";
import { parseYoutubeId } from "@/lib/youtube";

const UFS = new Set(BRAZIL_STATES.map((s) => s.uf));
const MAX_PDF_BYTES = 5 * 1024 * 1024;

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

function field(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Formulário inválido" }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields
  if (field(form, "website") !== "") {
    return NextResponse.json({ ok: true });
  }

  const stateUf = field(form, "state_uf").toUpperCase();
  const city = field(form, "city");
  const venue = field(form, "venue");
  const notes = field(form, "description");
  const occurredAt = clampDate(field(form, "occurred_at"));
  const youtubeRaw = field(form, "youtube_url");
  const pdfEntry = form.get("pdf");

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

  let youtubeId: string | null = null;
  if (youtubeRaw) {
    youtubeId = parseYoutubeId(youtubeRaw);
    if (!youtubeId) {
      return NextResponse.json(
        { error: "Link do YouTube inválido" },
        { status: 400 },
      );
    }
  }

  const supabase = getSupabase();
  let sourceUrl: string | null = null;

  if (pdfEntry instanceof File && pdfEntry.size > 0) {
    if (pdfEntry.size > MAX_PDF_BYTES) {
      return NextResponse.json(
        { error: "PDF deve ter no máximo 5 MB" },
        { status: 400 },
      );
    }

    const mime = pdfEntry.type || "application/pdf";
    if (mime !== "application/pdf") {
      return NextResponse.json({ error: "Envie apenas arquivo PDF" }, { status: 400 });
    }

    const bytes = new Uint8Array(await pdfEntry.arrayBuffer());
    const header = String.fromCharCode(...bytes.slice(0, 4));
    if (header !== "%PDF") {
      return NextResponse.json({ error: "Arquivo PDF inválido" }, { status: 400 });
    }

    const path = `${stateUf.toLowerCase()}/${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("event-pdfs")
      .upload(path, bytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("pdf upload failed", uploadError);
      return NextResponse.json(
        { error: "Não foi possível enviar o PDF" },
        { status: 500 },
      );
    }

    const { data: publicData } = supabase.storage.from("event-pdfs").getPublicUrl(path);
    sourceUrl = publicData.publicUrl;
  }

  const title = `Ato pró-Lula em ${city}`;
  const description =
    [venue, notes].filter(Boolean).join(" · ").replace(/\s+/g, " ").trim() || null;
  const externalId = `user-${crypto.randomUUID()}`;

  const { data, error } = await supabase
    .from("ml_manifestations")
    .insert({
      external_id: externalId,
      state_uf: stateUf,
      title,
      description,
      youtube_id: youtubeId,
      city,
      occurred_at: occurredAt,
      source_url: sourceUrl,
      tipo: "contribuicao",
      venue: venue || null,
    })
    .select("id, state_uf, city, occurred_at, youtube_id, source_url")
    .single();

  if (error) {
    console.error("event insert failed", error);
    if (error.code === "23505" && youtubeId) {
      return NextResponse.json(
        {
          error:
            "Este vídeo do YouTube já está cadastrado em outro ato. Use outro link ou deixe em branco.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Não foi possível salvar o evento" },
      { status: 500 },
    );
  }

  revalidatePath("/");
  revalidatePath(`/estado/${stateUf}`);

  return NextResponse.json({ ok: true, event: data });
}
