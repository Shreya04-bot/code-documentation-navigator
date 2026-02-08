import Loader from "./Loader";

interface QueryBoxProps {
  question: string;
  onQuestionChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  loading: boolean;
}

export default function QueryBox({
  question,
  onQuestionChange,
  onSubmit,
  disabled,
  loading
}: QueryBoxProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-800/70 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Query Panel</p>
          <h2 className="text-xl font-semibold text-white">Ask a question</h2>
          <p className="text-sm text-slate-400">Get natural language answers plus code references.</p>
        </div>
        <div className="rounded-full border border-white/10 bg-surface-900/70 px-3 py-1 text-xs text-slate-400">
          {disabled ? "Indexing required" : "Ready"}
        </div>
      </div>

      <div className="mt-5">
        <textarea
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          rows={4}
          placeholder="Ask a question about this codebase..."
          className="w-full resize-none rounded-xl border border-white/10 bg-surface-900/60 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-400/60 focus:ring-sky-400/40"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">Example: Where is authentication handled?</p>
        <button
          onClick={onSubmit}
          disabled={disabled || loading || question.trim().length === 0}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader size={16} className="text-white" />
              Searching
            </>
          ) : (
            "Submit Question"
          )}
        </button>
      </div>
    </div>
  );
}
