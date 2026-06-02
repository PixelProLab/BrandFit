import { describe, expect, it } from "vitest";
import {
  computeOpticalDensityMetrics,
  createEmbeddedSvgMarkup,
  findTransparentTrimBounds,
  normalizeImageDataColor,
  processImage,
  type RgbaPixelBuffer,
} from "@/lib/canvas-processing";

const imageDataFromPixels = (width: number, pixels: Array<[number, number, number, number]>) =>
  new ImageData(new Uint8ClampedArray(pixels.flat()), width, pixels.length / width);

const rgbaBufferFromPixels = (
  width: number,
  pixels: Array<[number, number, number, number]>,
): RgbaPixelBuffer => ({
  width,
  height: pixels.length / width,
  data: new Uint8ClampedArray(pixels.flat()),
});

describe("canvas-processing", () => {
  it("finds the smallest non-transparent trim bounds", () => {
    const imageData = imageDataFromPixels(4, [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [255, 0, 0, 255],
      [0, 0, 255, 255],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 255, 0, 255],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    expect(findTransparentTrimBounds(imageData)).toEqual({
      left: 1,
      top: 1,
      right: 2,
      bottom: 2,
      width: 2,
      height: 2,
    });
  });

  it("keeps transparent pixels transparent during color normalization", () => {
    const imageData = imageDataFromPixels(2, [
      [120, 80, 40, 255],
      [255, 255, 255, 0],
    ]);

    const normalized = normalizeImageDataColor(imageData, "black");

    expect(Array.from(normalized.data)).toEqual([0, 0, 0, 255, 255, 255, 255, 0]);
  });

  it("scales sparse marks larger than dense marks for optical balance", () => {
    const sparse = imageDataFromPixels(4, [
      [0, 0, 0, 255],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 255],
    ]);
    const dense = imageDataFromPixels(
      4,
      Array.from({ length: 16 }, () => [0, 0, 0, 255] as [number, number, number, number]),
    );

    const sparseMetrics = computeOpticalDensityMetrics(sparse);
    const denseMetrics = computeOpticalDensityMetrics(dense);

    expect(sparseMetrics.opticalScale).toBeGreaterThan(denseMetrics.opticalScale);
  });

  it("processes a logo through the headless engine without browser Canvas classes", () => {
    const image = rgbaBufferFromPixels(4, [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [90, 120, 180, 255],
      [90, 120, 180, 255],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [90, 120, 180, 255],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    const result = processImage({
      image,
      settings: {
        grid: { outputWidth: 256, outputHeight: 256 },
        targetPadding: { ratio: 0.2 },
        colorMode: "white",
        manualScale: 1.1,
      },
    });

    expect(result.trimBounds).toEqual({
      left: 1,
      top: 1,
      right: 2,
      bottom: 2,
      width: 2,
      height: 2,
    });
    expect(result.normalizedTrimmedImage.width).toBe(2);
    expect(result.normalizedTrimmedImage.height).toBe(2);
    expect(Array.from(result.normalizedTrimmedImage.data.slice(0, 4))).toEqual([
      255,
      255,
      255,
      255,
    ]);
    expect(result.placement.width).toBeGreaterThan(0);
    expect(result.placement.height).toBeGreaterThan(0);
    expect(result.settings.grid.outputWidth).toBe(256);
  });

  it("creates standalone SVG markup for MCP and browser export adapters", () => {
    const svg = createEmbeddedSvgMarkup({
      imageBase64: "ZmFrZS1pbWFnZQ==",
      imageMimeType: "image/png",
      width: 512,
      height: 512,
    });

    expect(svg).toContain('viewBox="0 0 512 512"');
    expect(svg).toContain("data:image/png;base64,ZmFrZS1pbWFnZQ==");
  });
});
