"use client";

import React, { useState, useMemo } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { ToastContainer } from "@/components/ToastContainer";
import { MetricCards } from "@/components/MetricCards";
import { RadarFilterBar, FilterState } from "@/components/RadarFilterBar";
import { PropertyCard } from "@/components/PropertyCard";
import { AnalyzeModal } from "@/components/AnalyzeModal";
import { ImportCsvModal } from "@/components/ImportCsvModal";
import { AlertCircle } from "lucide-react";

function RadarHome() {
  const { properties, showSampleData, setShowSampleData } = useApp();
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    city: "all",
    status: "all",
    portal: "all",
    sortBy: "opportunity",
  });

  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => {
        // Toggle sample properties
        if (!showSampleData && p.isSample) {
          return false;
        }

        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchBarrio = p.barrio.toLowerCase().includes(q);
          const matchAddress = p.address.toLowerCase().includes(q);
          const matchOwner = p.ownerName.toLowerCase().includes(q);
          const matchCity = p.city.toLowerCase().includes(q);
          if (!matchBarrio && !matchAddress && !matchOwner && !matchCity) return false;
        }

        // City filter
        if (filters.city !== "all" && p.city !== filters.city) {
          return false;
        }

        // Status filter
        if (filters.status !== "all" && p.status !== filters.status) {
          return false;
        }

        // Portal filter
        if (filters.portal !== "all" && p.sourcePortal !== filters.portal) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "opportunity") {
          const scoreA = a.analysis?.opportunityScore ?? 0;
          const scoreB = b.analysis?.opportunityScore ?? 0;
          return scoreB - scoreA;
        }
        if (filters.sortBy === "days") {
          return b.daysStuck - a.daysStuck;
        }
        if (filters.sortBy === "price-desc") {
          return b.askingPriceCop - a.askingPriceCop;
        }
        if (filters.sortBy === "price-asc") {
          return a.askingPriceCop - b.askingPriceCop;
        }
        return 0;
      });
  }, [properties, filters, showSampleData]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Editorial Subheader */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-[#9E7D3B] font-semibold mb-1.5">
            <span>Inteligencia de Mercado Inmobiliario</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#14171A]">
            Radar de Particulares en Portales
          </h1>
          <p className="text-sm text-[#565C62] max-w-3xl mt-1.5 leading-relaxed">
            Detección sistemática de apartamentos ofertados directamente por propietarios con sobreprecio o fallas comerciales en Metrocuadrado, Fincaraiz y Ciencuadras. Audite el motivo de su estancamiento y presente valor antes de solicitar la captación.
          </p>
        </div>

        {/* Global Metric Cards (State-derived) */}
        <MetricCards />

        {/* Notice of Sample Data */}
        {showSampleData && (
          <div className="mb-6 p-3.5 bg-[#FFFFFF] border border-[#E6E1D8] rounded-sm flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#9E7D3B] shrink-0 mt-0.5" />
            <div className="text-xs text-[#565C62] leading-relaxed">
              <strong className="text-[#14171A] font-semibold">Aviso de transparencia:</strong> Los inmuebles, transacciones comparables y promedios por metro cuadrado mostrados corresponden a simulaciones técnicas controladas (<span className="font-mono text-[#9E7D3B] font-semibold">Datos de ejemplo</span>). Ningún dato inventado se presenta como una transacción real ni constituye avalúo formal bajo la legislación colombiana.
            </div>
          </div>
        )}

        {/* Search, Filter and Sort controls */}
        <RadarFilterBar
          filters={filters}
          onChange={setFilters}
          resultCount={filteredProperties.length}
        />

        {/* Property Cards List or Rich Empty State */}
        <div className="space-y-4">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))
          ) : (
            <div className="p-10 sm:p-14 text-center bg-white border border-[#E6E1D8] rounded-sm shadow-xs">
              <div className="w-12 h-12 bg-[#FAF8F5] border border-[#E6E1D8] rounded-full flex items-center justify-center mx-auto mb-4 text-[#9E7D3B]">
                <AlertCircle className="w-6 h-6" />
              </div>

              {properties.length === 0 || (!showSampleData && properties.every((p) => p.isSample)) ? (
                <>
                  <h3 className="font-serif text-xl font-bold text-[#14171A]">
                    No hay inmuebles visibles en el radar
                  </h3>
                  <p className="text-xs text-[#565C62] max-w-md mx-auto mt-2 leading-relaxed">
                    {!showSampleData && properties.some((p) => p.isSample)
                      ? "Los datos de ejemplo se encuentran ocultos y aún no ha incorporado inmuebles reales. Puede volver a activar los ejemplos o agregar un inmueble nuevo."
                      : "Aún no ha incorporado inmuebles comerciales a su radar. Agregue un inmueble de forma manual o cargue una lista mediante archivo CSV."}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                    {!showSampleData && properties.some((p) => p.isSample) && (
                      <button
                        onClick={() => setShowSampleData(true)}
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#0F533E] bg-[#EBF5F0] hover:bg-[#D7EBDD] border border-[#C3DFD3] rounded-sm transition-colors cursor-pointer"
                      >
                        Mostrar datos de ejemplo
                      </button>
                    )}
                    <button
                      onClick={() => setShowAnalyzeModal(true)}
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#0F533E] hover:bg-[#0A3C2D] rounded-sm transition-colors shadow-sm cursor-pointer"
                    >
                      + Agregar inmueble
                    </button>
                    <button
                      onClick={() => setShowCsvModal(true)}
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#23272B] bg-white border border-[#E6E1D8] hover:border-[#0F533E] hover:text-[#0F533E] rounded-sm transition-colors cursor-pointer"
                    >
                      Importar CSV
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-serif text-xl font-bold text-[#14171A]">
                    No se encontraron inmuebles con los criterios seleccionados
                  </h3>
                  <p className="text-xs text-[#565C62] max-w-md mx-auto mt-2 leading-relaxed">
                    Ningún inmueble coincide con la búsqueda o combinación de filtros actual (ciudad, portal o estado).
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                    <button
                      onClick={() =>
                        setFilters({
                          searchQuery: "",
                          city: "all",
                          status: "all",
                          portal: "all",
                          sortBy: "opportunity",
                        })
                      }
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#0F533E] bg-[#EBF5F0] hover:bg-[#D7EBDD] border border-[#C3DFD3] rounded-sm transition-colors cursor-pointer"
                    >
                      Restablecer filtros
                    </button>
                    <button
                      onClick={() => setShowAnalyzeModal(true)}
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#0F533E] hover:bg-[#0A3C2D] rounded-sm transition-colors shadow-sm cursor-pointer"
                    >
                      + Agregar nuevo inmueble
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="no-print bg-[#FFFFFF] border-t border-[#E6E1D8] py-6 mt-16 text-xs text-[#828A91]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            RADAR DE CAPTACIÓN - Plataforma B2B para Agencias Inmobiliarias en Colombia
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Metrocuadrado</span>
            <span>Fincaraiz</span>
            <span>Ciencuadras</span>
            <span>Valuación en COP</span>
          </div>
        </div>
      </footer>

      <ToastContainer />
      {showAnalyzeModal && <AnalyzeModal onClose={() => setShowAnalyzeModal(false)} />}
      {showCsvModal && <ImportCsvModal onClose={() => setShowCsvModal(false)} />}
    </div>
  );
}

export default function HomePage() {
  return (
    <AppProvider>
      <RadarHome />
    </AppProvider>
  );
}
