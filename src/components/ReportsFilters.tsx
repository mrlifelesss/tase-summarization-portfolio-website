import type { ReactNode } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { getFormMeta } from "../lib/db";
import type { ExportManifest, FilterState } from "../lib/types";

type ReportsFiltersProps = {
  filters: FilterState;
  onFilterChange: (next: FilterState) => void;
  companies: string[];
  writers: string[];
  manifest: ExportManifest;
};

export default function ReportsFilters({ filters, onFilterChange, companies, writers, manifest }: ReportsFiltersProps) {
  const activeCount =
    Number(Boolean(filters.searchQuery)) +
    Number(Boolean(filters.formSlug)) +
    Number(Boolean(filters.company)) +
    Number(Boolean(filters.writer)) +
    Number(filters.hasAnalysisOnly) +
    Number(filters.hasPdfOnly);

  const patch = (updates: Partial<FilterState>) => onFilterChange({ ...filters, ...updates });

  return (
    <aside className="space-y-6 lg:sticky lg:top-24">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            value={filters.searchQuery}
            onChange={(event) => patch({ searchQuery: event.target.value })}
            placeholder="Search company, report ID, tier 1, or summary text"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
          />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            Filters
            {activeCount > 0 && (
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">{activeCount}</span>
            )}
          </div>
          {activeCount > 0 && (
            <button
              onClick={() =>
                onFilterChange({
                  searchQuery: "",
                  formSlug: "",
                  company: "",
                  writer: "",
                  hasAnalysisOnly: false,
                  hasPdfOnly: false,
                  sortBy: "newest",
                })
              }
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              Reset
            </button>
          )}
        </div>

        <div className="mt-6 space-y-5">
          <FilterGroup label="Sort">
            <select
              value={filters.sortBy}
              onChange={(event) => patch({ sortBy: event.target.value as FilterState["sortBy"] })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="company">Company A-Z</option>
            </select>
          </FilterGroup>

          <FilterGroup label="Company">
            <select
              value={filters.company}
              onChange={(event) => patch({ company: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
            >
              <option value="">All companies</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup label="Writer">
            <div className="flex flex-wrap gap-2">
              {["", ...writers].map((writer) => {
                const active = filters.writer === writer;
                const label = writer || "All writers";
                return (
                  <button
                    key={label}
                    onClick={() => patch({ writer })}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      active ? "bg-slate-900 text-white" : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </FilterGroup>

          <FilterGroup label="Forms">
            <div className="flex flex-wrap gap-2">
              {manifest.forms.map((form) => {
                const active = filters.formSlug === form.form_slug;
                const meta = getFormMeta(form.form_slug, form.form_type);
                return (
                  <button
                    key={form.form_slug}
                    onClick={() => patch({ formSlug: active ? "" : form.form_slug })}
                    title={meta.description}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-900"
                    }`}
                  >
                    <span>{`T${form.form_type.replace(/^[^0-9]+/, "")}`}</span>
                    <span className={`${active ? "text-slate-300" : "text-slate-400"}`}>·</span>
                    <span className={`font-mono ${active ? "text-slate-300" : "text-slate-400"}`}>
                      {form.count} reports
                    </span>
                  </button>
                );
              })}
            </div>
          </FilterGroup>

          <FilterGroup label="Content flags">
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span>Only reports with tier 3 analysis</span>
              <input
                type="checkbox"
                checked={filters.hasAnalysisOnly}
                onChange={(event) => patch({ hasAnalysisOnly: event.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
            </label>
            <label className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span>Only reports with linked PDF</span>
              <input
                type="checkbox"
                checked={filters.hasPdfOnly}
                onChange={(event) => patch({ hasPdfOnly: event.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
            </label>
          </FilterGroup>
        </div>
      </div>
    </aside>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      {children}
    </div>
  );
}
