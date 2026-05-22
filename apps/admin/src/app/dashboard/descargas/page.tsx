"use client";

import { useState, useEffect, useRef } from "react";
import { get, post, put, del, upload } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import MediaPicker from "@/components/ui/MediaPicker";

interface DownloadAsset {
  id: number;
  title: string;
  description: string;
  file_url: string;
  access_type: "public" | "request_required" | "private";
  is_visible: boolean;
  expires_in_days: number | null;
  sort_order: number;
}

const emptyAsset: DownloadAsset = {
  id: 0, title: "", description: "", file_url: "", access_type: "public", is_visible: true, expires_in_days: null, sort_order: 0,
};

export default function DescargasPage() {
  const [assets, setAssets] = useState<DownloadAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<DownloadAsset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    get<{ data: DownloadAsset[] }>("/api/admin/download-assets")
      .then((res) => setAssets(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editTarget) return;
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      const res = await upload<{ data: { file_url: string } }>("/api/admin/download-assets/upload", fd);
      setEditTarget({ ...editTarget, file_url: res.data.file_url });
    } catch {
      setAlert({ type: "error", message: "Error al subir archivo." });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function saveAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    setAlert(null);
    try {
      if (editTarget.id === 0) {
        const res = await post<{ data: DownloadAsset }>("/api/admin/download-assets", editTarget);
        setAssets((a) => [...a, res.data]);
      } else {
        await put(`/api/admin/download-assets/${editTarget.id}`, editTarget);
        setAssets((a) => a.map((x) => (x.id === editTarget.id ? editTarget : x)));
      }
      setAlert({ type: "success", message: "Descarga guardada." });
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
      await del(`/api/admin/download-assets/${deleteTarget}`);
      setAssets((a) => a.filter((x) => x.id !== deleteTarget));
    } catch {
      setAlert({ type: "error", message: "Error al eliminar." });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const accessLabels = { public: "Público", request_required: "Con solicitud", private: "Privado" };

  if (loading) return <p className="text-neutral-500 text-sm">Cargando...</p>;

  return (
    <>
      <PageHeader
        title="Descargas"
        action={<button onClick={() => setEditTarget({ ...emptyAsset, sort_order: assets.length })} className="btn-primary text-sm">+ Nueva descarga</button>}
      />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {editTarget && (
        <div className="card mb-6 max-w-2xl">
          <h2 className="text-sm font-semibold text-white mb-4">{editTarget.id === 0 ? "Nueva descarga" : "Editar descarga"}</h2>
          <form onSubmit={saveAsset}>
            <FormField label="Título" htmlFor="dl-title" required>
              <input id="dl-title" className="input" value={editTarget.title} required
                onChange={(e) => setEditTarget({ ...editTarget, title: e.target.value })} />
            </FormField>
            <FormField label="Descripción" htmlFor="dl-desc">
              <textarea id="dl-desc" className="input" rows={2} value={editTarget.description}
                onChange={(e) => setEditTarget({ ...editTarget, description: e.target.value })} />
            </FormField>
            <FormField label="Tipo de acceso" htmlFor="dl-access">
              <select id="dl-access" className="input" value={editTarget.access_type}
                onChange={(e) => setEditTarget({ ...editTarget, access_type: e.target.value as DownloadAsset["access_type"] })}>
                <option value="public">Público (descarga directa)</option>
                <option value="request_required">Con solicitud (aprobación manual)</option>
                <option value="private">Privado (solo admin)</option>
              </select>
            </FormField>
            <div className="mb-4">
              <label className="label">Archivo</label>
              <div className="flex items-center gap-2 flex-wrap">
                <label className="btn-secondary text-xs cursor-pointer">
                  {uploading ? "Subiendo..." : "Subir archivo"}
                  <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="btn-secondary text-xs"
                  disabled={uploading}
                >
                  Elegir de la galería
                </button>
                {editTarget.file_url && (
                  <span className="text-xs text-green-400 truncate max-w-48">✓ {editTarget.file_url.split("/").pop()}</span>
                )}
              </div>
              <p className="text-[10px] text-neutral-600 mt-1">
                Podés subir un archivo nuevo o reutilizar una imagen del módulo Multimedia.
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer mb-4">
              <input type="checkbox" checked={editTarget.is_visible} onChange={(e) => setEditTarget({ ...editTarget, is_visible: e.target.checked })} className="accent-red-600" />
              Visible
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={saving || uploading} className="btn-primary">{saving ? "Guardando..." : "Guardar"}</button>
              <button type="button" onClick={() => setEditTarget(null)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3 max-w-2xl">
        {assets.map((a) => (
          <div key={a.id} className="card flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{a.title}</p>
              <p className="text-xs text-neutral-500">{accessLabels[a.access_type]}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!a.is_visible && <span className="badge-neutral">Oculto</span>}
              <button onClick={() => setEditTarget(a)} className="btn-ghost text-xs">Editar</button>
              <button onClick={() => setDeleteTarget(a.id)} className="text-xs text-red-500 hover:text-red-400">Eliminar</button>
            </div>
          </div>
        ))}
        {assets.length === 0 && <p className="text-neutral-500 text-sm">No hay descargas. Agregá la primera.</p>}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message="¿Eliminás esta descarga? Esta acción no se puede deshacer."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {showPicker && editTarget && (
        <MediaPicker
          typeSlug="image"
          title="Elegir archivo de la galería"
          onSelect={(media) => {
            setEditTarget({ ...editTarget, file_url: media.file_url });
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
