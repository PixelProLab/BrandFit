import { expect, test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import JSZip from "jszip";

test("processes logos locally and exports a zip", async ({ page }) => {
  const logoRequests: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (
      (url.startsWith("http://") || url.startsWith("https://")) &&
      !url.startsWith("http://localhost:3000")
    ) {
      logoRequests.push(url);
    }
  });

  await page.goto("/");
  await expect(page.getByAltText("BrandFit by Pixel Pro Lab logo")).toBeVisible();
  await expect(page.getByText("Optically balance your logo grids")).toBeVisible();
  await expect(page.getByTestId("file-input")).toHaveAttribute("data-ready", "true");

  const files = await createPngFixtures(page);
  const input = page.getByTestId("file-input");
  await input.setInputFiles(files);
  await input.dispatchEvent("change");

  await expect(page.getByTestId("logo-card")).toHaveCount(2);
  await expect(page.getByText("complete")).toHaveCount(2, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Final output grid" })).toBeVisible();
  await expect(page.getByLabel("Selected logo controls").getByText("fixture-1.png")).toBeVisible();
  await expect(page.getByRole("button", { name: "Export ZIP" })).toBeVisible();

  await page.getByLabel("Selected logo controls").getByRole("button", { name: "Bigger" }).click();
  await expect(page.getByText(/Manual scale updated/)).toBeVisible();
  await expect(page.getByText("complete")).toHaveCount(2, { timeout: 20_000 });
  await expect(page.getByLabel("Final output grid preview").getByText("Manual 104%")).toBeVisible();

  await page.getByRole("button", { name: "PNG", exact: true }).click();
  await expect(page.getByText(/Reprocessing/)).toBeVisible();
  await expect(page.getByText("complete")).toHaveCount(2, { timeout: 20_000 });

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export ZIP" }).click();
  const download = await downloadPromise;
  const buffer = await download.createReadStream().then(
    (stream) =>
      new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
      }),
  );
  const zip = await JSZip.loadAsync(buffer);
  const names = Object.keys(zip.files);

  expect(download.suggestedFilename()).toBe("brandfit-logos.zip");
  expect(names).toHaveLength(2);
  expect(names.every((name) => name.endsWith(".png"))).toBe(true);
  expect(logoRequests).toEqual([]);
});

test("has no critical accessibility violations on the initial workspace", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("keeps the workspace usable on mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Select logos" })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

const createPngFixtures = async (page: import("@playwright/test").Page) => {
  const payloads = await page.evaluate(() => {
    const makePng = (draw: (context: CanvasRenderingContext2D) => void) => {
      const canvas = document.createElement("canvas");
      canvas.width = 96;
      canvas.height = 96;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("No canvas context");
      draw(context);
      return canvas.toDataURL("image/png").split(",")[1];
    };

    return [
      makePng((context) => {
        context.fillStyle = "#111827";
        context.fillRect(28, 28, 40, 40);
      }),
      makePng((context) => {
        context.fillStyle = "#0f766e";
        context.fillRect(12, 40, 72, 16);
        context.fillRect(12, 60, 42, 8);
      }),
    ];
  });

  return payloads.map((base64, index) => ({
    name: `fixture-${index + 1}.png`,
    mimeType: "image/png",
    buffer: Buffer.from(base64, "base64"),
  }));
};
