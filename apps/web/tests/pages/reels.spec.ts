import { test, expect } from "@playwright/test";

test.describe("Página de reels", () => {
  test("carga con título correcto", async ({ page }) => {
    await page.goto("/reels");
    await expect(page).toHaveTitle(/Reels/i);
  });

  test("muestra encabezado h1", async ({ page }) => {
    await page.goto("/reels");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("sección galería de reels visible", async ({ page }) => {
    await page.goto("/reels");
    await expect(page.getByRole("region", { name: /Galería de reels/i })).toBeVisible();
  });
});
