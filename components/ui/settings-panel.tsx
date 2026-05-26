"use client";

import type { ColorNormalizationMode, LogoExportFormat } from "@/lib/canvas-processing";
import type { LogoJob, LogoWorkspaceSettings } from "@/store/logo-workspace-store";

type SettingsPanelProps = {
  settings: LogoWorkspaceSettings;
  isProcessing: boolean;
  completedCount: number;
  selectedJob: LogoJob | null;
  onSettingsChange: (settings: Partial<LogoWorkspaceSettings>) => void;
  onManualScaleChange: (id: string, manualScale: number) => void;
  onReprocess: () => void;
  onExport: () => void;
  onReset: () => void;
};

const normalizationModes: Array<{ value: ColorNormalizationMode; label: string }> = [
  { value: "original", label: "Original" },
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "grayscale", label: "Grayscale" },
];

const exportFormats: Array<{ value: LogoExportFormat; label: string }> = [
  { value: "webp", label: "WebP" },
  { value: "png", label: "PNG" },
  { value: "svg", label: "SVG" },
];

export function SettingsPanel({
  settings,
  isProcessing,
  completedCount,
  selectedJob,
  onSettingsChange,
  onManualScaleChange,
  onReprocess,
  onExport,
  onReset,
}: SettingsPanelProps) {
  const selectedLogoIsEditable = Boolean(selectedJob && selectedJob.status === "complete" && !isProcessing);

  return (
    <aside className="rounded-md border border-brand-purple/25 bg-brand-surface p-5 shadow-brand-purple">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-brand-text-main">Output controls</h2>
          <p className="mt-1 text-sm text-brand-text-muted">Every change can reprocess the queue locally.</p>
        </div>
        <span className="rounded bg-brand-purple/20 px-2 py-1 text-xs font-medium text-brand-text-main">
          {completedCount} ready
        </span>
      </div>

      <label className="mt-6 block text-sm font-medium text-brand-text-main">
        Square size
        <select
          value={settings.outputSize}
          onChange={(event) => onSettingsChange({ outputSize: Number(event.target.value) })}
          className="mt-2 h-11 w-full rounded border border-brand-purple/30 bg-black px-3 text-sm text-brand-text-main"
        >
          <option value={256}>256 px</option>
          <option value={512}>512 px</option>
          <option value={1024}>1024 px</option>
        </select>
      </label>

      <label className="mt-5 block text-sm font-medium text-brand-text-main">
        Padding: {Math.round(settings.paddingRatio * 100)}%
        <input
          type="range"
          min="0.08"
          max="0.32"
          step="0.01"
          value={settings.paddingRatio}
          suppressHydrationWarning
          onChange={(event) => onSettingsChange({ paddingRatio: Number(event.target.value) })}
          className="mt-3 w-full accent-brand-orange"
        />
      </label>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-brand-text-main">Color normalization</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {normalizationModes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => onSettingsChange({ normalizationMode: mode.value })}
              className={`h-10 rounded border px-3 text-sm font-medium transition ${
                settings.normalizationMode === mode.value
                  ? "border-brand-purple bg-brand-purple text-brand-text-main"
                  : "border-brand-purple/25 bg-black text-brand-text-muted hover:border-brand-pink hover:text-brand-text-main"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-brand-text-main">Export format</legend>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {exportFormats.map((format) => (
            <button
              key={format.value}
              type="button"
              onClick={() => onSettingsChange({ exportFormat: format.value })}
              className={`h-10 rounded border px-3 text-sm font-medium transition ${
                settings.exportFormat === format.value
                  ? "border-brand-pink bg-brand-pink text-black"
                  : "border-brand-purple/25 bg-black text-brand-text-muted hover:border-brand-pink hover:text-brand-text-main"
              }`}
            >
              {format.label}
            </button>
          ))}
        </div>
      </fieldset>

      <section
        aria-label="Selected logo controls"
        className="mt-5 rounded border border-brand-orange/30 bg-black p-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-brand-text-main">Selected logo</h3>
            <p className="mt-1 truncate text-xs text-brand-text-muted">
              {selectedJob ? selectedJob.file.name : "Click a logo in the output grid"}
            </p>
          </div>
          <span className="shrink-0 rounded bg-brand-purple/20 px-2 py-1 text-xs font-semibold text-brand-text-main">
            {settings.outputSize}px
          </span>
        </div>

        <label className="mt-4 block text-xs font-semibold text-brand-text-main">
          Manual scale: {selectedJob ? Math.round(selectedJob.manualScale * 100) : 100}%
          <input
            type="range"
            min="0.65"
            max="1.4"
            step="0.02"
            value={selectedJob?.manualScale ?? 1}
            disabled={!selectedLogoIsEditable}
            aria-label={selectedJob ? `Manual scale for ${selectedJob.file.name}` : "Manual scale"}
            onChange={(event) => {
              if (selectedJob) {
                onManualScaleChange(selectedJob.id, Number(event.target.value));
              }
            }}
            className="mt-3 w-full accent-brand-orange disabled:cursor-not-allowed disabled:opacity-50"
          />
        </label>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <ScaleButton
            label="Smaller"
            disabled={!selectedLogoIsEditable || !selectedJob}
            onClick={() => selectedJob && onManualScaleChange(selectedJob.id, selectedJob.manualScale - 0.04)}
          />
          <ScaleButton
            label="Reset"
            disabled={!selectedLogoIsEditable || !selectedJob || selectedJob.manualScale === 1}
            onClick={() => selectedJob && onManualScaleChange(selectedJob.id, 1)}
          />
          <ScaleButton
            label="Bigger"
            disabled={!selectedLogoIsEditable || !selectedJob}
            onClick={() => selectedJob && onManualScaleChange(selectedJob.id, selectedJob.manualScale + 0.04)}
          />
        </div>
      </section>

      <div className="mt-6 grid gap-2">
        <button
          type="button"
          onClick={onExport}
          disabled={completedCount === 0 || isProcessing}
          className="h-11 rounded-md bg-brand-purple text-sm font-bold text-brand-text-main transition hover:bg-brand-pink disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-brand-text-muted"
        >
          Export {settings.outputSize}px ZIP
        </button>
        <button
          type="button"
          onClick={onReprocess}
          disabled={completedCount === 0 || isProcessing}
          className="h-10 rounded-md border border-brand-purple/25 text-sm font-semibold text-brand-text-main transition hover:border-brand-pink disabled:cursor-not-allowed disabled:text-zinc-700"
        >
          Reprocess all
        </button>
        <button
          type="button"
          onClick={onReset}
          className="h-10 rounded-md text-sm font-semibold text-brand-text-muted transition hover:text-brand-text-main"
        >
          Clear workspace
        </button>
      </div>
    </aside>
  );
}

function ScaleButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-9 rounded border border-brand-purple/25 text-xs font-semibold text-brand-text-muted transition hover:border-brand-pink hover:text-brand-text-main disabled:cursor-not-allowed disabled:border-zinc-900 disabled:text-zinc-700"
    >
      {label}
    </button>
  );
}
