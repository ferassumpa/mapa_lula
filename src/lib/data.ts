import seedManifestations from "@/data/seed-manifestations.json";
import { supabase } from "./supabase";
import type { Manifestation, StateRow, StateWithCount } from "./types";

export const BRAZIL_STATES: StateRow[] = [
  { uf: "AC", name: "Acre", slug: "acre" },
  { uf: "AL", name: "Alagoas", slug: "alagoas" },
  { uf: "AP", name: "Amapá", slug: "amapa" },
  { uf: "AM", name: "Amazonas", slug: "amazonas" },
  { uf: "BA", name: "Bahia", slug: "bahia" },
  { uf: "CE", name: "Ceará", slug: "ceara" },
  { uf: "DF", name: "Distrito Federal", slug: "distrito-federal" },
  { uf: "ES", name: "Espírito Santo", slug: "espirito-santo" },
  { uf: "GO", name: "Goiás", slug: "goias" },
  { uf: "MA", name: "Maranhão", slug: "maranhao" },
  { uf: "MT", name: "Mato Grosso", slug: "mato-grosso" },
  { uf: "MS", name: "Mato Grosso do Sul", slug: "mato-grosso-do-sul" },
  { uf: "MG", name: "Minas Gerais", slug: "minas-gerais" },
  { uf: "PA", name: "Pará", slug: "para" },
  { uf: "PB", name: "Paraíba", slug: "paraiba" },
  { uf: "PR", name: "Paraná", slug: "parana" },
  { uf: "PE", name: "Pernambuco", slug: "pernambuco" },
  { uf: "PI", name: "Piauí", slug: "piaui" },
  { uf: "RJ", name: "Rio de Janeiro", slug: "rio-de-janeiro" },
  { uf: "RN", name: "Rio Grande do Norte", slug: "rio-grande-do-norte" },
  { uf: "RS", name: "Rio Grande do Sul", slug: "rio-grande-do-sul" },
  { uf: "RO", name: "Rondônia", slug: "rondonia" },
  { uf: "RR", name: "Roraima", slug: "roraima" },
  { uf: "SC", name: "Santa Catarina", slug: "santa-catarina" },
  { uf: "SP", name: "São Paulo", slug: "sao-paulo" },
  { uf: "SE", name: "Sergipe", slug: "sergipe" },
  { uf: "TO", name: "Tocantins", slug: "tocantins" },
];

function seedAsManifestations(): Manifestation[] {
  return seedManifestations.map((m, i) => ({
    id: `seed-${i}`,
    state_uf: m.state_uf,
    title: m.title,
    description: m.description,
    youtube_id: m.youtube_id,
    city: m.city,
    occurred_at: m.occurred_at,
    source_url: m.source_url,
    created_at: new Date().toISOString(),
    external_id: m.external_id,
    tipo: m.tipo,
    venue: m.venue,
  }));
}

function todayInBrazil(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function dateKey(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(0, 10);
}

function summarize(
  rows: { state_uf: string; occurred_at?: string | null }[],
  today: string,
) {
  const counts = new Map<string, number>();
  const todayUfs = new Set<string>();
  for (const row of rows) {
    counts.set(row.state_uf, (counts.get(row.state_uf) ?? 0) + 1);
    if (dateKey(row.occurred_at) === today) todayUfs.add(row.state_uf);
  }
  return { counts, todayUfs };
}

export async function getStatesWithCounts(): Promise<StateWithCount[]> {
  const today = todayInBrazil();

  try {
    const { data: states, error: statesError } = await supabase
      .from("ml_states")
      .select("uf, name, slug")
      .order("name");

    if (statesError) throw statesError;

    const { data: manifestations, error: manError } = await supabase
      .from("ml_manifestations")
      .select("state_uf, occurred_at");

    if (manError) throw manError;
    if (!manifestations || manifestations.length === 0) throw new Error("empty");

    const { counts, todayUfs } = summarize(manifestations, today);
    return (states ?? BRAZIL_STATES).map((s) => ({
      ...s,
      count: counts.get(s.uf) ?? 0,
      hasToday: todayUfs.has(s.uf),
    }));
  } catch {
    const { counts, todayUfs } = summarize(seedManifestations, today);
    return BRAZIL_STATES.map((s) => ({
      ...s,
      count: counts.get(s.uf) ?? 0,
      hasToday: todayUfs.has(s.uf),
    }));
  }
}

export async function getStateByUf(uf: string) {
  try {
    const { data, error } = await supabase
      .from("ml_states")
      .select("uf, name, slug")
      .eq("uf", uf.toUpperCase())
      .maybeSingle();

    if (error) throw error;
    if (data) return data;
  } catch {
    /* fallback below */
  }

  return BRAZIL_STATES.find((s) => s.uf === uf.toUpperCase()) ?? null;
}

export async function getManifestationsByUf(uf: string): Promise<Manifestation[]> {
  try {
    const { data, error } = await supabase
      .from("ml_manifestations")
      .select(
        "id, state_uf, title, description, youtube_id, city, occurred_at, source_url, created_at, external_id, tipo, venue",
      )
      .eq("state_uf", uf.toUpperCase())
      .order("occurred_at", { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) return data;
  } catch {
    /* fallback below */
  }

  return seedAsManifestations()
    .filter((m) => m.state_uf === uf.toUpperCase())
    .sort((a, b) => (b.occurred_at ?? "").localeCompare(a.occurred_at ?? ""));
}
