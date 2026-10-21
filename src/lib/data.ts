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

    const counts = new Map<string, number>();
    for (const row of manifestations ?? []) {
      counts.set(row.state_uf, (counts.get(row.state_uf) ?? 0) + 1);
    }

    return (states ?? FALLBACK_STATES).map((s) => ({
      ...s,
      count: counts.get(s.uf) ?? 0,
    }));
  } catch {
    return FALLBACK_STATES.map((s) => ({ ...s, count: 0 }));
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
      .select("*")
      .eq("state_uf", uf.toUpperCase())
      .order("occurred_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}
