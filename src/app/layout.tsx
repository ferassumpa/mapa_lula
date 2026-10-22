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
  title: "A VOZ DO POVO É A VOZ DO LULA",
  description:
    "Mapa do Brasil com manifestações a favor do Lula por estado e vídeos do YouTube.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-red-950" style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}>
        <header className="border-b border-neutral-200 bg-white">
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
        <footer className="mt-auto border-t border-neutral-200 bg-white px-4 py-4 text-center text-xs text-neutral-500">
          Conteúdo embutido do YouTube. Agregação informativa de vídeos públicos.
        </footer>
      </body>
    </html>
  );
}
