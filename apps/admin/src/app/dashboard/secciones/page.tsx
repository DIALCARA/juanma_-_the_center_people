"use client";

import { useState, useEffect } from "react";
import { get, put } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import Alert from "@/components/ui/Alert";

interface Section {
  id: number;
  slug: string;
  title: string;
  is_enabled: boolean;
  show_in_home: boolean;
  empty_state_message: string;
  sort_order: number;
}

export default function SeccionesPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    get<{ data: Section[] }>("/api/admin/sections")
      .then((res) => setSections(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggleField(section: Section, field: "is_enabled" | "show_in_home") {
    const updated = { ...section, [field]: !section[field] };
    setSaving(section.id);
    try {
      await put(`/api/admin/sections/${section.id}`, updated);
      setSections((prev) => prev.map((s) => (s.id === section.id ? updated : s)));
    } catch {
      setAlert({ type: "error", message: "Error al guardar cambio." });
    } finally {
      setSaving(null);
    }
  }

  async function updateMessage(section: Section, value: string) {
    const updated = { ...section, empty_state_message: value };
    setSections((prev) => prev.map((s) => (s.id === section.id ? updated : s)));
    setSaving(section.id);
    try {
      await put(`/api/admin/sections/${section.id}`, updated);
    } catch {
      setAlert({ type: "error", message: "Error al guardar mensaje." });
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <p className="text-neutral-500 text-sm">Cargando...</p>;

  return (
    <>
      <PageHeader title="Secciones" description="Habilitá o deshabilitá secciones del sitio." />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="space-y-3 max-w-3xl">
        {sections.map((s) => (
          <div key={s.id} className="card">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{s.title}</p>
                <p className="text-xs text-neutral-500">{s.slug}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={s.show_in_home}
                    disabled={saving === s.id}
                    onChange={() => toggleField(s, "show_in_home")}
                    className="accent-red-600"
                  />
                  En inicio
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={s.is_enabled}
                    disabled={saving === s.id}
                    onChange={() => toggleField(s, "is_enabled")}
                    className="accent-red-600"
                  />
                  Habilitada
                </label>
              </div>
            </div>
            <div className="mt-3">
              <label className="label text-[10px]">Mensaje cuando está vacía</label>
              <input
                type="text"
                className="input text-xs"
                defaultValue={s.empty_state_message}
                onBlur={(e) => updateMessage(s, e.target.value)}
                placeholder="Mensaje para mostrar cuando no hay contenido..."
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
