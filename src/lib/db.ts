import type { ExportManifest, FormMetadata, ReportDetail, ReportIndexRecord } from "./types";

const DATA_ROOT = (import.meta.env.VITE_DATA_BASE_URL || "/data").replace(/\/+$/, "");

let manifestPromise: Promise<ExportManifest> | null = null;
let indexPromise: Promise<ReportIndexRecord[]> | null = null;
let formsMetaPromise: Promise<Record<string, FormMetadata>> | null = null;
let loadedFormsMeta: Record<string, FormMetadata> | null = null;
const reportCache = new Map<string, Promise<ReportDetail>>();

export const formMetadataMap: Record<string, FormMetadata> = {
  t049: {
    title: "T049 · General meeting results",
    description: "Meeting outcomes and voting decisions approved by shareholders.",
    accent: "#0f766e",
  },
  t076: {
    title: "T076 · Officer and management changes",
    description: "Appointments, resignations, and governance changes involving senior officers.",
    accent: "#1d4ed8",
  },
  t078: {
    title: "T078 · Directors' report",
    description: "Board-level narrative around operating results, cash flow, and business direction.",
    accent: "#4338ca",
  },
  t079: {
    title: "T079 · Governance and holdings events",
    description: "Structured filings around corporate governance and material holding updates.",
    accent: "#0f766e",
  },
  t081: {
    title: "T081 · Shelf offering activity",
    description: "Capital markets actions, shelf prospectus usage, and financing events.",
    accent: "#7c3aed",
  },
  t085: {
    title: "T085 · Capital structure changes",
    description: "Treasury shares and other capital structure changes reported by issuers.",
    accent: "#be185d",
  },
  t087: {
    title: "T087 · Related-party and control matters",
    description: "Transactions or changes involving controllers and concentrated ownership.",
    accent: "#c2410c",
  },
  t090: {
    title: "T090 · Meeting notices",
    description: "Notices convening shareholder meetings and agenda items.",
    accent: "#b45309",
  },
  t091: {
    title: "T091 · Meeting resolutions",
    description: "Formal outcomes of shareholder meetings and recorded resolutions.",
    accent: "#ea580c",
  },
  t095: {
    title: "T095 · Interested party holding changes",
    description: "Updates to positions held by controlling or interested parties.",
    accent: "#7c2d12",
  },
  t097: {
    title: "T097 · Bond trustee reports",
    description: "Trustee oversight filings tied to debt covenants and bondholder protection.",
    accent: "#0f766e",
  },
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function buildDataUrl(relativePath: string): string {
  return `${DATA_ROOT}/${relativePath.replace(/^\/+/, "")}`;
}

export function buildMayaReportUrl(reportId: string): string {
  const normalizedReportId = reportId.replace(/^[^0-9]+/, "");
  return `https://maya.tase.co.il/he/reports/companies/${encodeURIComponent(normalizedReportId)}`;
}

type FormsJsonEntry = { form_slug: string; title?: string; description?: string; accent?: string };

export async function loadFormsMeta(): Promise<Record<string, FormMetadata>> {
  if (!formsMetaPromise) {
    formsMetaPromise = fetchJson<FormsJsonEntry[]>(buildDataUrl("forms.json"))
      .then((entries) => {
        const map: Record<string, FormMetadata> = {};
        for (const entry of entries) {
          if (entry.title && entry.description && entry.accent) {
            map[entry.form_slug] = { title: entry.title, description: entry.description, accent: entry.accent };
          }
        }
        loadedFormsMeta = Object.keys(map).length > 0 ? map : formMetadataMap;
        return loadedFormsMeta;
      })
      .catch(() => {
        loadedFormsMeta = formMetadataMap;
        return formMetadataMap;
      });
  }
  return formsMetaPromise;
}

export async function loadManifest(): Promise<ExportManifest> {
  if (!manifestPromise) {
    manifestPromise = fetchJson<ExportManifest>(buildDataUrl("manifest.json"));
  }
  return manifestPromise;
}

export async function loadIndex(): Promise<ReportIndexRecord[]> {
  if (!indexPromise) {
    indexPromise = fetchJson<ReportIndexRecord[]>(buildDataUrl("index.json"));
  }
  return indexPromise;
}

export async function loadReportDetail(reportPath: string): Promise<ReportDetail> {
  if (!reportCache.has(reportPath)) {
    reportCache.set(reportPath, fetchJson<ReportDetail>(buildDataUrl(reportPath)));
  }
  return reportCache.get(reportPath)!;
}

export function getFormMeta(formSlug: string, formType: string): FormMetadata {
  const map = loadedFormsMeta ?? formMetadataMap;
  return map[formSlug] ?? {
    title: `${formType} · TASE filing`,
    description: "Structured filing exported from the deterministic summarization pipeline.",
    accent: "#334155",
  };
}

export function getReportPdfUrl(report: Pick<ReportDetail, "assets" | "source_pdf_path">): string | null {
  if (report.assets?.pdf_path) {
    return buildDataUrl(report.assets.pdf_path);
  }
  if (report.source_pdf_path) {
    return buildDataUrl(report.source_pdf_path);
  }
  return null;
}
