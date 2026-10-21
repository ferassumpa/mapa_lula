import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoCard } from "@/components/VideoCard";
import { getManifestationsByUf, getStateByUf } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ uf: string }>;
};

export default async function EstadoPage({ params }: Props) {
  const { uf: raw } = await params;
  const uf = raw.toUpperCase();

  const [state, videos] = await Promise.all([getStateByUf(uf), getManifestationsByUf(uf)]);
  if (!state) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative px-4 pb-16 pt-8 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#fecaca_0%,_transparent_50%),linear-gradient(180deg,#fff5f5_0%,#ffe4e6_100%)]" />

        <div className="relative mx-auto max-w-5xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-red-800 hover:text-red-950"
          >
            ← Voltar ao mapa
          </Link>

          <h1 className="font-display mt-4 text-3xl font-bold text-red-950 sm:text-4xl">
            {state.name}
          </h1>
          <p className="mt-2 text-red-900/75">
            {videos.length === 0
              ? "Nenhuma manifestação registrada neste estado ainda."
              : `${videos.length} manifestaç${videos.length === 1 ? "ão" : "ões"} a favor do Lula`}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {videos.map((item) => (
              <VideoCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
