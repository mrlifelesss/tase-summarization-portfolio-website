import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ArrowRight, Layers3, LoaderCircle, SearchX, Sparkles } from "lucide-react";

import AboutSystem from "./components/AboutSystem";
import DashboardStats from "./components/DashboardStats";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ReportDetailsCard from "./components/ReportDetailsCard";
import ReportsFilters from "./components/ReportsFilters";
import ReportsList from "./components/ReportsList";
import { getFormMeta, loadFormsMeta, loadIndex, loadManifest, loadReportDetail } from "./lib/db";
import type { ExportManifest, FilterState, ReportDetail, ReportIndexRecord, RouteState } from "./lib/types";

const PERSONAL_PORTFOLIO_URL = "https://mrlifelesss.github.io/portfolio/";

const defaultFilters: FilterState = {
  searchQuery: "",
  formSlug: "",
  company: "",
  writer: "",
  hasAnalysisOnly: false,
  hasPdfOnly: false,
  sortBy: "newest",
};

function getPageId(report: Pick<ReportIndexRecord, "report_id" | "page_id"> | Pick<ReportDetail, "report_id" | "page_id">): string {
  return report.page_id ?? report.report_id;
}

function parseHash(hash: string): RouteState {
  const value = (hash || "#/").slice(1) || "/";
  if (value === "/") {
    return { kind: "home" };
  }
  if (value === "/reports") {
    return { kind: "reports" };
  }
  if (value === "/about") {
    return { kind: "about" };
  }
  if (value.startsWith("/reports/")) {
    const [, , formSlug, reportId] = value.split("/");
    if (formSlug && reportId) {
      return { kind: "detail", formSlug, reportId };
    }
  }
  return { kind: "home" };
}

function formatExportDate(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function App() {
  const [route, setRoute] = useState<RouteState>(() => parseHash(window.location.hash));
  const [manifest, setManifest] = useState<ExportManifest | null>(null);
  const [reports, setReports] = useState<ReportIndexRecord[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const deferredQuery = useDeferredValue(filters.searchQuery);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    Promise.all([loadManifest(), loadIndex(), loadFormsMeta()])
      .then(([nextManifest, nextReports]) => {
        if (cancelled) {
          return;
        }
        setManifest(nextManifest);
        setReports(nextReports);
        setError(null);
      })
      .catch((nextError) => {
        if (cancelled) {
          return;
        }
        setError(nextError instanceof Error ? nextError.message : "Failed to load site data.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (route.kind !== "detail") {
      setDetail(null);
      setDetailError(null);
      setDetailLoading(false);
      return;
    }

    const selectedReport = reports.find(
      (report) => report.form_slug === route.formSlug && getPageId(report) === route.reportId,
    );

    if (!selectedReport) {
      if (!loading) {
        setDetail(null);
        setDetailError("This report is not present in the exported index.");
      }
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);

    loadReportDetail(selectedReport.report_path)
      .then((nextDetail) => {
        if (!cancelled) {
          setDetail(nextDetail);
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          setDetail(null);
          setDetailError(nextError instanceof Error ? nextError.message : "Failed to load report detail.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDetailLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loading, reports, route]);

  const exportDateLabel = formatExportDate(manifest?.generated_at ?? null);
  const companies = useMemo(
    () => [...new Set(reports.map((report) => report.company))].sort((a, b) => a.localeCompare(b, "he")),
    [reports],
  );
  const writers = useMemo(
    () => [...new Set(reports.map((report) => report.writer).filter((writer): writer is string => Boolean(writer)))].sort(),
    [reports],
  );

  const filteredReports = useMemo(() => {
    const query = deferredQuery.trim().toLocaleLowerCase();

    const nextReports = reports.filter((report) => {
      if (query) {
        const haystack = [report.company, report.report_id, report.tier1_one_liner, report.summary_text]
          .concat(report.page_id ? [report.page_id] : [])
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      if (filters.formSlug && report.form_slug !== filters.formSlug) {
        return false;
      }
      if (filters.company && report.company !== filters.company) {
        return false;
      }
      if (filters.writer && (report.writer ?? "") !== filters.writer) {
        return false;
      }
      if (filters.hasAnalysisOnly && !report.tier3_professional_analysis) {
        return false;
      }
      if (filters.hasPdfOnly && !report.pdf_path) {
        return false;
      }

      return true;
    });

    nextReports.sort((left, right) => {
      if (filters.sortBy === "company") {
        return left.company.localeCompare(right.company, "he");
      }
      const leftTime = new Date(left.date_iso ?? 0).getTime();
      const rightTime = new Date(right.date_iso ?? 0).getTime();
      return filters.sortBy === "oldest" ? leftTime - rightTime : rightTime - leftTime;
    });

    return nextReports;
  }, [deferredQuery, filters, reports]);

  const featuredReports = useMemo(() => {
    const picks = reports.filter((report) => report.tier3_professional_analysis).slice(0, 3);
    return picks.length > 0 ? picks : reports.slice(0, 3);
  }, [reports]);

  const selectedIndexRecord =
    route.kind === "detail"
      ? reports.find((report) => report.form_slug === route.formSlug && getPageId(report) === route.reportId) ?? null
      : null;

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  const openReport = (report: ReportIndexRecord) => {
    navigateTo(`/reports/${report.form_slug}/${getPageId(report)}`);
  };

  return (
    <div className="min-h-screen bg-app text-slate-900">
      <Navbar route={route} onNavigate={navigateTo} exportDateLabel={exportDateLabel} />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} />}

        {!loading && !error && manifest && (
          <>
            {route.kind === "home" && (
              <div className="space-y-12">
                <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[2.25rem] border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span lang="he" dir="rtl">נתחו את הודעות הבורסה בשניות</span>
                    </div>
                    <h1 className="mt-6 max-w-3xl font-heading text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
                      TASE filing summaries, exported from a deterministic document-processing workflow.
                    </h1>
                    <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
                      This site presents summaries generated from selected TASE filings. The underlying workflow parses
                      source documents, extracts structured fields, renders deterministic summary layers, and exports
                      JSON plus archived PDFs for static delivery.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <button
                        onClick={() => navigateTo("/reports")}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        <span>Browse reports</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <a
                        href={PERSONAL_PORTFOLIO_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
                      >
                        <span>About Me</span>
                      </a>
                    </div>
                  </div>

                  <div className="rounded-[2.25rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-sm">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Live dataset snapshot</div>
                    <div className="mt-6 space-y-4">
                      <SnapshotRow label="Reports" value={manifest.report_count.toLocaleString()} />
                      <SnapshotRow label="Forms" value={manifest.form_count.toString()} />
                      <SnapshotRow label="Exported on" value={exportDateLabel ?? "Unknown"} mono />
                      <SnapshotRow label="Source" value={manifest.source_dir} mono />
                    </div>
                    <p className="mt-8 text-sm leading-6 text-slate-300">
                      The data is precomputed upstream, copied into `public/data`, and served without a runtime
                      backend. That keeps the site simple and makes the work easier to inspect.
                    </p>
                  </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-3">
                  <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">System context</div>
                    <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                      <p>
                        The source material comes from Tel Aviv Stock Exchange filings referenced through a local SQLite
                        index and archived HTML copies.
                      </p>
                      <p>
                        The summaries shown here are deterministic. They are produced from extracted fields and
                        template-driven summarization code rather than a generative runtime step.
                      </p>
                      <p>
                        This website is the read-only presentation layer over the exported results.
                      </p>
                    </div>
                  </section>

                  <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Tech stack</div>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      Python, SQLite, HTML parsing, deterministic summarization, JSON export, React, TypeScript, and
                      static hosting.
                    </p>
                  </section>

                  <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Methodology and limitations</div>
                    <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                      <p>
                        Coverage is limited to the filing forms currently supported by the extraction and summarization
                        code.
                      </p>
                      <p>
                        The output is intended as a structured research archive and engineering sample, not investment
                        advice or an official filing substitute.
                      </p>
                    </div>
                  </section>
                </section>

                <DashboardStats manifest={manifest} reports={reports} onBrowseReports={() => navigateTo("/reports")} />

                <section className="space-y-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Featured reports</p>
                      <h2 className="mt-2 font-heading text-3xl font-bold text-slate-950">
                        Selected reports from the dataset
                      </h2>
                    </div>
                    <button
                      onClick={() => navigateTo("/reports")}
                      className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
                    >
                      View all
                    </button>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    {featuredReports.map((report) => {
                      const meta = getFormMeta(report.form_slug, report.form_type);
                      return (
                        <button
                          key={`${report.form_slug}:${report.report_id}`}
                          onClick={() => openReport(report)}
                          className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-900 hover:shadow-lg"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <span
                              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                              style={{ backgroundColor: `${meta.accent}14`, color: meta.accent }}
                            >
                              {report.form_type}
                            </span>
                            <span className="font-mono text-xs text-slate-400">{report.date_display}</span>
                          </div>
                          <h3 className="mt-5 font-heading text-2xl font-bold text-slate-950">{report.company}</h3>
                          <p className="mt-3 text-sm leading-7 text-slate-900" dir="rtl" lang="he">
                            {report.tier1_one_liner}
                          </p>
                          <p className="mt-4 text-sm leading-6 text-slate-600">{meta.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {route.kind === "reports" && (
              <div className="space-y-8">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Archive browser</p>
                  <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-slate-950">
                    Browse the exported reports
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                    Search across companies, report IDs, headline summaries, and body text. The list below is backed
                    by the real export index and opens detail pages sourced from the per-report JSON files.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                    <Layers3 className="h-4 w-4" />
                    <span>{filteredReports.length.toLocaleString()} matching reports</span>
                  </div>
                </section>

                <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
                  <ReportsFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    companies={companies}
                    writers={writers}
                    manifest={manifest}
                  />
                  <ErrorBoundary>
                    <ReportsList reports={filteredReports} onOpenReport={openReport} />
                  </ErrorBoundary>
                </div>
              </div>
            )}

            {route.kind === "about" && <AboutSystem manifest={manifest} reports={reports} />}

            {route.kind === "detail" && (
              <div className="space-y-8">
                {!selectedIndexRecord && !detailLoading && <ErrorState message={detailError ?? "Report not found in the current export."} />}
                {detailLoading && <LoadingState compact />}
                {!detailLoading && detail && (
                  <ErrorBoundary>
                    <ReportDetailsCard
                      report={detail}
                      onBack={() => navigateTo("/reports")}
                    />
                  </ErrorBoundary>
                )}
                {!detailLoading && detailError && <ErrorState message={detailError} />}
              </div>
            )}
          </>
        )}
      </main>

      <Footer manifest={manifest} />
    </div>
  );
}

function LoadingState({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm ${compact ? "max-w-2xl" : ""}`}>
      <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-slate-400" />
      <div className="mt-4 font-heading text-2xl font-bold text-slate-950">Loading exported data</div>
      <p className="mt-2 text-sm text-slate-600">Reading manifest, index, and linked report assets from `public/data`.</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[2rem] border border-red-200 bg-red-50 p-10 text-center shadow-sm">
      <SearchX className="mx-auto h-8 w-8 text-red-500" />
      <div className="mt-4 font-heading text-2xl font-bold text-red-950">Unable to render the archive</div>
      <p className="mt-2 text-sm text-red-700">{message}</p>
    </div>
  );
}

function SnapshotRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm text-white ${mono ? "font-mono" : "font-semibold"}`}>{value}</span>
    </div>
  );
}
