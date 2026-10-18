"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Search, ArrowUpDown } from "lucide-react";

export interface FilterState {
  searchQuery: string;
  city: string;
  status: string;
  portal: string;
  sortBy: "opportunity" | "days" | "price-desc" | "price-asc";
}

interface RadarFilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
}

export function RadarFilterBar({ filters, onChange, resultCount }: RadarFilterBarProps) {
  const { showSampleData, setShowSampleData } = useApp();
  const updateFilter = (key: keyof FilterState, value: string) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E6E1D8] p-4 rounded-sm shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            placeholder="Buscar por barrio, dirección o propietario..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] placeholder:text-[#828A91]"
          />
          <Search className="w-4 h-4 text-[#828A91] absolute left-3 top-2.5" />
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* City Filter */}
          <select
            value={filters.city}
            onChange={(e) => updateFilter("city", e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] cursor-pointer"
          >
            <option value="all">Todas las ciudades</option>
            <option value="Bogotá">Bogotá</option>
            <option value="Medellín">Medellín</option>
            <option value="Cali">Cali</option>
            <option value="Barranquilla">Barranquilla</option>
            <option value="Bucaramanga">Bucaramanga</option>
            <option value="Cartagena">Cartagena</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="sin_contactar">Sin contactar</option>
            <option value="dossier_enviado">Dossier enviado</option>
            <option value="reunion_agendada">Reunión agendada</option>
            <option value="captado_exclusiva">Captado en exclusiva</option>
          </select>

          {/* Portal Filter */}
          <select
            value={filters.portal}
            onChange={(e) => updateFilter("portal", e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] cursor-pointer"
          >
            <option value="all">Todos los portales</option>
            <option value="Metrocuadrado">Metrocuadrado</option>
            <option value="Fincaraiz">Fincaraiz</option>
            <option value="Ciencuadras">Ciencuadras</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E6E1D8] px-2 rounded-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#687076]" />
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter("sortBy", e.target.value as FilterState["sortBy"])}
              className="py-2 text-xs font-medium bg-transparent border-0 focus:outline-none text-[#14171A] cursor-pointer"
            >
              <option value="opportunity">Mayor oportunidad</option>
              <option value="days">Más días estancado</option>
              <option value="price-desc">Mayor precio pedido</option>
              <option value="price-asc">Menor precio pedido</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#EFECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#687076]">
        <span>
          Mostrando <strong className="font-semibold text-[#14171A]">{resultCount}</strong> inmuebles en radar
        </span>

        {/* Interruptor 'Mostrar datos de ejemplo' */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showSampleData}
            onChange={(e) => setShowSampleData(e.target.checked)}
            className="w-4 h-4 rounded-xs accent-[#0F533E] cursor-pointer"
          />
          <span className="text-xs text-[#14171A] font-medium">
            Mostrar datos de ejemplo
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#FAF8F5] border border-[#DECBA0] text-[#9E7D3B] rounded-xs font-semibold">
            6 demo
          </span>
        </label>
      </div>
    </div>
  );
}
