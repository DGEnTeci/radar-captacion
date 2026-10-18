"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { formatCop } from "@/lib/formatters";
import { TrendingUp, FileCheck2, Award, Building, Sparkles } from "lucide-react";

export function MetricCards() {
  const { metrics, config } = useApp();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10">
      {/* Featured Metric: Comisión Potencial Acumulada (Private Banking Style) */}
      <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#E6E1D8] p-7 rounded-sm relative overflow-hidden flex flex-col justify-between shadow-xs">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0F533E]" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-mono tracking-widest text-[#0F533E] font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Pipeline Comercial Estimado</span>
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-[#FAF8F5] text-[#565C62] border border-[#E6E1D8] rounded-sm">
              Base: {config.commissionPercent.toString().replace(".", ",")}% captación
            </span>
          </div>

          <h3 className="text-xs font-semibold text-[#687076] uppercase tracking-wider mb-1">
            Comisión Potencial Acumulada
          </h3>
          <p className="font-metric text-3xl sm:text-4xl font-bold tracking-tight text-[#14171A]">
            {formatCop(metrics.comisionPotencialCop)}
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-[#EFECE6] flex items-center justify-between text-xs text-[#565C62]">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#9E7D3B]" />
            <span>Valoración total de inventario detectado</span>
          </span>
          <span className="font-mono text-[#14171A] font-medium">
            {metrics.promedioDiasEstancados} días promedio en vitrina
          </span>
        </div>
      </div>

      {/* Secondary Metrics: 3 Distinct Cards */}
      <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Particulares detectados */}
        <div className="bg-[#FFFFFF] border border-[#E6E1D8] p-5 rounded-sm flex flex-col justify-between shadow-xs hover:border-[#D6CEBF] transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-sm bg-[#FAF8F5] border border-[#E6E1D8] flex items-center justify-center text-[#565C62]">
                <Building className="w-3.5 h-3.5" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#687076]">
                En Portales
              </span>
            </div>
            <p className="text-xs font-medium text-[#687076] uppercase tracking-wider mb-1">
              Particulares
            </p>
            <p className="font-metric text-2xl font-bold text-[#14171A]">
              {metrics.totalDetectados}
            </p>
          </div>
          <p className="text-[11px] text-[#828A91] mt-3">
            Inmuebles en monitoreo
          </p>
        </div>

        {/* Metric 2: Dossiers enviados */}
        <div className="bg-[#FFFFFF] border border-[#E6E1D8] p-5 rounded-sm flex flex-col justify-between shadow-xs hover:border-[#D6CEBF] transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-sm bg-[#EBF5F0] border border-[#C3DFD3] flex items-center justify-center text-[#0F533E]">
                <FileCheck2 className="w-3.5 h-3.5" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0F533E] font-medium">
                Enviados
              </span>
            </div>
            <p className="text-xs font-medium text-[#687076] uppercase tracking-wider mb-1">
              Dossiers
            </p>
            <p className="font-metric text-2xl font-bold text-[#14171A]">
              {metrics.dossiersEnviados}
            </p>
          </div>
          <p className="text-[11px] text-[#828A91] mt-3">
            Estudios presentados
          </p>
        </div>

        {/* Metric 3: Exclusivas cerradas */}
        <div className="bg-[#FFFFFF] border border-[#E6E1D8] p-5 rounded-sm flex flex-col justify-between shadow-xs hover:border-[#DECBA0] transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-sm bg-[#F9F5EC] border border-[#DECBA0] flex items-center justify-center text-[#9E7D3B]">
                <Award className="w-3.5 h-3.5" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E7D3B] font-medium">
                Exclusivas
              </span>
            </div>
            <p className="text-xs font-medium text-[#687076] uppercase tracking-wider mb-1">
              Captaciones
            </p>
            <p className="font-metric text-2xl font-bold text-[#9E7D3B]">
              {metrics.exclusivasCerradas}
            </p>
          </div>
          <p className="text-[11px] text-[#828A91] mt-3">
            Contratos formalizados
          </p>
        </div>
      </div>
    </div>
  );
}
