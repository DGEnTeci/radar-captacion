"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none no-print">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isWarning = toast.type === "warning";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-sm border shadow-lg transition-all transform translate-y-0 ${
              isSuccess
                ? "bg-white border-[#C3DFD3] text-[#14171A]"
                : isWarning
                ? "bg-[#FDFBF7] border-[#DECBA0] text-[#14171A]"
                : "bg-white border-[#E6E1D8] text-[#14171A]"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#0F533E]" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-[#9E7D3B]" />}
              {!isSuccess && !isWarning && <Info className="w-5 h-5 text-[#3E4348]" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold tracking-tight text-[#14171A]">
                {toast.title}
              </p>
              {toast.description && (
                <p className="text-xs text-[#565C62] mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#939B9F] hover:text-[#14171A] p-0.5 transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
