import { test, expect } from "@playwright/test";

test.describe("Página de inicio", () => {
  test("carga correctamente con título de banda", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Juanma/i);
  });

  test("muestra el hero con el nombre de la banda", async ({ page }) => {
    await page.goto("/");
    const hero = page.getByRole("region", { name: /Presentación/i });
    await expect(hero).toBeVisible();
    await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("contiene enlace a Contacto / Booking", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Contacto/i }).first()).toBeVisible();
  });

  test("sección de fechas tiene contenido o mensaje vacío", async ({ page }) => {
    await page.goto("/");
    const fechasSection = page.getByRole("region", { name: /Próximas fechas/i });
    await expect(fechasSection).toBeVisible();
  });

  test("sección de prensa/EPK tiene CTA visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Prensa.*EPK/i })).toBeVisible();
  });

  test("skip link de accesibilidad existe", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: /Ir al contenido principal/i });
    await expect(skipLink).toBeAttached();
  });

  test("header con navegación principal visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: /Navegación principal/i })).toBeVisible();
  });

  test("footer visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
  });
});
