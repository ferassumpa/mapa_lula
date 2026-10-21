import seedManifestations from "@/data/seed-manifestations.json";
import { supabase } from "./supabase";
import type { Manifestation, StateRow, StateWithCount } from "./types";

const FALLBACK_STATES: StateRow[] = [
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

function countsFrom(rows: { state_uf: string }[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.state_uf, (counts.get(row.state_uf) ?? 0) + 1);
  }
  return counts;
}

export async function getStatesWithCounts(): Promise<StateWithCount[]> {
  try {
    const { data: states, error: statesError } = await supabase
      .from("ml_states")
      .select("uf, name, slug")
      .order("name");

    if (statesError) throw statesError;

    const { data: manifestations, error: manError } = await supabase
      .from("ml_manifestations")
      .select("state_uf");

    if (manError) throw manError;
    if (!manifestations || manifestations.length === 0) throw new Error("empty");

    const counts = countsFrom(manifestations);
    return (states ?? FALLBACK_STATES).map((s) => ({
      ...s,
      count: counts.get(s.uf) ?? 0,
    }));
  } catch {
    const counts = countsFrom(seedManifestations);
    return FALLBACK_STATES.map((s) => ({
      ...s,
      count: counts.get(s.uf) ?? 0,
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

  return FALLBACK_STATES.find((s) => s.uf === uf.toUpperCase()) ?? null;
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
