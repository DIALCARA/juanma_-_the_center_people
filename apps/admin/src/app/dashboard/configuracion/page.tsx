"use client";

import { useState, useEffect } from "react";
import { get, put } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import Alert from "@/components/ui/Alert";

interface SiteSettings {
  band_name: string;
  tagline: string;
  subgenre: string;
  city: string;
  country: string;
  spotify_url: string;
  youtube_url: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
  contact_email: string;
  booking_email: string;
  press_email: string;
  max_image_size_mb: number;
  max_video_size_mb: number;
  max_zip_size_mb: number;
  max_download_size_mb: number;
}

const defaults: SiteSettings = {
  band_name: "",
  tagline: "",
  subgenre: "",
  city: "",
  country: "Perú",
  spotify_url: "",
  youtube_url: "",
  instagram_url: "",
  tiktok_url: "",
  facebook_url: "",
  contact_email: "",
  booking_email: "",
  press_email: "",
  max_image_size_mb: 15,
  max_video_size_mb: 200,
  max_zip_size_mb: 500,
  max_download_size_mb: 100,
};

export default function ConfiguracionPage() {
  const [form, setForm] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    get<{ data: SiteSettings }>("/api/admin/site-settings")
      .then((res) => setForm({ ...defaults, ...res.data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    try {
      await put("/api/admin/site-settings", form);
      setAlert({ type: "success", message: "Configuración guardada correctamente." });
    } catch (err: unknown) {
      setAlert({ type: "error", message: err instanceof Error ? err.message : "Error al guardar." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-neutral-500 text-sm">Cargando...</p>;

  return (
    <>
      <PageHeader title="Configuración del sitio" description="Datos generales, redes sociales y límites de carga." />

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-0">

        <section className="card mb-6">
          <h2 className="text-sm font-semibold text-neutral-300 mb-4 pb-2 border-b border-neutral-700">Datos generales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nombre de la banda" htmlFor="band_name" required>
              <input id="band_name" name="band_name" className="input" value={form.band_name} onChange={handle} required />
            </FormField>
            <FormField label="Subgénero" htmlFor="subgenre">
              <input id="subgenre" name="subgenre" className="input" value={form.subgenre} onChange={handle} />
            </FormField>
            <FormField label="Ciudad" htmlFor="city">
              <input id="city" name="city" className="input" value={form.city} onChange={handle} />
            </FormField>
            <FormField label="País" htmlFor="country">
              <input id="country" name="country" className="input" value={form.country} onChange={handle} />
            </FormField>
          </div>
          <FormField label="Tagline / Descripción" htmlFor="tagline">
            <input id="tagline" name="tagline" className="input" value={form.tagline} onChange={handle} />
          </FormField>
        </section>

        <section className="card mb-6">
          <h2 className="text-sm font-semibold text-neutral-300 mb-4 pb-2 border-b border-neutral-700">Redes sociales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["spotify_url", "youtube_url", "instagram_url", "tiktok_url", "facebook_url"] as const).map((field) => (
              <FormField key={field} label={field.replace("_url", "").replace(/^\w/, (c) => c.toUpperCase())} htmlFor={field}>
                <input id={field} name={field} type="url" className="input" value={form[field]} onChange={handle} placeholder="https://" />
              </FormField>
            ))}
          </div>
        </section>

        <section className="card mb-6">
          <h2 className="text-sm font-semibold text-neutral-300 mb-4 pb-2 border-b border-neutral-700">Emails de contacto</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Email general" htmlFor="contact_email">
              <input id="contact_email" name="contact_email" type="email" className="input" value={form.contact_email} onChange={handle} />
            </FormField>
            <FormField label="Email booking" htmlFor="booking_email">
              <input id="booking_email" name="booking_email" type="email" className="input" value={form.booking_email} onChange={handle} />
            </FormField>
            <FormField label="Email prensa" htmlFor="press_email">
              <input id="press_email" name="press_email" type="email" className="input" value={form.press_email} onChange={handle} />
            </FormField>
          </div>
        </section>

        <section className="card mb-6">
          <h2 className="text-sm font-semibold text-neutral-300 mb-4 pb-2 border-b border-neutral-700">Límites de carga (MB)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <FormField label="Imágenes" htmlFor="max_image_size_mb">
              <input id="max_image_size_mb" name="max_image_size_mb" type="number" min="1" max="100" className="input" value={form.max_image_size_mb} onChange={handle} />
            </FormField>
            <FormField label="Videos" htmlFor="max_video_size_mb">
              <input id="max_video_size_mb" name="max_video_size_mb" type="number" min="1" max="2000" className="input" value={form.max_video_size_mb} onChange={handle} />
            </FormField>
            <FormField label="ZIP" htmlFor="max_zip_size_mb">
              <input id="max_zip_size_mb" name="max_zip_size_mb" type="number" min="1" max="2000" className="input" value={form.max_zip_size_mb} onChange={handle} />
            </FormField>
            <FormField label="Descargas" htmlFor="max_download_size_mb">
              <input id="max_download_size_mb" name="max_download_size_mb" type="number" min="1" max="2000" className="input" value={form.max_download_size_mb} onChange={handle} />
            </FormField>
          </div>
        </section>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </>
  );
}
