import { test, expect } from "@playwright/test";
import fs from "node:fs";

// Screenshots land here so the PR-preview workflow can collect and post them.
const SHOT_DIR = "preview-shots";

const PAGES = [
  { path: "/", name: "home" },
  { path: "/locations/", name: "locations" },
  { path: "/learn/", name: "learn" },
  { path: "/products/", name: "products" },
  { path: "/blog/", name: "blog" },
  { path: "/contact/", name: "contact" },
];

for (const p of PAGES) {
  test(`${p.name} renders without JS errors`, async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    // Uncaught exceptions are real defects; external resource console noise is not.
    page.on("pageerror", (e) => pageErrors.push(String(e)));

    const resp = await page.goto(p.path, { waitUntil: "load" });
    expect(resp?.status(), `${p.path} HTTP status`).toBeLessThan(400);

    // Every page has a visible top-level heading.
    await expect(page.locator("h1").first()).toBeVisible();

    // The locations page must actually initialise its interactive map.
    if (p.name === "locations") {
      await expect(
        page.locator(".leaflet-container, canvas, .maplibregl-canvas").first(),
      ).toBeVisible({ timeout: 15_000 });
    }

    // Full-page for desktop (good for reviewing a whole page); viewport-only
    // for mobile, where a long page's full-height PNG is enormous and slow.
    const fullPage = testInfo.project.name === "desktop" && p.name !== "locations";
    fs.mkdirSync(SHOT_DIR, { recursive: true });
    await page.screenshot({
      path: `${SHOT_DIR}/${testInfo.project.name}-${p.name}.png`,
      fullPage,
      animations: "disabled",
      timeout: 20_000,
    });

    expect(pageErrors, `uncaught JS errors on ${p.path}`).toEqual([]);
  });
}

// The juggling-shops directory is the most-visited page; its clustered map has
// its own failure mode ("Failed to load map"), so guard it explicitly.
test("juggling-shops map initialises", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));

  await page.goto("/locations/juggling-shops/", { waitUntil: "load" });
  await expect(page.locator(".leaflet-container").first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Failed to load map")).toHaveCount(0);
  expect(pageErrors, "uncaught JS errors on juggling-shops map").toEqual([]);
});
