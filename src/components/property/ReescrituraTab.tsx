"use client";

import React, { useState } from "react";
import { Property } from "@/types/property";
import { useApp } from "@/context/AppContext";
import {
  Copy,
  ExternalLink,
  PhoneCall,
  MessageSquare,
  Check,
  ShieldCheck,
  Sparkles,
  HelpCircle,
} from "lucide-react";

interface ReescrituraTabProps {
  property: Property;
}

export function ReescrituraTab({ property }: ReescrituraTabProps) {
  const { config, addToast } = useApp();
  const contactKit = property.analysis.contactKit;
  const optimized = property.analysis.optimizedListing;

  const activeAgency = config.agencyName?.trim() || "su agencia inmobiliaria";
  const activeAgent = config.agentName?.trim() || "su asesor inmobiliario";
  const activeRole = config.agentRole?.trim() ? ` (${config.agentRole.trim()})` : "";
  const activePhone = config.agencyPhone?.trim() ? ` (contacto: ${config.agencyPhone.trim()})` : "";

  const [whatsappMessage, setWhatsappMessage] = useState(() => {
    let msg = contactKit.whatsappIcebreaker;
    msg = msg.replace(/Inmobiliaria Singular/g, activeAgency);
    msg = msg.replace(/Consultor Patrimonial/g, `${activeAgent}${activeRole}`);
    if (activePhone && !msg.includes(config.agencyPhone.trim())) {
      msg = msg.replace(activeAgency, `${activeAgency}${activePhone}`);
    }
    return msg;
  });
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, sectionKey: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionKey);
      addToast({
        type: "success",
        title: "Texto copiado al portapapeles",
        description: `${label} listo para ser utilizado en su gestión.`,
      });
      setTimeout(() => setCopiedSection(null), 3000);
    } catch {
      addToast({
        type: "warning",
        title: "No fue posible copiar",
        description: "Por favor seleccione el texto manualmente.",
      });
    }
  };

  // Format Colombian phone number for wa.me:
  // Strip non-digits; if 10 digits (e.g. 3001234567), prepend 57.
  // If already starts with 57 and has 12 digits, keep as is.
  const rawDigits = (property.ownerPhone || "").replace(/[^0-9]/g, "");
  let formattedPhone = "";
  if (rawDigits.length === 10) {
    formattedPhone = `57${rawDigits}`;
  } else if (rawDigits.length === 12 && rawDigits.startsWith("57")) {
    formattedPhone = rawDigits;
  } else if (rawDigits.length > 0) {
    formattedPhone = rawDigits;
  }

  const hasValidPhone = Boolean(formattedPhone && formattedPhone.length >= 10);
  const encodedWaText = encodeURIComponent(whatsappMessage);
  const waUrl = hasValidPhone ? `https://wa.me/${formattedPhone}?text=${encodedWaText}` : "#";

  return (
    <div className="space-y-8">
      {/* 1. Before vs After: Listing Comparison */}
      <section className="bg-white border border-[#E6E1D8] p-6 sm:p-8 rounded-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-[#EFECE6]">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-[#0F533E] font-semibold">
              Optimización Editorial
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#14171A] tracking-tight mt-1">
              Contraste: Anuncio Original frente a Propuesta Profesional
            </h2>
            <p className="text-xs text-[#565C62] mt-1">
              Transformación del texto publicado por el propietario particular en una pieza de alta conversión adaptada a portales inmobiliarios colombianos.
            </p>
          </div>

          <button
            onClick={() =>
              copyToClipboard(
                `${optimized.headline}\n\n${optimized.description}`,
                "listing",
                "Anuncio profesional optimizado"
              )
            }
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#0F533E] bg-[#EBF5F0] hover:bg-[#D7EBDD] border border-[#C3DFD3] rounded-sm transition-colors cursor-pointer"
          >
            {copiedSection === "listing" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Anuncio Optimizado</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Before: Poor owner listing */}
          <div className="bg-[#FAF8F5] border border-[#E6E1D8] p-5 rounded-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#EFECE6]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E7D3B] font-semibold">
                  Versión Original del Particular
                </span>
                <span className="text-[10px] font-mono text-[#828A91]">
                  Portal: {property.sourcePortal}
                </span>
              </div>
              <p className="text-xs text-[#565C62] italic leading-relaxed whitespace-pre-line font-mono bg-white p-3.5 border border-[#E6E1D8] rounded-xs">
                &ldquo;{property.originalListingText}&rdquo;
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EFECE6] text-[11px] text-[#828A91] space-y-1">
              <p>Fallas evidentes: carencia de estructura narrativa, sin detalle de valorización, lenguaje telegráfico y defensivo.</p>
            </div>
          </div>

          {/* After: Professional Luxury Listing */}
          <div className="bg-white border-2 border-[#C3DFD3] p-5 rounded-sm flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#C3DFD3]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0F533E] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Propuesta Editorial Optimizada</span>
                </span>
                <span className="text-[10px] font-mono text-[#0F533E] font-medium">
                  Listo para Portales
                </span>
              </div>

              <h4 className="font-serif text-base font-bold text-[#14171A] mb-2 leading-snug">
                {optimized.headline}
              </h4>
              <p className="text-xs text-[#23272B] leading-relaxed whitespace-pre-line">
                {optimized.description}
              </p>

              {/* Highlights */}
              <div className="mt-4 pt-3 border-t border-[#EFECE6]">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#687076] font-semibold block mb-1.5">
                  Puntos Destacados
                </span>
                <ul className="space-y-1">
                  {optimized.highlights.map((h, i) => (
                    <li key={i} className="text-xs text-[#565C62] flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F533E] mt-1.5 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EFECE6] flex items-center justify-between text-[11px] font-mono text-[#0F533E]">
              <span>Formato validado para Metrocuadrado y Fincaraiz</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WhatsApp Icebreaker & Calling Script */}
      <section className="bg-white border border-[#E6E1D8] p-6 sm:p-8 rounded-sm">
        <div className="mb-6 pb-5 border-b border-[#EFECE6]">
          <span className="text-xs uppercase font-mono tracking-widest text-[#0F533E] font-semibold">
            Kit de Primer Contacto Sin Fricción
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#14171A] tracking-tight mt-1">
            Mensaje Rompehielos para WhatsApp y Guión de Llamada
          </h2>
          <p className="text-xs text-[#565C62] mt-1">
            Estrategia de prospección ética: aporte valor entregando el estudio técnico de mercado en PDF antes de solicitar una reunión o captación.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* WhatsApp Message Panel (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#23272B] flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#0F533E]" />
                <span>Mensaje WhatsApp (Editable)</span>
              </label>
              <span className="text-xs font-mono text-[#565C62]">
                Propietario: {property.ownerName} ({property.ownerPhone})
              </span>
            </div>

            <textarea
              rows={9}
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              className="w-full p-4 text-xs leading-relaxed font-sans bg-[#FAF8F5] border border-[#E6E1D8] rounded-sm focus:outline-none focus:border-[#0F533E] focus:bg-white text-[#14171A]"
            />

            {/* Ethical Notice Badge */}
            <div className="p-3 bg-[#EBF5F0] border border-[#C3DFD3] rounded-sm flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#0F533E] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#0F533E] leading-relaxed">
                <strong>Principios de Captación Honesta:</strong> Identificación transparente de la agencia, sin simular ser un comprador ficticio, sin inventar urgencias artificiales y ofreciendo el dossier en PDF como regalo de valor informativo.
              </p>
            </div>

            {/* Actions for WhatsApp */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() =>
                  copyToClipboard(whatsappMessage, "whatsapp", "Mensaje de WhatsApp")
                }
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#14171A] bg-[#FFFFFF] border border-[#E6E1D8] hover:border-[#14171A] rounded-sm transition-colors cursor-pointer"
              >
                {copiedSection === "whatsapp" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#0F533E]" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Mensaje</span>
                  </>
                )}
              </button>

              {hasValidPhone ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#0F533E] hover:bg-[#0A3C2D] rounded-sm transition-colors shadow-xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir en WhatsApp Web (+{formattedPhone})</span>
                </a>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#828A91] bg-[#F1EFEA] border border-[#E6E1D8] rounded-sm cursor-not-allowed opacity-75"
                    title="Número de contacto no disponible o formato inválido"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>WhatsApp no disponible</span>
                  </button>
                  <span className="text-[11px] text-[#A3382D] font-medium">
                    Número de contacto no disponible para este propietario
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Call Script (5 cols) */}
          <div className="lg:col-span-5 bg-[#FAF8F5] border border-[#E6E1D8] p-5 rounded-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E6E1D8]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#14171A] flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-[#9E7D3B]" />
                  <span>Guión de Llamada Telefónica</span>
                </span>
                <span className="text-[10px] font-mono text-[#828A91]">Duración: 2 min</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-mono text-[10px] uppercase text-[#687076] font-semibold block">
                    1. Saludo y Validación de Tiempo
                  </span>
                  <p className="text-[#23272B] italic mt-0.5">
                    &ldquo;{contactKit.callScript.greeting.replace(/Inmobiliaria Singular/g, activeAgency).replace(/Consultor Patrimonial/g, activeAgent)}&rdquo;
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase text-[#687076] font-semibold block">
                    2. Gancho Directo
                  </span>
                  <p className="text-[#23272B] italic mt-0.5">
                    &ldquo;{contactKit.callScript.hook}&rdquo;
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase text-[#687076] font-semibold block">
                    3. Propuesta de Valor Técnico
                  </span>
                  <p className="text-[#23272B] italic mt-0.5">
                    &ldquo;{contactKit.callScript.valueOffer}&rdquo;
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[10px] uppercase text-[#687076] font-semibold block">
                    4. Llamado a la Acción Sin Presión
                  </span>
                  <p className="text-[#23272B] italic mt-0.5 font-medium text-[#0F533E]">
                    &ldquo;{contactKit.callScript.callToAction}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E6E1D8] flex items-center justify-between">
              <button
                onClick={() => {
                  const greeting = contactKit.callScript.greeting.replace(/Inmobiliaria Singular/g, activeAgency).replace(/Consultor Patrimonial/g, activeAgent);
                  copyToClipboard(
                    `${greeting}\n\n${contactKit.callScript.hook}\n\n${contactKit.callScript.valueOffer}\n\n${contactKit.callScript.callToAction}`,
                    "script",
                    "Guión de llamada"
                  );
                }}
                className="text-[11px] text-[#0F533E] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Copy className="w-3 h-3" />
                <span>Copiar guión completo</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three Objection Handling Cards */}
      <section className="bg-white border border-[#E6E1D8] p-6 sm:p-8 rounded-sm">
        <div className="mb-6 pb-5 border-b border-[#EFECE6]">
          <span className="text-xs uppercase font-mono tracking-widest text-[#9E7D3B] font-semibold">
            Manejo de Objeciones Comerciales
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#14171A] tracking-tight mt-1">
            Respuestas Estratégicas a las 3 Barreras del Particular
          </h2>
          <p className="text-xs text-[#565C62] mt-1">
            Argumentación sólida basada en datos de mercado, diseñada para desactivar la resistencia habitual de los propietarios en Colombia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Objection 1: No quiero agencias */}
          <div className="bg-[#FAF8F5] border border-[#E6E1D8] p-5 rounded-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-[#9E7D3B] shrink-0" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#687076] font-semibold">
                  Objeción 1
                </span>
              </div>
              <h4 className="font-serif text-base font-bold text-[#14171A] mb-3 leading-snug">
                &ldquo;{contactKit.objectionReplies.noAgencias.objection}&rdquo;
              </h4>
              <p className="text-xs text-[#23272B] leading-relaxed mb-4">
                {contactKit.objectionReplies.noAgencias.response}
              </p>
            </div>

            <div className="pt-3 border-t border-[#EFECE6]">
              <span className="text-[10px] uppercase font-mono text-[#0F533E] font-semibold block">
                Clave psicológica:
              </span>
              <p className="text-[11px] text-[#565C62] mt-0.5">
                {contactKit.objectionReplies.noAgencias.keyInsight}
              </p>
            </div>
          </div>

          {/* Objection 2: Ya me llaman 20 inmobiliarias */}
          <div className="bg-[#FAF8F5] border border-[#E6E1D8] p-5 rounded-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-[#9E7D3B] shrink-0" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#687076] font-semibold">
                  Objeción 2
                </span>
              </div>
              <h4 className="font-serif text-base font-bold text-[#14171A] mb-3 leading-snug">
                &ldquo;{contactKit.objectionReplies.muchasLlamadas.objection}&rdquo;
              </h4>
              <p className="text-xs text-[#23272B] leading-relaxed mb-4">
                {contactKit.objectionReplies.muchasLlamadas.response}
              </p>
            </div>

            <div className="pt-3 border-t border-[#EFECE6]">
              <span className="text-[10px] uppercase font-mono text-[#0F533E] font-semibold block">
                Clave psicológica:
              </span>
              <p className="text-[11px] text-[#565C62] mt-0.5">
                {contactKit.objectionReplies.muchasLlamadas.keyInsight}
              </p>
            </div>
          </div>

          {/* Objection 3: No quiero pagar comisión */}
          <div className="bg-[#FAF8F5] border border-[#E6E1D8] p-5 rounded-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-[#9E7D3B] shrink-0" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#687076] font-semibold">
                  Objeción 3
                </span>
              </div>
              <h4 className="font-serif text-base font-bold text-[#14171A] mb-3 leading-snug">
                &ldquo;{contactKit.objectionReplies.noComision.objection}&rdquo;
              </h4>
              <p className="text-xs text-[#23272B] leading-relaxed mb-4">
                {contactKit.objectionReplies.noComision.response}
              </p>
            </div>

            <div className="pt-3 border-t border-[#EFECE6]">
              <span className="text-[10px] uppercase font-mono text-[#0F533E] font-semibold block">
                Clave psicológica:
              </span>
              <p className="text-[11px] text-[#565C62] mt-0.5">
                {contactKit.objectionReplies.noComision.keyInsight}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
