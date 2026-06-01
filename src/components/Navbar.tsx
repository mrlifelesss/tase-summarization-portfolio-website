import { Database, FileSearch2, GitBranch, Home } from "lucide-react";

import type { RouteState } from "../lib/types";

const PERSONAL_PORTFOLIO_URL = "https://mrlifelesss.github.io/portfolio/";

type NavbarProps = {
  route: RouteState;
  onNavigate: (path: string) => void;
  exportDateLabel: string | null;
};

const items = [
  { path: "/", label: "Overview", icon: Home },
  { path: "/reports", label: "Reports", icon: FileSearch2 },
];

export default function Navbar({ route, onNavigate, exportDateLabel }: NavbarProps) {
  const currentPath = route.kind === "detail" ? "/reports" : route.kind === "home" ? "/" : `/${route.kind}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-900/10 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <button className="text-left" onClick={() => onNavigate("/")}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="font-heading text-base font-bold tracking-tight text-slate-950">
                TASE Summary Archive
              </div>
              <div className="text-xs text-slate-500">
                Filing summary explorer
              </div>
            </div>
          </div>
        </button>

        <nav className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/90 p-1 sm:flex">
          {items.map((item) => {
            const active = currentPath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <a
            href={PERSONAL_PORTFOLIO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <GitBranch className="h-4 w-4" />
            <span>About Me</span>
          </a>
        </nav>

        <div className="hidden text-right sm:block">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Latest export</div>
          <div className="font-mono text-xs text-slate-700">{exportDateLabel ?? "Loading..."}</div>
        </div>
      </div>
    </header>
  );
}
