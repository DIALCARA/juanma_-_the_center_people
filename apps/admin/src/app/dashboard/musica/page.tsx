"use client";

import { useState, useEffect } from "react";
import { get, post, put, del } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface Release {
  id: number;
  title: string;
  description: string;
  release_date: string;
  spotify_url: string;
  youtube_url: string;
  is_featured: boolean;
  is_visible: boolean;
  sort_order: number;
}

export default function MusicaPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editTarget, setEditTarget] = useState<Release | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // El endpoint admin devuelve el array directo en `data`, no envuelto en
    // {releases: [...]} como el público.
    get<{ data: Release[] }>("/api/admin/music")
      .then((res) => setReleases(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function openNew() {
    setEditTarget({
      id: 0, title: "", description: "", release_date: "", spotify_url: "", youtube_url: "", is_featured: false, is_visible: true, sort_order: releases.length,
    });
  }

  async function saveRelease(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    setAlert(null);
    try {
      if (editTarget.id === 0) {
        const res = await post<{ data: Release }>("/api/admin/music", editTarget);
        setReleases((r) => [...r, res.data]);
      } else {
        await put(`/api/admin/music/${editTarget.id}`, editTarget);
        setReleases((r) => r.map((x) => (x.id === editTarget.id ? editTarget : x)));
      }
      setAlert({ type: "success", message: "Lanzamiento guardado." });
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
      await del(`/api/admin/music/${deleteTarget}`);
      setReleases((r) => r.filter((x) => x.id !== deleteTarget));
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
        title="Música"
        action={<button onClick={openNew} className="btn-primary text-sm">+ Nuevo lanzamiento</button>}
      />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* FORMULARIO */}
      {editTarget && (
        <div className="card mb-6 max-w-2xl">
          <h2 className="text-sm font-semibold text-white mb-4">
            {editTarget.id === 0 ? "Nuevo lanzamiento" : "Editar lanzamiento"}
          </h2>
          <form onSubmit={saveRelease}>
            <FormField label="Título" htmlFor="rel-title" required>
              <input id="rel-title" className="input" value={editTarget.title} required onChange={(e) => setEditTarget({ ...editTarget, title: e.target.value })} />
            </FormField>
            <FormField label="Descripción" htmlFor="rel-desc">
              <textarea id="rel-desc" className="input" rows={3} value={editTarget.description} onChange={(e) => setEditTarget({ ...editTarget, description: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Fecha de lanzamiento" htmlFor="rel-date">
                <input id="rel-date" type="date" className="input" value={editTarget.release_date} onChange={(e) => setEditTarget({ ...editTarget, release_date: e.target.value })} />
              </FormField>
            </div>
            <FormField label="URL Spotify" htmlFor="rel-spotify">
              <input id="rel-spotify" type="url" className="input" value={editTarget.spotify_url} placeholder="https://open.spotify.com/..." onChange={(e) => setEditTarget({ ...editTarget, spotify_url: e.target.value })} />
            </FormField>
            <FormField label="URL YouTube" htmlFor="rel-youtube">
              <input id="rel-youtube" type="url" className="input" value={editTarget.youtube_url} placeholder="https://youtube.com/..." onChange={(e) => setEditTarget({ ...editTarget, youtube_url: e.target.value })} />
            </FormField>
            <div className="flex gap-6 mb-4">
              <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                <input type="checkbox" checked={editTarget.is_featured} onChange={(e) => setEditTarget({ ...editTarget, is_featured: e.target.checked })} className="accent-red-600" />
                Destacado
              </label>
              <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                <input type="checkbox" checked={editTarget.is_visible} onChange={(e) => setEditTarget({ ...editTarget, is_visible: e.target.checked })} className="accent-red-600" />
                Visible
              </label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? "Guardando..." : "Guardar"}</button>
              <button type="button" onClick={() => setEditTarget(null)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* LISTA */}
      <div className="space-y-3 max-w-2xl">
        {releases.map((r) => (
          <div key={r.id} className="card flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{r.title}</p>
              <p className="text-xs text-neutral-500">{r.release_date || "Sin fecha"}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {r.is_featured && <span className="badge-yellow">Destacado</span>}
              {!r.is_visible && <span className="badge-neutral">Oculto</span>}
              <button onClick={() => setEditTarget(r)} className="btn-ghost text-xs">Editar</button>
              <button onClick={() => setDeleteTarget(r.id)} className="text-xs text-red-500 hover:text-red-400">Eliminar</button>
            </div>
          </div>
        ))}
        {releases.length === 0 && (
          <p className="text-neutral-500 text-sm">No hay lanzamientos. Agregá el primero.</p>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message="¿Eliminás este lanzamiento? Esta acción no se puede deshacer."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  );
}
