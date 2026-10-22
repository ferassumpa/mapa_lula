import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mapa Lula — Manifestações por estado",
  description:
    "Mapa do Brasil com manifestações a favor do Lula por estado e vídeos do YouTube.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fff5f5] text-red-950" style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}>
        <header className="border-b border-red-900/10 bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
            <a href="/" className="font-display text-lg font-bold text-red-900">
              Mapa Lula
            </a>
            <a
              href="/#cadastrar"
              className="text-sm font-semibold text-red-800 underline-offset-4 hover:underline"
            >
              Cadastrar evento
            </a>
          </div>
        </header>
        {children}
        <footer className="mt-auto border-t border-red-900/10 bg-white/50 px-4 py-4 text-center text-xs text-red-900/50">
          Conteúdo embutido do YouTube. Agregação informativa de vídeos públicos.
        </footer>
      </body>
    </html>
  );
}
