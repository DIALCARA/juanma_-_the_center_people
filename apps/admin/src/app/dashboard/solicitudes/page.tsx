"use client";

import { useState, useEffect } from "react";
import { get, put } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import Alert from "@/components/ui/Alert";

interface DownloadRequest {
  id: number;
  name: string;
  email: string;
  organization: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "expired";
  created_at: string;
  download_asset?: { title: string };
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
  expired: "Expirada",
};

export default function SolicitudesPage() {
  const [requests, setRequests] = useState<DownloadRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [processing, setProcessing] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    get<{ data: DownloadRequest[] }>(`/api/admin/download-requests?status=${filter}`)
      .then((res) => setRequests(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  async function setStatus(req: DownloadRequest, action: "approved" | "rejected") {
    setProcessing(req.id);
    try {
      await put(`/api/admin/download-requests/${req.id}`, { action });
      setRequests((r) => r.filter((x) => x.id !== req.id));
      setAlert({ type: "success", message: action === "approved" ? "Solicitud aprobada. Se envió el email." : "Solicitud rechazada." });
      if (action === "approved" && typeof window !== "undefined") {
        const w = window as Window & { umami?: { track: (e: string) => void } };
        w.umami?.track("approve_download");
      }
    } catch {
      setAlert({ type: "error", message: "Error al procesar la solicitud." });
    } finally {
      setProcessing(null);
    }
  }

  return (
    <>
      <PageHeader title="Solicitudes de descarga" description="Aprobá o rechazá solicitudes de material de prensa." />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="flex gap-1 mb-4">
        {["pending", "approved", "rejected", "expired"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${filter === s ? "text-red-400 border-b-2 border-red-600" : "text-neutral-500 hover:text-white"}`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-neutral-500 text-sm">Cargando...</p>
      ) : requests.length > 0 ? (
        <div className="space-y-3 max-w-3xl">
          {requests.map((req) => (
            <div key={req.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{req.name}</p>
                  <p className="text-xs text-neutral-500">
                    <a href={`mailto:${req.email}`} className="hover:text-white">{req.email}</a>
                    {req.organization && ` · ${req.organization}`}
                  </p>
                  {req.download_asset && (
                    <p className="text-xs text-neutral-400 mt-1">Archivo: {req.download_asset.title}</p>
                  )}
                  {req.reason && (
                    <p className="text-xs text-neutral-500 mt-2 leading-relaxed">{req.reason}</p>
                  )}
                  <p className="text-[10px] text-neutral-600 mt-2">{new Date(req.created_at).toLocaleString("es-PE")}</p>
                </div>
                {filter === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setStatus(req, "approved")}
                      disabled={processing === req.id}
                      className="btn-primary text-xs"
                    >
                      {processing === req.id ? "..." : "Aprobar"}
                    </button>
                    <button
                      onClick={() => setStatus(req, "rejected")}
                      disabled={processing === req.id}
                      className="btn-danger text-xs"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
                {filter !== "pending" && (
                  <span className={`badge-${filter === "approved" ? "green" : filter === "rejected" ? "red" : "neutral"} shrink-0`}>
                    {statusLabels[req.status]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">No hay solicitudes en esta categoría.</p>
      )}
    </>
  );
}
