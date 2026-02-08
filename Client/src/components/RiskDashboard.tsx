import type { QueryResult } from "../lib/api";

interface RiskDashboardProps {
  results: QueryResult[];
}

const levels = [
  { key: "low", label: "Low", color: "from-emerald-400 to-emerald-600", solid: "#34d399" },
  { key: "medium", label: "Medium", color: "from-amber-400 to-amber-600", solid: "#f59e0b" },
  { key: "high", label: "High", color: "from-rose-400 to-rose-600", solid: "#fb7185" }
] as const;

const buildCounts = (results: QueryResult[]) => {
  const counts = { low: 0, medium: 0, high: 0 };
  results.forEach((result) => {
    if (result.risk.score >= 4) counts.high += 1;
    else if (result.risk.score >= 3) counts.medium += 1;
    else counts.low += 1;
  });
  return counts;
};

const buildTopReasons = (results: QueryResult[]) => {
  const tally = new Map<string, number>();
  results.forEach((result) => {
    const reason = result.risk.reason;
    tally.set(reason, (tally.get(reason) ?? 0) + 1);
  });
  return Array.from(tally.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
};

const buildTopFiles = (results: QueryResult[]) => {
  const tally = new Map<string, number>();
  results.forEach((result) => {
    const prev = tally.get(result.file) ?? 0;
    tally.set(result.file, Math.max(prev, result.risk.score));
  });
  return Array.from(tally.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
};

export default function RiskDashboard({ results }: RiskDashboardProps) {
  const counts = buildCounts(results);
  const total = results.length || 1;
  const topReasons = buildTopReasons(results);
  const topFiles = buildTopFiles(results);

  const lowPct = Math.round((counts.low / total) * 100);
  const mediumPct = Math.round((counts.medium / total) * 100);
  const highPct = Math.max(0, 100 - lowPct - mediumPct);

  const pieBackground = `conic-gradient(#34d399 0 ${lowPct}%, #f59e0b ${lowPct}% ${
    lowPct + mediumPct
  }%, #fb7185 ${lowPct + mediumPct}% 100%)`;

  const maxFileScore = topFiles[0]?.[1] ?? 1;

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-800/70 p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Risk Analyzer</p>
          <h3 className="text-xl font-semibold text-white">Risk distribution</h3>
          <p className="mt-1 text-sm text-slate-400">
            Highlights TODO/FIXME flags, long files, and structural complexity signals.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-surface-900/60 px-3 py-1 text-xs text-slate-300">
          {results.length} snippets analyzed
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
        <div className="rounded-xl border border-white/10 bg-surface-900/60 p-5">
          <div className="flex items-center gap-6">
            <div className="relative h-28 w-28">
              <div
                className="h-full w-full rounded-full"
                style={{ background: pieBackground }}
              />
              <div className="absolute inset-4 rounded-full bg-surface-800" />
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                {results.length}
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              {levels.map((level) => {
                const count =
                  level.key === "low" ? counts.low : level.key === "medium" ? counts.medium : counts.high;
                return (
                  <div key={level.key} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: level.solid }} />
                    <span>{level.label} Risk</span>
                    <span className="text-slate-500">({count})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-surface-900/60 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top Risky Files</p>
          <div className="mt-3 space-y-3">
            {topFiles.length === 0 ? (
              <p className="text-xs text-slate-400">Run a query to populate top risky files.</p>
            ) : (
              topFiles.map(([file, score]) => (
                <div key={file} className="text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="truncate pr-2">{file}</span>
                    <span className="text-slate-400">{score}/5</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-surface-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400"
                      style={{ width: `${Math.round((score / maxFileScore) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {levels.map((level) => {
          const count =
            level.key === "low" ? counts.low : level.key === "medium" ? counts.medium : counts.high;
          const percent = Math.round((count / total) * 100);

          return (
            <div key={level.label} className="rounded-xl border border-white/10 bg-surface-900/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{level.label} risk</p>
                <span className="text-xs text-slate-400">{count} files</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-surface-700">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${level.color}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">{percent}% of snippets</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top signals</p>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {topReasons.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-surface-900/60 p-4 text-sm text-slate-400">
              Run a query to populate risk insights.
            </div>
          ) : (
            topReasons.map(([reason, count]) => (
              <div
                key={reason}
                className="rounded-xl border border-white/10 bg-surface-900/60 p-4 text-sm text-slate-200"
              >
                <p className="text-xs text-slate-400">{count} snippets</p>
                <p className="mt-1 font-medium text-white">{reason}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
