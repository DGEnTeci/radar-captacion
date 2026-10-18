"use client";

import React, { useState } from "react";
import { Property } from "@/types/property";
import { useApp } from "@/context/AppContext";
import { formatCop, formatPercent, formatPricePerM2 } from "@/lib/formatters";
import {
  AlertTriangle,
  Camera,
  FileText,
  DollarSign,
  Filter,
  Calculator,
  Info,
  CheckCircle2,
} from "lucide-react";

interface AuditoriaTabProps {
  property: Property;
}

export function AuditoriaTab({ property }: AuditoriaTabProps) {
  const { config } = useApp();
  const analysis = property.analysis;
  const valuation = analysis.valuation;
  const diagnosis = analysis.diagnosis;

  // Interactive calculator state
  const [calcPriceCop, setCalcPriceCop] = useState<number>(property.askingPriceCop);
  const [calcCommission, setCalcCommission] = useState<number>(config.commissionPercent);

  // Real-time calculations
  const commissionCop = Math.round(calcPriceCop * (calcCommission / 100));
  const netOwnerMoneyCop = calcPriceCop - commissionCop;

  // Days to sell dynamic estimation
  const priceRatio = calcPriceCop / (valuation.barrioAvgPricePerM2 * property.m2);
  let estimatedDaysToSell = Math.round(35 * Math.pow(priceRatio, 2.8));
  if (estimatedDaysToSell < 15) estimatedDaysToSell = 15;
  if (estimatedDaysToSell > 180) estimatedDaysToSell = 180;

  const scoreCategories = [
    {
      title: "Calidad Fotográfica",
      score: diagnosis.photoScore,
      icon: Camera,
      status: diagnosis.photoScore >= 70 ? "Aceptable" : "Crítico",
      desc: "Resolución, ángulos, iluminación y staging de espacios.",
    },
    {
      title: "Redacción y Contenido",
      score: diagnosis.textScore,
      icon: FileText,
      status: diagnosis.textScore >= 70 ? "Adecuado" : "Deficiente",
      desc: "Extensión, atributos técnicos y persuasión sensorial.",
    },
    {
      title: "Alineación de Precio",
      score: diagnosis.priceScore,
      icon: DollarSign,
      status: diagnosis.priceScore >= 70 ? "Competitivo" : "Sobreprecio",
      desc: "Relación $/m2 frente al promedio de absorción del sector.",
    },
    {
      title: "Filtrado en Portales",
      score: diagnosis.filteringScore,
      icon: Filter,
      status: diagnosis.filteringScore >= 70 ? "Visible" : "Incompleto",
      desc: "Presencia de planos, costos fijos y datos clave de búsqueda.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Visual Diagnosis & Score Breakdown */}
      <section className="bg-white border border-[#E6E1D8] p-6 sm:p-8 rounded-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#EFECE6]">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-[#0F533E] font-semibold">
              Diagnóstico de Atrición Comercial
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#14171A] tracking-tight mt-1">
              ¿Por qué no se está vendiendo este inmueble?
            </h2>
            <p className="text-xs text-[#565C62] mt-1">
              Evaluación multifactorial de las deficiencias comerciales que han mantenido el apartamento {property.daysStuck} días en vitrina.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#FAF8F5] border border-[#E6E1D8] px-4 py-2.5 rounded-sm shrink-0">
            <div>
              <p className="text-[10px] uppercase font-mono text-[#687076] font-semibold">
                Índice de Oportunidad
              </p>
              <p className="font-metric text-xl font-bold text-[#0F533E]">
                {analysis.opportunityScore} / 100
              </p>
            </div>
            <div className="text-xs text-[#565C62] pl-3 border-l border-[#E6E1D8]">
              Alta urgencia de intervención técnica
            </div>
          </div>
        </div>

        {/* 4 Score Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {scoreCategories.map((item, idx) => {
            const Icon = item.icon;
            const isGood = item.score >= 70;
            return (
              <div
                key={idx}
                className="p-4 bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-4 h-4 text-[#0F533E]" />
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-xs font-semibold ${
                        isGood
                          ? "bg-[#EBF5F0] text-[#0F533E] border border-[#C3DFD3]"
                          : "bg-[#F9F5EC] text-[#9E7D3B] border border-[#DECBA0]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#14171A] uppercase tracking-wider">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#687076] mt-1 leading-snug">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EFECE6]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#828A91]">Efectividad</span>
                    <span className="font-metric font-bold text-[#14171A]">
                      {item.score}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E6E1D8] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isGood ? "bg-[#0F533E]" : "bg-[#9E7D3B]"
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Concrete Errors Costing Money */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#14171A] mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#9E7D3B]" />
            <span>Errores Críticos que Están Costándole Dinero al Propietario</span>
          </h3>

          <div className="space-y-3">
            {diagnosis.criticalFlaws.map((flaw) => (
              <div
                key={flaw.id}
                className="p-4 bg-white border border-[#E6E1D8] hover:border-[#D6CEBF] rounded-sm transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#FAF8F5] border border-[#E6E1D8] text-[#565C62] rounded-xs font-semibold">
                      {flaw.category}
                    </span>
                    <h5 className="text-sm font-semibold text-[#14171A]">
                      {flaw.title}
                    </h5>
                  </div>
                  <p className="text-xs text-[#565C62] leading-relaxed">
                    {flaw.explanation}
                  </p>
                </div>

                <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EFECE6]">
                  <span className="text-[10px] font-mono uppercase text-[#828A91] block">
                    Impacto en retención
                  </span>
                  <span className="font-metric text-xs font-bold text-[#9E7D3B]">
                    ~ {formatCop(flaw.estimatedCostCop)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Valuation Study in $/m2 vs Comparables */}
      <section className="bg-white border border-[#E6E1D8] p-6 sm:p-8 rounded-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-[#EFECE6]">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-[#9E7D3B] font-semibold">
              Estudio Técnico de Mercado
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#14171A] tracking-tight mt-1">
              Valoración Comparativa por Metro Cuadrado
            </h2>
            <p className="text-xs text-[#565C62] mt-1">
              Contraste entre el precio solicitado por el particular y la media de transacciones efectivas en {property.barrio}.
            </p>
          </div>

          <span className="self-start sm:self-auto text-[11px] font-mono tracking-wider px-2.5 py-1 bg-[#9E7D3B] text-white rounded-xs font-semibold shadow-xs">
            Datos de ejemplo
          </span>
        </div>

        {/* 3 Metric Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="p-5 bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#687076]">
              Precio Solicitado (Actual)
            </span>
            <p className="font-metric text-2xl font-bold text-[#14171A] mt-1">
              {formatCop(valuation.askingPriceCop)}
            </p>
            <p className="font-metric text-xs text-[#565C62] mt-1">
              {formatPricePerM2(valuation.askingPriceCop, valuation.m2)}
            </p>
            <div className="mt-3 text-xs text-[#9E7D3B] font-medium flex items-center gap-1">
              <span>{formatPercent(valuation.priceDifferencePercent, true)} frente a la zona</span>
            </div>
          </div>

          <div className="p-5 bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#687076]">
              Promedio del Sector ({property.barrio})
            </span>
            <p className="font-metric text-2xl font-bold text-[#14171A] mt-1">
              {formatCop(valuation.barrioAvgPricePerM2 * valuation.m2)}
            </p>
            <p className="font-metric text-xs text-[#565C62] mt-1">
              {formatCop(valuation.barrioAvgPricePerM2)} / m2
            </p>
            <div className="mt-3 text-xs text-[#565C62]">
              Absorción promedio observada
            </div>
          </div>

          <div className="p-5 bg-[#EBF5F0] border border-[#C3DFD3] rounded-sm">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#0F533E] font-semibold">
              Precio Óptimo de Cierre Recomendado
            </span>
            <p className="font-metric text-2xl font-bold text-[#0F533E] mt-1">
              {formatCop(valuation.recommendedOptimalPriceCop)}
            </p>
            <p className="font-metric text-xs text-[#0F533E] font-semibold mt-1">
              {formatCop(valuation.recommendedOptimalPricePerM2)} / m2
            </p>
            <div className="mt-3 text-xs text-[#0F533E] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Cierre proyectado en ~30 días</span>
            </div>
          </div>
        </div>

        {/* 3 Comparables Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#14171A]">
              Transacciones Comparables en la Misma Cuadra o Sector
            </h4>
            <span className="text-[11px] font-mono text-[#9E7D3B] font-medium">
              3 operaciones cerradas
            </span>
          </div>

          <div className="overflow-x-auto border border-[#E6E1D8] rounded-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E6E1D8] text-[10px] uppercase font-mono text-[#687076]">
                <tr>
                  <th className="py-2.5 px-3">Dirección del Inmueble</th>
                  <th className="py-2.5 px-3">Área (m2)</th>
                  <th className="py-2.5 px-3">Precio de Cierre (COP)</th>
                  <th className="py-2.5 px-3">Valor / m2</th>
                  <th className="py-2.5 px-3">Días en Venta</th>
                  <th className="py-2.5 px-3">Fecha Transacción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6] font-mono text-[#14171A]">
                {property.comparables.map((comp) => (
                  <tr key={comp.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-3 px-3 font-sans font-medium text-[#14171A]">
                      {comp.address}
                    </td>
                    <td className="py-3 px-3">{comp.m2} m2</td>
                    <td className="py-3 px-3 font-semibold text-[#0F533E]">
                      {formatCop(comp.soldPriceCop)}
                    </td>
                    <td className="py-3 px-3">{formatCop(comp.pricePerM2)} / m2</td>
                    <td className="py-3 px-3">{comp.daysToSell} días</td>
                    <td className="py-3 px-3 text-[#565C62]">{comp.soldDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. Interactive Pricing & Commission Calculator */}
      <section className="bg-white border border-[#E6E1D8] p-6 sm:p-8 rounded-sm">
        <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-[#0F533E] font-semibold mb-1">
          <Calculator className="w-4 h-4" />
          <span>Simulador Dinámico de Cierre</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#14171A] tracking-tight">
          Calculadora de Escenarios y Retorno Neto
        </h2>
        <p className="text-xs text-[#565C62] mt-1 mb-8 max-w-2xl">
          Ajuste el precio objetivo y los honorarios de intermediación en tiempo real para proyectar los días estimados de venta y el recaudo líquido del propietario.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sliders Area (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Slider 1: Precio de Venta */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <label className="font-semibold uppercase tracking-wider text-[#23272B]">
                  Precio de Venta Simulado
                </label>
                <span className="font-metric text-base font-bold text-[#0F533E]">
                  {formatCop(calcPriceCop)}
                </span>
              </div>
              <input
                type="range"
                min={Math.round(property.askingPriceCop * 0.7)}
                max={Math.round(property.askingPriceCop * 1.3)}
                step={5000000}
                value={calcPriceCop}
                onChange={(e) => setCalcPriceCop(Number(e.target.value))}
                className="w-full accent-[#0F533E] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#828A91] mt-1">
                <span>-30% ({formatCop(Math.round(property.askingPriceCop * 0.7))})</span>
                <span>Original ({formatCop(property.askingPriceCop)})</span>
                <span>+30% ({formatCop(Math.round(property.askingPriceCop * 1.3))})</span>
              </div>
            </div>

            {/* Slider 2: Comisión de la Agencia */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <label className="font-semibold uppercase tracking-wider text-[#23272B]">
                  Comisión de Intermediación
                </label>
                <span className="font-metric text-base font-bold text-[#9E7D3B]">
                  {calcCommission.toFixed(1).replace(".", ",")}%
                </span>
              </div>
              <input
                type="range"
                min={2.0}
                max={5.0}
                step={0.1}
                value={calcCommission}
                onChange={(e) => setCalcCommission(Number(e.target.value))}
                className="w-full accent-[#9E7D3B] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#828A91] mt-1">
                <span>2,0%</span>
                <span>3,0%</span>
                <span>3,5% (Estándar)</span>
                <span>4,0%</span>
                <span>5,0%</span>
              </div>
            </div>

            {/* "Cómo se calcula" Note */}
            <div className="p-3.5 bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#687076] shrink-0 mt-0.5" />
              <div className="text-xs text-[#565C62] leading-relaxed">
                <strong className="text-[#14171A] font-semibold">Cómo se calcula:</strong> Esta simulación financiera es una estimación orientativa basada en curvas de absorción inmobiliaria en Colombia. Los valores netos corresponden a la deducción directa de los honorarios pactados con la agencia y excluyen gastos notariales, retención en la fuente (1%), derechos de registro e impuestos municipales o de plusvalía que correspondan según la situación tributaria del vendedor.
              </div>
            </div>
          </div>

          {/* Real-Time Outcome Panel (5 cols) */}
          <div className="lg:col-span-5 bg-[#FAF8F5] border border-[#E6E1D8] p-6 rounded-sm flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#687076] mb-4 pb-2 border-b border-[#E6E1D8]">
                Proyección Financiera en Tiempo Real
              </h4>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-[#565C62]">Recaudo Neto Estimado para el Propietario</span>
                  <p className="font-metric text-2xl font-bold text-[#14171A] mt-0.5">
                    {formatCop(netOwnerMoneyCop)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#EFECE6] text-xs">
                  <div>
                    <span className="text-[#828A91] block">Honorarios Agencia</span>
                    <span className="font-metric font-semibold text-[#0F533E] mt-0.5 block">
                      {formatCop(commissionCop)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#828A91] block">Valor por m2 Simulado</span>
                    <span className="font-metric font-semibold text-[#14171A] mt-0.5 block">
                      {formatPricePerM2(calcPriceCop, property.m2)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white border border-[#E6E1D8] rounded-sm mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#565C62]">Tiempo Estimado de Cierre</span>
                    <span className="font-metric font-bold text-[#0F533E]">
                      ~{estimatedDaysToSell} días
                    </span>
                  </div>
                  <p className="text-[11px] text-[#828A91] leading-relaxed">
                    {calcPriceCop < valuation.barrioAvgPricePerM2 * property.m2 * 1.03
                      ? "Precio dentro del rango de rápida absorción por compradores calificados."
                      : "Sobreprecio activo. Cada mes adicional en vitrina incrementa el desgaste comercial del inmueble."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E6E1D8] text-[11px] font-mono text-[#828A91] text-right">
              Agencia: {config.agencyName}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
