import React from "react";
import { ToastMessage } from "../types";
import { CheckCircle, Info, AlertTriangle, Coins, X } from "lucide-react";

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export default function Toast({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 bg-white border border-zinc-200 p-4 rounded-2xl shadow-xl animate-slide-in"
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === "success" && (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            )}
            {toast.type === "info" && <Info className="w-5 h-5 text-blue-500" />}
            {toast.type === "error" && (
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            )}
            {toast.type === "yield" && (
              <Coins className="w-5 h-5 text-amber-500 animate-bounce" />
            )}
          </div>
          <div className="flex-grow">
            <p className="text-xs font-medium text-zinc-900 leading-normal">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-zinc-400 hover:text-zinc-600 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
