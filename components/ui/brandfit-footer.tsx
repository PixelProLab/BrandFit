"use client";

import type { ReactNode } from "react";

export function BrandFitFooter() {
  return (
    <footer className="border-t border-brand-purple/20 py-6 text-sm text-brand-text-muted">
      <div className="grid gap-5 lg:grid-cols-[minmax(260px,1fr)_minmax(360px,440px)_220px] lg:items-stretch">
        <div className="flex min-h-[122px] items-center">
          <p className="text-lg font-semibold leading-7 text-brand-text-main">
            Built and Maintained by{" "}
            <a
              href="https://pixelprotocol.co"
              target="_blank"
              rel="noreferrer"
              className="text-brand-text-main underline decoration-brand-purple/50 underline-offset-4 transition hover:text-brand-pink"
            >
              Pixel Pro Lab
            </a>
            .
          </p>
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
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.6.69.49A10.14 10.14 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}
