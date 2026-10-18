"use client";

import React, { useState, useMemo } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { ToastContainer } from "@/components/ToastContainer";
import { MetricCards } from "@/components/MetricCards";
import { RadarFilterBar, FilterState } from "@/components/RadarFilterBar";
import { PropertyCard } from "@/components/PropertyCard";
import { AlertCircle } from "lucide-react";

function RadarHome() {
  const { properties } = useApp();

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
  }, [properties, filters]);

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
        <div className="mb-6 p-3.5 bg-[#FFFFFF] border border-[#E6E1D8] rounded-sm flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#9E7D3B] shrink-0 mt-0.5" />
          <div className="text-xs text-[#565C62] leading-relaxed">
            <strong className="text-[#14171A] font-semibold">Aviso de transparencia:</strong> Los inmuebles, transacciones comparables y promedios por metro cuadrado mostrados corresponden a simulaciones técnicas controladas (<span className="font-mono text-[#9E7D3B] font-semibold">Datos de ejemplo</span>). Ningún dato inventado se presenta como una transacción real ni constituye avalúo formal bajo la legislación colombiana.
          </div>
        </div>

        {/* Search, Filter and Sort controls */}
        <RadarFilterBar
          filters={filters}
          onChange={setFilters}
          resultCount={filteredProperties.length}
        />

        {/* Property Cards List */}
        <div className="space-y-4">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))
          ) : (
            <div className="p-12 text-center bg-white border border-[#E6E1D8] rounded-sm">
              <p className="font-serif text-lg text-[#14171A] font-medium">
                No se encontraron inmuebles con los criterios seleccionados
              </p>
              <p className="text-xs text-[#828A91] mt-1">
                Intente ajustar los filtros de ciudad, portal o estado de captación.
              </p>
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
