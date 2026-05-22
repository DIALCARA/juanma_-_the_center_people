"use client";

import { useState, useEffect } from "react";
import { get, put, post, del } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import MediaPicker from "@/components/ui/MediaPicker";

interface Bio {
  bio_short: string;
  bio_long: string;
}

interface Member {
  id: number;
  name: string;
  role: string;
  instrument: string;
  bio: string;        // bio breve
  bio_long: string;   // bio completa
  photo_media_id: number | null;
  photo_url: string | null;
  sort_order: number;
  is_visible: boolean;
}

interface QuickFact {
  id: number;
  label: string;
  value: string;
  sort_order: number;
  is_visible: boolean;
}

type Tab = "bio" | "members" | "facts";

export default function BandaPage() {
  const [tab, setTab] = useState<Tab>("bio");
  const [bio, setBio] = useState<Bio>({ bio_short: "", bio_long: "" });
  const [members, setMembers] = useState<Member[]>([]);
  const [facts, setFacts] = useState<QuickFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "member" | "fact"; id: number } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [photoPickerFor, setPhotoPickerFor] = useState<number | null>(null);

  useEffect(() => {
    get<{ data: { bio: Bio; members: Member[]; quick_facts: QuickFact[] } }>("/api/admin/band/bio")
      .then((res) => {
        setBio(res.data.bio ?? { bio_short: "", bio_long: "" });
        setMembers(res.data.members ?? []);
        setFacts(res.data.quick_facts ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function saveBio(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    try {
      await put("/api/admin/band/bio", bio);
      setAlert({ type: "success", message: "Bio guardada correctamente." });
    } catch {
      setAlert({ type: "error", message: "Error al guardar bio." });
    } finally {
      setSaving(false);
    }
  }

  async function addMember() {
    try {
      const res = await post<{ data: Member }>("/api/admin/band/members", {
        name: "Nuevo integrante",
        role: "",
        instrument: "",
        bio: "",
        sort_order: members.length,
        is_visible: true,
      });
      setMembers((m) => [...m, res.data]);
    } catch {
      setAlert({ type: "error", message: "Error al crear integrante." });
    }
  }

  async function updateMember(id: number, partial: Partial<Member>) {
    try {
      await put(`/api/admin/band/members/${id}`, partial);
      setMembers((ms) => ms.map((x) => (x.id === id ? { ...x, ...partial } : x)));
    } catch {
      setAlert({ type: "error", message: "Error al guardar integrante." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "member") {
        await del(`/api/admin/band/members/${deleteTarget.id}`);
        setMembers((m) => m.filter((x) => x.id !== deleteTarget.id));
      } else {
        await del(`/api/admin/band/quick-facts/${deleteTarget.id}`);
        setFacts((f) => f.filter((x) => x.id !== deleteTarget.id));
      }
    } catch {
      setAlert({ type: "error", message: "Error al eliminar." });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function addFact() {
    try {
      const res = await post<{ data: QuickFact }>("/api/admin/band/quick-facts", {
        label: "Nuevo dato",
        value: "",
        sort_order: facts.length,
        is_visible: true,
      });
      setFacts((f) => [...f, res.data]);
    } catch {
      setAlert({ type: "error", message: "Error al crear dato." });
    }
  }

  async function updateFact(id: number, partial: Partial<QuickFact>) {
    try {
      await put(`/api/admin/band/quick-facts/${id}`, partial);
      setFacts((fs) => fs.map((x) => (x.id === id ? { ...x, ...partial } : x)));
    } catch {
      setAlert({ type: "error", message: "Error al guardar dato." });
    }
  }

  if (loading) return <p className="text-neutral-500 text-sm">Cargando...</p>;

  const tabs: { id: Tab; label: string }[] = [
    { id: "bio", label: "Bio" },
    { id: "members", label: "Integrantes" },
    { id: "facts", label: "Datos rápidos" },
  ];

  return (
    <>
      <PageHeader title="La Banda" />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="flex gap-1 mb-6 border-b border-neutral-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? "text-red-400 border-b-2 border-red-600" : "text-neutral-500 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* BIO */}
      {tab === "bio" && (
        <form onSubmit={saveBio} className="max-w-2xl">
          <FormField label="Bio corta (para inicio)" htmlFor="bio_short">
            <textarea
              id="bio_short"
              className="input"
              rows={3}
              value={bio.bio_short}
              onChange={(e) => setBio((b) => ({ ...b, bio_short: e.target.value }))}
            />
          </FormField>
          <FormField label="Bio completa" htmlFor="bio_long">
            <textarea
              id="bio_long"
              className="input"
              rows={8}
              value={bio.bio_long}
              onChange={(e) => setBio((b) => ({ ...b, bio_long: e.target.value }))}
            />
          </FormField>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Guardando..." : "Guardar bio"}
          </button>
        </form>
      )}

      {/* INTEGRANTES */}
      {tab === "members" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={addMember} className="btn-primary text-sm">+ Agregar integrante</button>
          </div>
          <div className="space-y-4 max-w-2xl">
            {members.map((m) => (
              <div key={m.id} className="card">
                <div className="flex gap-4">
                  {/* Foto del integrante */}
                  <div className="shrink-0">
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Foto</label>
                    <div className="w-24 h-24 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden flex items-center justify-center mb-2 relative">
                      {m.photo_url ? (
                        <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl text-neutral-600 uppercase font-semibold">
                          {m.name?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => setPhotoPickerFor(m.id)}
                        className="btn-secondary text-[10px] px-2 py-1 w-full"
                      >
                        {m.photo_media_id ? "Cambiar" : "Elegir"}
                      </button>
                      {m.photo_media_id && (
                        <button
                          type="button"
                          onClick={() => updateMember(m.id, { photo_media_id: null, photo_url: null })}
                          className="text-[10px] text-neutral-500 hover:text-red-400 transition-colors"
                        >
                          Quitar foto
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Datos */}
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <FormField label="Nombre" htmlFor={`name-${m.id}`}>
                        <input
                          id={`name-${m.id}`}
                          className="input"
                          defaultValue={m.name}
                          onBlur={(e) => updateMember(m.id, { name: e.target.value })}
                        />
                      </FormField>
                      <FormField label="Instrumento / Rol" htmlFor={`inst-${m.id}`}>
                        <input
                          id={`inst-${m.id}`}
                          className="input"
                          defaultValue={m.instrument}
                          onBlur={(e) => updateMember(m.id, { instrument: e.target.value })}
                        />
                      </FormField>
                    </div>
                    <FormField label="Bio breve" htmlFor={`bio-${m.id}`}>
                      <textarea
                        id={`bio-${m.id}`}
                        className="input"
                        rows={2}
                        placeholder="1-2 líneas que aparecen en la grilla de integrantes."
                        defaultValue={m.bio}
                        onBlur={(e) => updateMember(m.id, { bio: e.target.value })}
                      />
                    </FormField>
                    <FormField label="Bio completa" htmlFor={`biolong-${m.id}`}>
                      <textarea
                        id={`biolong-${m.id}`}
                        className="input"
                        rows={5}
                        placeholder="Historia extendida (opcional). Aparece al hacer click en 'Leer más'."
                        defaultValue={m.bio_long}
                        onBlur={(e) => updateMember(m.id, { bio_long: e.target.value })}
                      />
                    </FormField>
                    <div className="flex items-center justify-between mt-2">
                      <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={m.is_visible}
                          onChange={(e) => updateMember(m.id, { is_visible: e.target.checked })}
                          className="accent-red-600"
                        />
                        Visible
                      </label>
                      <button
                        onClick={() => setDeleteTarget({ type: "member", id: m.id })}
                        className="text-xs text-red-500 hover:text-red-400"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-neutral-500 text-sm">No hay integrantes. Agregá el primero.</p>
            )}
          </div>
        </div>
      )}

      {/* DATOS RÁPIDOS */}
      {tab === "facts" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={addFact} className="btn-primary text-sm">+ Agregar dato</button>
          </div>
          <div className="space-y-3 max-w-xl">
            {facts.map((f) => (
              <div key={f.id} className="card flex items-center gap-3">
                <input
                  className="input flex-1"
                  defaultValue={f.label}
                  placeholder="Etiqueta"
                  onBlur={(e) => updateFact(f.id, { label: e.target.value })}
                />
                <input
                  className="input flex-1"
                  defaultValue={f.value}
                  placeholder="Valor"
                  onBlur={(e) => updateFact(f.id, { value: e.target.value })}
                />
                <button
                  onClick={() => setDeleteTarget({ type: "fact", id: f.id })}
                  className="text-xs text-red-500 hover:text-red-400 shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
            {facts.length === 0 && (
              <p className="text-neutral-500 text-sm">No hay datos. Agregá el primero.</p>
            )}
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`¿Eliminás este ${deleteTarget.type === "member" ? "integrante" : "dato"}? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {photoPickerFor !== null && (
        <MediaPicker
          typeSlug="image"
          title="Elegir foto del integrante"
          onSelect={(media) => {
            updateMember(photoPickerFor, {
              photo_media_id: media.id,
              photo_url: media.thumbnail_url || media.file_url,
            });
            setPhotoPickerFor(null);
          }}
          onClose={() => setPhotoPickerFor(null)}
        />
      )}
    </>
  );
}
