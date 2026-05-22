// Eventos personalizados de Umami
declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, string | number | boolean>) => void;
    };
  }
}

export function trackEvent(
  event: string,
  data?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.umami) {
    window.umami.track(event, data);
  }
}

/**
 * Eventos personalizados oficiales (definidos en docs/09_analytics_seo_accesibilidad.md).
 * Mantener sincronizados con los atributos `data-umami-event` del HTML.
 */
export const Events = {
  // Redes sociales
  CLICK_SPOTIFY: "click_spotify",
  CLICK_YOUTUBE: "click_youtube",
  CLICK_INSTAGRAM: "click_instagram",
  CLICK_TIKTOK: "click_tiktok",
  CLICK_FACEBOOK: "click_facebook",

  // Contacto / Booking
  CLICK_CONTACT_BOOKING: "click_contact_booking",
  CLICK_CONTACT_PRESS: "click_contact_press",
  SUBMIT_CONTACT_FORM: "submit_contact_form",

  // Descargas
  REQUEST_DOWNLOAD: "request_download",
  CLICK_DOWNLOAD_PUBLIC: "click_download_public",
  APPROVE_DOWNLOAD: "approve_download",

  // Vistas de secciones
  VIEW_EPK: "view_epk",
  VIEW_MUSIC: "view_music",
  VIEW_GALLERY: "view_gallery",

  // Extras de granularidad (música y entradas)
  CLICK_RELEASE_SPOTIFY: "click_release_spotify",
  CLICK_RELEASE_YOUTUBE: "click_release_youtube",
  CLICK_REEL: "click_reel",
  CLICK_TICKET: "click_ticket",
} as const;
