import { BrazilMap } from "@/components/BrazilMap";
import { EventForm } from "@/components/EventForm";
import { BRAZIL_STATES, getStatesWithCounts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const states = await getStatesWithCounts();
  const total = states.reduce((sum, s) => sum + s.count, 0);
  const withEvents = states.filter((s) => s.count > 0).length;

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-x-clip px-2 pb-10 pt-10 sm:overflow-visible sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#fecaca_0%,_transparent_55%),linear-gradient(180deg,#fff5f5_0%,#ffe4e6_45%,#fff1f2_100%)]" />
        <div className="relative mx-auto max-w-5xl px-2 text-center sm:px-0">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-red-800/80">
            Brasil · último mês
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight text-red-950 sm:text-5xl">
            Mapa Lula
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-red-900/80 sm:text-lg">
            Estados em verde, divisões em amarelo. Lula pisca para manifestações ocorrendo hoje.
          </p>
          <p className="mt-4 text-sm font-medium text-red-800">
            {total} manifestações em {withEvents} estados (último mês)
          </p>
        </div>

        <div className="relative mx-auto mt-8 w-full max-w-5xl">
          <BrazilMap states={states} />
        </div>

        <p className="relative mx-auto mt-6 max-w-2xl text-center text-xs text-red-900/60">
          Clique em um estado para ver os atos. Fontes: agenda aberta Esquerda nas Ruas / Comitê
          Popular / Hoje tem 13 (CC BY 4.0), com embeds do YouTube quando disponíveis.
        </p>
      </section>

      <section
        id="cadastrar"
        className="relative border-t border-red-900/10 bg-white/40 px-4 py-12 sm:px-8"
      >
        <div className="relative mx-auto max-w-xl">
          <h2 className="font-display text-2xl font-bold text-red-950 sm:text-3xl">
            Cadastre um evento
          </h2>
          <p className="mt-2 text-red-900/75">
            Tem um ato na sua cidade? Informe estado, cidade e data — e, se quiser, um link do
            YouTube ou um PDF. Ele entra no contador do mapa e na lista do estado.
          </p>
          <div className="mt-6 rounded-2xl bg-white/90 p-5 shadow-sm ring-1 ring-red-900/10 sm:p-6">
            <EventForm states={BRAZIL_STATES} />
          </div>
        </div>
      </section>
    </main>
  );
}
