"use client";

import type { LogoWorkspaceSettings } from "@/store/logo-workspace-store";

type OpticalGridControlsProps = {
  outputSize: number;
  onOutputSizeChange: (settings: Partial<LogoWorkspaceSettings>) => void;
};

const simulatedControls = [
  {
    label: "Auto-Trim Whitespace",
    description: "Detect transparent edges before optical balancing.",
    active: true,
  },
  {
    label: "Normalize Padding Density",
    description: "Keep visual breathing room consistent across brand assets.",
    active: true,
  },
  {
    label: "Align Optically (Beta)",
    description: "Balance dense marks, wide wordmarks, and light icons by perceived weight.",
    active: true,
  },
];

export function OpticalGridControls({
  outputSize,
  onOutputSizeChange,
}: OpticalGridControlsProps) {
  return (
    <section className="rounded-md border border-brand-purple/20 bg-brand-surface p-5 shadow-brand-purple">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-brand-orange">BrandFit by Pixel Pro Lab controls</p>
          <h2 className="mt-2 text-xl font-semibold text-brand-text-main">Optical Grid Controls</h2>
        </div>
        <span className="rounded border border-brand-orange/40 bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange">
          Active local engine
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {simulatedControls.map((control) => (
          <article key={control.label} className="rounded border border-brand-purple/20 bg-black p-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-brand-text-main">{control.label}</h3>
              <span
                aria-hidden="true"
                className={`h-5 w-9 rounded-full border p-0.5 ${
                  control.active ? "border-brand-pink bg-brand-purple" : "border-zinc-700 bg-zinc-900"
                }`}
              >
                <span className="block h-3.5 w-3.5 translate-x-3.5 rounded-full bg-white" />
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-brand-text-muted">{control.description}</p>
          </article>
        ))}

        <label className="rounded border border-brand-orange/35 bg-black p-3 text-sm font-semibold text-brand-text-main">
          Define Export Square Size
          <select
            value={outputSize}
            onChange={(event) => onOutputSizeChange({ outputSize: Number(event.target.value) })}
            className="mt-3 h-10 w-full rounded border border-brand-purple/30 bg-brand-surface px-3 text-sm text-brand-text-main"
          >
            <option value={256}>256 px</option>
            <option value={512}>512 px</option>
            <option value={1024}>1024 px</option>
          </select>
          <span className="mt-2 block text-xs font-normal leading-5 text-brand-text-muted">
            Mirrors the export square size used by BrandFit by Pixel Pro Lab output controls.
          </span>
        </label>
      </div>
    </section>
  );
}
