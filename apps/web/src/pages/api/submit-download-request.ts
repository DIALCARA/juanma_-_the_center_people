import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const apiUrl = import.meta.env.API_BASE_URL ?? "http://localhost:8000";

    const res = await fetch(`${apiUrl}/api/public/download-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Error interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
