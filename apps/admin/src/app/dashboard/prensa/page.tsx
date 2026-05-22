"use client";

import { useState, useEffect } from "react";
import { get, post, put, del } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface PressQuote {
  id: number;
  quote: string;
  author: string;
  media_name: string;
  url: string;
  quote_date: string;
  is_visible: boolean;
  sort_order: number;
}

const emptyQuote: PressQuote = {
  id: 0, quote: "", author: "", media_name: "", url: "", quote_date: "", is_visible: true, sort_order: 0,
};

export default function PrensaPage() {
  const [quotes, setQuotes] = useState<PressQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<PressQuote | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    get<{ data: PressQuote[] }>("/api/admin/press-quotes")
      .then((res) => setQuotes(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function saveQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    setAlert(null);
    try {
      if (editTarget.id === 0) {
        const res = await post<{ data: PressQuote }>("/api/admin/press-quotes", editTarget);
        setQuotes((q) => [...q, res.data]);
      } else {
        await put(`/api/admin/press-quotes/${editTarget.id}`, editTarget);
        setQuotes((q) => q.map((x) => (x.id === editTarget.id ? editTarget : x)));
      }
      setAlert({ type: "success", message: "Cita guardada." });
      setEditTarget(null);
    } catch {
      setAlert({ type: "error", message: "Error al guardar." });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/api/admin/press-quotes/${deleteTarget}`);
      setQuotes((q) => q.filter((x) => x.id !== deleteTarget));
    } catch {
      setAlert({ type: "error", message: "Error al eliminar." });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  if (loading) return <p className="text-neutral-500 text-sm">Cargando...</p>;

  return (
    <>
      <PageHeader
        title="Citas de prensa"
        action={<button onClick={() => setEditTarget({ ...emptyQuote, sort_order: quotes.length })} className="btn-primary text-sm">+ Nueva cita</button>}
      />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {editTarget && (
        <div className="card mb-6 max-w-2xl">
          <h2 className="text-sm font-semibold text-white mb-4">{editTarget.id === 0 ? "Nueva cita" : "Editar cita"}</h2>
          <form onSubmit={saveQuote}>
            <FormField label="Cita" htmlFor="q-quote" required>
              <textarea id="q-quote" className="input" rows={3} value={editTarget.quote} required
                onChange={(e) => setEditTarget({ ...editTarget, quote: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Autor" htmlFor="q-author" required>
                <input id="q-author" className="input" value={editTarget.author} required
                  onChange={(e) => setEditTarget({ ...editTarget, author: e.target.value })} />
              </FormField>
              <FormField label="Medio" htmlFor="q-media">
                <input id="q-media" className="input" value={editTarget.media_name}
                  onChange={(e) => setEditTarget({ ...editTarget, media_name: e.target.value })} />
              </FormField>
            </div>
            <FormField label="URL del artículo" htmlFor="q-url">
              <input id="q-url" type="url" className="input" value={editTarget.url} placeholder="https://"
                onChange={(e) => setEditTarget({ ...editTarget, url: e.target.value })} />
            </FormField>
            <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer mb-4">
              <input type="checkbox" checked={editTarget.is_visible} onChange={(e) => setEditTarget({ ...editTarget, is_visible: e.target.checked })} className="accent-red-600" />
              Visible
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? "Guardando..." : "Guardar"}</button>
              <button type="button" onClick={() => setEditTarget(null)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3 max-w-2xl">
        {quotes.map((q) => (
          <div key={q.id} className="card">
            <p className="text-sm text-neutral-300 italic mb-1">"{q.quote.substring(0, 100)}..."</p>
            <p className="text-xs text-neutral-500">{q.author}{q.media_name && ` — ${q.media_name}`}</p>
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setEditTarget(q)} className="btn-ghost text-xs">Editar</button>
              <button onClick={() => setDeleteTarget(q.id)} className="text-xs text-red-500 hover:text-red-400">Eliminar</button>
            </div>
          </div>
        ))}
        {quotes.length === 0 && <p className="text-neutral-500 text-sm">No hay citas. Agregá la primera.</p>}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message="¿Eliminás esta cita? Esta acción no se puede deshacer."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  );
}
