"use client";

import { useEffect, useRef, useState } from "react";
import type { Manifestation } from "@/lib/types";

export function VideoCard({ item }: { item: Manifestation }) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const date = item.occurred_at
    ? new Date(item.occurred_at + "T12:00:00").toLocaleDateString("pt-BR")
    : null;

  useEffect(() => {
    if (!item.youtube_id) return;
    const el = mediaRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [item.youtube_id]);

  return (
    <article className="overflow-hidden rounded-2xl bg-white/90 shadow-md ring-1 ring-red-900/10">
      {item.youtube_id ? (
        <div ref={mediaRef} className="aspect-video w-full bg-black">
          {inView ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${item.youtube_id}`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://i.ytimg.com/vi/${item.youtube_id}/hqdefault.jpg`}
              alt=""
              className="h-full w-full object-cover opacity-90"
              loading="lazy"
              decoding="async"
            />
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
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
          {item.youtube_id && (
            <a
              href={`https://www.youtube.com/watch?v=${item.youtube_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-red-700 underline-offset-2 hover:underline"
            >
              Abrir no YouTube
            </a>
          )}
          {item.source_url && (
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-red-700/80 underline-offset-2 hover:underline"
            >
              Detalhes do ato
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
