import type { ReactNode } from "react";
import { ArrowLeft, ExternalLink, FileText, GraduationCap, Link2, Sparkles } from "lucide-react";

import { buildMayaReportUrl, getFormMeta, getReportPdfUrl } from "../lib/db";
import type { ReportDetail } from "../lib/types";

type ReportDetailsCardProps = {
  report: ReportDetail;
  onBack: () => void;
};

export default function ReportDetailsCard({ report, onBack }: ReportDetailsCardProps) {
  const meta = getFormMeta(report.form_slug, report.form_type);
  const pdfUrl = getReportPdfUrl(report);
  const mayaReportUrl = buildMayaReportUrl(report.report_id);

  const copyLink = async () => {
    const value = `${window.location.origin}${window.location.pathname}#/reports/${report.form_slug}/${report.report_id}`;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // no-op
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to reports</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
          >
            <Link2 className="h-4 w-4" />
            <span>Copy link</span>
          </button>
          <a
            href={mayaReportUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Link to source</span>
          </a>
        </div>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ backgroundColor: `${meta.accent}14`, color: meta.accent }}
              >
                {report.form_type}
              </span>
              <span className="rounded-full border border-slate-200 px-3 py-1 font-mono text-[11px] text-slate-500">
                {report.report_id}
              </span>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-500">
                {report.writer ?? "Unknown writer"}
              </span>
            </div>

            <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-slate-950">{report.company}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{meta.description}</p>

            <dl className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-slate-400">Filing date</dt>
                <dd className="mt-1 font-mono text-slate-900">{report.date_display ?? "Unknown"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-slate-400">Export timestamp</dt>
                <dd className="mt-1 font-mono text-slate-900">{report.generated_at ?? "Unknown"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-slate-400">Source path</dt>
                <dd className="mt-1 truncate font-mono text-slate-900">{report.source_summary_path}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 lg:max-w-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
              <Sparkles className="h-4 w-4" />
              Summary layers
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-white p-4">
                <div className="font-semibold text-slate-950">Tier 1</div>
                <div className="mt-1">Headline-level summary for quick scanning.</div>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <div className="font-semibold text-slate-950">Tier 2</div>
                <div className="mt-1">Core explanatory summary plus educational context.</div>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <div className="font-semibold text-slate-950">Tier 3</div>
                <div className="mt-1">Optional professional analysis when the summarizer produced it.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <LayerCard icon={<FileText className="h-4 w-4" />} label="Tier 1" title={report.payload.tier1_one_liner ?? "No tier 1 summary"} strong />

          {report.payload.tier2?.summary_text && (
            <LayerCard
              icon={<FileText className="h-4 w-4" />}
              label="Tier 2 summary"
              title={report.payload.tier2.summary_text}
            />
          )}

          {report.payload.tier3_professional_analysis && (
            <LayerCard
              icon={<Sparkles className="h-4 w-4" />}
              label="Tier 3 analysis"
              title={report.payload.tier3_professional_analysis}
              accent
            />
          )}
        </div>

        <div>
          {report.payload.tier2?.educational_narrative && (
            <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50/70 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                <GraduationCap className="h-4 w-4" />
                Educational context
              </div>
              <p className="mt-4 text-sm leading-7 text-emerald-950" dir="rtl" lang="he">
                {report.payload.tier2.educational_narrative}
              </p>
            </section>
          )}
        </div>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
          <FileText className="h-4 w-4" />
          Source data
        </div>

        {pdfUrl ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-6 text-slate-600">
              Original filing metadata and the external source page come from TASE Maya. The PDF embedded below is the
              local archived version used in this project.
            </p>
            <a
              href={mayaReportUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Link To Source
            </a>
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
              <iframe src={pdfUrl} title={`${report.report_id} PDF`} className="h-[760px] w-full bg-white" />
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-6 text-slate-600">
              Original filing metadata and the external source page come from TASE Maya. No local archived PDF was
              exported for this report.
            </p>
            <a
              href={mayaReportUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Link To Source
            </a>
          </div>
        )}
      </section>
    </div>
  );
}

function LayerCard({
  icon,
  label,
  title,
  strong = false,
  accent = false,
}: {
  icon: ReactNode;
  label: string;
  title: string;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <section
      className={`rounded-[2rem] border p-6 shadow-sm ${
        accent ? "border-amber-200 bg-amber-50/60" : "border-slate-200 bg-white"
      }`}
    >
      <div className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] ${accent ? "text-amber-700" : "text-slate-400"}`}>
        {icon}
        {label}
      </div>
      <p className={`mt-4 leading-7 text-slate-900 ${strong ? "text-lg font-semibold" : "text-sm"}`} dir="rtl" lang="he">
        {title}
      </p>
    </section>
  );
}
