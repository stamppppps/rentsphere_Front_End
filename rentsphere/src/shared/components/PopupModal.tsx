import { useEffect, useRef } from "react";

type PopupType = "success" | "error" | "warning" | "confirm" | "info";

type PopupModalProps = {
  open: boolean;
  type?: PopupType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
};

const icons: Record<PopupType, string> = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  confirm: "❓",
  info: "ℹ️",
};

const colors: Record<PopupType, { bg: string; border: string; btn: string }> = {
  success: { bg: "bg-emerald-50", border: "border-emerald-200", btn: "bg-emerald-600 hover:bg-emerald-700" },
  error: { bg: "bg-rose-50", border: "border-rose-200", btn: "bg-rose-600 hover:bg-rose-700" },
  warning: { bg: "bg-amber-50", border: "border-amber-200", btn: "bg-amber-500 hover:bg-amber-600" },
  confirm: { bg: "bg-blue-50", border: "border-blue-200", btn: "bg-blue-600 hover:bg-blue-700" },
  info: { bg: "bg-blue-50", border: "border-blue-200", btn: "bg-blue-600 hover:bg-blue-700" },
};

export default function PopupModal({
  open,
  type = "info",
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  onClose,
}: PopupModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const c = colors[type];
  const isConfirm = type === "confirm";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* card */}
      <div
        className={`relative w-full max-w-sm rounded-2xl ${c.bg} border ${c.border} shadow-2xl overflow-hidden animate-[popIn_0.2s_ease-out]`}
        style={{ animation: "popIn 0.2s ease-out" }}
      >
        <div className="p-6 text-center">
          <div className="text-4xl mb-3">{icons[type]}</div>

          {title && (
            <div className="text-lg font-extrabold text-gray-900 mb-2">{title}</div>
          )}

          <div className="text-sm font-bold text-gray-700 whitespace-pre-line leading-relaxed">
            {message}
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center justify-center gap-3">
          {isConfirm && (
            <button
              type="button"
              onClick={() => { onCancel?.(); onClose(); }}
              className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-extrabold text-sm hover:bg-gray-50 transition"
            >
              {cancelText || "ยกเลิก"}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onConfirm?.();
              if (!isConfirm) onClose();
            }}
            className={`px-5 py-2.5 rounded-xl text-white font-extrabold text-sm shadow-lg transition ${c.btn}`}
          >
            {confirmText || (isConfirm ? "ยืนยัน" : "ตกลง")}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ---------- Hook for easy usage ---------- */
export type PopupState = {
  open: boolean;
  type: PopupType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export const defaultPopup: PopupState = {
  open: false,
  type: "info",
  message: "",
};
