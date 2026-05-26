import type { Metadata } from "next";
import Link from "next/link";
import { BrandFitFooter } from "@/components/ui/brandfit-footer";

const repositoryUrl = "https://github.com/PixelProLab/BrandFit";
const linkedInUrl = "https://www.linkedin.com/company/pixelprolab/";

export const metadata: Metadata = {
  title: "About BrandFit by Pixel Pro Lab",
  description:
    "Learn why Pixel Pro Lab built BrandFit, an open-source automated batch image resizer, aspect ratio fitting tool, padding utility, and brand assets optimizer.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text-main">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="BrandFit resources">
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-md bg-brand-purple px-3 text-sm font-bold text-brand-text-main transition hover:bg-brand-pink"
          >
            ← Back to app
          </Link>
          <span className="flex items-center gap-2">
            <a
              href={repositoryUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="View BrandFit by Pixel Pro Lab on GitHub"
              title="View BrandFit by Pixel Pro Lab on GitHub"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-brand-purple/30 text-brand-text-main transition hover:border-brand-pink hover:text-brand-pink"
            >
              <GitHubIcon />
            </a>
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Visit Pixel Pro Lab on LinkedIn"
              title="Visit Pixel Pro Lab on LinkedIn"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-brand-purple/30 text-brand-text-main transition hover:border-brand-pink hover:text-brand-pink"
            >
              <LinkedInIcon />
            </a>
          </span>
        </nav>

        <header className="border-b border-brand-purple/25 pb-8">
          <p className="text-xs font-semibold uppercase text-brand-orange">
            About Pixel Pro Lab
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-brand-text-main sm:text-5xl">
            BrandFit by Pixel Pro Lab exists to make brand asset grids feel deliberate, balanced, and production-ready.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-brand-text-muted">
            Pixel Pro Lab builds practical creative technology for teams that need polished digital systems without
            adding unnecessary operational weight. BrandFit by Pixel Pro Lab was created from a common production
            problem: sponsor logos, partner icons, and organization marks rarely arrive with matching aspect ratios,
            transparent padding, or visual density.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3" aria-label="BrandFit mission pillars">
          <article className="rounded-md border border-brand-purple/20 bg-brand-surface p-5 shadow-brand-purple">
            <h2 className="text-lg font-semibold">Local-first privacy</h2>
            <p className="mt-3 text-sm leading-6 text-brand-text-muted">
              BrandFit by Pixel Pro Lab processes files in the browser with Canvas APIs, Blob URLs, and local ZIP
              generation. Confidential brand assets do not need to leave the user&apos;s device.
            </p>
          </article>
          <article className="rounded-md border border-brand-purple/20 bg-brand-surface p-5 shadow-brand-purple">
            <h2 className="text-lg font-semibold">Optical balance</h2>
            <p className="mt-3 text-sm leading-6 text-brand-text-muted">
              Mathematical boxes are not enough. BrandFit by Pixel Pro Lab considers visible pixels, density, padding,
              and manual review so grids look visually uniform instead of merely equal in dimensions.
            </p>
          </article>
          <article className="rounded-md border border-brand-purple/20 bg-brand-surface p-5 shadow-brand-purple">
            <h2 className="text-lg font-semibold">Open-source clarity</h2>
            <p className="mt-3 text-sm leading-6 text-brand-text-muted">
              The codebase separates UI, state, and canvas-processing modules so designers, engineers, and AI agents
              can inspect, improve, and extend BrandFit by Pixel Pro Lab with clear ownership boundaries.
            </p>
          </article>
        </section>

        <section className="rounded-md border border-brand-orange/30 bg-brand-surface p-6 shadow-brand-orange">
          <h2 className="text-2xl font-semibold">The mission behind BrandFit by Pixel Pro Lab</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-brand-text-muted">
            <p>
              Every public website eventually becomes a home for brand assets: partners, sponsors, agencies,
              government entities, event collaborators, press marks, and internal programs. When those assets are
              dropped into a standard CSS grid, the result often feels uneven. A dense emblem can overpower a wordmark;
              a wide logo can feel too small; a file with excess transparent space can break alignment altogether.
            </p>
            <p>
              BrandFit by Pixel Pro Lab turns that repetitive cleanup work into a transparent browser workflow. It is
              an automated batch image resizer, aspect ratio fitting tool, padding utility, and brand assets optimizer
              built for modern web teams that need consistent visual output without sending sensitive files to a server.
            </p>
            <p>
              The long-term goal is simple: make polished brand presentation accessible to teams of every size, while
              keeping the implementation readable enough for open-source contributors and AI agents to understand.
            </p>
          </div>
        </section>
      </section>
      <div className="mx-auto w-full max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
        <BrandFitFooter />
      </div>
    </main>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.6.69.49A10.14 10.14 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.33 8h4.34v15H.33V8Zm7.17 0h4.16v2.05h.06c.58-1.1 2-2.26 4.12-2.26 4.41 0 5.23 2.9 5.23 6.68V23h-4.34v-7.56c0-1.8-.03-4.12-2.51-4.12-2.52 0-2.9 1.96-2.9 3.99V23H7.5V8Z" />
    </svg>
  );
}
