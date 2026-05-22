const API_URL = import.meta.env.API_BASE_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json();
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  errors: string[];
}

export async function getSiteSettings() {
  return apiFetch<ApiResponse<Record<string, string>>>("/api/public/site-settings");
}

export async function getSections() {
  return apiFetch<ApiResponse<any[]>>("/api/public/sections");
}

/**
 * Helper para páginas individuales. Devuelve el estado de la sección
 * para decidir si renderizar el contenido o "Sección no disponible".
 *
 * Convención: si la API no responde (red caída, etc.), asume habilitada
 * para no dejar al sitio inutilizable.
 */
export async function getSectionInfo(slug: string): Promise<{
  isEnabled: boolean;
  title: string | undefined;
  message: string | undefined;
  info: any;
}> {
  try {
    const res = await getSections();
    const section = (res.data ?? []).find((s: any) => s.slug === slug);
    return {
      isEnabled: section ? section.is_enabled !== false : true,
      title: section?.title,
      message: section?.empty_state_message,
      info: section,
    };
  } catch {
    return { isEnabled: true, title: undefined, message: undefined, info: null };
  }
}

export async function getHome() {
  return apiFetch<ApiResponse<any>>("/api/public/home");
}

export async function getBand() {
  return apiFetch<ApiResponse<any>>("/api/public/band");
}

export async function getMusic() {
  return apiFetch<ApiResponse<any>>("/api/public/music");
}

export async function getMedia(params?: {
  type?: string;
  category?: string;
  page?: number;
  page_size?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.type) qs.set("type", params.type);
  if (params?.category) qs.set("category", params.category);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  return apiFetch<any>(`/api/public/media?${qs.toString()}`);
}

/**
 * Devuelve las categorías de un tipo (image/video/reel) que tienen al menos 1 archivo visible.
 * Útil para no mostrar tabs vacías en las galerías públicas.
 */
export async function getMediaCategories(type: string) {
  return apiFetch<ApiResponse<Array<{ id: number; name: string; slug: string; count: number }>>>(
    `/api/public/media-categories?type=${encodeURIComponent(type)}`,
  );
}

export async function getEvents() {
  return apiFetch<ApiResponse<any>>("/api/public/events");
}

export async function getPressEpk() {
  return apiFetch<ApiResponse<any>>("/api/public/press-epk");
}

export async function submitContact(body: {
  name: string;
  email: string;
  contact_type: string;
  message: string;
}) {
  return apiFetch<ApiResponse<null>>("/api/public/contact", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function requestDownload(body: {
  download_asset_id: number;
  name: string;
  email: string;
  organization?: string;
  reason: string;
  message?: string;
}) {
  return apiFetch<ApiResponse<null>>("/api/public/download-requests", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
