"use client";

import { useState, useEffect } from "react";
import { get, put } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import Alert from "@/components/ui/Alert";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  contact_type: string;
  message: string;
  status: "unread" | "read" | "archived";
  created_at: string;
}

const typeLabels: Record<string, string> = {
  booking: "Booking",
  press: "Prensa",
  collaboration: "Colaboración",
  fan: "Fan",
  other: "Otro",
};

const statusLabels: Record<string, string> = {
  unread: "No leído",
  read: "Leído",
  archived: "Archivado",
};

export default function MensajesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("unread");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    get<{ data: ContactMessage[] }>(`/api/admin/contact-messages?status=${filter}`)
      .then((res) => setMessages(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  async function updateStatus(msg: ContactMessage, status: ContactMessage["status"]) {
    try {
      await put(`/api/admin/contact-messages/${msg.id}/status`, { status });
      setMessages((m) => m.map((x) => (x.id === msg.id ? { ...x, status } : x)));
      if (selected?.id === msg.id) setSelected({ ...msg, status });
    } catch {
      setAlert({ type: "error", message: "Error al actualizar estado." });
    }
  }

  return (
    <>
      <PageHeader title="Mensajes" description="Mensajes recibidos por el formulario de contacto." />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="flex gap-1 mb-4">
        {["unread", "read", "archived"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${filter === s ? "text-red-400 border-b-2 border-red-600" : "text-neutral-500 hover:text-white"}`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      <div className="flex gap-4 h-[60vh]">
        {/* LISTA */}
        <div className="w-72 shrink-0 overflow-y-auto space-y-1">
          {loading ? (
            <p className="text-neutral-500 text-sm">Cargando...</p>
          ) : messages.length > 0 ? (
            messages.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelected(m);
                  if (m.status === "unread") updateStatus(m, "read");
                }}
                className={`w-full text-left p-3 border transition-colors ${selected?.id === m.id ? "border-red-800 bg-red-900/10" : "border-neutral-800 hover:border-neutral-600 bg-neutral-900"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-white truncate">{m.name}</p>
                  <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-sm ${m.status === "unread" ? "bg-red-900/50 text-red-400" : "bg-neutral-800 text-neutral-500"}`}>
                    {typeLabels[m.contact_type] ?? m.contact_type}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 truncate mt-1">{m.message.substring(0, 60)}...</p>
                <p className="text-[10px] text-neutral-600 mt-1">{new Date(m.created_at).toLocaleDateString("es-PE")}</p>
              </button>
            ))
          ) : (
            <p className="text-neutral-500 text-sm">No hay mensajes en esta categoría.</p>
          )}
        </div>

        {/* DETALLE */}
        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <div className="card h-full flex flex-col">
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-neutral-700">
                <div>
                  <p className="font-semibold text-white">{selected.name}</p>
                  <p className="text-xs text-neutral-500">
                    <a href={`mailto:${selected.email}`} className="hover:text-white">{selected.email}</a>
                    {" · "}{typeLabels[selected.contact_type] ?? selected.contact_type}
                    {" · "}{new Date(selected.created_at).toLocaleString("es-PE")}
                  </p>
                </div>
                <div className="flex gap-2">
                  {selected.status !== "archived" && (
                    <button onClick={() => updateStatus(selected, "archived")} className="btn-ghost text-xs">Archivar</button>
                  )}
                  {selected.status === "archived" && (
                    <button onClick={() => updateStatus(selected, "read")} className="btn-ghost text-xs">Desarchivar</button>
                  )}
                </div>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap flex-1">{selected.message}</p>
              <div className="mt-4 pt-4 border-t border-neutral-700">
                <a href={`mailto:${selected.email}`} className="btn-primary text-xs inline-block">
                  Responder por email →
                </a>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-neutral-600 text-sm">Seleccioná un mensaje para leerlo.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
