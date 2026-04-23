"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type ToastKind = "success" | "error";

type Toast = {
  id: number;
  message: string;
  kind: ToastKind;
};

type ToastContextValue = {
  notify: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

type ToastProviderProps = Readonly<{
  children: ReactNode;
}>;

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, kind: ToastKind = "success") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, kind }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = toast.kind === "success" ? CheckCircle2 : XCircle;
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-lg ${
                toast.kind === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                  : "border-rose-200 bg-rose-50 text-rose-950"
              }`}
              role="status"
            >
              <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
