export type {
  ColorNormalizationMode,
  ColorMode,
  EncodedLogoAsset,
  GridConstraints,
  LogoExportFormat,
  LogoOutputSettings,
  LogoSourceFile,
  OpticalBalanceMetrics,
  ProcessedLogo,
  TargetPadding,
  TrimmedLogoBounds,
} from "./types";
export type {
  BrandFitProcessImageInput,
  BrandFitProcessImageResult,
  BrandFitProcessingSettings,
  LogoPlacementPlan,
  ResolvedBrandFitSettings,
  RgbaPixelBuffer,
} from "./engine";
export {
  calculateLogoPlacement,
  computeOpticalScale,
  cropRgbaToBounds,
  findTransparentTrimBounds as findTransparentTrimBoundsFromRgba,
  normalizeRgbaColor,
  processImage,
} from "./engine";

import type {
  ColorNormalizationMode,
  EncodedLogoAsset,
  LogoExportFormat,
  LogoOutputSettings,
  LogoSourceFile,
  OpticalBalanceMetrics,
  ProcessedLogo,
  TrimmedLogoBounds,
} from "./types";
import {
  computeOpticalDensityMetrics as computeEngineOpticalDensityMetrics,
  findTransparentTrimBounds as findEngineTransparentTrimBounds,
  normalizeRgbaColor,
  normalizeTrimBounds as normalizeEngineTrimBounds,
  processImage,
  type RgbaPixelBuffer,
} from "./engine";

const DEFAULT_ALPHA_THRESHOLD = 8;
const DEFAULT_OUTPUT_SIZE = 512;
const DEFAULT_PADDING_RATIO = 0.16;
const DEFAULT_MANUAL_SCALE = 1;
const DEFAULT_WEBP_QUALITY = 0.92;

type CanvasImageSourceLike = ImageBitmap | HTMLImageElement | HTMLCanvasElement | OffscreenCanvas;

export type DrawImageOptions = {
  width?: number;
  height?: number;
  smoothing?: boolean;
};

export type CanvasSnapshot = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  imageData: ImageData;
};

export type ProcessLogoFileOptions = Partial<LogoOutputSettings> & {
  id?: string;
  alphaThreshold?: number;
};

export type FittedLogoCanvas = {
  canvas: HTMLCanvasElement;
  fit: {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
  };
  metrics: OpticalBalanceMetrics;
};

export type ProcessedLogoOutput = ProcessedLogo & {
  blob: Blob;
  fileName: string;
  exportFormat: LogoExportFormat;
};

export type ZipEntry = {
  fileName: string;
  blob: Blob;
};

export const readImageFileToImageBitmap = async (file: File): Promise<ImageBitmap> => {
  if (!file.type.startsWith("image/")) {
    throw new TypeError(`Unsupported file type: ${file.type || "unknown"}`);
  }

  return createImageBitmap(file);
};

export const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  assertPositiveInteger(width, "width");
  assertPositiveInteger(height, "height");

  if (typeof document === "undefined") {
    throw new Error("Canvas processing is browser-only and requires document.createElement.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  return canvas;
};

export const drawImageToCanvas = (
  source: CanvasImageSourceLike,
  options: DrawImageOptions = {},
): CanvasSnapshot => {
  const width = options.width ?? source.width;
  const height = options.height ?? source.height;
  const canvas = createCanvas(width, height);
  const context = get2dContext(canvas);

  context.imageSmoothingEnabled = options.smoothing ?? true;
  context.clearRect(0, 0, width, height);
  context.drawImage(source, 0, 0, width, height);

  return {
    canvas,
    context,
    imageData: context.getImageData(0, 0, width, height),
  };
};

export const findTransparentTrimBounds = (
  imageData: ImageData,
  alphaThreshold = DEFAULT_ALPHA_THRESHOLD,
): TrimmedLogoBounds | null =>
  findEngineTransparentTrimBounds(imageDataToRgbaPixelBuffer(imageData), alphaThreshold);

export const normalizeTrimBounds = (
  bounds: TrimmedLogoBounds | null,
  sourceWidth: number,
  sourceHeight: number,
): TrimmedLogoBounds => normalizeEngineTrimBounds(bounds, sourceWidth, sourceHeight);

export const cropImageDataToBounds = (imageData: ImageData, bounds: TrimmedLogoBounds): ImageData => {
  const normalizedBounds = normalizeTrimBounds(bounds, imageData.width, imageData.height);
  const canvas = createCanvas(normalizedBounds.width, normalizedBounds.height);
  const context = get2dContext(canvas);

  context.putImageData(
    imageData,
    -normalizedBounds.left,
    -normalizedBounds.top,
    normalizedBounds.left,
    normalizedBounds.top,
    normalizedBounds.width,
    normalizedBounds.height,
  );

  return context.getImageData(0, 0, normalizedBounds.width, normalizedBounds.height);
};

export const computeOpticalDensityMetrics = (
  imageData: ImageData,
  bounds: TrimmedLogoBounds = makeBounds(0, 0, imageData.width - 1, imageData.height - 1),
  alphaThreshold = DEFAULT_ALPHA_THRESHOLD,
): OpticalBalanceMetrics =>
  computeEngineOpticalDensityMetrics(
    imageDataToRgbaPixelBuffer(imageData),
    bounds,
    alphaThreshold,
  );

export const fitLogoIntoSquareOutput = (
  imageData: ImageData,
  options: Partial<LogoOutputSettings> & {
    trimBounds?: TrimmedLogoBounds | null;
    alphaThreshold?: number;
  } = {},
): FittedLogoCanvas => {
  const outputSize = options.outputSize ?? DEFAULT_OUTPUT_SIZE;
  const result = processImage({
    image: imageDataToRgbaPixelBuffer(imageData),
    settings: {
      grid: {
        outputWidth: outputSize,
        outputHeight: outputSize,
      },
      targetPadding: {
        ratio: options.paddingRatio ?? DEFAULT_PADDING_RATIO,
      },
      colorMode: options.normalizationMode ?? "original",
      manualScale: options.manualScale ?? DEFAULT_MANUAL_SCALE,
      alphaThreshold: options.alphaThreshold,
      trimBounds: options.trimBounds,
    },
  });
  const canvas = createCanvas(outputSize, outputSize);
  const context = get2dContext(canvas);
  const sourceCanvas = imageDataToCanvas(rgbaPixelBufferToImageData(result.normalizedTrimmedImage));
  const { x, y, width, height, scale } = result.placement;

  context.clearRect(0, 0, outputSize, outputSize);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(sourceCanvas, x, y, width, height);

  return {
    canvas,
    fit: { x, y, width, height, scale },
    metrics: result.balanceMetrics,
  };
};

export const normalizeImageDataColor = (
  imageData: ImageData,
  mode: ColorNormalizationMode,
): ImageData => rgbaPixelBufferToImageData(normalizeRgbaColor(imageDataToRgbaPixelBuffer(imageData), mode));

export const canvasToWebPBlob = (
  canvas: HTMLCanvasElement,
  quality = DEFAULT_WEBP_QUALITY,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to encode canvas as WebP."));
          return;
        }

        resolve(blob);
      },
      "image/webp",
      clamp(quality, 0, 1),
    );
  });

export const canvasToPngBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to encode canvas as PNG."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });

export const canvasToEmbeddedSvgBlob = (canvas: HTMLCanvasElement): Blob => {
  const svg = canvasToEmbeddedSvgMarkup(canvas);

  return new Blob([svg], { type: "image/svg+xml" });
};

export const canvasToEmbeddedSvgMarkup = (canvas: HTMLCanvasElement): string => {
  const dataUrl = canvas.toDataURL("image/png");
  const imageBase64 = dataUrl.slice(dataUrl.indexOf(",") + 1);

  return createEmbeddedSvgMarkup({
    imageBase64,
    imageMimeType: "image/png",
    width: canvas.width,
    height: canvas.height,
  });
};

export const createEmbeddedSvgMarkup = ({
  imageBase64,
  imageMimeType,
  width,
  height,
}: {
  imageBase64: string;
  imageMimeType: string;
  width: number;
  height: number;
}): string => {
  assertPositiveInteger(width, "width");
  assertPositiveInteger(height, "height");

  /*
   * WHY this is an SVG export instead of vector tracing:
   * Most uploaded sponsor files are raster screenshots, PNGs, or flattened
   * artwork. Automatic vector tracing would invent paths, lose brand detail,
   * and imply a precision we cannot guarantee in a privacy-first release. Wrapping
   * the processed image in an SVG preserves the standardized viewBox and layout
   * behavior while keeping the logo pixels faithful to the source.
   */
  const dataUrl = `data:${imageMimeType};base64,${imageBase64}`;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">`,
    `<image href="${dataUrl}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" />`,
    "</svg>",
  ].join("");
};

export const blobToBase64 = async (blob: Blob): Promise<string> => {
  const bytes = new Uint8Array(await blob.arrayBuffer());

  return bytesToBase64(bytes);
};

export const bytesToBase64 = (bytes: Uint8Array): string => {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
};

export const processedLogoOutputToEncodedAsset = async (
  logo: ProcessedLogoOutput,
): Promise<EncodedLogoAsset> => {
  if (logo.exportFormat === "svg") {
    return {
      fileName: logo.fileName,
      mimeType: "image/svg+xml",
      encoding: "utf8",
      content: await logo.blob.text(),
    };
  }

  return {
    fileName: logo.fileName,
    mimeType: logo.blob.type || `image/${logo.exportFormat}`,
    encoding: "base64",
    content: await blobToBase64(logo.blob),
  };
};

export const processLogoFile = async (
  file: File,
  options: ProcessLogoFileOptions = {},
): Promise<ProcessedLogoOutput> => {
  const imageBitmap = await readImageFileToImageBitmap(file);

  try {
    const source = createLogoSourceFile(file);
    const snapshot = drawImageToCanvas(imageBitmap);
    const trimBounds = normalizeTrimBounds(
      findTransparentTrimBounds(snapshot.imageData, options.alphaThreshold),
      snapshot.imageData.width,
      snapshot.imageData.height,
    );
    const fitted = fitLogoIntoSquareOutput(snapshot.imageData, {
      outputSize: options.outputSize,
      paddingRatio: options.paddingRatio,
      normalizationMode: options.normalizationMode,
      manualScale: options.manualScale,
      webpQuality: options.webpQuality,
      trimBounds,
      alphaThreshold: options.alphaThreshold,
    });
    const outputSize = options.outputSize ?? DEFAULT_OUTPUT_SIZE;
    const normalizationMode = options.normalizationMode ?? "original";
    const exportFormat = options.exportFormat ?? "webp";
    const manualScale = clamp(options.manualScale ?? DEFAULT_MANUAL_SCALE, 0.65, 1.4);
    const id = options.id ?? source.id;
    const blob =
      exportFormat === "svg"
        ? canvasToEmbeddedSvgBlob(fitted.canvas)
        : exportFormat === "png"
          ? await canvasToPngBlob(fitted.canvas)
          : await canvasToWebPBlob(fitted.canvas, options.webpQuality);
    const fileName = `${sanitizeFileStem(file.name)}-${normalizationMode}-${outputSize}.${exportFormat}`;

    return {
      id,
      source,
      trimBounds,
      balanceMetrics: fitted.metrics,
      outputWidth: outputSize,
      outputHeight: outputSize,
      normalizationMode,
      manualScale,
      blob,
      fileName,
      exportFormat,
    };
  } finally {
    imageBitmap.close();
  }
};

export const generateProcessedLogosZip = async (
  entries: ZipEntry[],
  zipName = "brandfit-logos.zip",
): Promise<File> => {
  if (entries.length === 0) {
    throw new Error("Cannot generate an empty ZIP file.");
  }

  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const entry of entries) {
    const safeName = uniqueFileName(sanitizeFileName(entry.fileName), usedNames);
    zip.file(safeName, entry.blob);
  }

  const blob = await zip.generateAsync({ type: "blob" });

  return new File([blob], sanitizeFileName(zipName), { type: "application/zip" });
};

const createLogoSourceFile = (file: File): LogoSourceFile => ({
  id: `${file.name}-${file.size}-${file.lastModified}`,
  fileName: file.name,
  mimeType: file.type,
  sizeInBytes: file.size,
});

const imageDataToCanvas = (imageData: ImageData): HTMLCanvasElement => {
  const canvas = createCanvas(imageData.width, imageData.height);
  get2dContext(canvas).putImageData(imageData, 0, 0);

  return canvas;
};

const imageDataToRgbaPixelBuffer = (imageData: ImageData): RgbaPixelBuffer => ({
  width: imageData.width,
  height: imageData.height,
  /*
   * Copy the backing store before it enters the headless engine. Browser
   * ImageData is mutable and may be reused by Canvas code, while MCP adapters
   * will pass their own typed arrays. Copying here keeps the portable engine
   * deterministic and prevents UI-side mutations from leaking across calls.
   */
  data: new Uint8ClampedArray(imageData.data),
});

const rgbaPixelBufferToImageData = (image: RgbaPixelBuffer): ImageData =>
  new ImageData(new Uint8ClampedArray(image.data), image.width, image.height);

const get2dContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Unable to create a 2D canvas context.");
  }

  return context;
};

const makeBounds = (left: number, top: number, right: number, bottom: number): TrimmedLogoBounds => ({
  top,
  right,
  bottom,
  left,
  width: right - left + 1,
  height: bottom - top + 1,
});

const assertPositiveInteger = (value: number, label: string): void => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive integer.`);
  }
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const sanitizeFileStem = (fileName: string): string => {
  const stem = fileName.replace(/\.[^.]+$/, "");

  return sanitizeFileName(stem).replace(/\.[^.]+$/, "") || "logo";
};

const sanitizeFileName = (fileName: string): string => {
  const safe = fileName.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").replace(/\s+/g, "-");

  return safe.replace(/-+/g, "-").replace(/^-|-$/g, "") || "brandfit-output";
};

const uniqueFileName = (fileName: string, usedNames: Set<string>): string => {
  if (!usedNames.has(fileName)) {
    usedNames.add(fileName);
    return fileName;
  }

  const extensionIndex = fileName.lastIndexOf(".");
  const stem = extensionIndex > 0 ? fileName.slice(0, extensionIndex) : fileName;
  const extension = extensionIndex > 0 ? fileName.slice(extensionIndex) : "";
  let suffix = 2;

  while (usedNames.has(`${stem}-${suffix}${extension}`)) {
    suffix += 1;
  }

  const uniqueName = `${stem}-${suffix}${extension}`;
  usedNames.add(uniqueName);

  return uniqueName;
};
