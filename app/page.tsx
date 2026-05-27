"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  generateProcessedLogosZip,
  processLogoFile,
  type ProcessedLogoOutput,
} from "@/lib/canvas-processing";
import { BrandFitFooter } from "@/components/ui/brandfit-footer";
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
    dispatch({ type: "update-settings", settings });
    dispatch({ type: "reprocess-all" });
  }, []);

  const selectJob = useCallback((id: string | null) => {
    dispatch({ type: "select-job", id });
  }, []);

  const updateManualScale = useCallback(
    (id: string, manualScale: number) => {
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
              onRemoveSelected={removeJob}
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
