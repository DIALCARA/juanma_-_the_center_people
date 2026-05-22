"use client";

import { useState, useEffect } from "react";
import { get, post, put } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import Alert from "@/components/ui/Alert";

interface RiderProfile {
  id: number;
  name: string;
  is_active: boolean;
  notes: string;
}

interface RiderMember { id: number; name: string; role: string; instrument: string; sort_order: number; }
interface RiderInputChannel { id: number; channel_number: number; source: string; mic_or_di: string; stand: string; notes: string; }
interface RiderBackline { id: number; equipment: string; provided_by: string; quantity: number; notes: string; }
interface RiderMonitoring { id: number; musician: string; needs_to_hear: string; monitor_type: string; notes: string; }
interface RiderElectrical { id: number; location: string; outlets_count: number; voltage: string; notes: string; }
interface RiderShowLength { id: number; show_type: string; duration_minutes: number; soundcheck_minutes: number; notes: string; }
interface RiderContact { id: number; name: string; phone: string; email: string; role: string; }
interface RiderHospitality { water: string; instrument_storage: string; loading_zone: string; dressing_room: string; food: string; notes: string; }

type RiderTab = "general" | "members" | "inputs" | "backline" | "monitoring" | "electrical" | "shows" | "contacts" | "hospitality";

export default function RiderPage() {
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [tab, setTab] = useState<RiderTab>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [members, setMembers] = useState<RiderMember[]>([]);
  const [inputs, setInputs] = useState<RiderInputChannel[]>([]);
  const [backline, setBackline] = useState<RiderBackline[]>([]);
  const [monitoring, setMonitoring] = useState<RiderMonitoring[]>([]);
  const [electrical, setElectrical] = useState<RiderElectrical[]>([]);
  const [shows, setShows] = useState<RiderShowLength[]>([]);
  const [contacts, setContacts] = useState<RiderContact[]>([]);
  const [hospitality, setHospitality] = useState<RiderHospitality>({ water: "", instrument_storage: "", loading_zone: "", dressing_room: "", food: "", notes: "" });

  useEffect(() => {
    get<{ data: any }>("/api/admin/rider")
      .then((res) => {
        const d = res.data;
        if (d?.profile) {
          setProfile(d.profile);
          setMembers(d.members ?? []);
          setInputs(d.input_channels ?? []);
          setBackline(d.backline ?? []);
          setMonitoring(d.monitoring ?? []);
          setElectrical(d.electrical ?? []);
          setShows(d.show_lengths ?? []);
          setContacts(d.contacts ?? []);
          setHospitality(d.hospitality ?? hospitality);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function saveSection(path: string, data: unknown) {
    if (!profile) return;
    setSaving(true);
    setAlert(null);
    try {
      await put(`/api/admin/rider/${profile.id}/${path}`, data);
      setAlert({ type: "success", message: "Rider guardado." });
    } catch {
      setAlert({ type: "error", message: "Error al guardar." });
    } finally {
      setSaving(false);
    }
  }

  async function createProfile() {
    setSaving(true);
    try {
      const res = await post<{ data: RiderProfile }>("/api/admin/rider", { name: "Rider principal", is_active: true, notes: "" });
      setProfile(res.data);
    } catch {
      setAlert({ type: "error", message: "Error al crear rider." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-neutral-500 text-sm">Cargando...</p>;

  if (!profile) {
    return (
      <>
        <PageHeader title="Rider técnico" />
        <div className="card max-w-sm text-center p-8">
          <p className="text-neutral-500 text-sm mb-4">No hay un rider configurado aún.</p>
          <button onClick={createProfile} disabled={saving} className="btn-primary">
            {saving ? "Creando..." : "Crear rider"}
          </button>
        </div>
      </>
    );
  }

  const tabs: { id: RiderTab; label: string }[] = [
    { id: "general", label: "General" },
    { id: "members", label: "Integrantes" },
    { id: "inputs", label: "Lista de inputs" },
    { id: "backline", label: "Backline" },
    { id: "monitoring", label: "Monitoreo" },
    { id: "electrical", label: "Eléctrico" },
    { id: "shows", label: "Show / Horarios" },
    { id: "contacts", label: "Contactos" },
    { id: "hospitality", label: "Hospitalidad" },
  ];

  return (
    <>
      <PageHeader title="Rider técnico" description={profile.name} />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="flex gap-1 mb-6 border-b border-neutral-800 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${tab === t.id ? "text-red-400 border-b-2 border-red-600" : "text-neutral-500 hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* GENERAL */}
      {tab === "general" && (
        <form onSubmit={(e) => { e.preventDefault(); saveSection("general", profile); }} className="max-w-xl">
          <FormField label="Nombre del rider" htmlFor="r-name">
            <input id="r-name" className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </FormField>
          <FormField label="Notas generales" htmlFor="r-notes">
            <textarea id="r-notes" className="input" rows={4} value={profile.notes} onChange={(e) => setProfile({ ...profile, notes: e.target.value })} />
          </FormField>
          <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer mb-4">
            <input type="checkbox" checked={profile.is_active} onChange={(e) => setProfile({ ...profile, is_active: e.target.checked })} className="accent-red-600" />
            Rider activo
          </label>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "Guardando..." : "Guardar"}</button>
        </form>
      )}

      {/* INTEGRANTES DEL RIDER */}
      {tab === "members" && (
        <div className="max-w-2xl">
          <div className="space-y-3 mb-4">
            {members.map((m, i) => (
              <div key={i} className="card grid grid-cols-3 gap-3">
                <input className="input" placeholder="Nombre" defaultValue={m.name}
                  onBlur={(e) => setMembers((ms) => ms.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                <input className="input" placeholder="Rol" defaultValue={m.role}
                  onBlur={(e) => setMembers((ms) => ms.map((x, j) => j === i ? { ...x, role: e.target.value } : x))} />
                <input className="input" placeholder="Instrumento" defaultValue={m.instrument}
                  onBlur={(e) => setMembers((ms) => ms.map((x, j) => j === i ? { ...x, instrument: e.target.value } : x))} />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setMembers((m) => [...m, { id: 0, name: "", role: "", instrument: "", sort_order: m.length }])} className="btn-secondary text-xs">+ Agregar</button>
            <button onClick={() => saveSection("members", members)} disabled={saving} className="btn-primary text-xs">{saving ? "Guardando..." : "Guardar integrantes"}</button>
          </div>
        </div>
      )}

      {/* INPUTS */}
      {tab === "inputs" && (
        <div className="max-w-3xl">
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 uppercase tracking-wider">
                  <th className="text-left py-2 pr-3 w-10">Ch.</th>
                  <th className="text-left py-2 pr-3">Fuente</th>
                  <th className="text-left py-2 pr-3">Mic / DI</th>
                  <th className="text-left py-2 pr-3">Stand</th>
                  <th className="text-left py-2">Notas</th>
                </tr>
              </thead>
              <tbody>
                {inputs.map((inp, i) => (
                  <tr key={i} className="border-b border-neutral-900">
                    <td className="pr-3 py-1.5"><input type="number" className="input w-12 text-xs" defaultValue={inp.channel_number} onBlur={(e) => setInputs((xs) => xs.map((x, j) => j === i ? { ...x, channel_number: Number(e.target.value) } : x))} /></td>
                    <td className="pr-3 py-1.5"><input className="input text-xs" defaultValue={inp.source} onBlur={(e) => setInputs((xs) => xs.map((x, j) => j === i ? { ...x, source: e.target.value } : x))} /></td>
                    <td className="pr-3 py-1.5"><input className="input text-xs" defaultValue={inp.mic_or_di} onBlur={(e) => setInputs((xs) => xs.map((x, j) => j === i ? { ...x, mic_or_di: e.target.value } : x))} /></td>
                    <td className="pr-3 py-1.5"><input className="input text-xs" defaultValue={inp.stand} onBlur={(e) => setInputs((xs) => xs.map((x, j) => j === i ? { ...x, stand: e.target.value } : x))} /></td>
                    <td className="py-1.5"><input className="input text-xs" defaultValue={inp.notes} onBlur={(e) => setInputs((xs) => xs.map((x, j) => j === i ? { ...x, notes: e.target.value } : x))} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setInputs((xs) => [...xs, { id: 0, channel_number: xs.length + 1, source: "", mic_or_di: "", stand: "", notes: "" }])} className="btn-secondary text-xs">+ Canal</button>
            <button onClick={() => saveSection("input-list", inputs)} disabled={saving} className="btn-primary text-xs">{saving ? "Guardando..." : "Guardar inputs"}</button>
          </div>
        </div>
      )}

      {/* BACKLINE */}
      {tab === "backline" && (
        <div className="max-w-2xl">
          <div className="space-y-3 mb-4">
            {backline.map((b, i) => (
              <div key={i} className="card grid grid-cols-3 gap-3">
                <input className="input col-span-2" placeholder="Equipo" defaultValue={b.equipment}
                  onBlur={(e) => setBackline((xs) => xs.map((x, j) => j === i ? { ...x, equipment: e.target.value } : x))} />
                <input className="input" placeholder="Proveído por" defaultValue={b.provided_by}
                  onBlur={(e) => setBackline((xs) => xs.map((x, j) => j === i ? { ...x, provided_by: e.target.value } : x))} />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setBackline((xs) => [...xs, { id: 0, equipment: "", provided_by: "", quantity: 1, notes: "" }])} className="btn-secondary text-xs">+ Equipo</button>
            <button onClick={() => saveSection("backline", backline)} disabled={saving} className="btn-primary text-xs">{saving ? "Guardando..." : "Guardar backline"}</button>
          </div>
        </div>
      )}

      {/* MONITORING */}
      {tab === "monitoring" && (
        <div className="max-w-2xl">
          <div className="space-y-3 mb-4">
            {monitoring.map((m, i) => (
              <div key={i} className="card grid grid-cols-2 gap-3">
                <input className="input" placeholder="Músico" defaultValue={m.musician}
                  onBlur={(e) => setMonitoring((xs) => xs.map((x, j) => j === i ? { ...x, musician: e.target.value } : x))} />
                <input className="input" placeholder="Tipo de monitor" defaultValue={m.monitor_type}
                  onBlur={(e) => setMonitoring((xs) => xs.map((x, j) => j === i ? { ...x, monitor_type: e.target.value } : x))} />
                <input className="input col-span-2" placeholder="Qué necesita escuchar" defaultValue={m.needs_to_hear}
                  onBlur={(e) => setMonitoring((xs) => xs.map((x, j) => j === i ? { ...x, needs_to_hear: e.target.value } : x))} />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setMonitoring((xs) => [...xs, { id: 0, musician: "", needs_to_hear: "", monitor_type: "", notes: "" }])} className="btn-secondary text-xs">+ Monitor</button>
            <button onClick={() => saveSection("monitoring", monitoring)} disabled={saving} className="btn-primary text-xs">{saving ? "Guardando..." : "Guardar monitoreo"}</button>
          </div>
        </div>
      )}

      {/* ELECTRICAL */}
      {tab === "electrical" && (
        <div className="max-w-2xl">
          <div className="space-y-3 mb-4">
            {electrical.map((el, i) => (
              <div key={i} className="card grid grid-cols-3 gap-3">
                <input className="input" placeholder="Ubicación" defaultValue={el.location}
                  onBlur={(e) => setElectrical((xs) => xs.map((x, j) => j === i ? { ...x, location: e.target.value } : x))} />
                <input type="number" className="input" placeholder="Tomacorrientes" defaultValue={el.outlets_count}
                  onBlur={(e) => setElectrical((xs) => xs.map((x, j) => j === i ? { ...x, outlets_count: Number(e.target.value) } : x))} />
                <input className="input" placeholder="Voltaje (ej: 220V)" defaultValue={el.voltage}
                  onBlur={(e) => setElectrical((xs) => xs.map((x, j) => j === i ? { ...x, voltage: e.target.value } : x))} />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setElectrical((xs) => [...xs, { id: 0, location: "", outlets_count: 0, voltage: "220V", notes: "" }])} className="btn-secondary text-xs">+ Punto eléctrico</button>
            <button onClick={() => saveSection("electrical", electrical)} disabled={saving} className="btn-primary text-xs">{saving ? "Guardando..." : "Guardar eléctrico"}</button>
          </div>
        </div>
      )}

      {/* SHOW LENGTHS */}
      {tab === "shows" && (
        <div className="max-w-2xl">
          <div className="space-y-3 mb-4">
            {shows.map((s, i) => (
              <div key={i} className="card grid grid-cols-2 gap-3">
                <input className="input" placeholder="Tipo de show (ej: Set completo)" defaultValue={s.show_type}
                  onBlur={(e) => setShows((xs) => xs.map((x, j) => j === i ? { ...x, show_type: e.target.value } : x))} />
                <input type="number" className="input" placeholder="Duración (min)" defaultValue={s.duration_minutes}
                  onBlur={(e) => setShows((xs) => xs.map((x, j) => j === i ? { ...x, duration_minutes: Number(e.target.value) } : x))} />
                <input type="number" className="input" placeholder="Soundcheck (min)" defaultValue={s.soundcheck_minutes}
                  onBlur={(e) => setShows((xs) => xs.map((x, j) => j === i ? { ...x, soundcheck_minutes: Number(e.target.value) } : x))} />
                <input className="input" placeholder="Notas" defaultValue={s.notes}
                  onBlur={(e) => setShows((xs) => xs.map((x, j) => j === i ? { ...x, notes: e.target.value } : x))} />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShows((xs) => [...xs, { id: 0, show_type: "", duration_minutes: 60, soundcheck_minutes: 30, notes: "" }])} className="btn-secondary text-xs">+ Formato</button>
            <button onClick={() => saveSection("show-lengths", shows)} disabled={saving} className="btn-primary text-xs">{saving ? "Guardando..." : "Guardar shows"}</button>
          </div>
        </div>
      )}

      {/* CONTACTS */}
      {tab === "contacts" && (
        <div className="max-w-2xl">
          <div className="space-y-3 mb-4">
            {contacts.map((c, i) => (
              <div key={i} className="card grid grid-cols-2 gap-3">
                <input className="input" placeholder="Nombre" defaultValue={c.name}
                  onBlur={(e) => setContacts((xs) => xs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                <input className="input" placeholder="Rol" defaultValue={c.role}
                  onBlur={(e) => setContacts((xs) => xs.map((x, j) => j === i ? { ...x, role: e.target.value } : x))} />
                <input className="input" placeholder="Teléfono" defaultValue={c.phone}
                  onBlur={(e) => setContacts((xs) => xs.map((x, j) => j === i ? { ...x, phone: e.target.value } : x))} />
                <input type="email" className="input" placeholder="Email" defaultValue={c.email}
                  onBlur={(e) => setContacts((xs) => xs.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setContacts((xs) => [...xs, { id: 0, name: "", phone: "", email: "", role: "" }])} className="btn-secondary text-xs">+ Contacto</button>
            <button onClick={() => saveSection("contacts", contacts)} disabled={saving} className="btn-primary text-xs">{saving ? "Guardando..." : "Guardar contactos"}</button>
          </div>
        </div>
      )}

      {/* HOSPITALITY */}
      {tab === "hospitality" && (
        <form onSubmit={(e) => { e.preventDefault(); saveSection("hospitality", hospitality); }} className="max-w-xl">
          {(["water", "instrument_storage", "loading_zone", "dressing_room", "food", "notes"] as const).map((field) => {
            const labels: Record<string, string> = { water: "Agua / Bebidas", instrument_storage: "Almacenamiento de instrumentos", loading_zone: "Zona de carga", dressing_room: "Camarín", food: "Catering / Comida", notes: "Notas adicionales" };
            return (
              <FormField key={field} label={labels[field]} htmlFor={`h-${field}`}>
                <textarea id={`h-${field}`} className="input" rows={2} value={hospitality[field]}
                  onChange={(e) => setHospitality({ ...hospitality, [field]: e.target.value })} />
              </FormField>
            );
          })}
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "Guardando..." : "Guardar hospitalidad"}</button>
        </form>
      )}
    </>
  );
}
