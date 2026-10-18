"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppProvider, useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { ToastContainer } from "@/components/ToastContainer";
import { AuditoriaTab } from "@/components/property/AuditoriaTab";
import { ReescrituraTab } from "@/components/property/ReescrituraTab";
import { DossierTab } from "@/components/property/DossierTab";
import { formatCop, formatPricePerM2 } from "@/lib/formatters";
import { PropertyStatus } from "@/types/property";
import {
  ArrowLeft,
  MapPin,
  Clock,
  FileCheck2,
  FileText,
  Printer,
  Cpu,
  User,
  Trash2,
} from "lucide-react";

function PropertyDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { getPropertyById, updatePropertyStatus, deleteProperty } = useApp();
  const property = getPropertyById(id);

  const [activeTab, setActiveTab] = useState<"auditoria" | "contacto" | "dossier">("auditoria");

  const handleDelete = () => {
    if (!property) return;
    if (window.confirm(`¿Está seguro de que desea eliminar permanentemente este inmueble (${property.address}) del radar?`)) {
      const ok = deleteProperty(property.id);
      if (ok) {
        router.push("/");
      }
    }
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white border border-[#E6E1D8] p-10 rounded-sm">
            <h1 className="font-serif text-2xl font-bold text-[#14171A] mb-2">
              Inmueble no encontrado
            </h1>
            <p className="text-sm text-[#565C62] mb-6">
              El apartamento solicitado no existe en el registro del radar o fue removido.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#0F533E] rounded-sm hover:bg-[#0A3C2D] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Radar de Particulares</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const analysis = property.analysis;
  const engineUsed = analysis.engine;
  const engineLabel =
    engineUsed === "openrouter"
      ? `Motor: OpenRouter (${analysis.modelUsed || "IA"})`
      : "Motor local (Reglas Heurísticas)";

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb & Navigation */}
        <div className="no-print mb-4 flex items-center justify-between text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium text-[#565C62] hover:text-[#14171A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Radar de Particulares</span>
          </Link>

          {/* Engine indicator */}
          <div className="flex items-center gap-2 text-[11px] font-mono px-2.5 py-1 bg-white border border-[#E6E1D8] rounded-sm text-[#565C62]">
            <Cpu className="w-3 h-3 text-[#0F533E]" />
            <span>{engineLabel}</span>
            {analysis.fallbackReason && (
              <span className="text-[#9E7D3B]" title={analysis.fallbackReason}>
                (Respaldo activo)
              </span>
            )}
          </div>
        </div>

        {/* Property Hero Summary Card (Screen Only) */}
        <div className="no-print bg-white border border-[#E6E1D8] p-6 rounded-sm mb-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#687076] font-medium mb-1.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0F533E]" />
                  <span>{property.barrio}, {property.city}</span>
                </span>
                <span>•</span>
                <span>Portal: {property.sourcePortal}</span>
                {property.isSample && (
                  <>
                    <span>•</span>
                    <span className="text-[#9E7D3B] font-mono">Datos de ejemplo</span>
                  </>
                )}
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14171A] tracking-tight">
                {property.address}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#565C62]">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#828A91]" />
                  <span>Propietario: <strong className="text-[#14171A]">{property.ownerName}</strong> ({property.ownerPhone})</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#9E7D3B]" />
                  <span>{property.daysStuck} días en portal</span>
                </span>
                <span>•</span>
                <span>{property.m2} m2 | {property.bedrooms} alcobas | {property.bathrooms} baños</span>
              </div>
            </div>

            {/* Price & Status Controls */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#EFECE6]">
              <div className="lg:text-right">
                <span className="text-[10px] uppercase font-mono text-[#828A91] tracking-wider block">
                  Precio Pedido
                </span>
                <p className="font-metric text-2xl sm:text-3xl font-bold text-[#14171A]">
                  {formatCop(property.askingPriceCop)}
                </p>
                <p className="font-metric text-xs text-[#565C62]">
                  {formatPricePerM2(property.askingPriceCop, property.m2)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#687076] uppercase tracking-wider">
                  Estado:
                </span>
                <select
                  value={property.status}
                  onChange={(e) => updatePropertyStatus(property.id, e.target.value as PropertyStatus)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-sm border border-[#E6E1D8] bg-[#FAF8F5] text-[#14171A] focus:outline-none focus:border-[#0F533E] cursor-pointer"
                >
                  <option value="sin_contactar">Sin contactar</option>
                  <option value="dossier_enviado">Dossier enviado</option>
                  <option value="reunion_agendada">Reunión agendada</option>
                  <option value="captado_exclusiva">Captado en exclusiva</option>
                </select>

                {!property.isSample && process.env.NEXT_PUBLIC_DEMO_MODE !== "true" && (
                  <button
                    onClick={handleDelete}
                    title="Eliminar este inmueble real del radar"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Module Tab Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-6 pt-5 border-t border-[#EFECE6] overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab("auditoria")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === "auditoria"
                  ? "bg-[#0F533E] text-white shadow-xs"
                  : "bg-[#FAF8F5] text-[#565C62] hover:text-[#14171A] hover:bg-[#EFECE6]"
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">1. Auditoría y Valoración</span>
              <span className="sm:hidden">1. Auditoría</span>
            </button>

            <button
              onClick={() => setActiveTab("contacto")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === "contacto"
                  ? "bg-[#0F533E] text-white shadow-xs"
                  : "bg-[#FAF8F5] text-[#565C62] hover:text-[#14171A] hover:bg-[#EFECE6]"
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">2. Reescritura y Kit de Contacto</span>
              <span className="sm:hidden">2. Reescritura / Kit</span>
            </button>

            <button
              onClick={() => setActiveTab("dossier")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === "dossier"
                  ? "bg-[#0F533E] text-white shadow-xs"
                  : "bg-[#FAF8F5] text-[#565C62] hover:text-[#14171A] hover:bg-[#EFECE6]"
              }`}
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">3. Dossier de Valoración (A4)</span>
              <span className="sm:hidden">3. Dossier A4</span>
            </button>
          </div>
        </div>

        {/* Tab Panels */}
        <div className="tab-content">
          {activeTab === "auditoria" && <AuditoriaTab property={property} />}
          {activeTab === "contacto" && <ReescrituraTab property={property} />}
          {activeTab === "dossier" && <DossierTab property={property} />}
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}

export function PropertyDetailClient({ id }: { id: string }) {
  return (
    <AppProvider>
      <PropertyDetailContent id={id} />
    </AppProvider>
  );
}
