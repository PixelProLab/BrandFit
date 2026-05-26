"use client";

import type { LogoJob } from "@/store/logo-workspace-store";

type LogoPreviewGridProps = {
  jobs: LogoJob[];
  outputUrls: Record<string, string>;
  selectedJobId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
};

export function LogoPreviewGrid({
  jobs,
  outputUrls,
  selectedJobId,
  onSelect,
  onRemove,
}: LogoPreviewGridProps) {
  if (jobs.length === 0) {
    return (
      <section className="rounded-md border border-brand-purple/20 bg-brand-surface p-8 text-center shadow-brand-purple">
        <h2 className="text-xl font-semibold text-brand-text-main">No logos queued yet</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-brand-text-muted">
          Upload a mixed set of marks, wordmarks, and emblems to review how BrandFit
          trims whitespace and applies optical balance inside a consistent square.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Processed logos" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-text-main">Diagnostics</h2>
          <p className="mt-1 text-sm text-brand-text-muted">
            Source, trim, density, and scale details for each processed logo.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => {
          const outputUrl = job.processedLogo ? outputUrls[job.id] : "";
          const metrics = job.processedLogo?.balanceMetrics;
          const isSelected = selectedJobId === job.id;

          return (
            <article
              key={job.id}
              className={`overflow-hidden rounded-md border bg-brand-surface shadow-brand-purple transition ${
                isSelected ? "border-brand-orange" : "border-brand-purple/20"
              }`}
              data-testid="logo-card"
              aria-label={`${job.file.name} logo review card`}
            >
              <button
                type="button"
                onClick={() => onSelect(job.id)}
                className="grid w-full cursor-pointer grid-cols-2 border-b border-brand-purple/20 bg-[linear-gradient(45deg,#0D0D0D_25%,transparent_25%),linear-gradient(-45deg,#0D0D0D_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#0D0D0D_75%),linear-gradient(-45deg,transparent_75%,#0D0D0D_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0] text-left focus:outline-none focus:ring-2 focus:ring-brand-orange"
                aria-label={`Select ${job.file.name} for live editing`}
              >
                <PreviewSlot label="Original" src={job.previewUrl} />
                <PreviewSlot label="BrandFit output" src={outputUrl} />
              </button>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-brand-text-main">{job.file.name}</h3>
                    <p className="mt-1 text-xs text-brand-text-muted">{formatBytes(job.file.size)}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                {job.error ? <p className="mt-3 text-sm text-brand-pink">{job.error}</p> : null}

                {job.processedLogo ? (
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <Metric label="Trim" value={`${job.processedLogo.trimBounds.width} x ${job.processedLogo.trimBounds.height}`} />
                    <Metric label="Output" value={`${job.processedLogo.outputWidth} px`} />
                    <Metric label="Density" value={metrics ? `${Math.round(metrics.visiblePixelRatio * 100)}%` : "-"} />
                    <Metric label="Scale" value={metrics ? metrics.opticalScale.toFixed(2) : "-"} />
                    <Metric label="Manual" value={`${Math.round(job.manualScale * 100)}%`} />
                  </dl>
                ) : null}

                <button
                  type="button"
                  onClick={() => onRemove(job.id)}
                  className="mt-4 h-9 w-full rounded border border-brand-purple/25 text-sm font-semibold text-brand-text-muted transition hover:border-brand-pink hover:text-brand-text-main"
                >
                  Remove
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PreviewSlot({ label, src }: { label: string; src: string }) {
  return (
    <div className="flex aspect-square flex-col items-center justify-center border-r border-brand-purple/20 p-4 last:border-r-0">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} className="max-h-full max-w-full object-contain" />
      ) : (
        <span className="text-xs font-medium text-brand-text-muted">Waiting</span>
      )}
      <span className="mt-3 rounded bg-black/70 px-2 py-1 text-[11px] font-medium text-brand-text-muted">
        {label}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: LogoJob["status"] }) {
  const styles = {
    queued: "bg-zinc-800 text-brand-text-muted",
    processing: "bg-brand-orange text-black",
    complete: "bg-brand-purple text-brand-text-main",
    error: "bg-brand-pink text-brand-text-main",
  } satisfies Record<LogoJob["status"], string>;

  return (
    <span className={`rounded px-2 py-1 text-xs font-bold uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-brand-purple/20 bg-black p-2">
      <dt className="text-brand-text-muted">{label}</dt>
      <dd className="mt-1 font-semibold text-brand-text-main">{value}</dd>
    </div>
  );
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
