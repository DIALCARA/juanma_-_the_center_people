"use client";

import { useState, useEffect } from "react";
import { get, put } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import Alert from "@/components/ui/Alert";
import MediaPicker, { type MediaItem } from "@/components/ui/MediaPicker";

interface SiteSettings {
  band_name: string;
  tagline: string;
  subgenre: string;
  city: string;
  country: string;
  hero_image_id: number | null;
  cover_image_id: number | null;
  spotify_url: string;
  youtube_url: string;
  youtube_music_url: string;
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
  hero_image_id: null,
  cover_image_id: null,
  spotify_url: "",
  youtube_url: "",
  youtube_music_url: "",
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

// Preview de la imagen seleccionada. Necesita una llamada adicional para
// obtener el thumbnail porque el GET solo trae el ID.
function MediaPreview({ mediaId, onClear, onChange }: {
  mediaId: number | null;
  onClear: () => void;
  onChange: () => void;
}) {
  const [item, setItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (!mediaId) { setItem(null); return; }
    get<{ data: MediaItem }>(`/api/admin/media/${mediaId}`)
      .then((res) => setItem(res.data))
      .catch(() => setItem(null));
  }, [mediaId]);

  if (!mediaId) {
    return (
      <button type="button" onClick={onChange} className="btn-secondary text-xs">
        Elegir imagen
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 h-24 bg-neutral-800 border border-neutral-700 overflow-hidden shrink-0">
        {item?.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.title || ""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
            {item ? "sin thumb" : "..."}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs text-neutral-400 truncate max-w-xs">
          {item?.title || `Media #${mediaId}`}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={onChange} className="btn-ghost text-xs">
            Cambiar
          </button>
          <button type="button" onClick={onClear} className="btn-ghost text-xs text-red-400 hover:text-red-300">
            Quitar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConfiguracionPage() {
  const [form, setForm] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pickerTarget, setPickerTarget] = useState<"hero" | "cover" | null>(null);

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

  function handleMediaSelect(media: MediaItem) {
    if (pickerTarget === "hero") {
      setForm((f) => ({ ...f, hero_image_id: media.id }));
    } else if (pickerTarget === "cover") {
      setForm((f) => ({ ...f, cover_image_id: media.id }));
    }
    setPickerTarget(null);
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
          <h2 className="text-sm font-semibold text-neutral-300 mb-1 pb-2 border-b border-neutral-700">Hero del sitio</h2>
          <p className="text-xs text-neutral-500 mb-4">
            La imagen del hero aparece centrada sobre el video de fondo en la home.
            Si no elegís ninguna, se usa el logo de la banda por defecto.
            La portada se usa como imagen secundaria/cover en otras secciones.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Imagen del hero (sobre el video)" htmlFor="hero_image">
              <MediaPreview
                mediaId={form.hero_image_id}
                onClear={() => setForm((f) => ({ ...f, hero_image_id: null }))}
                onChange={() => setPickerTarget("hero")}
              />
            </FormField>
            <FormField label="Imagen de portada (cover)" htmlFor="cover_image">
              <MediaPreview
                mediaId={form.cover_image_id}
                onClear={() => setForm((f) => ({ ...f, cover_image_id: null }))}
                onChange={() => setPickerTarget("cover")}
              />
            </FormField>
          </div>
        </section>

        <section className="card mb-6">
          <h2 className="text-sm font-semibold text-neutral-300 mb-4 pb-2 border-b border-neutral-700">Redes sociales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              { field: "spotify_url", label: "Spotify", placeholder: "https://open.spotify.com/artist/..." },
              { field: "youtube_music_url", label: "YouTube Music", placeholder: "https://music.youtube.com/channel/..." },
              { field: "youtube_url", label: "YouTube (canal videos)", placeholder: "https://youtube.com/@..." },
              { field: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/..." },
              { field: "tiktok_url", label: "TikTok", placeholder: "https://tiktok.com/@..." },
              { field: "facebook_url", label: "Facebook", placeholder: "https://facebook.com/..." },
            ] as const).map(({ field, label, placeholder }) => (
              <FormField key={field} label={label} htmlFor={field}>
                <input id={field} name={field} type="url" className="input" value={form[field]} onChange={handle} placeholder={placeholder} />
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

      {pickerTarget && (
        <MediaPicker
          typeSlug="image"
          title={pickerTarget === "hero" ? "Elegir imagen del hero" : "Elegir imagen de portada"}
          onSelect={handleMediaSelect}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </>
  );
}
