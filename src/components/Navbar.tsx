"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { SlidersHorizontal, Plus, Compass, FileSpreadsheet } from "lucide-react";
import { ConfigModal } from "./ConfigModal";
import { AnalyzeModal } from "./AnalyzeModal";
import { ImportCsvModal } from "./ImportCsvModal";

export function Navbar() {
  const { config } = useApp();
  const [showConfig, setShowConfig] = useState(false);
  const [showAnalyze, setShowAnalyze] = useState(false);
  const [showImportCsv, setShowImportCsv] = useState(false);

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  return (
    <>
      {isDemoMode && (
        <div className="no-print bg-[#0F533E] text-white text-[11px] font-mono tracking-wider uppercase text-center py-1.5 px-4 flex items-center justify-center gap-2 border-b border-[#0A3C2D]">
          <span className="w-2 h-2 rounded-full bg-[#9E7D3B] animate-pulse" />
          <span>Versión de demostración</span>
          <span className="text-[#C3DFD3] lowercase tracking-normal">
            — Motor heurístico local activado (sin consumo de API)
          </span>
        </div>
      )}
      <header className="no-print bg-[#FFFFFF] border-b border-[#E6E1D8] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Editorial Brand */}
          <Link href="/" className="group flex items-center gap-3.5 focus:outline-none">
            <div className="w-10 h-10 bg-[#0F533E] text-white flex items-center justify-center rounded-sm font-serif font-bold text-xl tracking-wider transition-transform group-hover:scale-105">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl tracking-tight font-bold text-[#14171A]">
                  RADAR DE CAPTACIÓN
                </span>
                <span className="text-[10px] uppercase tracking-widest font-mono text-[#0F533E] bg-[#EBF5F0] px-2 py-0.5 rounded-sm font-semibold border border-[#C3DFD3]">
                  B2B Colombia
                </span>
              </div>
              <p className="text-xs text-[#687076] tracking-tight">
                Inteligencia inmobiliaria y captación en exclusiva
              </p>
            </div>
          </Link>

          {/* Agency Badge & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm text-xs text-[#565C62]">
              <Compass className="w-3.5 h-3.5 text-[#0F533E]" />
              <span className="font-medium text-[#14171A]">{config.agencyName}</span>
              <span className="text-[#939B9F]">|</span>
              <span className="font-mono text-[#0F533E] font-semibold">
                {config.commissionPercent.toString().replace(".", ",")}% comisión
              </span>
            </div>

            <button
              onClick={() => setShowConfig(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold tracking-wide uppercase text-[#23272B] bg-[#FFFFFF] border border-[#E6E1D8] hover:border-[#9E7D3B] hover:text-[#9E7D3B] rounded-sm transition-colors cursor-pointer"
              title="Ajustes de la agencia, modelo y clave API"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Configuración</span>
            </button>

            <button
              onClick={() => setShowImportCsv(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold tracking-wide uppercase text-[#23272B] bg-[#FFFFFF] border border-[#E6E1D8] hover:border-[#0F533E] hover:text-[#0F533E] rounded-sm transition-colors cursor-pointer"
              title="Importar inmuebles por archivo CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#0F533E]" />
              <span className="hidden sm:inline">Importar CSV</span>
            </button>

            <button
              onClick={() => setShowAnalyze(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide uppercase text-white bg-[#0F533E] hover:bg-[#0A3C2D] rounded-sm transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar inmueble</span>
            </button>
          </div>
        </div>
      </header>

      {showConfig && <ConfigModal onClose={() => setShowConfig(false)} />}
      {showImportCsv && <ImportCsvModal onClose={() => setShowImportCsv(false)} />}
      {showAnalyze && <AnalyzeModal onClose={() => setShowAnalyze(false)} />}
    </>
  );
}
