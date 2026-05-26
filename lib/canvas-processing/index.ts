export type {
  ColorNormalizationMode,
  LogoExportFormat,
  LogoOutputSettings,
  LogoSourceFile,
  OpticalBalanceMetrics,
  ProcessedLogo,
  TrimmedLogoBounds,
} from "./types";

import type {
  ColorNormalizationMode,
  LogoExportFormat,
  LogoOutputSettings,
  LogoSourceFile,
  OpticalBalanceMetrics,
  ProcessedLogo,
  TrimmedLogoBounds,
} from "./types";

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
): TrimmedLogoBounds | null => {
  const { data, width, height } = imageData;
  let top = height;
  let right = -1;
  let bottom = -1;
  let left = width;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];

      if (alpha <= alphaThreshold) {
        continue;
      }

      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
      left = Math.min(left, x);
    }
  }

  if (right < left || bottom < top) {
    return null;
  }

  return makeBounds(left, top, right, bottom);
};

export const normalizeTrimBounds = (
  bounds: TrimmedLogoBounds | null,
  sourceWidth: number,
  sourceHeight: number,
): TrimmedLogoBounds => {
  if (!bounds) {
    return makeBounds(0, 0, sourceWidth - 1, sourceHeight - 1);
  }

  const left = clamp(Math.floor(bounds.left), 0, sourceWidth - 1);
  const top = clamp(Math.floor(bounds.top), 0, sourceHeight - 1);
  const right = clamp(Math.ceil(bounds.right), left, sourceWidth - 1);
  const bottom = clamp(Math.ceil(bounds.bottom), top, sourceHeight - 1);

  return makeBounds(left, top, right, bottom);
};

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
): OpticalBalanceMetrics => {
  const normalizedBounds = normalizeTrimBounds(bounds, imageData.width, imageData.height);
  const { data, width } = imageData;
  let visiblePixels = 0;
  let alphaSum = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (let y = normalizedBounds.top; y <= normalizedBounds.bottom; y += 1) {
    for (let x = normalizedBounds.left; x <= normalizedBounds.right; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];

      if (alpha <= alphaThreshold) {
        continue;
      }

      visiblePixels += 1;
      alphaSum += alpha;
      weightedX += x * alpha;
      weightedY += y * alpha;
    }
  }

  const boxArea = normalizedBounds.width * normalizedBounds.height;
  const visiblePixelRatio = boxArea > 0 ? visiblePixels / boxArea : 0;
  const alphaDensity = boxArea > 0 ? alphaSum / (boxArea * 255) : 0;
  const centerX = normalizedBounds.left + (normalizedBounds.width - 1) / 2;
  const centerY = normalizedBounds.top + (normalizedBounds.height - 1) / 2;
  const visualX = alphaSum > 0 ? weightedX / alphaSum : centerX;
  const visualY = alphaSum > 0 ? weightedY / alphaSum : centerY;

  return {
    visiblePixelRatio,
    visualCenterOffset: {
      x: normalizedBounds.width > 0 ? (visualX - centerX) / normalizedBounds.width : 0,
      y: normalizedBounds.height > 0 ? (visualY - centerY) / normalizedBounds.height : 0,
    },
    alphaDensity,
    opticalScale: computeOpticalScale(visiblePixelRatio, alphaDensity),
  };
};

export const fitLogoIntoSquareOutput = (
  imageData: ImageData,
  options: Partial<LogoOutputSettings> & {
    trimBounds?: TrimmedLogoBounds | null;
    alphaThreshold?: number;
  } = {},
): FittedLogoCanvas => {
  const outputSize = options.outputSize ?? DEFAULT_OUTPUT_SIZE;
  const paddingRatio = clamp(options.paddingRatio ?? DEFAULT_PADDING_RATIO, 0, 0.45);
  const trimBounds = normalizeTrimBounds(
    options.trimBounds ?? findTransparentTrimBounds(imageData, options.alphaThreshold),
    imageData.width,
    imageData.height,
  );
  const croppedData = cropImageDataToBounds(imageData, trimBounds);
  const normalizedData = normalizeImageDataColor(
    croppedData,
    options.normalizationMode ?? "original",
  );
  const metrics = computeOpticalDensityMetrics(imageData, trimBounds, options.alphaThreshold);
  const canvas = createCanvas(outputSize, outputSize);
  const context = get2dContext(canvas);
  const sourceCanvas = imageDataToCanvas(normalizedData);
  const drawableSize = outputSize * (1 - paddingRatio * 2);
  const geometricScale = Math.min(
    drawableSize / trimBounds.width,
    drawableSize / trimBounds.height,
  );
  const manualScale = clamp(options.manualScale ?? DEFAULT_MANUAL_SCALE, 0.65, 1.4);

  /*
   * WHY manual scale is multiplied last:
   * The pipeline first finds the maximum safe geometric fit, then applies the
   * automatic density correction. The reviewer adjustment is intentionally the
   * final multiplier so "make this logo 8% bigger" means 8% bigger than
   * BrandFit's recommended output, not 8% bigger than the raw source bounds.
   */
  const scale = geometricScale * metrics.opticalScale * manualScale;
  const width = trimBounds.width * scale;
  const height = trimBounds.height * scale;

  /*
   * WHY this centers better than raw bounds:
   * Transparent trim gives us the smallest geometric rectangle, but logos are
   * often lopsided: a registered mark, long descender, or dense icon can pull
   * the eye away from the rectangle's center. The alpha-weighted centroid finds
   * where the visible pixels actually carry mass. Moving the destination in the
   * opposite direction recenters that mass while keeping all math scale-invariant.
  */
  const balanceStrength = 0.55;
  const balancedX = (outputSize - width) / 2 - metrics.visualCenterOffset.x * width * balanceStrength;
  const balancedY =
    (outputSize - height) / 2 - metrics.visualCenterOffset.y * height * balanceStrength;
  const x = clamp(balancedX, 0, outputSize - width);
  const y = clamp(balancedY, 0, outputSize - height);

  context.clearRect(0, 0, outputSize, outputSize);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(sourceCanvas, x, y, width, height);

  return {
    canvas,
    fit: { x, y, width, height, scale },
    metrics,
  };
};

export const normalizeImageDataColor = (
  imageData: ImageData,
  mode: ColorNormalizationMode,
): ImageData => {
  if (mode === "original") {
    return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
  }

  const normalized = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
  );

  for (let index = 0; index < normalized.data.length; index += 4) {
    const alpha = normalized.data[index + 3];

    if (alpha === 0) {
      continue;
    }

    if (mode === "black" || mode === "white") {
      const channel = mode === "black" ? 0 : 255;
      normalized.data[index] = channel;
      normalized.data[index + 1] = channel;
      normalized.data[index + 2] = channel;
      continue;
    }

    /*
     * WHY these weights:
     * sRGB green contributes the most perceived brightness and blue the least.
     * Using the Rec. 709 luma coefficients keeps grayscale marks visually close
     * to their original contrast instead of averaging channels equally.
     */
    const gray = Math.round(
      normalized.data[index] * 0.2126 +
        normalized.data[index + 1] * 0.7152 +
        normalized.data[index + 2] * 0.0722,
    );
    normalized.data[index] = gray;
    normalized.data[index + 1] = gray;
    normalized.data[index + 2] = gray;
  }

  return normalized;
};

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
  const size = canvas.width;
  const dataUrl = canvas.toDataURL("image/png");

  /*
   * WHY this is an SVG export instead of vector tracing:
   * Most uploaded sponsor files are raster screenshots, PNGs, or flattened
   * artwork. Automatic vector tracing would invent paths, lose brand detail,
   * and imply a precision we cannot guarantee in a privacy-first MVP. Wrapping
   * the processed canvas in an SVG preserves the standardized square viewBox
   * and layout behavior while keeping the logo pixels faithful to the source.
   */
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img">`,
    `<image href="${dataUrl}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet" />`,
    "</svg>",
  ].join("");

  return new Blob([svg], { type: "image/svg+xml" });
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

const get2dContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Unable to create a 2D canvas context.");
  }

  return context;
};

const computeOpticalScale = (visiblePixelRatio: number, alphaDensity: number): number => {
  /*
   * WHY this heuristic works for MVP:
   * Designers judge logo size by ink density, not by bounding boxes. A sparse
   * wordmark inside a wide trim box looks smaller than a filled app icon at the
   * same geometric size, so we gently enlarge sparse marks and slightly reduce
   * dense marks. The clamp keeps the correction subtle enough to avoid clipping.
   */
  const densitySignal = (visiblePixelRatio + alphaDensity) / 2;

  return clamp(1.1 - densitySignal * 0.28, 0.9, 1.08);
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
