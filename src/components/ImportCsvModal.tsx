"use client";

import React, { useState, useRef } from "react";
import { z } from "zod";
import { useApp } from "@/context/AppContext";
import { Property, ComparableSale } from "@/types/property";
import { runLocalListingAnalysis } from "@/lib/analyzer";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ImportCsvModalProps {
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

const CsvRowSchema = z.object({
  city: z.enum(CITY_OPTIONS, {
    message: "Ciudad no válida (debe ser: Bogotá, Medellín, Cali, Barranquilla, Bucaramanga o Cartagena)",
  }),
  barrio: z.string().trim().min(2, "El barrio debe tener al menos 2 caracteres").max(100),
  address: z.string().trim().min(3, "La dirección debe tener al menos 3 caracteres").max(150),
  ownerName: z.string().trim().min(2, "El nombre del propietario es obligatorio").max(100),
  ownerPhone: z.string().trim().min(7, "Teléfono no válido (mínimo 7 dígitos)").max(25),
  m2: z.number().positive("El área debe ser mayor a 0 m²").max(5000),
  bedrooms: z.number().int().min(0, "Mínimo 0 alcobas").max(20),
  bathrooms: z.number().min(0, "Mínimo 0 baños").max(20),
  askingPriceCop: z.number().min(10000000, "El precio en COP debe ser al menos de $10.000.000"),
  daysStuck: z.number().int().min(0, "Mínimo 0 días").max(2000),
  sourcePortal: z.enum(["Metrocuadrado", "Fincaraiz", "Ciencuadras"], {
    message: "Portal no válido (debe ser: Metrocuadrado, Fincaraiz o Ciencuadras)",
  }),
  originalListingText: z.string().trim().min(10, "El texto del anuncio debe tener al menos 10 caracteres"),
});

interface FailedRow {
  rowNumber: number;
  dataSnippet: string;
  error: string;
}

function parseRfcCsv(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === "," || char === ";") {
        row.push(cell.trim());
        cell = "";
      } else if (char === "\r") {
        // Ignorar retornos de carro
      } else if (char === "\n") {
        row.push(cell.trim());
        if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
          lines.push(row);
        }
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
  }

  if (cell || row.length > 0) {
    row.push(cell.trim());
    if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
      lines.push(row);
    }
  }

  return lines;
}

function normalizeHeader(h: string): string {
  return h
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function ImportCsvModal({ onClose }: ImportCsvModalProps) {
  const { config, addProperties } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importedProperties, setImportedProperties] = useState<Property[]>([]);
  const [failedRows, setFailedRows] = useState<FailedRow[]>([]);
  const [importCompleted, setImportCompleted] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleDownloadTemplate = () => {
    const headers = [
      "ciudad",
      "barrio",
      "direccion",
      "propietario",
      "telefono",
      "m2",
      "habitaciones",
      "banos",
      "precio_cop",
      "dias_estancado",
      "portal",
      "texto_anuncio",
    ];

    const sampleRow1 = [
      "Bogotá",
      "Rosales",
      "Cra. 4 # 71-30",
      "Felipe Santamaría",
      "+57 300 789 0123",
      "130",
      "3",
      "3",
      "1150000000",
      "68",
      "Metrocuadrado",
      '"Vendo apartamento en Rosales 130 mts 3 alcobas 3 baños excelente vista chimenea parqueadero doble depósito directo negociable."',
    ];

    const sampleRow2 = [
      "Medellín",
      "El Poblado",
      "Cra. 32 # 5Sur-120",
      "Valeria Gómez",
      "+57 312 456 7890",
      "145",
      "3",
      "3",
      "1280000000",
      "55",
      "Fincaraiz",
      '"Apartamento amplio en El Poblado sector Los Balsos 145 metros 3 alcobas completas estudio balcón con vista verde piso alto dos parqueaderos independientes negociable directo."',
    ];

    const csvContent = "\uFEFF" + [headers.join(","), sampleRow1.join(","), sampleRow2.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plantilla_inmuebles_radar.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);
    setImportCompleted(false);
    setProcessing(true);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const text = evt.target?.result;
        if (typeof text !== "string") {
          throw new Error("No fue posible leer el archivo como texto UTF-8.");
        }

        const lines = parseRfcCsv(text);
        if (lines.length < 2) {
          throw new Error("El archivo CSV no contiene filas de datos o está vacío.");
        }

        const rawHeaders = lines[0];
        const normalizedHeaders = rawHeaders.map(normalizeHeader);

        // Header mapping resolver
        const findCol = (aliases: string[]): number => {
          for (const alias of aliases) {
            const idx = normalizedHeaders.indexOf(alias);
            if (idx !== -1) return idx;
          }
          return -1;
        };

        const cityIdx = findCol(["ciudad", "city"]);
        const barrioIdx = findCol(["barrio", "sector"]);
        const addressIdx = findCol(["direccion", "dir", "address"]);
        const ownerIdx = findCol(["propietario", "nombre", "nombrepropietario", "owner"]);
        const phoneIdx = findCol(["telefono", "celular", "tel", "phone"]);
        const m2Idx = findCol(["m2", "area", "aream2", "metros"]);
        const bedsIdx = findCol(["habitaciones", "alcobas", "cuartos", "beds"]);
        const bathsIdx = findCol(["banos", "baths", "servicios"]);
        const priceIdx = findCol(["preciocop", "precio", "valor", "valorpido"]);
        const daysIdx = findCol(["diasestancado", "dias", "antiguedad"]);
        const portalIdx = findCol(["portal", "portalfuente", "fuente"]);
        const textIdx = findCol(["textoanuncio", "texto", "descripcion", "anuncio"]);

        if (cityIdx === -1 || barrioIdx === -1 || priceIdx === -1 || textIdx === -1) {
          throw new Error(
            "Columnas obligatorias faltantes en la cabecera. Descargue la plantilla de referencia para verificar la estructura."
          );
        }

        const validList: Property[] = [];
        const errorList: FailedRow[] = [];

        const cityImageMap: Record<string, string> = {
          Bogotá: "/images/properties/bogota-chapinero.jpg",
          Medellín: "/images/properties/medellin-poblado.jpg",
          Cali: "/images/properties/cali-granada.jpg",
          Barranquilla: "/images/properties/barranquilla-alto-prado.jpg",
          Bucaramanga: "/images/properties/bucaramanga-cabecera.jpg",
          Cartagena: "/images/properties/cartagena-bocagrande.jpg",
        };

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i];
          const rowNumber = i + 1; // 1-indexed including header

          if (row.length === 0 || (row.length === 1 && row[0] === "")) {
            continue;
          }

          const getVal = (idx: number, def = "") => (idx !== -1 && row[idx] ? row[idx].trim() : def);

          const rawCity = getVal(cityIdx);
          const rawBarrio = getVal(barrioIdx);
          const rawAddress = getVal(addressIdx, `Inmueble sector ${rawBarrio}`);
          const rawOwner = getVal(ownerIdx, "Propietario");
          const rawPhone = getVal(phoneIdx, "+57 300 000 0000");
          const rawM2 = parseFloat(getVal(m2Idx, "100").replace(/[^0-9.]/g, "")) || 0;
          const rawBeds = parseInt(getVal(bedsIdx, "3").replace(/[^0-9]/g, ""), 10);
          const rawBaths = parseFloat(getVal(bathsIdx, "2").replace(/[^0-9.]/g, ""));
          const rawPrice = parseFloat(getVal(priceIdx, "0").replace(/[^0-9.]/g, "")) || 0;
          const rawDays = parseInt(getVal(daysIdx, "30").replace(/[^0-9]/g, ""), 10);
          const rawPortal = getVal(portalIdx, "Metrocuadrado");
          const rawText = getVal(textIdx);

          const validation = CsvRowSchema.safeParse({
            city: rawCity,
            barrio: rawBarrio,
            address: rawAddress,
            ownerName: rawOwner,
            ownerPhone: rawPhone,
            m2: rawM2,
            bedrooms: isNaN(rawBeds) ? -1 : rawBeds,
            bathrooms: isNaN(rawBaths) ? -1 : rawBaths,
            askingPriceCop: rawPrice,
            daysStuck: isNaN(rawDays) ? -1 : rawDays,
            sourcePortal: rawPortal,
            originalListingText: rawText,
          });

          if (!validation.success) {
            const reason = validation.error.issues.map((iss) => iss.message).join(". ");
            errorList.push({
              rowNumber,
              dataSnippet: `${rawCity} - ${rawBarrio} (${rawAddress})`,
              error: reason,
            });
            continue;
          }

          const valid = validation.data;

          // Process immediately with local heuristic engine (0 OpenRouter credits)
          const analysis = runLocalListingAnalysis({
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
            agencyName: config.agencyName,
            agentName: config.agentName,
            agentRole: config.agentRole,
            agencyPhone: config.agencyPhone,
          }, "Importación por CSV (Motor Heurístico Local)");

          const avgPricePerM2 = analysis.valuation.barrioAvgPricePerM2;
          const comp1Price = Math.round(avgPricePerM2 * (valid.m2 * 0.98));
          const comp2Price = Math.round(avgPricePerM2 * (valid.m2 * 1.02));
          const comp3Price = Math.round(avgPricePerM2 * (valid.m2 * 0.95));

          const comparables: ComparableSale[] = [
            {
              id: `comp-csv-${Date.now()}-${i}-1`,
              address: `${valid.address.split("#")[0] || "Cl. 10"} # ${Math.floor(Math.random() * 80) + 10}-15`,
              m2: Math.round(valid.m2 * 0.98),
              soldPriceCop: comp1Price,
              pricePerM2: Math.round(comp1Price / (valid.m2 * 0.98)),
              daysToSell: 36,
              soldDate: "Hace 40 días",
            },
            {
              id: `comp-csv-${Date.now()}-${i}-2`,
              address: `${valid.address.split("#")[0] || "Cl. 10"} # ${Math.floor(Math.random() * 80) + 10}-45`,
              m2: Math.round(valid.m2 * 1.02),
              soldPriceCop: comp2Price,
              pricePerM2: Math.round(comp2Price / (valid.m2 * 1.02)),
              daysToSell: 48,
              soldDate: "Hace 58 días",
            },
            {
              id: `comp-csv-${Date.now()}-${i}-3`,
              address: `${valid.address.split("#")[0] || "Cl. 10"} # ${Math.floor(Math.random() * 80) + 10}-82`,
              m2: Math.round(valid.m2 * 0.95),
              soldPriceCop: comp3Price,
              pricePerM2: Math.round(comp3Price / (valid.m2 * 0.95)),
              daysToSell: 27,
              soldDate: "Hace 72 días",
            },
          ];

          const newProp: Property = {
            id: `prop-csv-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
            city: valid.city,
            barrio: valid.barrio,
            address: valid.address,
            ownerName: valid.ownerName,
            ownerPhone: valid.ownerPhone,
            askingPriceCop: valid.askingPriceCop,
            m2: valid.m2,
            bedrooms: valid.bedrooms,
            bathrooms: valid.bathrooms,
            parkingSpots: 1,
            estrato: 4,
            adminFeeCop: Math.round(valid.m2 * 5000),
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

          validList.push(newProp);
        }

        setImportedProperties(validList);
        setFailedRows(errorList);
        setImportCompleted(true);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al procesar el archivo CSV.";
        setParseError(msg);
      } finally {
        setProcessing(false);
      }
    };

    reader.onerror = () => {
      setParseError("No fue posible leer el archivo. Verifique los permisos o formato.");
      setProcessing(false);
    };

    // Explicitly read as UTF-8 so accented characters (á, é, í, ó, ú, ñ) are never corrupted
    reader.readAsText(file, "utf-8");
  };

  const handleApplyImport = () => {
    if (importedProperties.length > 0) {
      addProperties(importedProperties);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs config-modal-backdrop overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#E6E1D8] rounded-sm max-w-2xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#828A91] hover:text-[#14171A] p-1 transition-colors cursor-pointer"
          aria-label="Cerrar modal de importación"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-[#0F533E] font-semibold mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Carga Masiva de Anuncios</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#14171A] tracking-tight">
            Importar Inmuebles desde CSV
          </h2>
          <p className="text-xs text-[#687076] mt-1">
            Cargue múltiples anuncios particulares simultáneamente. Cada registro se valida fila por fila con Zod y se audita con el motor local sin consumir créditos de IA.
          </p>
        </div>

        {/* Template download card */}
        <div className="p-4 bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#14171A]">
              Plantilla CSV Oficial (UTF-8)
            </h4>
            <p className="text-[11px] text-[#565C62] mt-0.5">
              Descargue la estructura con las columnas y formatos requeridos para asegurar compatibilidad.
            </p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0F533E] bg-white border border-[#C3DFD3] hover:bg-[#EBF5F0] rounded-sm transition-colors cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Plantilla CSV</span>
          </button>
        </div>

        {parseError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Upload Zone */}
        {!importCompleted && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#C9C2B5] hover:border-[#0F533E] bg-[#FAF8F5] hover:bg-[#F3EFEA] rounded-sm p-8 text-center cursor-pointer transition-colors mb-4"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {processing ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-[#0F533E] animate-spin" />
                <p className="text-xs font-semibold text-[#14171A]">
                  Validando y auditando inmuebles en UTF-8...
                </p>
                <p className="text-[11px] font-mono text-[#687076]">
                  {fileName}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="w-8 h-8 text-[#0F533E]" />
                <p className="text-xs font-semibold text-[#14171A]">
                  Haga clic para seleccionar o arrastre su archivo .CSV
                </p>
                <p className="text-[11px] text-[#687076]">
                  Codificación UTF-8 garantizada (mantiene tildes, ñ y caracteres colombianos)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results Summary */}
        {importCompleted && (
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#EBF5F0] border border-[#C3DFD3] rounded-sm flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#0F533E] shrink-0" />
                <div>
                  <span className="font-bold text-sm text-[#0F533E] block">
                    {importedProperties.length} válidos
                  </span>
                  <span className="text-[11px] text-[#0F533E]/80">Listos para agregar</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <span className="font-bold text-sm text-amber-900 block">
                    {failedRows.length} con error
                  </span>
                  <span className="text-[11px] text-amber-800">Filas descartadas</span>
                </div>
              </div>
            </div>

            {failedRows.length > 0 && (
              <div className="border border-amber-200 bg-amber-50/50 p-3 rounded-sm max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-amber-900 mb-2">
                  Detalle de filas no importadas:
                </p>
                <div className="space-y-1.5 text-[11px]">
                  {failedRows.map((f, idx) => (
                    <div key={idx} className="pb-1.5 border-b border-amber-100 last:border-b-0">
                      <strong className="text-amber-950">Fila {f.rowNumber}:</strong>{" "}
                      <span className="text-amber-900 font-mono text-[10px]">{f.dataSnippet}</span>
                      <p className="text-red-700 mt-0.5">{f.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setImportCompleted(false);
                  setImportedProperties([]);
                  setFailedRows([]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-[#0F533E] hover:underline cursor-pointer"
              >
                Cargar otro archivo CSV
              </button>
            </div>
          </div>
        )}

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#EFECE6]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[#565C62] hover:text-[#14171A] bg-transparent transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApplyImport}
            disabled={processing || !importCompleted || importedProperties.length === 0}
            className="flex items-center gap-2 px-5 py-2 text-xs uppercase tracking-wider font-semibold text-white bg-[#0F533E] hover:bg-[#0A3C2D] disabled:opacity-40 rounded-sm transition-colors shadow-sm cursor-pointer"
          >
            <span>Incorporar {importedProperties.length} al Radar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
