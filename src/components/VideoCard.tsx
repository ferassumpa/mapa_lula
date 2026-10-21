import type { Manifestation } from "@/lib/types";

export function VideoCard({ item }: { item: Manifestation }) {
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
        <div className="aspect-video w-full bg-black">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${item.youtube_id}`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
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
          <p className="text-sm leading-relaxed text-red-950/80">{item.description}</p>
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
