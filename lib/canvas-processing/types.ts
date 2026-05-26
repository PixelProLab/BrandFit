/**
 * Shared types for BrandFit's local image-processing pipeline.
 *
 * Keep these types free of React imports so Canvas workers, browser utilities,
 * and UI components can all depend on the same contracts without creating
 * circular ownership between the app layers.
 */

export type ColorNormalizationMode = "original" | "black" | "white" | "grayscale";

export type LogoExportFormat = "webp" | "png" | "svg";

export type LogoSourceFile = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeInBytes: number;
};

export type TrimmedLogoBounds = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
};

export type OpticalBalanceMetrics = {
  /**
   * Ratio of visible pixels to the full trimmed logo box.
   *
   * A dense square icon usually has a higher filled-area ratio than a thin
   * wordmark. Future balancing code will use this signal to scale each logo by
   * visual weight, not only by raw width and height.
   */
  visiblePixelRatio: number;
  /**
   * Alpha-weighted center of visual mass within the trimmed logo.
   *
   * Values are normalized from -0.5 to 0.5, where 0 is the geometric center.
   * A logo that is visually heavier on the right will have a positive x value.
   */
  visualCenterOffset: {
    x: number;
    y: number;
  };
  /**
   * Average alpha across the trimmed box. Lower values usually mean a thin,
   * line-art mark or wordmark that can tolerate slightly larger scaling.
   */
  alphaDensity: number;
  /**
   * Scale selected by the optical balancing step before final padding/export.
   */
  opticalScale: number;
};

export type LogoOutputSettings = {
  outputSize: number;
  paddingRatio: number;
  normalizationMode: ColorNormalizationMode;
  exportFormat: LogoExportFormat;
  /**
   * Per-logo multiplier applied after automatic optical balancing.
   *
   * BrandFit's density heuristic gives every logo a strong first pass, but
   * brand marks are subjective: a sponsor may require a slightly larger
   * wordmark, or a dense emblem may need to recede. Keeping this as an explicit
   * multiplier makes manual review predictable and easy to serialize later.
   */
  manualScale: number;
  webpQuality?: number;
};

export type ProcessedLogo = {
  id: string;
  source: LogoSourceFile;
  trimBounds: TrimmedLogoBounds;
  balanceMetrics: OpticalBalanceMetrics;
  outputWidth: number;
  outputHeight: number;
  normalizationMode: ColorNormalizationMode;
  manualScale: number;
  blob?: Blob;
  fileName?: string;
};
