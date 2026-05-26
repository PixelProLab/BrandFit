# BrandFit

An open-source, browser-native tool for standardizing logo grids and optically balancing brand assets.

Built and maintained by [Pixel Pro Lab](https://github.com/PixelProLab).

## The Problem

Creating a uniform grid from diverse logos is a persistent design challenge. A square icon, a wide wordmark, and a complex emblem can all share the same mathematical dimensions but appear visually disproportionate when placed side-by-side.

BrandFit is a utility built to automate this alignment. It processes raw logo files to ensure they are trimmed, optically balanced, consistently padded, and ready to export as a unified, visually stable grid.

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
5. **Export:** Download the standardized SVG or WebP assets instantly as a single `.zip` file.

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

## Run the development server:
```bash
npm run lint
npm run build
```
## Run checks:
```Bash
npm run lint
npm run build
```