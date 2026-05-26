import "@testing-library/jest-dom/vitest";

if (typeof globalThis.ImageData === "undefined") {
  class ImageDataPolyfill {
    readonly colorSpace = "srgb" as PredefinedColorSpace;
    readonly data: Uint8ClampedArray;
    readonly height: number;
    readonly width: number;

    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data;
      this.width = width;
      this.height = height ?? data.length / 4 / width;
    }
  }

  globalThis.ImageData = ImageDataPolyfill as typeof ImageData;
}
