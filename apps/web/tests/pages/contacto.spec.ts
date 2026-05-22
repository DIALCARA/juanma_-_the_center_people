import { test, expect } from "@playwright/test";

test.describe("Página de contacto", () => {
  test("carga con título correcto", async ({ page }) => {
    await page.goto("/contacto");
    await expect(page).toHaveTitle(/Contacto/i);
  });

  test("muestra encabezado h1", async ({ page }) => {
    await page.goto("/contacto");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("formulario de contacto tiene todos los campos requeridos", async ({ page }) => {
    await page.goto("/contacto");
    await expect(page.locator("#contact_type")).toBeVisible();
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#message")).toBeVisible();
    await expect(page.locator("#submit-btn")).toBeVisible();
  });

  test("validación HTML5 impide enviar con campos vacíos", async ({ page }) => {
    await page.goto("/contacto");
    await page.locator("#submit-btn").click();
    // El formulario no debe enviar, los campos requeridos disparan validación nativa
    await expect(page.locator("#form-status")).not.toBeVisible();
  });

  test("param ?tipo=booking preselecciona opción Booking", async ({ page }) => {
    await page.goto("/contacto?tipo=booking");
    await expect(page.locator("#contact_type")).toHaveValue("booking");
  });

  test("param ?tipo=prensa preselecciona opción Prensa", async ({ page }) => {
    await page.goto("/contacto?tipo=prensa");
    await expect(page.locator("#contact_type")).toHaveValue("press");
  });

  test("formulario envía correctamente con datos válidos (mock API)", async ({ page }) => {
    // Interceptar la llamada a la API interna de Astro
    await page.route("/api/submit-contact", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Mensaje recibido" }),
      });
    });

    await page.goto("/contacto");
    await page.selectOption("#contact_type", "fan");
    await page.fill("#name", "María García");
    await page.fill("#email", "maria@example.com");
    await page.fill("#message", "Hola, son muy buenos! Los escucho siempre.");
    await page.locator("#submit-btn").click();

    await expect(page.locator("#form-status")).toBeVisible();
    await expect(page.locator("#form-status")).toContainText(/enviado/i);
  });

  test("muestra error cuando la API falla", async ({ page }) => {
    await page.route("/api/submit-contact", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Error interno" }),
      });
    });

    await page.goto("/contacto");
    await page.selectOption("#contact_type", "fan");
    await page.fill("#name", "Test User");
    await page.fill("#email", "test@example.com");
    await page.fill("#message", "Mensaje de prueba para el test.");
    await page.locator("#submit-btn").click();

    await expect(page.locator("#form-status")).toBeVisible();
    await expect(page.locator("#form-status")).toContainText(/error/i);
  });
});
