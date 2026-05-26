"use client";

import type { LogoJob } from "@/store/logo-workspace-store";

type OutputGridPreviewProps = {
  jobs: LogoJob[];
  outputUrls: Record<string, string>;
  selectedJobId: string | null;
  onSelect: (id: string) => void;
};

export function OutputGridPreview({
  jobs,
  outputUrls,
  selectedJobId,
  onSelect,
}: OutputGridPreviewProps) {
  if (jobs.length === 0) {
    return null;
  }

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0];

  return (
    <section
      aria-label="Final output grid preview"
      className="rounded-md border border-brand-purple/25 bg-brand-surface p-4 shadow-brand-purple"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-text-main">Final output grid</h2>
          <p className="mt-1 text-sm text-brand-text-muted">
            Review the exact square assets as a grid before exporting the ZIP.
          </p>
        </div>
        <span className="rounded border border-brand-orange/40 bg-brand-orange/10 px-2 py-1 text-xs font-semibold text-brand-orange">
          {jobs.length} output{jobs.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {jobs.map((job) => {
          const outputUrl = outputUrls[job.id];
          const isSelected = selectedJob.id === job.id;

          return (
            <button
              key={job.id}
              type="button"
              onClick={() => onSelect(job.id)}
              aria-pressed={isSelected}
              className={`group rounded border bg-black p-3 text-left transition ${
                isSelected
                  ? "border-brand-orange shadow-brand-orange"
                  : "border-brand-purple/20 hover:border-brand-pink"
              }`}
            >
              <span className="flex aspect-square items-center justify-center rounded bg-[linear-gradient(45deg,#0D0D0D_25%,transparent_25%),linear-gradient(-45deg,#0D0D0D_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#0D0D0D_75%),linear-gradient(-45deg,transparent_75%,#0D0D0D_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] p-3">
                {outputUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={outputUrl}
                    alt={`${job.file.name} final BrandFit by Pixel Pro Lab output`}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-brand-text-muted">Processing</span>
                )}
              </span>
              <span className="mt-2 block truncate text-xs font-medium text-brand-text-muted group-hover:text-brand-text-main">
                {job.file.name}
              </span>
              <span className="mt-1 block text-[11px] text-brand-text-muted">
                Manual {Math.round(job.manualScale * 100)}%
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
