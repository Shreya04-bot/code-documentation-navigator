import type { IndexStatus } from "../lib/api";

interface SidebarProps {
  repoName?: string;
  status: IndexStatus;
  detail?: string | null;
}

const statusStyles: Record<IndexStatus, string> = {
  indexed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  indexing: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  not_indexed: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  error: "bg-rose-500/20 text-rose-300 border-rose-500/40"
};

export default function Sidebar({ repoName, status, detail }: SidebarProps) {
  return (
    <aside className="w-full border-b border-white/10 bg-surface-800/80 p-6 backdrop-blur lg:h-screen lg:w-80 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-400 text-slate-900 shadow-glow">
          <span className="text-xl font-bold">{`</>`}</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Code Documentation</p>
          <h1 className="text-lg font-semibold text-white">Navigator</h1>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-surface-700/60 p-4 shadow-card">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Indexed Repository</p>
        <p className="mt-2 text-lg font-semibold text-white">
          {repoName || "No repository yet"}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}>
            {status.replace("_", " ")}
          </span>
          {detail ? <span className="text-xs text-slate-400">{detail}</span> : null}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-surface-700/70 to-surface-800/70 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tips</p>
        <ul className="mt-3 space-y-3 text-sm text-slate-200">
          <li>Index the root of your local repo for best coverage.</li>
          <li>Ask about ownership, dependencies, and flows.</li>
          <li>Review risk badges to prioritize audits.</li>
        </ul>
      </div>
    </aside>
  );
}
