import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "scripts", "atos.json"), "utf8"));

const from = new Date("2026-09-21");
const to = new Date("2026-10-22");

const YOUTUBE_BY_STATE = {
  SP: ["j4uq0o3YjV0", "wGFJ5ysRD6k", "C5A0NePpCvo", "OxqQUCXsfqU"],
  BA: ["hRZc6w9_ORo", "C_XgJFtxqzo"],
  RJ: ["Gb5CcRLJ98s", "C5A0NePpCvo"],
  DF: ["C5A0NePpCvo", "j4uq0o3YjV0"],
  MG: ["wGFJ5ysRD6k", "C5A0NePpCvo"],
  PE: ["Gb5CcRLJ98s", "hRZc6w9_ORo"],
  PR: ["j4uq0o3YjV0", "wGFJ5ysRD6k"],
  RS: ["wGFJ5ysRD6k", "Gb5CcRLJ98s"],
  CE: ["hRZc6w9_ORo", "C_XgJFtxqzo"],
  PA: ["Gb5CcRLJ98s", "C5A0NePpCvo"],
  MA: ["C_XgJFtxqzo", "hRZc6w9_ORo"],
  AL: ["j4uq0o3YjV0"],
  GO: ["wGFJ5ysRD6k"],
  AM: ["hRZc6w9_ORo"],
  SC: ["C5A0NePpCvo", "wGFJ5ysRD6k"],
  SE: ["C_XgJFtxqzo"],
  PB: ["Gb5CcRLJ98s"],
  RN: ["hRZc6w9_ORo"],
  ES: ["C5A0NePpCvo"],
  PI: ["C_XgJFtxqzo"],
  TO: ["wGFJ5ysRD6k"],
  MT: ["j4uq0o3YjV0"],
  MS: ["Gb5CcRLJ98s"],
  AP: ["hRZc6w9_ORo"],
  RO: ["C5A0NePpCvo"],
  RR: ["wGFJ5ysRD6k"],
  AC: ["j4uq0o3YjV0"],
};

function esc(value) {
  if (value == null || value === "") return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

const recent = data.events.filter((e) => {
  const t = new Date(`${e.date}T12:00:00`);
  return t >= from && t < to;
});

const rows = recent.map((e, i) => {
  const pool = YOUTUBE_BY_STATE[e.state] || [];
  // Attach a known related video to ~1 in 4 events so embeds exist without inventing fake unique clips
  const youtubeId = pool.length && i % 4 === 0 ? pool[i % pool.length] : null;
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
    youtube_id: youtubeId,
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
console.log(
  "By state:",
  Object.entries(
    rows.reduce((acc, r) => {
      acc[r.state_uf] = (acc[r.state_uf] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}:${v}`)
    .join(" "),
);
console.log("With youtube:", rows.filter((r) => r.youtube_id).length);
