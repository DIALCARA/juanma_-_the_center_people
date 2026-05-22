"use client";

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({ message, onConfirm, onCancel, loading }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-neutral-900 border border-neutral-700 p-6 max-w-sm w-full">
        <p className="text-sm text-neutral-200 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary" disabled={loading}>
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn-danger" disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
