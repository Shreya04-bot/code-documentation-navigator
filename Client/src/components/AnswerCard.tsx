import type { QueryResult } from "../lib/api";

interface AnswerCardProps {
  result: QueryResult;
  index: number;
}

const riskColor = (score: number) => {
  if (score >= 4) return "text-rose-300 bg-rose-500/10 border-rose-500/30";
  if (score >= 3) return "text-amber-200 bg-amber-500/10 border-amber-500/30";
  return "text-emerald-200 bg-emerald-500/10 border-emerald-500/30";
};

export default function AnswerCard({ result, index }: AnswerCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-800/70 p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Result {index + 1}</p>
          <p className="text-xs text-slate-400 break-all">{result.file}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-surface-900/60 px-3 py-1 text-xs text-slate-300">
            Lines {result.line_start}-{result.line_end}
          </span>
          <span className={`rounded-full border px-3 py-1 text-xs ${riskColor(result.risk.score)}`}>
            Risk {result.risk.score}
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{result.risk.reason}</p>

      <div className="mt-4 rounded-xl border border-white/5 bg-slate-950/70 p-4">
        <pre className="max-h-64 overflow-x-auto whitespace-pre text-xs leading-relaxed text-slate-200">
          <code>{result.content}</code>
        </pre>
      </div>
    </div>
  );
}
