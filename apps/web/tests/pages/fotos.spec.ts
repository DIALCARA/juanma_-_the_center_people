import { test, expect } from "@playwright/test";

test.describe("Página de fotos", () => {
  test("carga con título correcto", async ({ page }) => {
    await page.goto("/fotos");
    await expect(page).toHaveTitle(/Fotos/i);
  });

  test("muestra encabezado h1", async ({ page }) => {
    await page.goto("/fotos");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("sección galería visible", async ({ page }) => {
    await page.goto("/fotos");
    const gallery = page.getByRole("region", { name: /Galería de fotos/i });
    await expect(gallery).toBeVisible();
  });

  test("lightbox se abre al hacer click en una foto (si hay fotos)", async ({ page }) => {
    await page.goto("/fotos");
    const firstBtn = page.locator("#gallery button[data-src]").first();
    const count = await firstBtn.count();
    if (count > 0) {
      await firstBtn.click();
      const lightbox = page.locator("#lightbox");
      await expect(lightbox).not.toHaveClass(/hidden/);
    }
  });

  test("lightbox se cierra con botón ×", async ({ page }) => {
    await page.goto("/fotos");
    const firstBtn = page.locator("#gallery button[data-src]").first();
    const count = await firstBtn.count();
    if (count > 0) {
      await firstBtn.click();
      await page.locator("#lightbox-close").click();
      await expect(page.locator("#lightbox")).toHaveClass(/hidden/);
    }
  });
});
