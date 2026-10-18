"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useApp } from "@/context/AppContext";
import { Property, ComparableSale } from "@/types/property";
import { X, PlusCircle, Loader2, AlertCircle } from "lucide-react";

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

const PropertyFormSchema = z.object({
  city: z.enum(CITY_OPTIONS, {
    message: "Seleccione una ciudad colombiana válida",
  }),
  barrio: z
    .string()
    .trim()
    .min(2, "El barrio debe tener al menos 2 caracteres")
    .max(100, "El barrio no puede exceder 100 caracteres"),
  address: z
    .string()
    .trim()
    .min(3, "La dirección debe tener al menos 3 caracteres")
    .max(150, "La dirección no puede exceder 150 caracteres"),
  ownerName: z
    .string()
    .trim()
    .min(2, "El nombre del propietario es obligatorio")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  ownerPhone: z
    .string()
    .trim()
    .min(7, "Ingrese un número de teléfono válido (mínimo 7 dígitos)")
    .max(25, "El teléfono no puede exceder 25 caracteres"),
  m2: z
    .number({ message: "El área en m² debe ser un valor numérico" })
    .positive("El área debe ser mayor a 0 m²")
    .max(5000, "El área máxima permitida es de 5.000 m²"),
  bedrooms: z
    .number({ message: "El número de habitaciones debe ser un número entero" })
    .int("Debe ser un número entero")
    .min(0, "Mínimo 0 alcobas")
    .max(20, "Máximo 20 alcobas"),
  bathrooms: z
    .number({ message: "El número de baños debe ser un valor numérico" })
    .min(0, "Mínimo 0 baños")
    .max(20, "Máximo 20 baños"),
  askingPriceCop: z
    .number({ message: "El precio pedido debe ser un valor numérico" })
    .min(10000000, "El precio pedido debe ser de al menos $10.000.000 COP"),
  daysStuck: z
    .number({ message: "Los días estancado deben ser un número entero" })
    .int("Debe ser un número entero")
    .min(0, "Mínimo 0 días")
    .max(2000, "Máximo 2000 días"),
  sourcePortal: z.enum(["Metrocuadrado", "Fincaraiz", "Ciencuadras"], {
    message: "Seleccione un portal de origen válido",
  }),
  originalListingText: z
    .string()
    .trim()
    .min(10, "El texto del anuncio debe contener al menos 10 caracteres")
    .max(5000, "El texto del anuncio no puede exceder 5000 caracteres"),
});

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setFieldErrors({});

    const parsedNumM2 = parseFloat(m2) || 0;
    const parsedNumPrice = parseFloat(askingPriceCop) || 0;
    const parsedNumBeds = parseInt(bedrooms, 10);
    const parsedNumBaths = parseFloat(bathrooms);
    const parsedNumDays = parseInt(daysStuck, 10);

    const validationResult = PropertyFormSchema.safeParse({
      city,
      barrio,
      address,
      ownerName,
      ownerPhone,
      m2: parsedNumM2,
      bedrooms: isNaN(parsedNumBeds) ? -1 : parsedNumBeds,
      bathrooms: isNaN(parsedNumBaths) ? -1 : parsedNumBaths,
      askingPriceCop: parsedNumPrice,
      daysStuck: isNaN(parsedNumDays) ? -1 : parsedNumDays,
      sourcePortal,
      originalListingText,
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0]?.toString();
        if (fieldName && !errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      });
      setFieldErrors(errors);
      setErrorMsg("Por favor corrija los campos señalados antes de continuar.");
      setLoading(false);
      return;
    }

    const valid = validationResult.data;

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
          city: valid.city,
          barrio: valid.barrio,
          address: valid.address,
          ownerName: valid.ownerName,
          m2: valid.m2,
          bedrooms: valid.bedrooms,
          bathrooms: valid.bathrooms,
          askingPriceCop: valid.askingPriceCop,
          daysStuck: valid.daysStuck,
          sourcePortal: valid.sourcePortal,
          originalListingText: valid.originalListingText,
          model: config.openRouterModel,
          agencyName: config.agencyName,
          agentName: config.agentName,
          agentRole: config.agentRole,
          agencyPhone: config.agencyPhone,
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

      // Generate 3 realistic comparables around the sector
      const avgPricePerM2 = analysis.valuation.barrioAvgPricePerM2;
      const comp1Price = Math.round(avgPricePerM2 * (valid.m2 * 0.98));
      const comp2Price = Math.round(avgPricePerM2 * (valid.m2 * 1.02));
      const comp3Price = Math.round(avgPricePerM2 * (valid.m2 * 0.95));

      const comparables: ComparableSale[] = [
        {
          id: `comp-gen-${Date.now()}-1`,
          address: `${valid.address.split("#")[0] || "Cra. 4"} # ${Math.floor(Math.random() * 80) + 10}-15`,
          m2: Math.round(valid.m2 * 0.98),
          soldPriceCop: comp1Price,
          pricePerM2: Math.round(comp1Price / (valid.m2 * 0.98)),
          daysToSell: 38,
          soldDate: "Hace 35 días",
        },
        {
          id: `comp-gen-${Date.now()}-2`,
          address: `${valid.address.split("#")[0] || "Cra. 4"} # ${Math.floor(Math.random() * 80) + 10}-42`,
          m2: Math.round(valid.m2 * 1.02),
          soldPriceCop: comp2Price,
          pricePerM2: Math.round(comp2Price / (valid.m2 * 1.02)),
          daysToSell: 44,
          soldDate: "Hace 52 días",
        },
        {
          id: `comp-gen-${Date.now()}-3`,
          address: `${valid.address.split("#")[0] || "Cra. 4"} # ${Math.floor(Math.random() * 80) + 10}-80`,
          m2: Math.round(valid.m2 * 0.95),
          soldPriceCop: comp3Price,
          pricePerM2: Math.round(comp3Price / (valid.m2 * 0.95)),
          daysToSell: 29,
          soldDate: "Hace 65 días",
        },
      ];

      // Assign image based on city
      const cityImageMap: Record<string, string> = {
        Bogotá: "/images/properties/bogota-chapinero.jpg",
        Medellín: "/images/properties/medellin-poblado.jpg",
        Cali: "/images/properties/cali-granada.jpg",
        Barranquilla: "/images/properties/barranquilla-alto-prado.jpg",
        Bucaramanga: "/images/properties/bucaramanga-cabecera.jpg",
        Cartagena: "/images/properties/cartagena-bocagrande.jpg",
      };

      const uniquePropertyId = typeof crypto !== "undefined" && crypto.randomUUID
        ? `prop-manual-${crypto.randomUUID()}`
        : `prop-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const newProperty: Property = {
        id: uniquePropertyId,
        city: valid.city,
        barrio: valid.barrio,
        address: valid.address,
        ownerName: valid.ownerName,
        ownerPhone: valid.ownerPhone,
        askingPriceCop: valid.askingPriceCop,
        m2: valid.m2,
        bedrooms: valid.bedrooms,
        bathrooms: valid.bathrooms,
        parkingSpots: 2,
        estrato: 5,
        adminFeeCop: Math.round(valid.m2 * 5500),
        daysStuck: valid.daysStuck,
        sourcePortal: valid.sourcePortal,
        originalListingText: valid.originalListingText,
        detectedFlaws: analysis.problemTags,
        barrioAvgPricePerM2: avgPricePerM2,
        comparables,
        imagePath: cityImageMap[valid.city] || "/images/properties/bogota-chapinero.jpg",
        status: "sin_contactar",
        analysis,
        isSample: false,
      };

      addProperty(newProperty);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado al auditar el anuncio.";
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
          className="absolute top-5 right-5 text-[#828A91] hover:text-[#14171A] p-1 transition-colors cursor-pointer"
          aria-label="Cerrar modal de alta"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-[#0F533E] font-semibold mb-1">
            <PlusCircle className="w-4 h-4" />
            <span>Captación de Inmuebles Particulares</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#14171A] tracking-tight">
            Agregar Inmueble al Radar
          </h2>
          <p className="text-xs text-[#687076] mt-1">
            Complete los datos del anuncio publicado por un propietario particular para auditar sus fallas comerciales, calcular su valor por m2 y agregarlo a su cartera de captación.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAnalyze} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Ciudad *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as (typeof CITY_OPTIONS)[number])}
                className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] ${
                  fieldErrors.city ? "border-red-400 bg-red-50/30" : "border-[#E6E1D8]"
                }`}
              >
                {CITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {fieldErrors.city && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Barrio o Sector *
              </label>
              <input
                type="text"
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                placeholder="Ej. Chapinero Alto"
                className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] ${
                  fieldErrors.barrio ? "border-red-400 bg-red-50/30" : "border-[#E6E1D8]"
                }`}
              />
              {fieldErrors.barrio && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.barrio}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Portal Fuente *
              </label>
              <select
                value={sourcePortal}
                onChange={(e) => setSourcePortal(e.target.value as "Metrocuadrado" | "Fincaraiz" | "Ciencuadras")}
                className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] ${
                  fieldErrors.sourcePortal ? "border-red-400 bg-red-50/30" : "border-[#E6E1D8]"
                }`}
              >
                <option value="Metrocuadrado">Metrocuadrado</option>
                <option value="Fincaraiz">Fincaraiz</option>
                <option value="Ciencuadras">Ciencuadras</option>
              </select>
              {fieldErrors.sourcePortal && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.sourcePortal}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Dirección Aprox. *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Cl. 64 # 3-45"
                className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] ${
                  fieldErrors.address ? "border-red-400 bg-red-50/30" : "border-[#E6E1D8]"
                }`}
              />
              {fieldErrors.address && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Nombre Propietario *
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Ej. Mauricio Restrepo"
                className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] ${
                  fieldErrors.ownerName ? "border-red-400 bg-red-50/30" : "border-[#E6E1D8]"
                }`}
              />
              {fieldErrors.ownerName && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.ownerName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Teléfono (+57) *
              </label>
              <input
                type="text"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="+57 300 000 0000"
                className={`w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] ${
                  fieldErrors.ownerPhone ? "border-red-400 bg-red-50/30" : "border-[#E6E1D8]"
                }`}
              />
              {fieldErrors.ownerPhone && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.ownerPhone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Área (m2) *
              </label>
              <input
                type="number"
                value={m2}
                onChange={(e) => setM2(e.target.value)}
                placeholder="110"
                className={`w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] ${
                  fieldErrors.m2 ? "border-red-400 bg-red-50/30" : "border-[#E6E1D8]"
                }`}
              />
              {fieldErrors.m2 && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.m2}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Alcobas *
              </label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="3"
                className={`w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] ${
                  fieldErrors.bedrooms ? "border-red-400 bg-red-50/30" : "border-[#E6E1D8]"
                }`}
              />
              {fieldErrors.bedrooms && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.bedrooms}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Baños *
              </label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                placeholder="3"
                className={`w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] ${
                  fieldErrors.bathrooms ? "border-red-400 bg-red-50/30" : "border-[#E6E1D8]"
                }`}
              />
              {fieldErrors.bathrooms && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.bathrooms}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
                Días en Portal *
              </label>
              <input
                type="number"
                value={daysStuck}
                onChange={(e) => setDaysStuck(e.target.value)}
                placeholder="45"
                className={`w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] ${
                  fieldErrors.daysStuck ? "border-red-400 bg-red-50/30" : "border-[#E6E1D8]"
                }`}
              />
              {fieldErrors.daysStuck && (
                <p className="text-[11px] text-red-600 mt-1">{fieldErrors.daysStuck}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Precio Pedido por el Propietario (COP) *</span>
              <span className="text-[11px] font-mono text-[#565C62]">Pesos Colombianos</span>
            </label>
            <input
              type="number"
              value={askingPriceCop}
              onChange={(e) => setAskingPriceCop(e.target.value)}
              placeholder="980000000"
              className={`w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] ${
                fieldErrors.askingPriceCop ? "border-red-400 bg-red-50/30" : "border-[#E6E1D8]"
              }`}
            />
            {fieldErrors.askingPriceCop && (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.askingPriceCop}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1">
              Texto Original del Anuncio (copiado del portal) *
            </label>
            <textarea
              rows={4}
              value={originalListingText}
              onChange={(e) => setOriginalListingText(e.target.value)}
              placeholder="Pegue aquí la redacción original publicada por el particular..."
              className={`w-full px-3 py-2 text-xs leading-relaxed bg-[#FAF8F5] border rounded-sm focus:outline-none focus:border-[#0F533E] text-[#14171A] ${
                fieldErrors.originalListingText ? "border-red-400 bg-red-50/30" : "border-[#E6E1D8]"
              }`}
            />
            {fieldErrors.originalListingText ? (
              <p className="text-[11px] text-red-600 mt-1">{fieldErrors.originalListingText}</p>
            ) : (
              <p className="text-[11px] text-[#828A91] mt-1">
                El motor auditará la extensión, atributos técnicos omitidos, deficiencias fotográficas y sobreprecio relativo.
              </p>
            )}
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
                  <span>Auditando e incorporando...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Auditar y Agregar al Radar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
