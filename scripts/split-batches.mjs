import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rows = JSON.parse(readFileSync(join(root, "src", "data", "seed-manifestations.json"), "utf8"));
const outDir = join(root, "scripts", "batches");
mkdirSync(outDir, { recursive: true });

function esc(value) {
  if (value == null || value === "") return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

const batchSize = 40;
let n = 0;
for (let i = 0; i < rows.length; i += batchSize) {
  const chunk = rows.slice(i, i + batchSize);
  const values = chunk
    .map(
      (r) =>
        `(${esc(r.external_id)}, ${esc(r.state_uf)}, ${esc(r.title)}, ${esc(r.description)}, ${esc(r.youtube_id)}, ${esc(r.city)}, ${esc(r.occurred_at)}, ${esc(r.source_url)}, ${esc(r.tipo)}, ${esc(r.venue)})`,
    )
    .join(",\n");
  const prefix = i === 0 ? "TRUNCATE ml_manifestations;\n\n" : "";
  const sql = `${prefix}INSERT INTO ml_manifestations (external_id, state_uf, title, description, youtube_id, city, occurred_at, source_url, tipo, venue) VALUES\n${values};`;
  writeFileSync(join(outDir, `batch-${String(n).padStart(2, "0")}.sql`), sql);
  n += 1;
}

console.log(`Wrote ${n} batches`);
