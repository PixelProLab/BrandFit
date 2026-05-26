import type { Metadata } from "next";
import Link from "next/link";

const repositoryUrl = "https://github.com/PixelProLab/BrandFit";
const liveAppUrl = "https://brandfit-design.netlify.app/";

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

        <nav className="flex flex-wrap gap-3" aria-label="BrandFit resources">
          <Link
            href="/"
            className="rounded-md bg-brand-purple px-4 py-3 text-sm font-bold text-brand-text-main transition hover:bg-brand-pink"
          >
            Open BrandFit by Pixel Pro Lab
          </Link>
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-brand-purple/30 px-4 py-3 text-sm font-bold text-brand-text-main transition hover:border-brand-pink hover:text-brand-pink"
          >
            View BrandFit by Pixel Pro Lab on GitHub
          </a>
          <a
            href={liveAppUrl}
            className="rounded-md border border-brand-orange/40 px-4 py-3 text-sm font-bold text-brand-orange transition hover:bg-brand-orange hover:text-black"
          >
            Test the live BrandFit by Pixel Pro Lab app
          </a>
        </nav>
      </section>
    </main>
  );
}
