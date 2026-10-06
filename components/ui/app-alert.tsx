"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle, CheckCircle2, Info, Trash2, X } from "lucide-react";

type AlertTone = "info" | "success" | "warning" | "danger";
type AlertRequest = {
  mode: "alert" | "confirm";
  title: string;
  message: string;
  tone: AlertTone;
  confirmLabel: string;
  cancelLabel: string;
};

type AppAlertContextValue = {
  notify: (message: string, options?: Partial<Omit<AlertRequest, "mode" | "message">>) => Promise<void>;
  ask: (message: string, options?: Partial<Omit<AlertRequest, "mode" | "message">>) => Promise<boolean>;
};

const AppAlertContext = createContext<AppAlertContextValue | null>(null);

const toneStyles: Record<AlertTone, { icon: typeof Info; iconClass: string; buttonClass: string }> = {
  info: { icon: Info, iconClass: "bg-sky-100 text-sky-700", buttonClass: "bg-zinc-900 hover:bg-zinc-800" },
  success: { icon: CheckCircle2, iconClass: "bg-emerald-100 text-emerald-700", buttonClass: "bg-emerald-700 hover:bg-emerald-800" },
  warning: { icon: AlertTriangle, iconClass: "bg-amber-100 text-amber-700", buttonClass: "bg-amber-600 hover:bg-amber-700" },
  danger: { icon: Trash2, iconClass: "bg-rose-100 text-rose-700", buttonClass: "bg-rose-600 hover:bg-rose-700" },
};

export function AppAlertProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<AlertRequest | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const open = useCallback((next: AlertRequest) => new Promise<boolean>((resolve) => {
    resolver.current = resolve;
    setRequest(next);
  }), []);

  const settle = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setRequest(null);
  }, []);

  const notify = useCallback(async (message: string, options: Partial<Omit<AlertRequest, "mode" | "message">> = {}) => {
    await open({ mode: "alert", title: options.title || "Perhatian", message, tone: options.tone || "info", confirmLabel: options.confirmLabel || "Mengerti", cancelLabel: "" });
  }, [open]);

  const ask = useCallback((message: string, options: Partial<Omit<AlertRequest, "mode" | "message">> = {}) => open({
    mode: "confirm",
    title: options.title || "Konfirmasi tindakan",
    message,
    tone: options.tone || "warning",
    confirmLabel: options.confirmLabel || "Lanjutkan",
    cancelLabel: options.cancelLabel || "Batal",
  }), [open]);

  const style = toneStyles[request?.tone || "info"];
  const Icon = style.icon;

  return <AppAlertContext.Provider value={{ notify, ask }}>
    {children}
    <DialogPrimitive.Root open={Boolean(request)} onOpenChange={(isOpen) => { if (!isOpen && request) settle(false); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-zinc-950/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.3)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          {request && <>
            <div className="p-6 pb-5 sm:p-7 sm:pb-6">
              <div className="flex items-start gap-4">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.iconClass}`}><Icon className="h-6 w-6" /></span>
                <div className="min-w-0 flex-1"><DialogPrimitive.Title className="pr-7 text-lg font-black tracking-tight text-zinc-950">{request.title}</DialogPrimitive.Title><DialogPrimitive.Description className="mt-2 text-sm leading-6 text-zinc-600">{request.message}</DialogPrimitive.Description></div>
                <DialogPrimitive.Close aria-label="Tutup" className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"><X className="h-4 w-4" /></DialogPrimitive.Close>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/80 p-4 sm:flex-row sm:justify-end">
              {request.mode === "confirm" && <button type="button" onClick={() => settle(false)} className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-600 transition hover:bg-zinc-100">{request.cancelLabel}</button>}
              <button type="button" onClick={() => settle(true)} className={`rounded-xl px-5 py-2.5 text-sm font-black text-white shadow-sm transition ${style.buttonClass}`}>{request.confirmLabel}</button>
            </div>
          </>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  </AppAlertContext.Provider>;
}

export function useAppAlert() {
  const context = useContext(AppAlertContext);
  if (!context) throw new Error("useAppAlert harus digunakan di dalam AppAlertProvider");
  return context;
}
