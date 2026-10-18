import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const serifFont = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Radar de Captación | Inteligencia Inmobiliaria para Agencias",
  description:
    "Detección y auditoría de apartamentos de particulares estancados en portales inmobiliarios colombianos. Valoración por m2 y dossiers editoriales de captación en exclusiva.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO" className={`${serifFont.variable} ${sansFont.variable} ${monoFont.variable}`}>
      <body className="min-h-screen bg-[#FAF8F5] text-[#181B1E] font-sans antialiased selection:bg-[#EBF5F0] selection:text-[#0F533E]">
        {children}
      </body>
    </html>
  );
}
