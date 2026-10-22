"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import type { StateRow } from "@/lib/types";

type Props = {
  states: StateRow[];
};

function todayLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function EventForm({ states }: Props) {
  const router = useRouter();
  const sorted = useMemo(
    () => [...states].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [states],
  );

  const [stateUf, setStateUf] = useState("");
  const [city, setCity] = useState("");
  const [occurredAt, setOccurredAt] = useState(todayLocal);
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state_uf: stateUf,
          city,
          occurred_at: occurredAt,
          venue,
          description,
          website,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error || "Não foi possível cadastrar.");
        return;
      }

      setStatus("ok");
      setMessage("Evento cadastrado! O mapa e a página do estado já contam com ele.");
      setCity("");
      setVenue("");
      setDescription("");
      setOccurredAt(todayLocal());
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Falha de rede. Tente de novo.");
    }
  }

  const field =
    "w-full rounded-xl border border-red-900/15 bg-white px-3 py-2.5 text-red-950 outline-none ring-red-700/30 placeholder:text-red-900/35 focus:ring-2";

  return (
    <form onSubmit={onSubmit} className="relative space-y-4 text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-red-950">
          Estado
          <select
            required
            value={stateUf}
            onChange={(e) => setStateUf(e.target.value)}
            className={`${field} mt-1.5`}
          >
            <option value="">Selecione</option>
            {sorted.map((s) => (
              <option key={s.uf} value={s.uf}>
                {s.name} ({s.uf})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-red-950">
          Cidade
          <input
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            maxLength={120}
            placeholder="Ex.: Belo Horizonte"
            className={`${field} mt-1.5`}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-red-950">
          Data
          <input
            required
            type="date"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            className={`${field} mt-1.5`}
          />
        </label>

        <label className="block text-sm font-medium text-red-950">
          Local <span className="font-normal text-red-900/50">(opcional)</span>
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            maxLength={200}
            placeholder="Praça, avenida…"
            className={`${field} mt-1.5`}
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-red-950">
        Detalhes <span className="font-normal text-red-900/50">(opcional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Horário, concentração, observações…"
          className={`${field} mt-1.5 resize-y`}
        />
      </label>

      {/* honeypot */}
      <label className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden>
        Site
        <input
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-red-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-900 disabled:opacity-60"
        >
          {status === "loading" ? "Enviando…" : "Cadastrar evento"}
        </button>
        {message && (
          <p
            className={`text-sm ${status === "ok" ? "text-green-800" : "text-red-800"}`}
            role="status"
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
