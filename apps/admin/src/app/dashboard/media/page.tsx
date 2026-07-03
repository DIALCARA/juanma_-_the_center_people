"use client";

import { useState, useEffect, useRef } from "react";
import { get, del, upload, post, put } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface MediaType {
  id: number;
  name: string;
  slug: string;
}

interface MediaCategory {
  id: number;
  name: string;
  slug: string;
  media_type_id: number;
}

interface MediaItem {
  id: number;
  title: string;
  thumbnail_url: string;
  file_url: string;
  mime_type: string;
  media_type_id: number;
  category_id: number;
  is_featured: boolean;
  is_visible: boolean;
  created_at: string;
}

type UploadTab = "single" | "zip" | "video";

export default function MediaPage() {
  const [types, setTypes] = useState<MediaType[]>([]);
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | "">("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadTab, setUploadTab] = useState<UploadTab>("single");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const singleRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      get<{ data: MediaType[] }>("/api/admin/media/types"),
      get<{ data: MediaCategory[] }>("/api/admin/media/categories"),
    ])
      .then(([t, c]) => {
        setTypes(t.data);
        setCategories(c.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedTypeId) params.set("type_id", String(selectedTypeId));
    if (selectedCategoryId) params.set("category_id", String(selectedCategoryId));
    get<{ data: { items: MediaItem[]; total: number } }>(`/api/admin/media?${params}`)
      .then((res) => setItems(res.data?.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [selectedTypeId, selectedCategoryId]);

  // Si no hay tipo, no hay categorías visibles (no las mezclamos entre tipos).
  const filteredCategories = selectedTypeId
    ? categories.filter((c) => c.media_type_id === selectedTypeId)
    : [];

  const selectedTypeSlug = types.find((t) => t.id === selectedTypeId)?.slug ?? null;
  const isImageType = selectedTypeSlug === "image";
  const isVideoOrReel = selectedTypeSlug === "video" || selectedTypeSlug === "reel";

  // Tab por defecto cuando cambia el tipo seleccionado
  useEffect(() => {
    if (isVideoOrReel) setUploadTab("video");
    else if (isImageType && uploadTab === "video") setUploadTab("single");
  }, [selectedTypeSlug]);

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    // El backend espera media_type_slug (string), no media_type_id.
    if (selectedTypeSlug) fd.append("media_type_slug", selectedTypeSlug);
    if (selectedCategoryId) fd.append("category_id", String(selectedCategoryId));
    const res = await upload<{ data: MediaItem }>("/api/admin/media/upload", fd);
    return res.data;
  }

  async function uploadMany(files: FileList | File[]) {
    setUploading(true);
    setAlert(null);
    let ok = 0;
    const errors: string[] = [];
    for (const f of Array.from(files)) {
      try {
        const item = await uploadFile(f);
        setItems((curr) => [item, ...curr]);
        ok++;
      } catch (err: unknown) {
        errors.push(`${f.name}: ${err instanceof Error ? err.message : "error"}`);
      }
    }
    setUploading(false);
    if (errors.length === 0) {
      setAlert({ type: "success", message: `${ok} archivo${ok === 1 ? "" : "s"} subido${ok === 1 ? "" : "s"} correctamente.` });
    } else {
      setAlert({ type: "error", message: `${ok} subido(s), ${errors.length} con error. Primer error: ${errors[0]}` });
    }
  }

  const [dragOver, setDragOver] = useState(false);

  async function handleSingleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    await uploadMany(files);
    if (singleRef.current) singleRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (!selectedTypeId) {
      setAlert({ type: "error", message: "Seleccioná un tipo antes de soltar archivos." });
      return;
    }
    if (!isImageType) {
      setAlert({ type: "error", message: "Drag & drop solo soporta imágenes." });
      return;
    }
    const files = e.dataTransfer.files;
    if (!files?.length) return;

    // Si es un solo archivo y es ZIP, mandarlo al endpoint de ZIP
    if (files.length === 1 && files[0].name.toLowerCase().endsWith(".zip")) {
      handleZipFile(files[0]);
      return;
    }
    // Si son imágenes (una o varias), subirlas en batch
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      setAlert({ type: "error", message: "Solo se aceptan imágenes o un ZIP con imágenes." });
      return;
    }
    uploadMany(imageFiles);
  }

  async function handleZipFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    // El backend espera media_type_slug (string), no media_type_id.
    if (selectedTypeSlug) fd.append("media_type_slug", selectedTypeSlug);
    if (selectedCategoryId) fd.append("category_id", String(selectedCategoryId));
    setUploading(true);
    setAlert(null);
    try {
      const res = await upload<{ data: { imported: number } }>("/api/admin/media/import/zip", fd);
      setAlert({ type: "success", message: `ZIP importado: ${res.data.imported} imágenes procesadas.` });
      const params = new URLSearchParams();
      if (selectedTypeId) params.set("type_id", String(selectedTypeId));
      if (selectedCategoryId) params.set("category_id", String(selectedCategoryId));
      const refreshed = await get<{ data: { items: MediaItem[] } }>(`/api/admin/media?${params}`);
      setItems(refreshed.data?.items ?? []);
    } catch (err: unknown) {
      setAlert({ type: "error", message: err instanceof Error ? err.message : "Error al importar ZIP." });
    } finally {
      setUploading(false);
    }
  }

  async function handleZipUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    await handleZipFile(files[0]);
    if (zipRef.current) zipRef.current.value = "";
  }

  async function handleVideoAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!videoUrl) return;
    setUploading(true);
    setAlert(null);
    try {
      // El backend espera media_type_slug (string), no media_type_id (number).
      // Sin esto siempre quedaba guardado como "video" aunque eligieras "reel".
      const res = await post<{ data: MediaItem }>("/api/admin/media/video", {
        source_url: videoUrl,
        title: videoTitle,
        media_type_slug: selectedTypeSlug || "video",
        category_id: selectedCategoryId || undefined,
      });
      setItems((i) => [res.data, ...i]);
      setAlert({ type: "success", message: "Video agregado correctamente." });
      setVideoUrl("");
      setVideoTitle("");
    } catch (err: unknown) {
      setAlert({ type: "error", message: err instanceof Error ? err.message : "Error al agregar video." });
    } finally {
      setUploading(false);
    }
  }

  async function toggleFeatured(item: MediaItem) {
    const next = !item.is_featured;
    try {
      await put(`/api/admin/media/${item.id}`, { is_featured: next });
      setItems((i) => i.map((x) => (x.id === item.id ? { ...x, is_featured: next } : x)));
    } catch {
      setAlert({ type: "error", message: "Error al actualizar destacado." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/api/admin/media/${deleteTarget}`);
      setItems((i) => i.filter((x) => x.id !== deleteTarget));
    } catch {
      setAlert({ type: "error", message: "Error al eliminar." });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <PageHeader title="Multimedia" description="Fotos, videos y reels." />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* FILTROS + UPLOAD */}
      <div className="card mb-6">
        <div className="flex gap-4 flex-wrap mb-4">
          <div>
            <label className="label text-[10px]">Tipo</label>
            <select
              className="input text-sm"
              value={selectedTypeId}
              onChange={(e) => { setSelectedTypeId(e.target.value ? Number(e.target.value) : ""); setSelectedCategoryId(""); }}
            >
              <option value="" disabled>Seleccionar tipo…</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-[10px]">Categoría</label>
            <select
              className="input text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : "")}
              disabled={!selectedTypeId}
            >
              {selectedTypeId ? (
                <>
                  <option value="">Todas las categorías</option>
                  {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </>
              ) : (
                <option value="">Seleccioná un tipo primero</option>
              )}
            </select>
          </div>
        </div>

        {/* TABS DE UPLOAD — disponibles según el tipo seleccionado */}
        {!selectedTypeId && (
          <div className="border border-dashed border-neutral-700 rounded p-6 text-center">
            <p className="text-neutral-500 text-sm">Seleccioná un <strong className="text-neutral-300">Tipo</strong> arriba para cargar contenido.</p>
          </div>
        )}

        {isImageType && (
          <>
            <div className="flex gap-1 border-b border-neutral-700 mb-4">
              {(["single", "zip"] as UploadTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setUploadTab(t)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${uploadTab === t ? "text-red-400 border-b-2 border-red-600" : "text-neutral-500 hover:text-white"}`}
                >
                  {t === "single" ? "Subir imagen(es)" : "Importar ZIP"}
                </button>
              ))}
            </div>

            {/* DROPZONE — funciona para una imagen, varias imágenes o un ZIP */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded p-6 text-center transition-colors ${
                dragOver ? "border-red-500 bg-red-900/10" : "border-neutral-700"
              }`}
            >
              <p className="text-neutral-400 text-sm mb-3">
                {dragOver
                  ? "Soltá los archivos aquí"
                  : uploadTab === "single"
                    ? "Arrastrá una o varias imágenes acá, o:"
                    : "Arrastrá un ZIP con imágenes adentro, o:"}
              </p>
              {uploadTab === "single" && (
                <label className="btn-secondary text-xs cursor-pointer inline-block">
                  {uploading ? "Subiendo..." : "Seleccionar imagen(es)"}
                  <input ref={singleRef} type="file" accept="image/*" multiple className="hidden" onChange={handleSingleUpload} disabled={uploading} />
                </label>
              )}
              {uploadTab === "zip" && (
                <label className="btn-secondary text-xs cursor-pointer inline-block">
                  {uploading ? "Procesando ZIP..." : "Seleccionar ZIP"}
                  <input ref={zipRef} type="file" accept=".zip" className="hidden" onChange={handleZipUpload} disabled={uploading} />
                </label>
              )}
              <p className="text-[10px] text-neutral-600 mt-3">
                Se asignan al tipo y categoría seleccionados arriba.
              </p>
            </div>
          </>
        )}

        {isVideoOrReel && (
          <form onSubmit={handleVideoAdd} className="space-y-3">
            <p className="text-xs text-neutral-500">
              Para {selectedTypeSlug === "video" ? "videos" : "reels"} se guarda la URL externa (YouTube / Vimeo / Instagram).
              No se sube el archivo al servidor.
            </p>
            <div className="flex gap-3 flex-wrap">
              <input
                type="url"
                className="input flex-1 min-w-48 text-sm"
                placeholder={selectedTypeSlug === "video" ? "https://www.youtube.com/watch?v=..." : "https://www.instagram.com/reel/..."}
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                required
              />
              <input
                type="text"
                className="input w-48 text-sm"
                placeholder="Título (opcional)"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
              />
              <button type="submit" disabled={uploading} className="btn-primary text-xs">
                {uploading ? "Agregando..." : `Agregar ${selectedTypeSlug === "video" ? "video" : "reel"}`}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* GRILLA */}
      {loading ? (
        <p className="text-neutral-500 text-sm">Cargando...</p>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {items.map((item) => (
            <div key={item.id} className="relative group border border-neutral-800 hover:border-neutral-600 overflow-hidden">
              <div className="aspect-square bg-neutral-900">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title || "Media"} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600 text-2xl">▶</div>
                )}
              </div>

              {/* Badge "destacada" SIEMPRE visible si is_featured=true */}
              {item.is_featured && (
                <span
                  className="absolute top-1 left-1 bg-yellow-500/90 text-black text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider"
                  title="Aparece en el bloque de Home"
                >
                  ★ Destacada
                </span>
              )}

              {/* Acciones al hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <button
                  onClick={() => toggleFeatured(item)}
                  className={`text-xs px-2 py-1 ${
                    item.is_featured
                      ? "text-yellow-400 hover:text-yellow-300 bg-black/50"
                      : "text-neutral-300 hover:text-yellow-400 bg-black/50"
                  }`}
                  title={item.is_featured ? "Quitar de destacadas" : "Destacar (aparece en Home)"}
                >
                  {item.is_featured ? "★ Quitar destacado" : "☆ Destacar"}
                </button>
                <button
                  onClick={() => setDeleteTarget(item.id)}
                  className="text-xs text-red-400 hover:text-red-300 bg-black/50 px-2 py-1"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">No hay multimedia en esta categoría.</p>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message="¿Eliminás este archivo? Esta acción no se puede deshacer."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  );
}
