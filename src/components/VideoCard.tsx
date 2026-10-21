"use client";

import { useState } from "react";
import type { Manifestation } from "@/lib/types";

export function VideoCard({ item }: { item: Manifestation }) {
  const [playing, setPlaying] = useState(false);

  const date = item.occurred_at
    ? new Date(item.occurred_at + "T12:00:00").toLocaleDateString("pt-BR")
    : null;

  const linkLabel = item.youtube_id
    ? "Abrir no YouTube"
    : item.source_url
      ? "Ver detalhes do ato"
      : null;

  const href = item.youtube_id
    ? `https://www.youtube.com/watch?v=${item.youtube_id}`
    : item.source_url;

  return (
    <article className="overflow-hidden rounded-2xl bg-white/90 shadow-md ring-1 ring-red-900/10">
      {item.youtube_id ? (
        <div className="relative aspect-video w-full bg-black">
          {playing ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${item.youtube_id}?autoplay=1`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group relative h-full w-full cursor-pointer"
              aria-label={`Reproduzir: ${item.title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://i.ytimg.com/vi/${item.youtube_id}/hqdefault.jpg`}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/35" />
              <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-700 text-white shadow-lg transition group-hover:scale-105">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-red-100 to-red-200 px-6 text-center">
          <div>
            <p className="font-display text-lg font-semibold text-red-900">
              {(item.tipo || "ato").toString()}
            </p>
            <p className="mt-1 text-sm text-red-800/80">
              {item.venue || item.city || "Manifestação registrada"}
            </p>
          </div>
        </div>
      )}
      <div className="space-y-1 p-4">
        <h2 className="text-lg font-semibold text-red-950">{item.title}</h2>
        {(item.city || date) && (
          <p className="text-sm text-red-900/70">
            {[item.city, date].filter(Boolean).join(" · ")}
          </p>
        )}
        {item.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-red-950/80">{item.description}</p>
        )}
        {href && linkLabel && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block pt-1 text-sm font-medium text-red-700 underline-offset-2 hover:underline"
          >
            {linkLabel}
          </a>
        )}
      </div>
    </article>
  );
}
