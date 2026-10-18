"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { Property, PropertyStatus, AgencyConfig, PropertyAnalysis } from "@/types/property";
import { INITIAL_PROPERTIES } from "@/data/properties";

export interface ToastMessage {
  id: string;
  type: "success" | "info" | "warning";
  title: string;
  description?: string;
}

interface AppContextValue {
  properties: Property[];
  config: AgencyConfig;
  updatePropertyStatus: (id: string, status: PropertyStatus) => void;
  updatePropertyAnalysis: (id: string, analysis: PropertyAnalysis) => void;
  addProperty: (property: Property) => void;
  updateConfig: (newConfig: Partial<AgencyConfig>) => void;
  getPropertyById: (id: string) => Property | undefined;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
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

const AppContext = createContext<AppContextValue | null>(null);

function loadInitialProperties(): Property[] {
  if (typeof window === "undefined") return INITIAL_PROPERTIES;
  try {
    const storedProps = localStorage.getItem(PROPERTIES_STORAGE_KEY);
    if (storedProps) {
      const parsed = JSON.parse(storedProps);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Failover
  }
  return INITIAL_PROPERTIES;
}

function loadInitialConfig(): AgencyConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
      if (parsed && typeof parsed === "object") {
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    }
  } catch {
    // Failover
  }
  return DEFAULT_CONFIG;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(loadInitialProperties);
  const [config, setConfig] = useState<AgencyConfig>(loadInitialConfig);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Keep localStorage synchronized when properties change
  useEffect(() => {
    try {
      localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
    } catch {
      // LocalStorage failover
    }
  }, [properties]);

  // Keep localStorage synchronized when config changes
  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch {
      // LocalStorage failover
    }
  }, [config]);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
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

  const getPropertyById = useCallback(
    (id: string) => {
      return properties.find((p) => p.id === id);
    },
    [properties]
  );

  const metrics = useMemo(() => {
    const totalDetectados = properties.length;
    const rate = config.commissionPercent / 100;
    const comisionPotencialCop = properties.reduce(
      (acc, p) => acc + Math.round(p.askingPriceCop * rate),
      0
    );
    const dossiersEnviados = properties.filter(
      (p) => p.status === "dossier_enviado" || p.status === "reunion_agendada" || p.status === "captado_exclusiva"
    ).length;
    const exclusivasCerradas = properties.filter(
      (p) => p.status === "captado_exclusiva"
    ).length;
    const promedioDiasEstancados =
      totalDetectados > 0
        ? Math.round(
            properties.reduce((acc, p) => acc + p.daysStuck, 0) / totalDetectados
          )
        : 0;

    return {
      totalDetectados,
      comisionPotencialCop,
      dossiersEnviados,
      exclusivasCerradas,
      promedioDiasEstancados,
    };
  }, [properties, config.commissionPercent]);

  return (
    <AppContext.Provider
      value={{
        properties,
        config,
        updatePropertyStatus,
        updatePropertyAnalysis,
        addProperty,
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
