import { test, expect } from "@playwright/test";

test.describe("Página de música", () => {
  test("carga con título correcto", async ({ page }) => {
    await page.goto("/musica");
    await expect(page).toHaveTitle(/Música/i);
  });

  test("muestra encabezado h1", async ({ page }) => {
    await page.goto("/musica");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("contiene sección del reproductor de Spotify", async ({ page }) => {
    await page.goto("/musica");
    const section = page.getByRole("region", { name: /Spotify/i });
    await expect(section).toBeVisible();
  });
});
