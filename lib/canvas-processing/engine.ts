import type {
  ColorMode,
  GridConstraints,
  OpticalBalanceMetrics,
  TargetPadding,
  TrimmedLogoBounds,
} from "./types";

const DEFAULT_ALPHA_THRESHOLD = 8;
const DEFAULT_OUTPUT_SIZE = 512;
const DEFAULT_PADDING_RATIO = 0.16;
const DEFAULT_MANUAL_SCALE = 1;
const DEFAULT_BALANCE_STRENGTH = 0.55;

/**
 * A raw RGBA pixel buffer that can be created by either a browser Canvas
 * adapter or a future Node MCP adapter backed by `sharp`, `canvas`, or another
 * image decoder.
 *
 * This contract intentionally avoids DOM classes such as `ImageData`,
 * `HTMLCanvasElement`, and `Blob`. MCP tools can serialize the numeric
 * settings into JSON schema and keep the pixel transport in a runtime-specific
 * adapter.
 */
export type RgbaPixelBuffer = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

export type BrandFitProcessingSettings = {
  /**
   * Target output box used by grid systems. The default is a square 512 x 512
   * asset, but the math accepts rectangular boxes for future layout tools.
   */
  grid?: Partial<GridConstraints>;
  /**
   * Padding applied inside the target box before optical scaling. Ratio padding
   * is preferred because it remains stable across 256, 512, and 1024 outputs.
   */
  targetPadding?: Partial<TargetPadding>;
  /**
   * Color policy applied to visible pixels before export. This maps directly to
   * MCP JSON schema as a small enum.
   */
  colorMode?: ColorMode;
  /**
   * Per-logo reviewer correction applied after automatic optical balancing.
   */
  manualScale?: number;
  /**
   * Alpha values at or below this threshold are considered transparent. Keeping
   * the threshold explicit lets server and browser runtimes agree on trim math.
   */
  alphaThreshold?: number;
  /**
   * Optional caller-provided trim bounds. Browser and MCP adapters can pass a
   * cached trim rectangle when they already measured one, avoiding duplicate
   * scanning while keeping the same normalized validation rules.
   */
  trimBounds?: TrimmedLogoBounds | null;
  /**
   * How strongly alpha centroid offset should affect placement. `0` disables
   * optical recentering; `1` fully compensates the measured mass offset.
   */
  balanceStrength?: number;
};

export type BrandFitProcessImageInput = {
  image: RgbaPixelBuffer;
  settings?: BrandFitProcessingSettings;
};

export type LogoPlacementPlan = {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
};

export type ResolvedBrandFitSettings = {
  grid: GridConstraints;
  targetPadding: TargetPadding;
  colorMode: ColorMode;
  manualScale: number;
  alphaThreshold: number;
  balanceStrength: number;
};

export type BrandFitProcessImageResult = {
  trimBounds: TrimmedLogoBounds;
  normalizedTrimmedImage: RgbaPixelBuffer;
  balanceMetrics: OpticalBalanceMetrics;
  placement: LogoPlacementPlan;
  settings: ResolvedBrandFitSettings;
};

/**
 * Headless BrandFit engine.
 *
 * This function owns the math that must remain portable to an MCP server:
 * transparent trim, optical-density measurement, color normalization, padding,
 * manual scale, and final placement. It does not read files, access the DOM,
 * allocate Canvas elements, create Blobs, or encode images.
 */
export const processImage = ({
  image,
  settings = {},
}: BrandFitProcessImageInput): BrandFitProcessImageResult => {
  assertRgbaPixelBuffer(image);

  const resolvedSettings = resolveSettings(settings);
  const trimBounds = normalizeTrimBounds(
    settings.trimBounds ?? findTransparentTrimBounds(image, resolvedSettings.alphaThreshold),
    image.width,
    image.height,
  );
  const normalizedTrimmedImage = normalizeRgbaColor(
    cropRgbaToBounds(image, trimBounds),
    resolvedSettings.colorMode,
  );
  const balanceMetrics = computeOpticalDensityMetrics(
    image,
    trimBounds,
    resolvedSettings.alphaThreshold,
  );
  const placement = calculateLogoPlacement({
    trimBounds,
    metrics: balanceMetrics,
    settings: resolvedSettings,
  });

  return {
    trimBounds,
    normalizedTrimmedImage,
    balanceMetrics,
    placement,
    settings: resolvedSettings,
  };
};

export const findTransparentTrimBounds = (
  image: RgbaPixelBuffer,
  alphaThreshold = DEFAULT_ALPHA_THRESHOLD,
): TrimmedLogoBounds | null => {
  assertRgbaPixelBuffer(image);

  let top = image.height;
  let right = -1;
  let bottom = -1;
  let left = image.width;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const alpha = image.data[(y * image.width + x) * 4 + 3];

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
  const width = Math.max(1, Math.floor(sourceWidth));
  const height = Math.max(1, Math.floor(sourceHeight));

  if (!bounds) {
    return makeBounds(0, 0, width - 1, height - 1);
  }

  const left = clamp(Math.floor(bounds.left), 0, width - 1);
  const top = clamp(Math.floor(bounds.top), 0, height - 1);
  const right = clamp(Math.ceil(bounds.right), left, width - 1);
  const bottom = clamp(Math.ceil(bounds.bottom), top, height - 1);

  return makeBounds(left, top, right, bottom);
};

export const cropRgbaToBounds = (
  image: RgbaPixelBuffer,
  bounds: TrimmedLogoBounds,
): RgbaPixelBuffer => {
  assertRgbaPixelBuffer(image);
  const normalizedBounds = normalizeTrimBounds(bounds, image.width, image.height);
  const output = new Uint8ClampedArray(normalizedBounds.width * normalizedBounds.height * 4);

  for (let y = 0; y < normalizedBounds.height; y += 1) {
    for (let x = 0; x < normalizedBounds.width; x += 1) {
      const sourceIndex =
        ((normalizedBounds.top + y) * image.width + normalizedBounds.left + x) * 4;
      const outputIndex = (y * normalizedBounds.width + x) * 4;

      output[outputIndex] = image.data[sourceIndex];
      output[outputIndex + 1] = image.data[sourceIndex + 1];
      output[outputIndex + 2] = image.data[sourceIndex + 2];
      output[outputIndex + 3] = image.data[sourceIndex + 3];
    }
  }

  return {
    width: normalizedBounds.width,
    height: normalizedBounds.height,
    data: output,
  };
};

export const normalizeRgbaColor = (
  image: RgbaPixelBuffer,
  mode: ColorMode,
): RgbaPixelBuffer => {
  assertRgbaPixelBuffer(image);
  const normalized = new Uint8ClampedArray(image.data);

  if (mode === "original") {
    return { ...image, data: normalized };
  }

  for (let index = 0; index < normalized.length; index += 4) {
    const alpha = normalized[index + 3];

    if (alpha === 0) {
      continue;
    }

    if (mode === "black" || mode === "white") {
      const channel = mode === "black" ? 0 : 255;
      normalized[index] = channel;
      normalized[index + 1] = channel;
      normalized[index + 2] = channel;
      continue;
    }

    /*
     * WHY these weights:
     * sRGB green contributes the most perceived brightness and blue the least.
     * Using the Rec. 709 luma coefficients keeps grayscale marks visually close
     * to their original contrast instead of averaging channels equally.
     */
    const gray = Math.round(
      normalized[index] * 0.2126 +
        normalized[index + 1] * 0.7152 +
        normalized[index + 2] * 0.0722,
    );
    normalized[index] = gray;
    normalized[index + 1] = gray;
    normalized[index + 2] = gray;
  }

  return {
    width: image.width,
    height: image.height,
    data: normalized,
  };
};

export const computeOpticalDensityMetrics = (
  image: RgbaPixelBuffer,
  bounds: TrimmedLogoBounds = makeBounds(0, 0, image.width - 1, image.height - 1),
  alphaThreshold = DEFAULT_ALPHA_THRESHOLD,
): OpticalBalanceMetrics => {
  assertRgbaPixelBuffer(image);
  const normalizedBounds = normalizeTrimBounds(bounds, image.width, image.height);
  let visiblePixels = 0;
  let alphaSum = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (let y = normalizedBounds.top; y <= normalizedBounds.bottom; y += 1) {
    for (let x = normalizedBounds.left; x <= normalizedBounds.right; x += 1) {
      const alpha = image.data[(y * image.width + x) * 4 + 3];

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

export const calculateLogoPlacement = ({
  trimBounds,
  metrics,
  settings,
}: {
  trimBounds: TrimmedLogoBounds;
  metrics: OpticalBalanceMetrics;
  settings: ResolvedBrandFitSettings;
}): LogoPlacementPlan => {
  const drawableWidth = settings.grid.outputWidth * (1 - settings.targetPadding.ratio * 2);
  const drawableHeight = settings.grid.outputHeight * (1 - settings.targetPadding.ratio * 2);
  const geometricScale = Math.min(
    drawableWidth / trimBounds.width,
    drawableHeight / trimBounds.height,
  );

  /*
   * WHY manual scale is multiplied last:
   * The pipeline first finds the maximum safe geometric fit, then applies the
   * automatic density correction. The reviewer adjustment is intentionally the
   * final multiplier so "make this logo 8% bigger" means 8% bigger than
   * BrandFit's recommended output, not 8% bigger than raw source bounds.
   */
  const scale = geometricScale * metrics.opticalScale * settings.manualScale;
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
  const balancedX =
    (settings.grid.outputWidth - width) / 2 -
    metrics.visualCenterOffset.x * width * settings.balanceStrength;
  const balancedY =
    (settings.grid.outputHeight - height) / 2 -
    metrics.visualCenterOffset.y * height * settings.balanceStrength;

  return {
    x: clamp(balancedX, 0, settings.grid.outputWidth - width),
    y: clamp(balancedY, 0, settings.grid.outputHeight - height),
    width,
    height,
    scale,
  };
};

export const computeOpticalScale = (
  visiblePixelRatio: number,
  alphaDensity: number,
): number => {
  /*
   * WHY this heuristic works for the first release:
   * Designers judge logo size by ink density, not by bounding boxes. A sparse
   * wordmark inside a wide trim box looks smaller than a filled app icon at the
   * same geometric size, so we gently enlarge sparse marks and slightly reduce
   * dense marks. The clamp keeps the correction subtle enough to avoid clipping.
   */
  const densitySignal = (visiblePixelRatio + alphaDensity) / 2;

  return clamp(1.1 - densitySignal * 0.28, 0.9, 1.08);
};

const resolveSettings = (settings: BrandFitProcessingSettings): ResolvedBrandFitSettings => ({
  grid: {
    outputWidth: assertPositiveInteger(settings.grid?.outputWidth ?? DEFAULT_OUTPUT_SIZE, "outputWidth"),
    outputHeight: assertPositiveInteger(settings.grid?.outputHeight ?? DEFAULT_OUTPUT_SIZE, "outputHeight"),
  },
  targetPadding: {
    ratio: clamp(settings.targetPadding?.ratio ?? DEFAULT_PADDING_RATIO, 0, 0.45),
  },
  colorMode: settings.colorMode ?? "original",
  manualScale: clamp(settings.manualScale ?? DEFAULT_MANUAL_SCALE, 0.65, 1.4),
  alphaThreshold: clamp(settings.alphaThreshold ?? DEFAULT_ALPHA_THRESHOLD, 0, 255),
  balanceStrength: clamp(settings.balanceStrength ?? DEFAULT_BALANCE_STRENGTH, 0, 1),
});

const assertRgbaPixelBuffer = (image: RgbaPixelBuffer): void => {
  assertPositiveInteger(image.width, "image.width");
  assertPositiveInteger(image.height, "image.height");

  const expectedLength = image.width * image.height * 4;
  if (image.data.length !== expectedLength) {
    throw new RangeError(
      `image.data must contain ${expectedLength} RGBA channel values for ${image.width} x ${image.height}.`,
    );
  }
};

const assertPositiveInteger = (value: number, label: string): number => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive integer.`);
  }

  return value;
};

const makeBounds = (left: number, top: number, right: number, bottom: number): TrimmedLogoBounds => ({
  top,
  right,
  bottom,
  left,
  width: right - left + 1,
  height: bottom - top + 1,
});

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
