"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { LogoJob } from "@/store/logo-workspace-store";

type OutputGridPreviewProps = {
  jobs: LogoJob[];
  outputUrls: Record<string, string>;
  selectedJobId: string | null;
  onFilesAccepted: (files: File[]) => void;
  onSelect: (id: string) => void;
  onRemoveSelected: (id: string) => void;
};

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export function OutputGridPreview({
  jobs,
  outputUrls,
  selectedJobId,
  onFilesAccepted,
  onSelect,
  onRemoveSelected,
}: OutputGridPreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const acceptFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const accepted = files.filter(isSupportedImage);
      const rejected = files.length - accepted.length;

      if (accepted.length > 0) {
        onFilesAccepted(accepted);
      }

      if (rejected > 0) {
        setMessage(`${rejected} file${rejected === 1 ? "" : "s"} skipped. Use an image under 20 MB.`);
        return;
      }

      setMessage(accepted.length > 0 ? `${accepted.length} logo${accepted.length === 1 ? "" : "s"} added.` : null);
    },
    [onFilesAccepted],
  );

  const handleFileInput = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      if (event.currentTarget.files) {
        acceptFiles(event.currentTarget.files);
        event.currentTarget.value = "";
      }
    },
    [acceptFiles],
  );

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    input.dataset.ready = "true";

    const handleNativeChange = () => {
      if (input.files) {
        acceptFiles(input.files);
        input.value = "";
      }
    };

    input.addEventListener("change", handleNativeChange);
    input.addEventListener("input", handleNativeChange);

    return () => {
      delete input.dataset.ready;
      input.removeEventListener("change", handleNativeChange);
      input.removeEventListener("input", handleNativeChange);
    };
  }, [acceptFiles, jobs.length]);

  if (jobs.length === 0) {
    return null;
  }

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0];

  return (
    <section
      aria-label="Final output grid preview"
      className="rounded-md border border-brand-purple/25 bg-brand-surface p-4 shadow-brand-purple"
    >
      <input
        ref={inputRef}
        type="file"
        aria-label="Add more logo files"
        accept="image/*"
        multiple
        suppressHydrationWarning
        className="sr-only"
        data-testid="add-more-file-input"
        onInput={handleFileInput}
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-text-main">Final output grid</h2>
          <p className="mt-1 text-sm text-brand-text-muted">
            Review the exact square assets as a grid before exporting the ZIP.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="h-9 rounded-md border border-brand-purple/35 bg-black px-3 text-xs font-bold text-brand-text-main transition hover:border-brand-pink hover:text-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2 focus:ring-offset-brand-bg"
          >
            Add logos
          </button>
          <button
            type="button"
            onClick={() => onRemoveSelected(selectedJob.id)}
            className="h-9 rounded-md border border-brand-pink/35 bg-black px-3 text-xs font-bold text-brand-text-muted transition hover:border-brand-pink hover:text-brand-text-main focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2 focus:ring-offset-brand-bg"
          >
            Remove selected
          </button>
          <span className="rounded border border-brand-orange/40 bg-brand-orange/10 px-2 py-1 text-xs font-semibold text-brand-orange">
            {jobs.length} output{jobs.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
      {message ? <p className="mt-3 text-sm text-brand-orange">{message}</p> : null}

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

const isSupportedImage = (file: File): boolean =>
  file.type.startsWith("image/") && file.size > 0 && file.size <= MAX_FILE_SIZE_BYTES;
