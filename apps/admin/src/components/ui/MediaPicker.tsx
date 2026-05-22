"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";

export interface MediaItem {
  id: number;
  title: string;
  file_url: string;
  thumbnail_url: string;
  mime_type: string;
  media_type_id: number;
  category_id: number | null;
}

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

interface Props {
  /** Restringe el picker a un tipo de media (slug). Default: "image" */
  typeSlug?: string;
  /** Título del modal */
  title?: string;
  onSelect: (media: MediaItem) => void;
  onClose: () => void;
}

export default function MediaPicker({
  typeSlug = "image",
  title = "Elegir imagen",
  onSelect,
  onClose,
}: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [types, setTypes] = useState<MediaType[]>([]);
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | "">("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);

  // Cargar tipos y categorías, y resolver el id del tipo por defecto
  useEffect(() => {
    Promise.all([
      get<{ data: MediaType[] }>("/api/admin/media/types"),
      get<{ data: MediaCategory[] }>("/api/admin/media/categories"),
    ])
      .then(([t, c]) => {
        setTypes(t.data);
        setCategories(c.data);
        const defaultType = t.data.find((x) => x.slug === typeSlug);
        if (defaultType) setSelectedTypeId(defaultType.id);
      })
      .catch(() => {});
  }, [typeSlug]);

  // Cargar items cuando cambia el filtro
  useEffect(() => {
    if (selectedTypeId === "") return;
    setLoading(true);
    const params = new URLSearchParams();
    params.set("type_id", String(selectedTypeId));
    if (selectedCategoryId) params.set("category_id", String(selectedCategoryId));
    params.set("page_size", "60");
    get<{ data: { items: MediaItem[]; total: number } }>(`/api/admin/media?${params}`)
      .then((res) => setItems(res.data?.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [selectedTypeId, selectedCategoryId]);

  // Cerrar con ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const filteredCategories = selectedTypeId
    ? categories.filter((c) => c.media_type_id === selectedTypeId)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="bg-neutral-900 border border-neutral-700 w-full max-w-5xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 shrink-0">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white text-2xl leading-none" aria-label="Cerrar">
            ×
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 flex-wrap p-4 border-b border-neutral-800 shrink-0">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Tipo</label>
            <select
              className="input text-xs"
              value={selectedTypeId}
              onChange={(e) => {
                setSelectedTypeId(e.target.value ? Number(e.target.value) : "");
                setSelectedCategoryId("");
              }}
            >
              <option value="" disabled>Seleccionar tipo…</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Categoría</label>
            <select
              className="input text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : "")}
              disabled={!selectedTypeId}
            >
              {selectedTypeId ? (
                <>
                  <option value="">Todas las categorías</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </>
              ) : (
                <option value="">Seleccioná un tipo primero</option>
              )}
            </select>
          </div>
        </div>

        {/* Grilla */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-neutral-500 text-sm text-center py-8">Cargando...</p>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500 text-sm mb-2">No hay archivos en esta categoría.</p>
              <p className="text-neutral-600 text-xs">
                Subí archivos desde el módulo <a href="/dashboard/media" className="text-red-400 hover:underline">Multimedia</a>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="group relative aspect-square bg-neutral-800 border border-neutral-700 hover:border-red-500 overflow-hidden transition-colors"
                  title={item.title}
                >
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title || ""}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-2xl">▶</div>
                  )}
                  <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/40 transition-colors flex items-end p-2">
                    <p className="text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity truncate w-full">
                      {item.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
