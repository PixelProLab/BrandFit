import { describe, expect, it } from "vitest";
import type { ProcessedLogo } from "@/lib/canvas-processing";
import {
  createInitialLogoWorkspaceState,
  createLogoJob,
  logoWorkspaceReducer,
} from "./logo-workspace-store";

const makeProcessedLogo = (id: string): ProcessedLogo => ({
  id,
  source: {
    id,
    fileName: `${id}.png`,
    mimeType: "image/png",
    sizeInBytes: 2048,
  },
  trimBounds: {
    top: 2,
    right: 120,
    bottom: 80,
    left: 4,
    width: 117,
    height: 79,
  },
  balanceMetrics: {
    visiblePixelRatio: 0.42,
    visualCenterOffset: { x: 0.02, y: -0.01 },
    alphaDensity: 0.61,
    opticalScale: 0.98,
  },
  outputWidth: 512,
  outputHeight: 512,
  normalizationMode: "original",
  manualScale: 1,
});

describe("logo workspace reducer", () => {
  it("creates queued logo jobs from uploaded files", () => {
    const file = new File(["brand"], "Acme Mark.png", { type: "image/png" });
    const job = createLogoJob(file);

    expect(job.file).toBe(file);
    expect(job.status).toBe("queued");
    expect(job.previewUrl).toBe("");
    expect(job.manualScale).toBe(1);
    expect(job.error).toBeNull();
    expect(job.id).toContain("Acme Mark.png");
  });

  it("tracks logo lifecycle and keeps settings updates immutable", () => {
    const state = createInitialLogoWorkspaceState();
    const file = new File(["brand"], "Acme Mark.png", { type: "image/png" });
    const job = createLogoJob(file);
    const queued = logoWorkspaceReducer(state, { type: "queue-files", files: [file] });
    const processing = logoWorkspaceReducer(queued, {
      type: "mark-processing",
      id: queued.jobs[0].id,
      previewUrl: "blob:preview",
    });
    const complete = logoWorkspaceReducer(processing, {
      type: "mark-complete",
      id: queued.jobs[0].id,
      logo: makeProcessedLogo(job.id),
    });
    const updated = logoWorkspaceReducer(complete, {
      type: "update-settings",
      settings: { outputSize: 1024, normalizationMode: "black" },
    });

    expect(state.jobs).toHaveLength(0);
    expect(queued.jobs[0]).toMatchObject({
      file,
      status: "queued",
    });
    expect(processing.jobs[0]).toMatchObject({
      status: "processing",
      previewUrl: "blob:preview",
    });
    expect(complete.jobs[0]).toMatchObject({
      status: "complete",
      processedLogo: expect.objectContaining({ outputWidth: 512 }),
    });
    expect(updated.settings).toMatchObject({
      outputSize: 1024,
      normalizationMode: "black",
    });
    expect(complete.settings.outputSize).toBe(512);
  });

  it("selects a logo and queues only that logo when manual scale changes", () => {
    const file = new File(["brand"], "Acme Mark.png", { type: "image/png" });
    const queued = logoWorkspaceReducer(createInitialLogoWorkspaceState(), {
      type: "queue-files",
      files: [file],
    });
    const complete = logoWorkspaceReducer(queued, {
      type: "mark-complete",
      id: queued.jobs[0].id,
      logo: makeProcessedLogo(queued.jobs[0].id),
    });
    const scaled = logoWorkspaceReducer(complete, {
      type: "update-job-manual-scale",
      id: queued.jobs[0].id,
      manualScale: 1.24,
    });

    expect(scaled.selectedJobId).toBe(queued.jobs[0].id);
    expect(scaled.jobs[0]).toMatchObject({
      manualScale: 1.24,
      status: "queued",
      processedLogo: complete.jobs[0].processedLogo,
      error: null,
    });
    expect(scaled.logos).toEqual([complete.jobs[0].processedLogo]);
  });

  it("keeps processed outputs mounted while all logos reprocess", () => {
    const file = new File(["brand"], "Acme Mark.png", { type: "image/png" });
    const queued = logoWorkspaceReducer(createInitialLogoWorkspaceState(), {
      type: "queue-files",
      files: [file],
    });
    const complete = logoWorkspaceReducer(queued, {
      type: "mark-complete",
      id: queued.jobs[0].id,
      logo: makeProcessedLogo(queued.jobs[0].id),
    });
    const reprocessing = logoWorkspaceReducer(complete, { type: "reprocess-all" });

    expect(reprocessing.jobs[0]).toMatchObject({
      status: "queued",
      processedLogo: complete.jobs[0].processedLogo,
      error: null,
    });
    expect(reprocessing.logos).toEqual([complete.jobs[0].processedLogo]);
  });
});
