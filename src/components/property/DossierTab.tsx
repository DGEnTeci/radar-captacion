"use client";

import React from "react";
import Image from "next/image";
import { Property } from "@/types/property";
import { useApp } from "@/context/AppContext";
import { formatCop, formatPricePerM2 } from "@/lib/formatters";
import { Printer, ShieldCheck } from "lucide-react";

interface DossierTabProps {
  property: Property;
}

export function DossierTab({ property }: DossierTabProps) {
  const { config } = useApp();
  const valuation = property.analysis.valuation;
  const diagnosis = property.analysis.diagnosis;
  const todayFormatted = new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print Action Bar (Screen Only) */}
      <div className="no-print bg-white border border-[#E6E1D8] p-5 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#9E7D3B] font-semibold">
            Dossier Editorial de Valoración
          </span>
          <h3 className="font-serif text-xl font-bold text-[#14171A]">
            Dossier de Presentación A4 para el Propietario
          </h3>
          <p className="text-xs text-[#565C62] mt-0.5">
            Documento de alta gama listo para entregar en PDF o imprimir para la reunión de captación con {property.ownerName}.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#0F533E] hover:bg-[#0A3C2D] rounded-sm transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Descargar / Imprimir Dossier PDF</span>
        </button>
      </div>

      {/* A4 Dossier Document Container */}
      <div className="dossier-print-container bg-white border border-[#E6E1D8] shadow-lg max-w-[210mm] mx-auto text-[#14171A]">
        {/* PAGE 1: COVER & EXECUTIVE SUMMARY */}
        <div className="p-10 sm:p-14 min-h-[297mm] flex flex-col justify-between dossier-page-break bg-white">
          {/* Top Brand Header */}
          <div className="border-b border-[#E6E1D8] pb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0F533E] text-white flex items-center justify-center rounded-xs font-serif font-bold text-xl">
                R
              </div>
              <div>
                <span className="font-serif text-lg font-bold tracking-tight text-[#14171A] block">
                  {config.agencyName.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#9E7D3B]">
                  División de Gestión Patrimonial
                </span>
              </div>
            </div>

            <div className="text-right text-[11px] font-mono text-[#687076]">
              <p>Fecha: {todayFormatted}</p>
              <p className="text-[#0F533E] font-medium">Informe Confidencial</p>
            </div>
          </div>

          {/* Title Area */}
          <div className="my-8">
            <span className="text-xs uppercase font-mono tracking-widest text-[#0F533E] font-bold block mb-2">
              ESTUDIO COMPARATIVO DE MERCADO Y VALORACIÓN COMERCIAL
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#14171A] leading-tight mb-3">
              Estrategia de Absorción y Cierre para su Apartamento en {property.barrio}
            </h1>
            <p className="text-sm text-[#565C62] leading-relaxed max-w-xl">
              Preparado exclusivamente para el propietario particular <strong className="text-[#14171A]">{property.ownerName}</strong>, con base en transacciones efectivas y curvas de absorción por metro cuadrado en {property.city}.
            </p>
          </div>

          {/* Hero Property Photo */}
          <div className="relative w-full h-72 bg-[#FAF8F5] border border-[#E6E1D8] overflow-hidden rounded-xs my-4">
            <Image
              src={property.imagePath}
              alt={`Apartamento en ${property.barrio}`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute bottom-2 left-3 z-10">
              <span className="text-[10px] tracking-wide text-white bg-black/50 px-2 py-0.5 rounded-xs">
                Imagen ilustrativa
              </span>
            </div>
            <div className="absolute top-3 right-3 z-10">
              <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 bg-[#9E7D3B] text-white rounded-xs font-semibold">
                Datos de ejemplo
              </span>
            </div>
          </div>

          {/* Property Identity Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-[#E6E1D8] text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-[#828A91] block">Ubicación</span>
              <span className="font-semibold text-[#14171A] mt-0.5 block">{property.address}</span>
              <span className="text-[#565C62] text-[11px]">{property.barrio}, {property.city}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-[#828A91] block">Área Construida</span>
              <span className="font-metric font-semibold text-[#14171A] mt-0.5 block">{property.m2} m2</span>
              <span className="text-[#565C62] text-[11px]">{property.bedrooms} hab | {property.bathrooms} baños</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-[#828A91] block">Precio Pretendido</span>
              <span className="font-metric font-semibold text-[#14171A] mt-0.5 block">{formatCop(property.askingPriceCop)}</span>
              <span className="text-[#565C62] text-[11px]">{formatPricePerM2(property.askingPriceCop, property.m2)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-[#828A91] block">Tiempo en Portal</span>
              <span className="font-metric font-semibold text-[#9E7D3B] mt-0.5 block">{property.daysStuck} días</span>
              <span className="text-[#565C62] text-[11px]">Portal: {property.sourcePortal}</span>
            </div>
          </div>

          {/* Executive Summary Footer */}
          <div className="pt-6 border-t border-[#EFECE6] flex items-center justify-between text-xs text-[#565C62]">
            <p>Elaborado por: <strong className="text-[#14171A]">{config.agentName}</strong> ({config.agencyName})</p>
            <p className="font-mono text-[10px]">Página 1 de 2</p>
          </div>
        </div>

        {/* PAGE 2: DIAGNOSIS, MARKET COMPARISON & ACTION PLAN */}
        <div className="p-10 sm:p-14 min-h-[297mm] flex flex-col justify-between bg-white border-t border-[#E6E1D8]">
          {/* Header */}
          <div className="border-b border-[#E6E1D8] pb-4 flex items-center justify-between">
            <span className="font-serif text-xs font-bold text-[#14171A] uppercase tracking-wider">
              {config.agencyName} - ESTUDIO DE VALORACIÓN
            </span>
            <span className="font-mono text-[10px] text-[#687076]">
              Inmueble: {property.address}
            </span>
          </div>

          <div className="space-y-6 my-6">
            {/* Section 1: Diagnóstico de Atrición */}
            <div>
              <h3 className="font-serif text-lg font-bold text-[#14171A] mb-2">
                1. Diagnóstico Comercial: ¿Por qué el inmueble no se ha vendido?
              </h3>
              <p className="text-xs text-[#565C62] mb-3 leading-relaxed">
                El análisis de la publicación detecta cuatro fricciones técnicas que alejan a compradores calificados:
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {diagnosis.criticalFlaws.slice(0, 4).map((flaw, i) => (
                  <div key={i} className="p-3 bg-[#FAF8F5] border border-[#E6E1D8] rounded-xs">
                    <span className="text-[10px] font-mono uppercase text-[#0F533E] font-bold block mb-1">
                      {flaw.category}
                    </span>
                    <strong className="text-[#14171A] block mb-0.5 leading-snug">{flaw.title}</strong>
                    <p className="text-[11px] text-[#565C62] leading-relaxed">{flaw.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Street Price Comparison */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-lg font-bold text-[#14171A]">
                  2. Valoración en $/m2 y Comparables de Cierre en la Misma Cuadra
                </h3>
                <span className="text-[10px] font-mono text-[#9E7D3B] font-semibold">
                  Datos de ejemplo
                </span>
              </div>

              {/* 3 Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                <div className="p-3 bg-[#FAF8F5] border border-[#E6E1D8] rounded-xs">
                  <span className="text-[10px] uppercase font-mono text-[#828A91]">Precio Actual</span>
                  <p className="font-metric text-base font-bold text-[#14171A] mt-0.5">{formatCop(property.askingPriceCop)}</p>
                  <p className="font-mono text-[11px] text-[#565C62]">{formatPricePerM2(property.askingPriceCop, property.m2)}</p>
                </div>
                <div className="p-3 bg-[#FAF8F5] border border-[#E6E1D8] rounded-xs">
                  <span className="text-[10px] uppercase font-mono text-[#828A91]">Promedio {property.barrio}</span>
                  <p className="font-metric text-base font-bold text-[#14171A] mt-0.5">{formatCop(valuation.barrioAvgPricePerM2 * property.m2)}</p>
                  <p className="font-mono text-[11px] text-[#565C62]">{formatCop(valuation.barrioAvgPricePerM2)} / m2</p>
                </div>
                <div className="p-3 bg-[#EBF5F0] border border-[#C3DFD3] rounded-xs">
                  <span className="text-[10px] uppercase font-mono text-[#0F533E] font-semibold">Precio Óptimo de Cierre</span>
                  <p className="font-metric text-base font-bold text-[#0F533E] mt-0.5">{formatCop(valuation.recommendedOptimalPriceCop)}</p>
                  <p className="font-mono text-[11px] text-[#0F533E]">{formatCop(valuation.recommendedOptimalPricePerM2)} / m2</p>
                </div>
              </div>

              {/* Comparables Table */}
              <table className="w-full text-left text-xs border border-[#E6E1D8]">
                <thead className="bg-[#FAF8F5] text-[10px] font-mono uppercase text-[#687076] border-b border-[#E6E1D8]">
                  <tr>
                    <th className="py-1.5 px-2.5">Inmueble Comparable</th>
                    <th className="py-1.5 px-2.5">Área</th>
                    <th className="py-1.5 px-2.5">Precio de Venta</th>
                    <th className="py-1.5 px-2.5">Valor / m2</th>
                    <th className="py-1.5 px-2.5">Tiempo Venta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6] font-mono text-[11px]">
                  {property.comparables.map((c) => (
                    <tr key={c.id}>
                      <td className="py-1.5 px-2.5 font-sans font-medium">{c.address}</td>
                      <td className="py-1.5 px-2.5">{c.m2} m2</td>
                      <td className="py-1.5 px-2.5 font-semibold text-[#0F533E]">{formatCop(c.soldPriceCop)}</td>
                      <td className="py-1.5 px-2.5">{formatCop(c.pricePerM2)}/m2</td>
                      <td className="py-1.5 px-2.5">{c.daysToSell} días</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section 3: 4-Step Agency Action Plan */}
            <div>
              <h3 className="font-serif text-lg font-bold text-[#14171A] mb-2">
                3. Plan de Acción Comercial en Exclusiva (4 Fases)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 bg-[#FAF8F5] border border-[#E6E1D8] rounded-xs">
                  <span className="text-[10px] font-mono font-bold text-[#0F533E] block mb-1">FASE 1</span>
                  <strong className="block text-[#14171A] mb-1">Producción Visual</strong>
                  <p className="text-[11px] text-[#565C62] leading-snug">Reportaje fotográfico profesional, plano arquitectónico 2D y estilismo.</p>
                </div>
                <div className="p-3 bg-[#FAF8F5] border border-[#E6E1D8] rounded-xs">
                  <span className="text-[10px] font-mono font-bold text-[#0F533E] block mb-1">FASE 2</span>
                  <strong className="block text-[#14171A] mb-1">Posicionamiento</strong>
                  <p className="text-[11px] text-[#565C62] leading-snug">Publicación destacada en Metrocuadrado y Fincaraiz con precio calibrado.</p>
                </div>
                <div className="p-3 bg-[#FAF8F5] border border-[#E6E1D8] rounded-xs">
                  <span className="text-[10px] font-mono font-bold text-[#0F533E] block mb-1">FASE 3</span>
                  <strong className="block text-[#14171A] mb-1">Filtrado Solventes</strong>
                  <p className="text-[11px] text-[#565C62] leading-snug">Validación crediticia y capacidad financiera previa a cada visita.</p>
                </div>
                <div className="p-3 bg-[#FAF8F5] border border-[#E6E1D8] rounded-xs">
                  <span className="text-[10px] font-mono font-bold text-[#0F533E] block mb-1">FASE 4</span>
                  <strong className="block text-[#14171A] mb-1">Cierre Notarial</strong>
                  <p className="text-[11px] text-[#565C62] leading-snug">Redacción de promesa, estudio de títulos y acompañamiento en notaría.</p>
                </div>
              </div>
            </div>

            {/* Section 4: Mandatory Closing Note (Orientative, not formal appraisal) */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E6E1D8] rounded-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#9E7D3B] shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#565C62] leading-relaxed">
                <strong className="text-[#14171A]">Nota de Responsabilidad Técnica:</strong> El presente documento constituye un estudio orientativo de posicionamiento comercial y análisis estadístico de absorción inmobiliaria. No constituye un avalúo comercial formal ni dictamen pericial bajo los términos de la Ley 1673 de 2013 o el Decreto 1420 de 1998 en Colombia. Los comparables y promedios corresponden a modelos analíticos de muestra (Datos de ejemplo).
              </p>
            </div>
          </div>

          {/* Signature and Agency Stamp */}
          <div className="pt-4 border-t border-[#E6E1D8] flex items-end justify-between text-xs">
            <div>
              <p className="font-semibold text-[#14171A]">{config.agentName}</p>
              <p className="text-[11px] text-[#565C62]">Consultor Inmobiliario Senior</p>
              <p className="text-[11px] text-[#0F533E] font-medium">{config.agencyName}</p>
            </div>

            <div className="text-right">
              <div className="w-36 h-10 border-b border-[#14171A] mb-1 ml-auto" />
              <span className="text-[10px] font-mono text-[#828A91]">Firma de Autorización</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
