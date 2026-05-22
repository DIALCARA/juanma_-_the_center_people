import { test, expect } from "@playwright/test";

test.describe("Página de fechas", () => {
  test("carga con título correcto", async ({ page }) => {
    await page.goto("/fechas");
    await expect(page).toHaveTitle(/Fechas/i);
  });

  test("muestra encabezado h1", async ({ page }) => {
    await page.goto("/fechas");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("sección de lista de fechas visible", async ({ page }) => {
    await page.goto("/fechas");
    await expect(page.getByRole("region", { name: /Lista de fechas/i })).toBeVisible();
  });

  test("sección de booking visible con CTA", async ({ page }) => {
    await page.goto("/fechas");
    const section = page.getByRole("region", { name: /Booking/i });
    await expect(section).toBeVisible();
    await expect(section.getByRole("link")).toBeVisible();
  });
});
