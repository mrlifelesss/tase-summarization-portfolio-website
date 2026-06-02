import type { ReactNode } from "react";
import { Database, FileJson2, FileStack, LayoutPanelTop, Settings2, Sparkles } from "lucide-react";

import type { ExportManifest, ReportIndexRecord } from "../lib/types";

type AboutSystemProps = {
  manifest: ExportManifest;
  reports: ReportIndexRecord[];
};

export default function AboutSystem({ manifest, reports }: AboutSystemProps) {
  const writers = [...new Set(reports.map((report) => report.writer || "Unknown"))];
  const withAnalysis = reports.filter((report) => report.tier3_professional_analysis).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">About me</p>
        <h2 className="mt-3 font-heading text-4xl font-bold tracking-tight text-slate-950">
          I build software that turns messy information into usable systems.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          This system brings together the kind of work I enjoy most: document processing, structured exports,
          and frontend interfaces that make complex information easier to browse. I am interested in building
          systems where accuracy, clarity, and practical implementation matter more than flashy claims.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={<Database className="h-5 w-5" />} label="Reports exported" value={manifest.report_count.toLocaleString()} />
        <InfoCard icon={<FileStack className="h-5 w-5" />} label="Form templates" value={manifest.form_count.toString()} />
        <InfoCard icon={<Sparkles className="h-5 w-5" />} label="Tier 3 summaries" value={withAnalysis.toLocaleString()} />
        <InfoCard icon={<Settings2 className="h-5 w-5" />} label="Writer modes" value={writers.join(", ")} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">What I do</p>
          <ol className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
            <li>1. Build Python workflows for extracting and structuring difficult source material.</li>
            <li>2. Design data models and exports that are reliable enough for a frontend to depend on.</li>
            <li>3. Build interfaces in TypeScript/React that make the data understandable and usable.</li>
            <li>4. Prefer systems that are auditable, maintainable, and straightforward to deploy.</li>
          </ol>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">What this system demonstrates</p>
          <div className="mt-6 grid gap-4">
            <ReasonCard
              icon={<FileJson2 className="h-4 w-4" />}
              title="Document-to-product thinking"
              body="The system starts with exchange disclosures and ends with a usable browsing interface, not just a script or dataset."
            />
            <ReasonCard
              icon={<LayoutPanelTop className="h-4 w-4" />}
              title="Cross-stack implementation"
              body="It combines Python data processing, export design, and frontend implementation in a single coherent workflow."
            />
            <ReasonCard
              icon={<Sparkles className="h-4 w-4" />}
              title="Accuracy over theatrics"
              body="The site is intentionally quieter than a product landing page. The point is to show engineering judgment, not marketing copy."
            />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">System context</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="font-heading text-2xl font-bold text-slate-950">Why I built it</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Public market disclosures are important, but they are often cumbersome to read and compare. I built
              this as a way to turn raw filings into a structured archive that is easier to scan, filter, and inspect
              without hiding the source material.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-2xl font-bold text-slate-950">How I want it to read</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              More like a product case study than an advertisement. The site should make the work legible: what the
              data is, how it was produced, and what kind of engineering decisions went into presenting it properly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs uppercase tracking-[0.18em]">{label}</span>
        {icon}
      </div>
      <div className="mt-4 font-heading text-2xl font-bold text-slate-950">{value}</div>
    </div>
  );
}

function ReasonCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-2 font-heading text-lg font-bold text-slate-950">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}
