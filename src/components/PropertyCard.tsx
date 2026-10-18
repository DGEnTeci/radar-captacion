"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Property, PropertyStatus } from "@/types/property";
import { useApp } from "@/context/AppContext";
import { formatCop, formatPricePerM2 } from "@/lib/formatters";
import { Clock, ArrowRight, MapPin, Sparkles, User } from "lucide-react";

interface PropertyCardProps {
  property: Property;
}

const STATUS_CONFIG: Record<
  PropertyStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  sin_contactar: {
    label: "Sin contactar",
    bg: "bg-[#FAF8F5]",
    text: "text-[#565C62]",
    border: "border-[#E6E1D8]",
  },
  dossier_enviado: {
    label: "Dossier enviado",
    bg: "bg-[#EBF5F0]",
    text: "text-[#0F533E]",
    border: "border-[#C3DFD3]",
  },
  reunion_agendada: {
    label: "Reunión agendada",
    bg: "bg-[#F9F5EC]",
    text: "text-[#9E7D3B]",
    border: "border-[#DECBA0]",
  },
  captado_exclusiva: {
    label: "Captado en exclusiva",
    bg: "bg-[#0F533E]",
    text: "text-[#FFFFFF]",
    border: "border-[#0F533E]",
  },
};

export function PropertyCard({ property }: PropertyCardProps) {
  const { updatePropertyStatus } = useApp();

  const statusStyle = STATUS_CONFIG[property.status];
  const oppScore = property.analysis?.opportunityScore ?? 75;

  return (
    <div className="luxury-card rounded-sm overflow-hidden flex flex-col md:flex-row group">
      {/* Property Image Container */}
      <div className="relative md:w-72 lg:w-80 h-56 md:h-auto shrink-0 bg-[#EFECE6] overflow-hidden">
        <Image
          src={property.imagePath}
          alt={`Apartamento en ${property.barrio}, ${property.city}`}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Portal & Example Data Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#14171A]/85 text-white backdrop-blur-xs rounded-xs">
            {property.sourcePortal}
          </span>
          {property.isSample && (
            <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 bg-[#9E7D3B] text-white rounded-xs font-semibold shadow-xs">
              Datos de ejemplo
            </span>
          )}
        </div>

        {/* Image Caption Mandatory */}
        <div className="absolute bottom-2 left-3 z-10">
          <span className="text-[10px] tracking-wide text-white/90 bg-black/40 px-1.5 py-0.5 rounded-xs">
            Imagen ilustrativa
          </span>
        </div>

        {/* Days Stuck Badge */}
        <div className="absolute bottom-2 right-3 z-10 flex items-center gap-1 text-[11px] font-mono text-white bg-black/60 px-2 py-0.5 rounded-xs backdrop-blur-xs">
          <Clock className="w-3 h-3 text-[#DECBA0]" />
          <span>{property.daysStuck} días estancado</span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row: Location & Opportunity Meter */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#687076] font-medium mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#0F533E]" />
                <span>{property.barrio}, {property.city}</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#14171A] group-hover:text-[#0F533E] transition-colors">
                {property.address}
              </h3>
            </div>

            {/* AI Opportunity Score Meter */}
            <div className="flex items-center gap-2.5 bg-[#FAF8F5] border border-[#E6E1D8] px-3 py-1.5 rounded-sm">
              <div className="text-right">
                <div className="text-[9px] uppercase font-mono tracking-widest text-[#687076] font-semibold">
                  Índice de Oportunidad
                </div>
                <div className="font-metric text-sm font-bold text-[#0F533E]">
                  {oppScore} / 100
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#C3DFD3] flex items-center justify-center bg-white text-[#0F533E]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 my-2 border-y border-[#EFECE6] text-xs">
            <div>
              <p className="text-[10px] uppercase font-mono text-[#828A91] tracking-wider">
                Precio Pedido
              </p>
              <p className="font-metric text-base font-bold text-[#14171A] mt-0.5">
                {formatCop(property.askingPriceCop)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-[#828A91] tracking-wider">
                Valor por m2
              </p>
              <p className="font-metric text-xs font-semibold text-[#565C62] mt-1">
                {formatPricePerM2(property.askingPriceCop, property.m2)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-[#828A91] tracking-wider">
                Área y Distribución
              </p>
              <p className="font-mono text-xs text-[#14171A] mt-1">
                {property.m2} m2 | {property.bedrooms} hab | {property.bathrooms} bñ
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-[#828A91] tracking-wider">
                Particular
              </p>
              <p className="text-xs text-[#14171A] truncate mt-1 flex items-center gap-1 font-medium">
                <User className="w-3 h-3 text-[#687076] shrink-0" />
                <span className="truncate">{property.ownerName}</span>
              </p>
            </div>
          </div>

          {/* Problem tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {property.detectedFlaws.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-mono px-2 py-0.5 bg-[#FAF8F5] border border-[#E6E1D8] text-[#565C62] rounded-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer row: Status selector and Link */}
        <div className="mt-5 pt-4 border-t border-[#EFECE6] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#687076]">
              Estado:
            </span>
            <select
              value={property.status}
              onChange={(e) => updatePropertyStatus(property.id, e.target.value as PropertyStatus)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-sm border focus:outline-none transition-colors cursor-pointer ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
            >
              <option value="sin_contactar">Sin contactar</option>
              <option value="dossier_enviado">Dossier enviado</option>
              <option value="reunion_agendada">Reunión agendada</option>
              <option value="captado_exclusiva">Captado en exclusiva</option>
            </select>
          </div>

          <Link
            href={`/propiedad/${property.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0F533E] hover:text-[#0A3C2D] group/btn transition-colors cursor-pointer"
          >
            <span>Auditoría y Dossier A4</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
