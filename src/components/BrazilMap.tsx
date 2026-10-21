"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import brazilMap from "@/data/brazil-map";
import type { StateWithCount } from "@/lib/types";
import { LulaFace } from "./LulaFace";

type Props = {
  states: StateWithCount[];
};

type Point = { x: number; y: number };

/** Extra room so right-side badges (NE coast) are not clipped */
const PAD = { left: 28, top: 24, right: 72, bottom: 36 };

function expandedViewBox(raw: string) {
  const [minX, minY, width, height] = raw.split(/\s+/).map(Number);
  return `${minX - PAD.left} ${minY - PAD.top} ${width + PAD.left + PAD.right} ${height + PAD.top + PAD.bottom}`;
}

export function BrazilMap({ states }: Props) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [centroids, setCentroids] = useState<Record<string, Point>>({});

  const byUf = useMemo(() => {
    const map = new Map<string, StateWithCount>();
    for (const s of states) map.set(s.uf.toLowerCase(), s);
    return map;
  }, [states]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const next: Record<string, Point> = {};
    for (const loc of brazilMap.locations) {
      const el = svg.querySelector(`#path-${loc.id}`) as SVGGraphicsElement | null;
      if (!el) continue;
      const box = el.getBBox();
      next[loc.id] = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    }
    setCentroids(next);

    for (const s of states) {
      if (s.count > 0) router.prefetch(`/estado/${s.uf}`);
    }
  }, [router, states]);

  const go = (uf: string) => router.push(`/estado/${uf.toUpperCase()}`);

  return (
    <div className="relative mx-auto w-full max-w-4xl px-2 sm:px-6">
      <svg
        ref={svgRef}
        viewBox={expandedViewBox(brazilMap.viewBox)}
        role="img"
        aria-label="Mapa do Brasil com manifestações por estado"
        className="h-auto w-full overflow-visible drop-shadow-sm"
        style={{ overflow: "visible" }}
      >
        {brazilMap.locations.map((loc) => {
          const state = byUf.get(loc.id);
          const hasEvents = (state?.count ?? 0) > 0;
          return (
            <path
              key={loc.id}
              id={`path-${loc.id}`}
              d={loc.path}
              role="link"
              tabIndex={0}
              onClick={() => go(loc.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") go(loc.id);
              }}
              className={
                hasEvents
                  ? "fill-[#f87171] stroke-[#7f1d1d] stroke-[0.8] transition hover:fill-[#ef4444] cursor-pointer outline-none"
                  : "fill-[#fecaca] stroke-[#b91c1c]/70 stroke-[0.8] transition hover:fill-[#fca5a5] cursor-pointer outline-none"
              }
            >
              <title>
                {`${state?.name ?? loc.name}${hasEvents ? ` — ${state!.count} manifestações` : ""}`}
              </title>
            </path>
          );
        })}

        {brazilMap.locations.map((loc) => {
          const state = byUf.get(loc.id);
          const count = state?.count ?? 0;
          if (count === 0) return null;
          const c = centroids[loc.id];
          if (!c) return null;

          return (
            <g
              key={`marker-${loc.id}`}
              transform={`translate(${c.x}, ${c.y})`}
              className="cursor-pointer"
              onClick={() => go(loc.id)}
            >
              <foreignObject x={-18} y={-18} width={36} height={36}>
                <div className="flex h-full w-full items-center justify-center">
                  <LulaFace size={32} />
                </div>
              </foreignObject>
              <g transform="translate(20, -10)">
                <rect
                  x={0}
                  y={-10}
                  rx={8}
                  ry={8}
                  width={Math.max(22, String(count).length * 10 + 12)}
                  height={20}
                  fill="#7f1d1d"
                />
                <text
                  x={Math.max(11, String(count).length * 5 + 6)}
                  y={4}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="var(--font-display), system-ui, sans-serif"
                >
                  {count}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
