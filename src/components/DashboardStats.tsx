import type { ReactNode } from "react";
import { ArrowRight, BarChart3, FileText, Layers3, ShieldCheck, Sparkles } from "lucide-react";

import { getFormMeta } from "../lib/db";
import type { ExportManifest, ReportIndexRecord } from "../lib/types";

type DashboardStatsProps = {
  manifest: ExportManifest;
  reports: ReportIndexRecord[];
  onBrowseReports: () => void;
};

function formatExportDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function DashboardStats({ manifest, reports, onBrowseReports }: DashboardStatsProps) {
  const reportsWithAnalysis = reports.filter((report) => Boolean(report.tier3_professional_analysis)).length;
  const reportsWithPdf = reports.filter((report) => Boolean(report.pdf_path)).length;
  const topForms = [...manifest.forms].sort((a, b) => b.count - a.count).slice(0, 5);
  const maxCount = topForms[0]?.count ?? 1;

  return (
    <section className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Exported reports"
          value={manifest.report_count.toLocaleString()}
          detail="Real records loaded from the Python export."
        />
        <StatCard
          icon={<Layers3 className="h-4 w-4" />}
          label="Form templates"
          value={manifest.form_count.toString()}
          detail="Distinct disclosure types currently represented."
        />
        <StatCard
          icon={<Sparkles className="h-4 w-4" />}
          label="Reports with tier 3"
          value={reportsWithAnalysis.toLocaleString()}
          detail="Summaries that include professional analysis text."
        />
        <StatCard
          icon={<ShieldCheck className="h-4 w-4" />}
          label="PDF coverage"
          value={`${reportsWithPdf}/${manifest.report_count}`}
          detail={`Last export: ${formatExportDate(manifest.generated_at)}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Top forms</p>
              <h3 className="mt-2 font-heading text-2xl font-bold text-slate-950">
                Where the archive is densest
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                The export is strongest in officer changes, trustee reports, and capital-structure filings. That
                gives the site a good mix of governance, financing, and event-driven summaries.
              </p>
            </div>

            <button
              onClick={onBrowseReports}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <span>Browse reports</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 space-y-4">
            {topForms.map((form) => {
              const meta = getFormMeta(form.form_slug, form.form_type);
              return (
                <div key={form.form_slug} className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-heading text-sm font-semibold text-slate-950">{meta.title}</div>
                      <div className="text-xs text-slate-500">{meta.description}</div>
                    </div>
                    <div className="rounded-full border border-slate-200 px-3 py-1 font-mono text-xs text-slate-700">
                      {form.count}
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(form.count / maxCount) * 100}%`,
                        backgroundColor: meta.accent,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <div className="flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-slate-400">
            <BarChart3 className="h-4 w-4" />
            Export profile
          </div>
          <h3 className="mt-4 font-heading text-2xl font-bold">Static, inspectable, reproducible.</h3>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            The frontend is intentionally thin. All interesting work happens upstream: Python parsing, deterministic
            summarization, JSON export, and asset packaging. This site exists to make that output legible and credible.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <MetricPanel label="Forms with PDFs" value={reportsWithPdf.toString()} />
            <MetricPanel label="Reports without severity tag" value={reports.filter((r) => !r.severity_indicator).length.toString()} />
            <MetricPanel label="Writer type" value={[...new Set(reports.map((r) => r.writer || "Unknown"))].join(", ")} />
            <MetricPanel label="Source export" value="public/data/" mono />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs uppercase tracking-[0.18em]">{label}</span>
        <span>{icon}</span>
      </div>
      <div className="mt-4 font-heading text-3xl font-bold tracking-tight text-slate-950">{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

function MetricPanel({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className={`mt-2 text-sm text-white ${mono ? "font-mono" : "font-semibold"}`}>{value}</div>
    </div>
  );
}
