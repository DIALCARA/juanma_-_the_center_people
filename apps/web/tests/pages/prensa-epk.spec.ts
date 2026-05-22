import { test, expect } from "@playwright/test";

test.describe("Página de Prensa / EPK", () => {
  test("carga con título correcto", async ({ page }) => {
    await page.goto("/prensa-epk");
    await expect(page).toHaveTitle(/Prensa/i);
  });

  test("muestra encabezado h1", async ({ page }) => {
    await page.goto("/prensa-epk");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("sección de material descargable visible", async ({ page }) => {
    await page.goto("/prensa-epk");
    await expect(page.getByRole("region", { name: /Material descargable/i })).toBeVisible();
  });

  test("sección contacto de prensa con CTA", async ({ page }) => {
    await page.goto("/prensa-epk");
    const section = page.getByRole("region", { name: /Contacto de prensa/i });
    await expect(section).toBeVisible();
    await expect(section.getByRole("link")).toBeVisible();
  });
});
