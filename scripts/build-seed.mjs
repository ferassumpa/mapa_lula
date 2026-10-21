import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "scripts", "atos.json"), "utf8"));

const from = new Date("2026-09-21");
const to = new Date("2026-10-22");

/** Each YouTube ID is used at most once, on one matching state event. */
const UNIQUE_VIDEOS = [
  // RJ — live Midia NINJA Copacabana 18/10
  {
    youtube_id: "ut8LrXJ1IhY",
    state: "RJ",
    preferCity: "Rio",
    preferVenue: "Copacabana",
    preferDate: "2026-10-18",
  },
  // RJ — ato de rua com artistas
  {
    youtube_id: "31QrBdr6hKs",
    state: "RJ",
    preferCity: "Rio",
    preferVenue: "Candelária",
    preferDate: "2026-10-18",
  },
  // BA — live Midia NINJA Salvador 18/10
  {
    youtube_id: "gMiXNKYkthw",
    state: "BA",
    preferCity: "Salvador",
    preferVenue: "Farol",
    preferDate: "2026-10-18",
  },
  // DF — Esplanada 18/10
  {
    youtube_id: "iMZWChDPVEw",
    state: "DF",
    preferCity: "Brasília",
    preferVenue: "Museu",
    preferDate: "2026-10-18",
  },
  {
    youtube_id: "UHInr8pvvbM",
    state: "DF",
    preferCity: "Brasília",
    preferVenue: "Esquina",
    preferDate: "2026-10-18",
  },
  // SP — Paulista / ABC
  {
    youtube_id: "j4uq0o3YjV0",
    state: "SP",
    preferCity: "São Paulo",
    preferVenue: "Paulista",
  },
  {
    youtube_id: "D66-HjToABg",
    state: "SP",
    preferCity: "São Paulo",
    preferDate: "2026-10-11",
  },
  {
    youtube_id: "OxqQUCXsfqU",
    state: "SP",
    preferCity: "São Bernardo",
    preferDate: "2026-10-18",
  },
];

function esc(value) {
  if (value == null || value === "") return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function scoreCandidate(e, video) {
  let score = 0;
  const blob = `${e.venue || ""} ${e.address || ""}`.toLowerCase();
  if (video.preferVenue && blob.includes(video.preferVenue.toLowerCase())) {
    score += 40;
  }
  if (video.preferDate && e.date === video.preferDate) {
    score += 30;
  }
  return score;
}

const recent = data.events.filter((e) => {
  const t = new Date(`${e.date}T12:00:00`);
  return t >= from && t < to;
});

const usedEventIds = new Set();
const videoByEventId = new Map();

for (const video of UNIQUE_VIDEOS) {
  let candidates = recent.filter(
    (e) => e.state === video.state && !usedEventIds.has(e.id),
  );
  if (video.preferCity) {
    const inCity = candidates.filter((e) =>
      e.city.toLowerCase().includes(video.preferCity.toLowerCase()),
    );
    if (inCity.length) candidates = inCity;
  }
  if (candidates.length === 0) continue;

  candidates.sort(
    (a, b) => scoreCandidate(b, video) - scoreCandidate(a, video),
  );
  const chosen = candidates[0];
  usedEventIds.add(chosen.id);
  videoByEventId.set(chosen.id, video.youtube_id);
}

const rows = recent.map((e) => {
  const tipo = e.tipo || "ato";
  const title = `${tipo.charAt(0).toUpperCase()}${tipo.slice(1)} pró-Lula em ${e.city}`;
  const description =
    [e.venue, e.address, e.notes]
      .filter(Boolean)
      .join(" · ")
      .replace(/\s+/g, " ")
      .trim() || null;

  return {
    external_id: e.id,
    state_uf: e.state,
    title,
    description,
    youtube_id: videoByEventId.get(e.id) || null,
    city: e.city,
    occurred_at: e.date,
    source_url: e.url || e.officialUrl,
    tipo,
    venue: e.venue || null,
  };
});

writeFileSync(join(root, "src", "data", "seed-manifestations.json"), JSON.stringify(rows, null, 2));

const values = rows
  .map(
    (r) =>
      `(${esc(r.external_id)}, ${esc(r.state_uf)}, ${esc(r.title)}, ${esc(r.description)}, ${esc(r.youtube_id)}, ${esc(r.city)}, ${esc(r.occurred_at)}, ${esc(r.source_url)}, ${esc(r.tipo)}, ${esc(r.venue)})`,
  )
  .join(",\n");

const sql = `TRUNCATE ml_manifestations;

INSERT INTO ml_manifestations (external_id, state_uf, title, description, youtube_id, city, occurred_at, source_url, tipo, venue)
VALUES
${values};
`;

writeFileSync(join(root, "scripts", "seed-manifestations.sql"), sql);
console.log(`Wrote ${rows.length} manifestations`);
console.log(`With unique youtube: ${rows.filter((r) => r.youtube_id).length}`);
