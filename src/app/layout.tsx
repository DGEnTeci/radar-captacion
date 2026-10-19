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

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ),
  title: "Radar de Captación | Inteligencia de captación inmobiliaria",
  description:
    "Plataforma B2B de inteligencia de mercado inmobiliario y captación en exclusiva de inmuebles para agencias en Colombia. Detección de inmuebles estancados y dossiers de valoración profesional.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Radar de Captación | Inteligencia de captación inmobiliaria",
    description:
      "Plataforma B2B de inteligencia de mercado inmobiliario y captación en exclusiva de inmuebles para agencias en Colombia.",
    type: "website",
    locale: "es_CO",
    siteName: "Radar de Captación",
    images: [
      {
        url: "/images/properties/bogota-chapinero.jpg",
        width: 1200,
        height: 800,
        alt: "Radar de Captación - Inteligencia inmobiliaria en Colombia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Radar de Captación | Inteligencia de captación inmobiliaria",
    description:
      "Plataforma B2B de inteligencia de mercado inmobiliario y captación en exclusiva de inmuebles para agencias en Colombia.",
    images: ["/images/properties/bogota-chapinero.jpg"],
  },
  ...(isDemoMode
    ? {
        robots: {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        },
      }
    : {}),
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
