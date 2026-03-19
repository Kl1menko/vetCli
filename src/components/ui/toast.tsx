"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastInput = Omit<ToastItem, "id">;

const listeners = new Set<(toasts: ToastItem[]) => void>();
let toastState: ToastItem[] = [];

function emit() {
  listeners.forEach((listener) => listener(toastState));
}

function removeToast(id: string) {
  toastState = toastState.filter((toast) => toast.id !== id);
  emit();
}

export function toast(input: ToastInput) {
  const id = crypto.randomUUID();
  toastState = [...toastState, { ...input, id }];
  emit();

  window.setTimeout(() => {
    removeToast(id);
  }, 4200);
}

export function ToastViewport() {
  const [toasts, setToasts] = useState<ToastItem[]>(toastState);

  useEffect(() => {
    listeners.add(setToasts);

    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={cn(
            "pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)] backdrop-blur animate-in fade-in-0 slide-in-from-bottom-2",
            item.variant === "success" && "border-emerald-200 bg-emerald-50/95 text-emerald-950",
            item.variant === "error" && "border-rose-200 bg-rose-50/95 text-rose-950",
            item.variant === "info" && "border-sky-200 bg-white/95 text-slate-950",
          )}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {item.variant === "success" ? (
                <CheckCircle2 className="size-4" />
              ) : item.variant === "error" ? (
                <CircleAlert className="size-4" />
              ) : (
                <CircleAlert className="size-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{item.title}</p>
              {item.description ? (
                <p className="mt-1 text-sm opacity-80">{item.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="rounded-md opacity-60 transition-opacity hover:opacity-100"
              aria-label="Закрити сповіщення"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
