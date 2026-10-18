"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { X, Eye, EyeOff, ShieldCheck, KeyRound, Building2, Percent, Cpu } from "lucide-react";

interface ConfigModalProps {
  onClose: () => void;
}

const MODEL_PRESETS = [
  { id: "openai/gpt-4o-mini", label: "OpenAI: GPT-4o Mini (Recomendado y veloz)" },
  { id: "anthropic/claude-3.5-haiku", label: "Anthropic: Claude 3.5 Haiku" },
  { id: "meta-llama/llama-3.3-70b-instruct", label: "Meta: Llama 3.3 70B Instruct" },
  { id: "google/gemini-2.5-flash", label: "Google: Gemini 2.5 Flash" },
];

export function ConfigModal({ onClose }: ConfigModalProps) {
  const { config, updateConfig } = useApp();

  const [agencyName, setAgencyName] = useState(config.agencyName || "");
  const [agentName, setAgentName] = useState(config.agentName || "");
  const [agentRole, setAgentRole] = useState(config.agentRole || "");
  const [agencyPhone, setAgencyPhone] = useState(config.agencyPhone || "");
  const [commissionPercent, setCommissionPercent] = useState(config.commissionPercent.toString());
  const [openRouterModel, setOpenRouterModel] = useState(config.openRouterModel);
  const [customModel, setCustomModel] = useState("");
  const [isCustomModel, setIsCustomModel] = useState(!MODEL_PRESETS.some((m) => m.id === config.openRouterModel));
  const [openRouterApiKey, setOpenRouterApiKey] = useState(config.openRouterApiKey);
  const [showKey, setShowKey] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalModel = isCustomModel ? customModel.trim() || "openai/gpt-4o-mini" : openRouterModel;
    const finalComm = parseFloat(commissionPercent.replace(",", ".")) || 3.5;

    updateConfig({
      agencyName: agencyName.trim(),
      agentName: agentName.trim(),
      agentRole: agentRole.trim(),
      agencyPhone: agencyPhone.trim(),
      commissionPercent: finalComm,
      openRouterModel: finalModel,
      openRouterApiKey: openRouterApiKey.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs config-modal-backdrop">
      <div className="bg-[#FFFFFF] border border-[#E6E1D8] rounded-sm max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#828A91] hover:text-[#14171A] p-1 transition-colors"
          aria-label="Cerrar modal de configuración"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-[#9E7D3B] font-semibold mb-1">
            <Building2 className="w-4 h-4" />
            <span>Ajustes Institucionales</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#14171A] tracking-tight">
            Configuración de la Agencia
          </h2>
          <p className="text-xs text-[#687076] mt-1">
            Personalice los datos de su firma inmobiliaria, porcentajes comerciales y conexión con el motor de IA. Si deja campos vacíos, se emplearán fórmulas neutras como &ldquo;su asesor inmobiliario&rdquo;.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1.5">
                Nombre de la Agencia
              </label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="Ej. Inmobiliaria Élite"
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] focus:bg-white text-[#14171A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1.5">
                Nombre del Asesor
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Ej. Carlos Mendoza"
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] focus:bg-white text-[#14171A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1.5">
                Cargo del Asesor
              </label>
              <input
                type="text"
                value={agentRole}
                onChange={(e) => setAgentRole(e.target.value)}
                placeholder="Ej. Consultor Patrimonial"
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] focus:bg-white text-[#14171A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1.5">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={agencyPhone}
                onChange={(e) => setAgencyPhone(e.target.value)}
                placeholder="Ej. +57 300 123 4567"
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] focus:bg-white text-[#14171A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Comisión de Captación en Exclusiva (%)</span>
              <span className="text-[11px] font-mono text-[#0F533E] font-medium lowercase">habitual en Colombia: 3% a 4%</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(e.target.value)}
                placeholder="3.5"
                className="w-full px-3 py-2 pl-9 text-sm font-mono bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] focus:bg-white text-[#14171A]"
                required
              />
              <Percent className="w-4 h-4 text-[#828A91] absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="pt-2 border-t border-[#EFECE6]">
            <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#0F533E]" />
              <span>Modelo de Lenguaje (OpenRouter)</span>
            </label>

            {!isCustomModel ? (
              <div className="space-y-2">
                <select
                  value={openRouterModel}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setIsCustomModel(true);
                      setCustomModel(openRouterModel);
                    } else {
                      setOpenRouterModel(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] focus:bg-white text-[#14171A]"
                >
                  {MODEL_PRESETS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                  <option value="custom">Otro modelo personalizado...</option>
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="ej. anthropic/claude-3-sonnet"
                  className="w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] focus:bg-white text-[#14171A]"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomModel(false)}
                  className="text-xs text-[#0F533E] hover:underline cursor-pointer"
                >
                  Volver a la lista de modelos predefinidos
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#23272B] uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#9E7D3B]" />
                <span>Clave API de OpenRouter (Opcional)</span>
              </span>
              <span className="text-[11px] font-normal text-[#828A91]">Clave de acceso OpenRouter</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={openRouterApiKey}
                onChange={(e) => setOpenRouterApiKey(e.target.value)}
                placeholder="Si se deja vacía, el sistema usa el motor heurístico local"
                className="w-full px-3 py-2 pr-10 text-xs font-mono bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] focus:bg-white text-[#14171A]"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-[#828A91] hover:text-[#14171A] p-0.5"
                aria-label={showKey ? "Ocultar clave" : "Mostrar clave"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="mt-2 p-2.5 bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0F533E] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#565C62] leading-relaxed">
                <strong className="font-semibold text-[#14171A]">Privacidad garantizada:</strong> La clave se almacena exclusivamente en este navegador (localStorage) y nunca se guarda en bases de datos externas ni se expone a terceros. Si no introduce clave, el motor local operará de forma determinista y continua.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#EFECE6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[#565C62] hover:text-[#14171A] bg-transparent transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs uppercase tracking-wider font-semibold text-white bg-[#0F533E] hover:bg-[#0A3C2D] rounded-sm transition-colors shadow-sm cursor-pointer"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
