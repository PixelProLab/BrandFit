import { describe, expect, it } from "vitest";
import {
  computeOpticalDensityMetrics,
  findTransparentTrimBounds,
  normalizeImageDataColor,
} from "@/lib/canvas-processing";

const imageDataFromPixels = (width: number, pixels: Array<[number, number, number, number]>) =>
  new ImageData(new Uint8ClampedArray(pixels.flat()), width, pixels.length / width);

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
});
