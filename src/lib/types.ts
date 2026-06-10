export type ExportManifest = {
  source_dir: string;
  generated_at: string;
  page_suffix?: string;
  report_count: number;
  form_count: number;
  missing_pdf_count: number;
  forms: Array<{
    form_type: string;
    form_slug: string;
    count: number;
  }>;
};

export type ReportIndexRecord = {
  report_id: string;
  page_id?: string;
  form_type: string;
  form_slug: string;
  company: string;
  title: string | null;
  date_display: string | null;
  date_iso: string | null;
  writer: string | null;
  model: string | null;
  generated_at: string | null;
  severity_indicator: string | null;
  tier1_one_liner: string | null;
  summary_text: string | null;
  educational_narrative: string | null;
  tier3_professional_analysis: string | null;
  report_path: string;
  pdf_path: string | null;
};

export type ReportDetail = {
  report_id: string;
  page_id?: string;
  form_type: string;
  form_slug: string;
  company: string;
  title: string | null;
  date_display: string | null;
  date_iso: string | null;
  writer: string | null;
  model: string | null;
  generated_at: string | null;
  severity_indicator: string | null;
  source_summary_path: string;
  source_pdf_path: string | null;
  payload: {
    severity_indicator: string | null;
    tier1_one_liner: string | null;
    tier2?: {
      summary_text?: string | null;
      educational_narrative?: string | null;
    };
    tier3_professional_analysis?: string | null;
  };
  assets: {
    pdf_path: string | null;
  };
};

export type RouteState =
  | { kind: "home" }
  | { kind: "reports" }
  | { kind: "about" }
  | { kind: "detail"; formSlug: string; reportId: string };

export type SortBy = "newest" | "oldest" | "company";

export type FilterState = {
  searchQuery: string;
  formSlug: string;
  company: string;
  writer: string;
  hasAnalysisOnly: boolean;
  hasPdfOnly: boolean;
  sortBy: SortBy;
};

export type FormMetadata = {
  title: string;
  description: string;
  accent: string;
};
