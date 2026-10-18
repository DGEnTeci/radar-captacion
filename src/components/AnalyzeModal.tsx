"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Property, ComparableSale } from "@/types/property";
import { X, Sparkles, Loader2 } from "lucide-react";

interface AnalyzeModalProps {
  onClose: () => void;
}

const CITY_OPTIONS = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Bucaramanga",
  "Cartagena",
] as const;

export function AnalyzeModal({ onClose }: AnalyzeModalProps) {
  const { config, addProperty, addToast } = useApp();

  const [city, setCity] = useState<(typeof CITY_OPTIONS)[number]>("Bogotá");
  const [barrio, setBarrio] = useState("Rosales");
  const [address, setAddress] = useState("Cra. 4 # 71-30");
  const [ownerName, setOwnerName] = useState("Felipe Santamaría");
  const [ownerPhone, setOwnerPhone] = useState("+57 300 789 0123");
  const [m2, setM2] = useState("130");
  const [bedrooms, setBedrooms] = useState("3");
  const [bathrooms, setBathrooms] = useState("3");
  const [askingPriceCop, setAskingPriceCop] = useState("1150000000");
  const [daysStuck, setDaysStuck] = useState("68");
  const [sourcePortal, setSourcePortal] = useState<"Metrocuadrado" | "Fincaraiz" | "Ciencuadras">("Metrocuadrado");
  const [originalListingText, setOriginalListingText] = useState(
    "Vendo apartamento en rosales 130 mts 3 alcobas 3 baños excelente vista chimenea parqueadero doble depósito directo negociable informes por whatsapp no inmobiliarias."
  );

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const numM2 = Math.max(1, parseFloat(m2) || 100);
    const numPrice = Math.max(1000000, parseFloat(askingPriceCop) || 800000000);
    const numBeds = Math.max(0, parseInt(bedrooms, 10) || 2);
    const numBaths = Math.max(0, parseInt(bathrooms, 10) || 2);
    const numDays = Math.max(0, parseInt(daysStuck, 10) || 45);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (config.openRouterApiKey) {
        headers["x-openrouter-key"] = config.openRouterApiKey;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify({
          city,
          barrio: barrio.trim(),
          address: address.trim(),
          ownerName: ownerName.trim(),
          m2: numM2,
          bedrooms: numBeds,
          bathrooms: numBaths,
          askingPriceCop: numPrice,
          daysStuck: numDays,
          sourcePortal,
          originalListingText: originalListingText.trim(),
          model: config.openRouterModel,
          agencyName: config.agencyName,
          agentName: config.agentName,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Error en el servidor (${res.status})`);
      }

      const jsonResult = await res.json();
      const analysis = jsonResult.data;
      const engineUsed = jsonResult.engine;
      const fallbackReason = jsonResult.fallbackReason;

      if (engineUsed === "local" && fallbackReason) {
        addToast({
          type: "warning",
          title: "Análisis completado (Motor local)",
          description: fallbackReason,
        });
      } else if (engineUsed === "openrouter") {
        addToast({
          type: "success",
          title: "Análisis completado con IA",
          description: `Generado mediante OpenRouter (${config.openRouterModel})`,
        });
      } else {
        addToast({
          type: "info",
          title: "Análisis completado (Motor local)",
          description: "Diagnóstico cuantitativo generado por reglas heurísticas de mercado.",
        });
      }

      // Generate 3 sample comparables around the sector
      const avgPricePerM2 = analysis.valuation.barrioAvgPricePerM2;
      const comp1Price = Math.round(avgPricePerM2 * (numM2 * 0.98));
      const comp2Price = Math.round(avgPricePerM2 * (numM2 * 1.02));
      const comp3Price = Math.round(avgPricePerM2 * (numM2 * 0.95));

      const comparables: ComparableSale[] = [
        {
          id: `comp-gen-${Date.now()}-1`,
          address: `${address.split("#")[0] || "Cra. 4"} # ${Math.floor(Math.random() * 80) + 10}-15`,
          m2: Math.round(numM2 * 0.98),
          soldPriceCop: comp1Price,
          pricePerM2: Math.round(comp1Price / (numM2 * 0.98)),
          daysToSell: 38,
          soldDate: "Hace 35 días",
        },
        {
          id: `comp-gen-${Date.now()}-2`,
          address: `${address.split("#")[0] || "Cra. 4"} # ${Math.floor(Math.random() * 80) + 10}-42`,
          m2: Math.round(numM2 * 1.02),
          soldPriceCop: comp2Price,
          pricePerM2: Math.round(comp2Price / (numM2 * 1.02)),
          daysToSell: 44,
          soldDate: "Hace 52 días",
        },
        {
          id: `comp-gen-${Date.now()}-3`,
          address: `${address.split("#")[0] || "Cra. 4"} # ${Math.floor(Math.random() * 80) + 10}-80`,
          m2: Math.round(numM2 * 0.95),
          soldPriceCop: comp3Price,
          pricePerM2: Math.round(comp3Price / (numM2 * 0.95)),
          daysToSell: 29,
          soldDate: "Hace 65 días",
        },
      ];

      // Assign realistic image based on city
      const cityImageMap: Record<string, string> = {
        Bogotá: "/images/properties/bogota-chapinero.jpg",
        Medellín: "/images/properties/medellin-poblado.jpg",
        Cali: "/images/properties/cali-granada.jpg",
        Barranquilla: "/images/properties/barranquilla-alto-prado.jpg",
        Bucaramanga: "/images/properties/bucaramanga-cabecera.jpg",
        Cartagena: "/images/properties/cartagena-bocagrande.jpg",
      };

      const newProperty: Property = {
        id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        city,
        barrio: barrio.trim(),
        address: address.trim(),
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim() || "+57 300 000 0000",
        askingPriceCop: numPrice,
        m2: numM2,
        bedrooms: numBeds,
        bathrooms: numBaths,
        parkingSpots: 2,
        estrato: 5,
        adminFeeCop: Math.round(numM2 * 5500),
        daysStuck: numDays,
        sourcePortal,
        originalListingText: originalListingText.trim(),
        detectedFlaws: analysis.problemTags,
        barrioAvgPricePerM2: avgPricePerM2,
        comparables,
        imagePath: cityImageMap[city] || "/images/properties/bogota-chapinero.jpg",
        status: "sin_contactar",
        analysis,
      };

      addProperty(newProperty);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado al analizar el anuncio.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs config-modal-backdrop overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#E6E1D8] rounded-sm max-w-2xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#828A91] hover:text-[#14171A] p-1 transition-colors"
          aria-label="Cerrar modal de análisis"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-[#0F533E] font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Auditoría de Inmuebles Particulares</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#14171A] tracking-tight">
            Analizar Nuevo Anuncio
          </h2>
          <p className="text-xs text-[#687076] mt-1">
            Pegue los datos y el texto del anuncio publicado por un particular para auditar sus fallas, estimar el valor por m2 y generar su kit de captación.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Ciudad
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as (typeof CITY_OPTIONS)[number])}
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A]"
              >
                {CITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Barrio o Sector
              </label>
              <input
                type="text"
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                placeholder="Ej. Chapinero Alto"
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Portal Fuente
              </label>
              <select
                value={sourcePortal}
                onChange={(e) => setSourcePortal(e.target.value as "Metrocuadrado" | "Fincaraiz" | "Ciencuadras")}
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A]"
              >
                <option value="Metrocuadrado">Metrocuadrado</option>
                <option value="Fincaraiz">Fincaraiz</option>
                <option value="Ciencuadras">Ciencuadras</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Dirección Aprox.
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Cl. 64 # 3-45"
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Nombre Propietario
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Ej. Mauricio Restrepo"
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Teléfono (+57)
              </label>
              <input
                type="text"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="+57 300 000 0000"
                className="w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Área (m2)
              </label>
              <input
                type="number"
                value={m2}
                onChange={(e) => setM2(e.target.value)}
                placeholder="110"
                className="w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Alcobas
              </label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="3"
                className="w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Baños
              </label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                placeholder="3"
                className="w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Días en Portal
              </label>
              <input
                type="number"
                value={daysStuck}
                onChange={(e) => setDaysStuck(e.target.value)}
                placeholder="45"
                className="w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Precio Pedido por el Propietario (COP)</span>
              <span className="text-[11px] font-mono text-[#565C62]">Pesos Colombianos</span>
            </label>
            <input
              type="number"
              value={askingPriceCop}
              onChange={(e) => setAskingPriceCop(e.target.value)}
              placeholder="980000000"
              className="w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
              Texto Original del Anuncio (copiado del portal)
            </label>
            <textarea
              rows={4}
              value={originalListingText}
              onChange={(e) => setOriginalListingText(e.target.value)}
              placeholder="Pegue aquí la redacción original publicada por el particular..."
              className="w-full px-3 py-2 text-xs leading-relaxed bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A]"
              required
            />
            <p className="text-[11px] text-[#828A91] mt-1">
              El motor evaluará la extensión, presencia de detalles técnicos, carencia de planos y argumentación persuasiva.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#EFECE6]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[#565C62] hover:text-[#14171A] bg-transparent transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs uppercase tracking-wider font-semibold text-white bg-[#0F533E] hover:bg-[#0A3C2D] disabled:opacity-50 rounded-sm transition-colors shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditando inmueble...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Ejecutar Diagnóstico y Valoración</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
