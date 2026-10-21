import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  readFileSync(join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const rows = JSON.parse(readFileSync(join(root, "src", "data", "seed-manifestations.json"), "utf8"));

const batchSize = 50;
let inserted = 0;

for (let i = 0; i < rows.length; i += batchSize) {
  const chunk = rows.slice(i, i + batchSize);
  const res = await fetch(`${url}/rest/v1/ml_manifestations`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(chunk),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Batch ${i}: ${res.status} ${text}`);
  }

  inserted += chunk.length;
  console.log(`Inserted ${inserted}/${rows.length}`);
}

console.log("Done");
