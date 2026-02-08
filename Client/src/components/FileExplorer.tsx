interface FileExplorerProps {
  files: string[];
  selectedFile?: string;
  code?: string;
  lines?: number;
  loading: boolean;
  error?: string | null;
  onSelect: (file: string) => void;
}

export default function FileExplorer({
  files,
  selectedFile,
  code,
  lines,
  loading,
  error,
  onSelect
}: FileExplorerProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
      <div className="rounded-2xl border border-white/10 bg-surface-800/70 p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Indexed Files</p>
            <h3 className="text-lg font-semibold text-white">Repository files</h3>
          </div>
          <span className="rounded-full border border-white/10 bg-surface-900/60 px-3 py-1 text-xs text-slate-300">
            {files.length} files
          </span>
        </div>

        <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-2 text-sm">
          {files.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-surface-900/60 p-4 text-center text-xs text-slate-400">
              Index a repository to see files here.
            </div>
          ) : (
            files.map((file) => (
              <button
                key={file}
                onClick={() => onSelect(file)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                  selectedFile === file
                    ? "border-sky-400/60 bg-sky-500/10 text-sky-200"
                    : "border-white/5 bg-surface-900/60 text-slate-200 hover:border-white/20"
                }`}
              >
                <p className="truncate text-xs">{file}</p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface-800/70 p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">File Preview</p>
            <h3 className="text-lg font-semibold text-white">
              {selectedFile ? "Selected file" : "Choose a file"}
            </h3>
          </div>
          {selectedFile ? (
            <span className="rounded-full border border-white/10 bg-surface-900/60 px-3 py-1 text-xs text-slate-300">
              {lines ?? 0} lines
            </span>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="mt-4">
          {loading ? (
            <div className="rounded-xl border border-white/10 bg-surface-900/60 p-4 text-sm text-slate-400">
              Loading file contents...
            </div>
          ) : selectedFile && code ? (
            <pre className="max-h-[360px] overflow-auto rounded-xl border border-white/5 bg-slate-950/70 p-4 text-xs leading-relaxed text-slate-200">
              <code>{code}</code>
            </pre>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-surface-900/60 p-4 text-center text-xs text-slate-400">
              Click a file to preview its content.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
