import { X } from "lucide-react";
import Button from "./Button.jsx";

export default function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 px-4 py-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-panel p-4 shadow-glow sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-xl font-black leading-tight text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{message}</p>
          </div>
          <button
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 transition hover:bg-zinc-800"
            type="button"
            title={cancelLabel}
            onClick={onCancel}
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
