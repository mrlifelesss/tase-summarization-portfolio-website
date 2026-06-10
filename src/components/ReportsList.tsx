import { ArrowRight, FileText, FolderSearch, Sparkles } from "lucide-react";

import { getFormMeta } from "../lib/db";
import type { ReportIndexRecord } from "../lib/types";

type ReportsListProps = {
  reports: ReportIndexRecord[];
  onOpenReport: (report: ReportIndexRecord) => void;
};

export default function ReportsList({ reports, onOpenReport }: ReportsListProps) {
  if (reports.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
        <FolderSearch className="mx-auto h-10 w-10 text-slate-400" />
        <h3 className="mt-5 font-heading text-2xl font-bold text-slate-950">No reports match the current filters</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Try widening the search, clearing the company filter, or removing the tier 3/PDF-only constraints.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const meta = getFormMeta(report.form_slug, report.form_type);
        const pageId = report.page_id ?? report.report_id;
        return (
          <article
            key={`${report.form_slug}:${pageId}`}
            className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-900 hover:shadow-lg"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                    style={{ backgroundColor: `${meta.accent}14`, color: meta.accent }}
                  >
                    {report.form_type}
                  </span>
                  <span className="rounded-full border border-slate-200 px-3 py-1 font-mono text-[11px] text-slate-500">
                    {pageId}
                  </span>
                  {report.tier3_professional_analysis && (
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                      Tier 3
                    </span>
                  )}
                  {report.pdf_path && (
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-500">
                      PDF linked
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-slate-950">{report.company}</h3>
                  {report.title && (
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-700" dir="rtl" lang="he">
                      {report.title}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-6 text-slate-600">{meta.description}</p>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-sm font-semibold leading-7 text-slate-900" dir="rtl" lang="he">
                    {report.tier1_one_liner ?? "No tier 1 summary available."}
                  </p>
                  {report.summary_text && (
                    <p className="mt-3 text-sm leading-7 text-slate-600" dir="rtl" lang="he">
                      {truncate(report.summary_text, 260)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex min-w-[210px] flex-col items-start gap-4 lg:items-end">
                <div className="text-sm text-slate-500">
                  <div className="font-mono text-slate-900">{report.date_display ?? "Unknown date"}</div>
                  <div className="mt-1">{report.writer ?? "Unknown writer"}</div>
                </div>

                <button
                  onClick={() => onOpenReport(report)}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <span>Open report</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {report.tier3_professional_analysis ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
                    <Sparkles className="h-3.5 w-3.5" />
                    Includes advanced commentary
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
                    <FileText className="h-3.5 w-3.5" />
                    Summary only
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength).trimEnd()}…`;
}
