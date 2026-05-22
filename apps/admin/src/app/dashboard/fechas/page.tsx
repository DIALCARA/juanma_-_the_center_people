"use client";

import { useState, useEffect } from "react";
import { get, post, put, del } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  venue: string;
  city: string;
  country: string;
  ticket_url: string;
  is_visible: boolean;
}

const emptyEvent: Event = {
  id: 0, title: "", description: "", event_date: "", venue: "", city: "", country: "Perú", ticket_url: "", is_visible: true,
};

export default function FechasPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Event | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    get<{ data: { events: Event[] } }>("/api/admin/events")
      .then((res) => setEvents(res.data.events ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    setAlert(null);
    try {
      if (editTarget.id === 0) {
        const res = await post<{ data: Event }>("/api/admin/events", editTarget);
        setEvents((ev) => [res.data, ...ev]);
      } else {
        await put(`/api/admin/events/${editTarget.id}`, editTarget);
        setEvents((ev) => ev.map((x) => (x.id === editTarget.id ? editTarget : x)));
      }
      setAlert({ type: "success", message: "Fecha guardada." });
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
      await del(`/api/admin/events/${deleteTarget}`);
      setEvents((ev) => ev.filter((x) => x.id !== deleteTarget));
    } catch {
      setAlert({ type: "error", message: "Error al eliminar." });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function update(field: keyof Event, value: string | boolean) {
    if (!editTarget) return;
    setEditTarget({ ...editTarget, [field]: value });
  }

  if (loading) return <p className="text-neutral-500 text-sm">Cargando...</p>;

  return (
    <>
      <PageHeader
        title="Fechas"
        action={<button onClick={() => setEditTarget(emptyEvent)} className="btn-primary text-sm">+ Nueva fecha</button>}
      />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {editTarget && (
        <div className="card mb-6 max-w-2xl">
          <h2 className="text-sm font-semibold text-white mb-4">{editTarget.id === 0 ? "Nueva fecha" : "Editar fecha"}</h2>
          <form onSubmit={saveEvent}>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Título del evento" htmlFor="ev-title" required>
                <input id="ev-title" className="input" value={editTarget.title} required onChange={(e) => update("title", e.target.value)} />
              </FormField>
              <FormField label="Fecha" htmlFor="ev-date" required>
                <input id="ev-date" type="date" className="input" value={editTarget.event_date} required onChange={(e) => update("event_date", e.target.value)} />
              </FormField>
              <FormField label="Venue / Sala" htmlFor="ev-venue">
                <input id="ev-venue" className="input" value={editTarget.venue} onChange={(e) => update("venue", e.target.value)} />
              </FormField>
              <FormField label="Ciudad" htmlFor="ev-city">
                <input id="ev-city" className="input" value={editTarget.city} onChange={(e) => update("city", e.target.value)} />
              </FormField>
            </div>
            <FormField label="URL de entradas" htmlFor="ev-tickets">
              <input id="ev-tickets" type="url" className="input" value={editTarget.ticket_url} placeholder="https://..." onChange={(e) => update("ticket_url", e.target.value)} />
            </FormField>
            <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer mb-4">
              <input type="checkbox" checked={editTarget.is_visible} onChange={(e) => update("is_visible", e.target.checked)} className="accent-red-600" />
              Visible en el sitio
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? "Guardando..." : "Guardar"}</button>
              <button type="button" onClick={() => setEditTarget(null)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3 max-w-2xl">
        {events.map((ev) => (
          <div key={ev.id} className="card flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{ev.title}</p>
              <p className="text-xs text-neutral-500">
                {ev.event_date} {ev.venue && `· ${ev.venue}`} {ev.city && `· ${ev.city}`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!ev.is_visible && <span className="badge-neutral">Oculto</span>}
              <button onClick={() => setEditTarget(ev)} className="btn-ghost text-xs">Editar</button>
              <button onClick={() => setDeleteTarget(ev.id)} className="text-xs text-red-500 hover:text-red-400">Eliminar</button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-neutral-500 text-sm">No hay fechas. Agregá la primera.</p>}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message="¿Eliminás esta fecha? Esta acción no se puede deshacer."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  );
}
