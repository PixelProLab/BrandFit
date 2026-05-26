"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

type BrandFitDropzoneProps = {
  onFilesAccepted: (files: File[]) => void;
};

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export function BrandFitDropzone({ onFilesAccepted }: BrandFitDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
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
        setMessage(`${rejected} file${rejected === 1 ? "" : "s"} skipped. Use PNG, JPEG, WebP, GIF, or SVG under 20 MB.`);
        return;
      }

      setMessage(accepted.length > 0 ? `${accepted.length} logo${accepted.length === 1 ? "" : "s"} queued for local processing.` : null);
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
  }, [acceptFiles]);

  return (
    <section
      aria-label="Logo upload"
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        acceptFiles(event.dataTransfer.files);
      }}
      className={`relative overflow-hidden rounded-md border border-dashed bg-brand-surface px-4 py-3 shadow-brand-purple transition before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(138,76,152,0.16),transparent_32%,rgba(244,168,77,0.08)_64%,rgba(222,85,143,0.12))] before:opacity-80 after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.03)_1px,transparent_1px)] after:bg-[length:48px_48px] sm:px-5 ${
        isDragging
          ? "border-brand-pink bg-brand-purple/20"
          : "border-brand-purple/45 hover:border-brand-purple"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        aria-label="Upload logo files"
        accept="image/*"
        multiple
        suppressHydrationWarning
        className="sr-only"
        data-testid="file-input"
        onInput={handleFileInput}
      />
      <div className="relative z-10 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-brand-orange">Processing terminal</p>
          <h1 className="mt-1 text-2xl font-bold text-brand-text-main sm:text-3xl">
            BrandFit by Pixel Pro Lab
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-brand-text-muted">
            The open-source engine for perfect image grids. Drop logos, icons, or graphics to trim,
            balance, normalize, and export brand assets locally.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="flex h-44 w-56 items-center justify-center rounded-md border border-brand-purple/25 bg-black/35 shadow-brand-pink sm:h-48 sm:w-64">
            <Image
              src="/BrandFit Favicon.png"
              alt="BrandFit by Pixel Pro Lab visual mark"
              width={512}
              height={512}
              priority
              className="h-auto w-44 object-contain sm:w-56"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <p className="max-w-sm text-sm leading-6 text-brand-text-muted lg:text-right">
            Optically balance your logo grids for perfectly uniform visual layouts with BrandFit by Pixel Pro Lab.
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="h-11 rounded-md bg-brand-purple px-5 text-sm font-bold text-brand-text-main shadow-brand-purple transition hover:bg-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2 focus:ring-offset-brand-bg"
          >
            Select logos
          </button>
        </div>
      </div>
      <div className="relative z-10 mt-3 grid gap-2 text-xs text-brand-text-muted md:grid-cols-3">
        <p className="rounded border border-brand-purple/25 bg-black/45 px-3 py-2">Canvas-only processing</p>
        <p className="rounded border border-brand-purple/25 bg-black/45 px-3 py-2">No asset upload endpoint</p>
        <p className="rounded border border-brand-purple/25 bg-black/45 px-3 py-2">ZIP export in browser</p>
      </div>
      {message ? <p className="relative z-10 mt-3 text-sm text-brand-orange">{message}</p> : null}
    </section>
  );
}

const isSupportedImage = (file: File): boolean =>
  file.type.startsWith("image/") && file.size > 0 && file.size <= MAX_FILE_SIZE_BYTES;
