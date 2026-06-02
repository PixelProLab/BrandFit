/**
 * Shared types for BrandFit by Pixel Pro Lab's local image-processing pipeline.
 *
 * Keep these types free of React imports so Canvas workers, browser utilities,
 * and UI components can all depend on the same contracts without creating
 * circular ownership between the app layers.
 */

export type ColorNormalizationMode = "original" | "black" | "white" | "grayscale";

/**
 * MCP-facing color mode enum. Kept as a separate alias so generated JSON
 * schemas can use the domain term while the existing browser UI keeps its
 * historical `ColorNormalizationMode` name.
 */
export type ColorMode = ColorNormalizationMode;

export type LogoExportFormat = "webp" | "png" | "svg";

/**
 * Padding contract used by both the browser app and future MCP server tools.
 * Ratio padding is serializable, resolution-independent, and easy for an AI
 * agent to reason about: `0.16` means 16% on each side of the output box.
 */
export type TargetPadding = {
  ratio: number;
};

/**
 * Output grid constraints for a single standardized asset. The browser app
 * currently uses square outputs, but MCP tools can pass rectangular constraints
 * without changing the optical-balance math.
 */
export type GridConstraints = {
  outputWidth: number;
  outputHeight: number;
};

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
   * BrandFit by Pixel Pro Lab's density heuristic gives every logo a strong first pass, but
   * brand marks are subjective: a sponsor may require a slightly larger
   * wordmark, or a dense emblem may need to recede. Keeping this as an explicit
   * multiplier makes manual review predictable and easy to serialize later.
   */
  manualScale: number;
  webpQuality?: number;
};

/**
 * MCP-friendly exported asset. Unlike browser downloads, this can be returned
 * directly in a tool response as JSON without requiring a ZIP file.
 */
export type EncodedLogoAsset = {
  fileName: string;
  mimeType: string;
  encoding: "base64" | "utf8";
  content: string;
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
