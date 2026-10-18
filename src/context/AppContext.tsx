"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useSyncExternalStore } from "react";
import { z } from "zod";
import { Property, PropertyStatus, AgencyConfig, PropertyAnalysis } from "@/types/property";
import { INITIAL_PROPERTIES } from "@/data/properties";

const BackupPayloadSchema = z.object({
  version: z.literal(2),
  exportedAt: z.string(),
  agencyConfig: z.object({
    agencyName: z.string().optional(),
    agentName: z.string().optional(),
    agentRole: z.string().optional(),
    agencyPhone: z.string().optional(),
    commissionPercent: z.number(),
    openRouterModel: z.string().optional(),
  }),
  properties: z.array(
    z.object({
      id: z.string(),
      city: z.enum(["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Cartagena"]),
      barrio: z.string(),
      address: z.string(),
      ownerName: z.string(),
      ownerPhone: z.string(),
      askingPriceCop: z.number(),
      m2: z.number(),
      bedrooms: z.number(),
      bathrooms: z.number(),
      parkingSpots: z.number().optional(),
      estrato: z.number().optional(),
      adminFeeCop: z.number().optional(),
      daysStuck: z.number(),
      sourcePortal: z.enum(["Metrocuadrado", "Fincaraiz", "Ciencuadras"]),
      originalListingText: z.string(),
      detectedFlaws: z.array(z.string()),
      barrioAvgPricePerM2: z.number(),
      comparables: z.array(z.any()),
      imagePath: z.string(),
      status: z.enum(["sin_contactar", "dossier_enviado", "reunion_agendada", "captado_exclusiva"]),
      analysis: z.any(),
      isSample: z.boolean().optional(),
    })
  ),
});

export interface ToastMessage {
  id: string;
  type: "success" | "info" | "warning";
  title: string;
  description?: string;
}

interface AppContextValue {
  properties: Property[];
  config: AgencyConfig;
  isHydrated: boolean;
  updatePropertyStatus: (id: string, status: PropertyStatus) => void;
  updatePropertyAnalysis: (id: string, analysis: PropertyAnalysis) => void;
  addProperty: (property: Property) => void;
  addProperties: (properties: Property[]) => void;
  updateConfig: (newConfig: Partial<AgencyConfig>) => void;
  getPropertyById: (id: string) => Property | undefined;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  deleteProperty: (id: string) => boolean;
  showSampleData: boolean;
  setShowSampleData: (show: boolean) => void;
  exportDataBackup: () => void;
  importDataBackup: (jsonString: string) => { success: boolean; error?: string };
  metrics: {
    totalDetectados: number;
    comisionPotencialCop: number;
    dossiersEnviados: number;
    exclusivasCerradas: number;
    promedioDiasEstancados: number;
  };
}

const DEFAULT_CONFIG: AgencyConfig = {
  agencyName: "",
  agentName: "",
  agentRole: "",
  agencyPhone: "",
  commissionPercent: 3.5,
  openRouterModel: "openai/gpt-4o-mini",
  openRouterApiKey: "",
};

const PROPERTIES_STORAGE_KEY = "radar_properties_v2";
const CONFIG_STORAGE_KEY = "radar_agency_config_v2";
const SHOW_SAMPLE_STORAGE_KEY = "radar_show_sample_v2";

const AppContext = createContext<AppContextValue | null>(null);

function getSafeInitialProperties(): Property[] {
  if (typeof window === "undefined") return INITIAL_PROPERTIES;
  try {
    const storedProps = localStorage.getItem(PROPERTIES_STORAGE_KEY);
    if (storedProps) {
      const parsed = JSON.parse(storedProps);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p: Property) => {
          if (p.isSample === undefined) {
            const isDemo = INITIAL_PROPERTIES.some((init) => init.id === p.id);
            return { ...p, isSample: isDemo };
          }
          return p;
        });
      }
    }
  } catch {
    // Failover
  }
  return INITIAL_PROPERTIES;
}

function getSafeInitialConfig(): AgencyConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    }
  } catch {
    // Failover
  }
  return DEFAULT_CONFIG;
}

function getSafeInitialShowSample(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const val = localStorage.getItem(SHOW_SAMPLE_STORAGE_KEY);
    if (val !== null) {
      return val === "true";
    }
  } catch {
    // Failover
  }
  return true;
}

const emptySubscribe = () => () => {};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(getSafeInitialProperties);
  const [config, setConfig] = useState<AgencyConfig>(getSafeInitialConfig);
  const [showSampleData, setShowSampleDataState] = useState<boolean>(getSafeInitialShowSample);
  const isHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  useEffect(() => {
    // Check if corrupted data existed in localStorage on mount
    try {
      const rawProps = localStorage.getItem(PROPERTIES_STORAGE_KEY);
      if (rawProps) JSON.parse(rawProps);
    } catch {
      setTimeout(() => {
        addToast({
          type: "warning",
          title: "Almacenamiento local restablecido",
          description: "Se detectó información corrupta en el navegador. Se cargaron los datos de ejemplo estándar.",
        });
      }, 100);
    }
  }, [addToast]);

  // Keep localStorage synchronized when properties change (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
    } catch (e: unknown) {
      const isQuota = e instanceof DOMException && (e.code === 22 || e.name === "QuotaExceededError");
      setTimeout(() => {
        addToast({
          type: "warning",
          title: isQuota ? "Almacenamiento local lleno" : "No fue posible guardar",
          description: isQuota
            ? "El navegador se ha quedado sin espacio de almacenamiento para guardar más inmuebles."
            : "El almacenamiento del navegador está bloqueado o restringido.",
        });
      }, 0);
    }
  }, [properties, isHydrated, addToast]);

  // Keep localStorage synchronized when config changes (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Ignore quota or private browsing errors on config
    }
  }, [config, isHydrated]);

  const setShowSampleData = useCallback((show: boolean) => {
    setShowSampleDataState(show);
    try {
      localStorage.setItem(SHOW_SAMPLE_STORAGE_KEY, String(show));
    } catch {
      // local storage failover
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updatePropertyStatus = useCallback(
    (id: string, newStatus: PropertyStatus) => {
      setProperties((prev) => {
        return prev.map((p) => {
          if (p.id === id) {
            return { ...p, status: newStatus };
          }
          return p;
        });
      });

      const statusLabels: Record<PropertyStatus, string> = {
        sin_contactar: "Sin contactar",
        dossier_enviado: "Dossier enviado",
        reunion_agendada: "Reunión agendada",
        captado_exclusiva: "Captado en exclusiva",
      };

      addToast({
        type: "success",
        title: "Estado actualizado",
        description: `El inmueble ahora se encuentra en estado: ${statusLabels[newStatus]}`,
      });
    },
    [addToast]
  );

  const updatePropertyAnalysis = useCallback(
    (id: string, analysis: PropertyAnalysis) => {
      setProperties((prev) => {
        return prev.map((p) => {
          if (p.id === id) {
            return { ...p, analysis };
          }
          return p;
        });
      });
    },
    []
  );

  const addProperty = useCallback(
    (property: Property) => {
      setProperties((prev) => [property, ...prev]);

      addToast({
        type: "success",
        title: "Nuevo inmueble incorporado",
        description: `${property.barrio} (${property.city}) añadido al radar comercial.`,
      });
    },
    [addToast]
  );

  const addProperties = useCallback(
    (newProps: Property[]) => {
      if (newProps.length === 0) return;
      setProperties((prev) => [...newProps, ...prev]);

      addToast({
        type: "success",
        title: "Importación completada",
        description: `Se han incorporado ${newProps.length} inmuebles al radar comercial.`,
      });
    },
    [addToast]
  );

  const deleteProperty = useCallback(
    (id: string): boolean => {
      const target = properties.find((p) => p.id === id);
      if (!target) return false;
      if (target.isSample) {
        addToast({
          type: "warning",
          title: "Inmueble protegido",
          description: "Los inmuebles de ejemplo no se pueden eliminar. Puede ocultarlos con el interruptor 'Mostrar datos de ejemplo'.",
        });
        return false;
      }

      setProperties((prev) => prev.filter((p) => p.id !== id));
      addToast({
        type: "info",
        title: "Inmueble eliminado",
        description: `El inmueble en ${target.barrio} ha sido retirado del radar.`,
      });
      return true;
    },
    [properties, addToast]
  );

  const updateConfig = useCallback(
    (newConfig: Partial<AgencyConfig>) => {
      setConfig((prev) => ({ ...prev, ...newConfig }));

      addToast({
        type: "success",
        title: "Configuración guardada",
        description: "Los parámetros de la agencia se actualizaron correctamente.",
      });
    },
    [addToast]
  );

  const exportDataBackup = useCallback(() => {
    // Exclude openRouterApiKey from backup for security
    const cleanConfig = {
      agencyName: config.agencyName,
      agentName: config.agentName,
      agentRole: config.agentRole,
      agencyPhone: config.agencyPhone,
      commissionPercent: config.commissionPercent,
      openRouterModel: config.openRouterModel,
    };

    const backupPayload = {
      version: 2 as const,
      exportedAt: new Date().toISOString(),
      agencyConfig: cleanConfig,
      properties,
    };

    const jsonStr = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `respaldo_radar_captacion_${dateStamp}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      type: "success",
      title: "Respaldo exportado exitosamente",
      description: "El archivo JSON contiene sus inmuebles, estados y configuración (sin claves secretas).",
    });
  }, [config, properties, addToast]);

  const importDataBackup = useCallback(
    (jsonString: string): { success: boolean; error?: string } => {
      try {
        const parsed = JSON.parse(jsonString);
        const validated = BackupPayloadSchema.safeParse(parsed);

        if (!validated.success) {
          const firstError = validated.error.issues[0]?.message || "Estructura de respaldo no válida.";
          addToast({
            type: "warning",
            title: "Archivo de respaldo inválido",
            description: firstError,
          });
          return { success: false, error: firstError };
        }

        const data = validated.data;
        // Merge config keeping existing local API key
        setConfig((prev) => ({
          ...prev,
          ...data.agencyConfig,
          openRouterApiKey: prev.openRouterApiKey,
        }));

        setProperties(data.properties as Property[]);

        addToast({
          type: "success",
          title: "Respaldo restaurado",
          description: `Se han cargado ${data.properties.length} inmuebles y los parámetros de su agencia.`,
        });

        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "El archivo no contiene un JSON legible.";
        addToast({
          type: "warning",
          title: "Error al leer el archivo",
          description: msg,
        });
        return { success: false, error: msg };
      }
    },
    [addToast]
  );

  const getPropertyById = useCallback(
    (id: string) => {
      return properties.find((p) => p.id === id);
    },
    [properties]
  );

  const metrics = useMemo(() => {
    const list = showSampleData ? properties : properties.filter((p) => !p.isSample);
    const totalDetectados = list.length;
    const rate = config.commissionPercent / 100;
    const comisionPotencialCop = list.reduce(
      (acc, p) => acc + Math.round(p.askingPriceCop * rate),
      0
    );
    const dossiersEnviados = list.filter(
      (p) => p.status === "dossier_enviado" || p.status === "reunion_agendada" || p.status === "captado_exclusiva"
    ).length;
    const exclusivasCerradas = list.filter(
      (p) => p.status === "captado_exclusiva"
    ).length;
    const promedioDiasEstancados =
      totalDetectados > 0
        ? Math.round(
            list.reduce((acc, p) => acc + p.daysStuck, 0) / totalDetectados
          )
        : 0;

    return {
      totalDetectados,
      comisionPotencialCop,
      dossiersEnviados,
      exclusivasCerradas,
      promedioDiasEstancados,
    };
  }, [properties, showSampleData, config.commissionPercent]);

  return (
    <AppContext.Provider
      value={{
        properties,
        config,
        isHydrated,
        updatePropertyStatus,
        updatePropertyAnalysis,
        addProperty,
        addProperties,
        deleteProperty,
        showSampleData,
        setShowSampleData,
        exportDataBackup,
        importDataBackup,
        updateConfig,
        getPropertyById,
        toasts,
        addToast,
        removeToast,
        metrics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp debe utilizarse dentro de un AppProvider");
  }
  return context;
}
