import { test, expect } from "@playwright/test";

test.describe("Página de videos", () => {
  test("carga con título correcto", async ({ page }) => {
    await page.goto("/videos");
    await expect(page).toHaveTitle(/Videos/i);
  });

  test("muestra encabezado h1", async ({ page }) => {
    await page.goto("/videos");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("sección galería de videos visible", async ({ page }) => {
    await page.goto("/videos");
    await expect(page.getByRole("region", { name: /Galería de videos/i })).toBeVisible();
  });
});
