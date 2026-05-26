"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import {
  generateProcessedLogosZip,
  processLogoFile,
  type ProcessedLogoOutput,
} from "@/lib/canvas-processing";
import { BrandFitDropzone } from "@/components/ui/brandfit-dropzone";
import { LogoPreviewGrid } from "@/components/ui/logo-preview-grid";
import { OutputGridPreview } from "@/components/ui/output-grid-preview";
import { SettingsPanel } from "@/components/ui/settings-panel";
import {
  createInitialLogoWorkspaceState,
  logoWorkspaceReducer,
  type LogoWorkspaceSettings,
} from "@/store/logo-workspace-store";

export default function Home() {
  const [state, dispatch] = useReducer(
    logoWorkspaceReducer,
    undefined,
    createInitialLogoWorkspaceState,
  );
  const [outputUrls, setOutputUrls] = useState<Record<string, string>>({});
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const processingIds = useRef(new Set<string>());
  const outputUrlsRef = useRef<Record<string, string>>({});

  const completedJobs = useMemo(
    () => state.jobs.filter((job) => job.processedLogo?.blob),
    [state.jobs],
  );
  const selectedJob = useMemo(
    () => state.jobs.find((job) => job.id === state.selectedJobId) ?? null,
    [state.jobs, state.selectedJobId],
  );
  const isProcessing = state.jobs.some((job) => job.status === "queued" || job.status === "processing");

  const queueFiles = useCallback((files: File[]) => {
    setExportMessage(null);
    dispatch({ type: "queue-files", files });
  }, []);

  const updateSettings = useCallback((settings: Partial<LogoWorkspaceSettings>) => {
    setExportMessage("Settings updated. Reprocessing queued logos locally.");
    dispatch({ type: "update-settings", settings });
    dispatch({ type: "reprocess-all" });
  }, []);

  const selectJob = useCallback((id: string | null) => {
    dispatch({ type: "select-job", id });
  }, []);

  const updateManualScale = useCallback(
    (id: string, manualScale: number) => {
      setExportMessage("Manual scale updated. Reprocessing selected logo locally.");
      dispatch({ type: "update-job-manual-scale", id, manualScale });
    },
    [],
  );

  const removeJob = useCallback(
    (id: string) => {
      if (outputUrls[id]) {
        revokeObjectUrlSoon(outputUrls[id]);
      }
      setOutputUrls((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      processingIds.current.delete(id);
      dispatch({ type: "remove-job", id });
    },
    [outputUrls],
  );

  const resetWorkspace = useCallback(() => {
    Object.values(outputUrls).forEach(revokeObjectUrlSoon);
    setOutputUrls({});
    processingIds.current.clear();
    setExportMessage(null);
    dispatch({ type: "reset" });
  }, [outputUrls]);

  const reprocessAll = useCallback(() => {
    Object.values(outputUrls).forEach(revokeObjectUrlSoon);
    setOutputUrls({});
    processingIds.current.clear();
    setExportMessage("Reprocessing all logos with current settings.");
    dispatch({ type: "reprocess-all" });
  }, [outputUrls]);

  const exportZip = useCallback(async () => {
    const entries = completedJobs.flatMap((job) => {
      const logo = job.processedLogo as ProcessedLogoOutput | null;
      return logo?.blob && logo.fileName ? [{ fileName: logo.fileName, blob: logo.blob }] : [];
    });

    if (entries.length === 0) {
      setExportMessage("No completed logos are ready to export yet.");
      return;
    }

    try {
      const zip = await generateProcessedLogosZip(entries);
      const url = URL.createObjectURL(zip);
      const link = document.createElement("a");
      link.href = url;
      link.download = zip.name;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setExportMessage(`Exported ${entries.length} processed logo${entries.length === 1 ? "" : "s"} as ${zip.name}.`);
    } catch (error) {
      setExportMessage(error instanceof Error ? error.message : "Unable to export ZIP.");
    }
  }, [completedJobs]);

  useEffect(() => {
    const queuedJobs = state.jobs.filter(
      (job) => job.status === "queued" && !processingIds.current.has(job.id),
    );

    for (const job of queuedJobs) {
      processingIds.current.add(job.id);
      const previewUrl = job.previewUrl || URL.createObjectURL(job.file);
      dispatch({ type: "mark-processing", id: job.id, previewUrl });

      processLogoFile(job.file, {
        id: job.id,
        outputSize: state.settings.outputSize,
        paddingRatio: state.settings.paddingRatio,
        normalizationMode: state.settings.normalizationMode,
        exportFormat: state.settings.exportFormat,
        manualScale: job.manualScale,
      })
        .then((logo) => {
          const outputUrl = URL.createObjectURL(logo.blob);
          setOutputUrls((current) => {
            if (current[job.id]) {
              revokeObjectUrlSoon(current[job.id]);
            }
            return { ...current, [job.id]: outputUrl };
          });
          dispatch({ type: "mark-complete", id: job.id, logo });
        })
        .catch((error) => {
          dispatch({
            type: "mark-error",
            id: job.id,
            error: error instanceof Error ? error.message : "Unable to process this logo.",
          });
        })
        .finally(() => {
          processingIds.current.delete(job.id);
        });
    }
  }, [state.jobs, state.settings]);

  useEffect(() => {
    outputUrlsRef.current = outputUrls;
  }, [outputUrls]);

  useEffect(
    () => () => {
      Object.values(outputUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text-main">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <BrandFitDropzone onFilesAccepted={queueFiles} />

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <OutputGridPreview
              jobs={completedJobs}
              outputUrls={outputUrls}
              selectedJobId={state.selectedJobId}
              onFilesAccepted={queueFiles}
              onSelect={selectJob}
            />
            <LogoPreviewGrid
              jobs={state.jobs}
              outputUrls={outputUrls}
              selectedJobId={state.selectedJobId}
              onFilesAccepted={queueFiles}
              onSelect={selectJob}
              onRemove={removeJob}
            />
          </div>
          <div className="lg:sticky lg:top-5 lg:self-start">
            {exportMessage ? (
              <p className="mb-4 rounded-md border border-brand-pink/30 bg-brand-pink/10 p-3 text-sm text-brand-text-main shadow-brand-pink">
                {exportMessage}
              </p>
            ) : null}
            <SettingsPanel
              settings={state.settings}
              isProcessing={isProcessing}
              completedCount={completedJobs.length}
              selectedJob={selectedJob}
              onSettingsChange={updateSettings}
              onManualScaleChange={updateManualScale}
              onReprocess={reprocessAll}
              onExport={exportZip}
              onReset={resetWorkspace}
            />
          </div>
        </div>

        <BrandFitFooter />
      </div>
    </main>
  );
}

const revokeObjectUrlSoon = (url: string): void => {
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
};

function BrandFitFooter() {
  return (
    <footer className="border-t border-brand-purple/20 py-6 text-sm text-brand-text-muted">
      <div className="grid gap-5 lg:grid-cols-[minmax(260px,1fr)_minmax(360px,440px)_220px] lg:items-stretch">
        <div>
          <p>
            Built and Maintained by{" "}
            <a
              href="https://pixelprotocol.co"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-brand-text-main transition hover:text-brand-pink"
            >
              Pixel Pro Lab
            </a>
            .
          </p>
          <Link
            href="/about"
            className="mt-5 inline-flex font-semibold text-brand-text-main transition hover:text-brand-pink"
          >
            About BrandFit by Pixel Pro Lab
          </Link>
        </div>

        <div className="flex min-h-[122px] rounded-md border border-brand-purple/25 bg-brand-surface px-4 py-3 shadow-brand-purple">
          <GitHubLink ariaLabel="View PixelProLab BrandFit source code on GitHub">
            <span className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <span className="grid gap-1">
                <span className="text-xs font-semibold uppercase text-brand-orange">Open source project</span>
                <span className="text-sm font-semibold text-brand-text-main">
                  BrandFit by Pixel Pro Lab is proudly open source.
                </span>
                <span className="text-sm text-brand-text-muted">contribute on GitHub.</span>
              </span>
              <GitHubIcon className="h-10 w-10 text-brand-text-main" />
            </span>
          </GitHubLink>
        </div>

        <div className="flex min-h-[122px] flex-col justify-center rounded-md border border-brand-orange/35 bg-brand-surface p-4">
          <p className="text-xs font-semibold uppercase text-brand-orange">Support open source</p>
          <button
            type="button"
            disabled
            className="mt-2 h-10 rounded-md border border-brand-orange/45 px-4 text-sm font-bold text-brand-orange opacity-70"
            aria-label="Buy me a coffee donation button coming soon"
          >
            Buy me a coffee
          </button>
        </div>
      </div>
    </footer>
  );
}

function GitHubLink({
  ariaLabel,
  children,
}: {
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <a
      href="https://github.com/PixelProLab/BrandFit"
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 font-semibold text-brand-text-main transition hover:text-brand-pink"
    >
      {children}
    </a>
  );
}

function GitHubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.6.69.49A10.14 10.14 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}
