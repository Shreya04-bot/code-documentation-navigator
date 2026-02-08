import Loader from "./Loader";
import type { IndexStatus } from "../lib/api";

interface RepoIndexerProps {
  repoPath: string;
  onRepoPathChange: (value: string) => void;
  onIndex: () => void;
  status: IndexStatus;
  isIndexing: boolean;
}

export default function RepoIndexer({
  repoPath,
  onRepoPathChange,
  onIndex,
  status,
  isIndexing
}: RepoIndexerProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-800/70 p-6 shadow-card">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Repository Indexing</p>
        <h2 className="text-xl font-semibold text-white">Load a local codebase</h2>
        <p className="text-sm text-slate-400">
          Provide an absolute path to a repository on this machine. We will build vector search embeddings for
          supported files.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <input
          value={repoPath}
          onChange={(event) => onRepoPathChange(event.target.value)}
          placeholder="C:\\Projects\\my-repo"
          className="flex-1 rounded-xl border border-white/10 bg-surface-900/60 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-400/60 focus:ring-sky-400/40"
        />
        <button
          onClick={onIndex}
          disabled={isIndexing || repoPath.trim().length === 0}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isIndexing ? (
            <>
              <Loader size={16} />
              Indexing
            </>
          ) : status === "indexed" ? "Re-index" : "Index Repository"}
        </button>
      </div>
    </div>
  );
}
