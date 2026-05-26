import type {
  ColorNormalizationMode,
  LogoExportFormat,
  ProcessedLogo,
} from "@/lib/canvas-processing";

export type LogoJobStatus = "queued" | "processing" | "complete" | "error";

export type LogoWorkspaceSettings = {
  outputSize: number;
  paddingRatio: number;
  exportFormat: LogoExportFormat;
  normalizationMode: ColorNormalizationMode;
};

export type LogoJob = {
  id: string;
  file: File;
  status: LogoJobStatus;
  previewUrl: string;
  manualScale: number;
  processedLogo: ProcessedLogo | null;
  error: string | null;
};

export type LogoWorkspaceState = {
  jobs: LogoJob[];
  logos: ProcessedLogo[];
  settings: LogoWorkspaceSettings;
  selectedJobId: string | null;
};

export type LogoWorkspaceAction =
  | { type: "queue-files"; files: File[] }
  | { type: "queue-jobs"; jobs: LogoJob[] }
  | { type: "mark-processing"; id: string; previewUrl: string }
  | { type: "mark-complete"; id: string; logo: ProcessedLogo }
  | { type: "mark-error"; id: string; error: string }
  | { type: "remove-job"; id: string }
  | { type: "clear-completed" }
  | { type: "reprocess-all" }
  | { type: "select-job"; id: string | null }
  | { type: "update-job-manual-scale"; id: string; manualScale: number }
  | { type: "update-settings"; settings: Partial<LogoWorkspaceSettings> }
  | { type: "reset" };

export const defaultLogoWorkspaceSettings: LogoWorkspaceSettings = {
  outputSize: 512,
  paddingRatio: 0.16,
  exportFormat: "webp",
  normalizationMode: "original",
};

export const createInitialLogoWorkspaceState = (): LogoWorkspaceState => ({
  jobs: [],
  logos: [],
  settings: { ...defaultLogoWorkspaceSettings },
  selectedJobId: null,
});

export const createLogoJob = (file: File): LogoJob => ({
  id: `${file.name}-${file.size}-${file.lastModified}-${createStableId()}`,
  file,
  status: "queued",
  previewUrl: "",
  manualScale: 1,
  processedLogo: null,
  error: null,
});

export const logoWorkspaceReducer = (
  state: LogoWorkspaceState,
  action: LogoWorkspaceAction,
): LogoWorkspaceState => {
  switch (action.type) {
    case "queue-files":
      return appendJobs(state, action.files.map(createLogoJob));
    case "queue-jobs":
      return appendJobs(state, action.jobs);
    case "mark-processing":
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === action.id
            ? { ...job, status: "processing", previewUrl: action.previewUrl, error: null }
            : job,
        ),
      };
    case "mark-complete": {
      const nextJobs = state.jobs.map((job) =>
        job.id === action.id
          ? { ...job, status: "complete" as const, processedLogo: action.logo, error: null }
          : job,
      );

      return {
        ...state,
        jobs: nextJobs,
        logos: nextJobs.flatMap((job) => (job.processedLogo ? [job.processedLogo] : [])),
      };
    }
    case "mark-error":
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === action.id ? { ...job, status: "error", error: action.error } : job,
        ),
      };
    case "remove-job": {
      const jobs = state.jobs.filter((job) => job.id !== action.id);

      return {
        ...state,
        jobs,
        logos: jobs.flatMap((job) => (job.processedLogo ? [job.processedLogo] : [])),
        selectedJobId: state.selectedJobId === action.id ? null : state.selectedJobId,
      };
    }
    case "clear-completed": {
      const jobs = state.jobs.filter((job) => job.status !== "complete");

      return {
        ...state,
        jobs,
        logos: jobs.flatMap((job) => (job.processedLogo ? [job.processedLogo] : [])),
      };
    }
    case "reprocess-all":
      return {
        ...state,
        jobs: state.jobs.map((job) => ({
          ...job,
          status: "queued",
          processedLogo: null,
          error: null,
        })),
        logos: [],
      };
    case "select-job":
      return {
        ...state,
        selectedJobId: action.id,
      };
    case "update-job-manual-scale": {
      const manualScale = clamp(action.manualScale, 0.65, 1.4);
      const jobs = state.jobs.map((job) =>
        job.id === action.id
          ? {
              ...job,
              manualScale,
              status: "queued" as const,
              error: null,
            }
          : job,
      );

      return {
        ...state,
        jobs,
        logos: jobs.flatMap((job) => (job.processedLogo ? [job.processedLogo] : [])),
        selectedJobId: action.id,
      };
    }
    case "update-settings":
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings,
        },
      };
    case "reset":
      return createInitialLogoWorkspaceState();
    default:
      return state;
  }
};

const appendJobs = (state: LogoWorkspaceState, jobs: LogoJob[]): LogoWorkspaceState => ({
  ...state,
  jobs: [...state.jobs, ...jobs],
  selectedJobId: state.selectedJobId ?? jobs[0]?.id ?? null,
});

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const createStableId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
};
