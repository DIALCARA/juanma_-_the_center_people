import { test, expect } from "@playwright/test";

test.describe("Página de la banda", () => {
  test("carga con título correcto", async ({ page }) => {
    await page.goto("/banda");
    await expect(page).toHaveTitle(/Banda/i);
  });

  test("muestra encabezado h1", async ({ page }) => {
    await page.goto("/banda");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navega desde el header al hacer click en Banda", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Banda", exact: true }).first().click();
    await expect(page).toHaveURL(/\/banda/);
  });

  test("sección de integrantes visible o con mensaje vacío", async ({ page }) => {
    await page.goto("/banda");
    const section = page.getByRole("region", { name: /Integrantes/i });
    await expect(section).toBeVisible();
  });
});
