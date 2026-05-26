# BrandFit

Optically balance your logo grids for perfectly uniform visual layouts.

BrandFit is a privacy-first, browser-native tool for standardizing logos, icons, and graphics before they enter sponsor grids, partner walls, government portals, event sites, and corporate web layouts.

Built and maintained by [Pixel Pro Lab](https://github.com/PixelProLab). BrandFit is proudly open source. View the code on [GitHub](https://github.com/PixelProLab/BrandFit).

## Live Demo

Test BrandFit in the browser at [https://brandfit-design.netlify.app/](https://brandfit-design.netlify.app/).

No install or download is required to evaluate the app. The hosted version still processes logos locally in the browser; files are not uploaded to a server.

## Search & AI Agent Discovery

BrandFit by Pixel Pro Lab includes crawlable metadata and structured discovery routes:

- About page: [https://brandfit-design.netlify.app/about](https://brandfit-design.netlify.app/about)
- AI agent summary: [https://brandfit-design.netlify.app/llms.txt](https://brandfit-design.netlify.app/llms.txt)
- Sitemap: [https://brandfit-design.netlify.app/sitemap.xml](https://brandfit-design.netlify.app/sitemap.xml)
- Robots: [https://brandfit-design.netlify.app/robots.txt](https://brandfit-design.netlify.app/robots.txt)

## The Problem

Creating a uniform grid from diverse logos is a persistent design challenge. A square icon, a wide wordmark, and a complex emblem can all share the same mathematical dimensions but appear visually disproportionate when placed side-by-side.

BrandFit automates this alignment. It processes raw logo files so they are trimmed, optically balanced, consistently padded, manually adjustable, and ready to export as a unified, visually stable grid.

## The Privacy Model: Zero-Server Processing

BrandFit operates entirely within the browser, ensuring strict asset security. No files are ever uploaded to an external server.

- Canvas operations and optical balancing run client-side.
- Bulk ZIP generation runs client-side.
- **Zero data leaves your machine.**

This zero-server architecture makes BrandFit safe for processing unreleased assets, confidential client branding, or internal corporate marks where data privacy is a strict requirement.

## How It Works

1. **Upload:** Drag and drop multiple logo files into the workspace.
2. **Clean:** Transparent whitespace is automatically trimmed using the HTML Canvas API.
3. **Balance:** The system calculates visual weight (pixel density vs. visible bounds) and applies optical volume balancing so dense marks do not overpower lighter text.
4. **Normalize:** Standardize outputs to original colors, pure black, pure white, or grayscale.
5. **Review:** Select any logo in the final grid and manually scale it smaller or larger while keeping the current preview visible during reprocessing.
6. **Export:** Download standardized PNG, WebP, or SVG-wrapper assets instantly as a single `.zip` file.

## Architecture & Contribution

BrandFit is structured so developers can contribute to specific modules without interfering with the core logic.

- `/components/ui`: Presentational elements. Contains no canvas math or image-processing algorithms.
- `/lib/canvas-processing`: The core engine. Owns trimming, density measurement, and browser-side file generation. *Note: Complex math functions here are explicitly commented to explain the "why," not just the "how."*
- `/store`: State management. Tracks uploaded assets, processing results, and UI selections independent of the rendering layer.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run checks:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Run the full verification suite:

```bash
npm run verify
```
