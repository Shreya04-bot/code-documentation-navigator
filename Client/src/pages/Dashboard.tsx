import { useEffect, useMemo, useState } from "react";
import AnswerCard from "../components/AnswerCard";
import FileExplorer from "../components/FileExplorer";
import QueryBox from "../components/QueryBox";
import RepoIndexer from "../components/RepoIndexer";
import Sidebar from "../components/Sidebar";
import RiskDashboard from "../components/RiskDashboard";
import type { IndexStatus, QueryResult, StatusResponse } from "../lib/api";
import {
  askAiQuestion,
  getFileContent,
  getFiles,
  getStatus,
  indexRepository
} from "../lib/api";

const POLL_INTERVAL_MS = 1500;

type Toast = { type: "success" | "error"; message: string };

type ChatEntry = {
  id: string;
  question: string;
  answer: string;
  results: QueryResult[];
  createdAt: string;
};

const buildChatId = () => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export default function Dashboard() {
  const [repoPath, setRepoPath] = useState("");
  const [status, setStatus] = useState<IndexStatus>("not_indexed");
  const [repoName, setRepoName] = useState<string | undefined>(undefined);
  const [statusDetail, setStatusDetail] = useState<string | undefined>(undefined);
  const [filesCount, setFilesCount] = useState<number | undefined>(undefined);
  const [chunksCount, setChunksCount] = useState<number | undefined>(undefined);
  const [isIndexing, setIsIndexing] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [results, setResults] = useState<QueryResult[]>([]);
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | undefined>(undefined);
  const [fileContent, setFileContent] = useState<string | undefined>(undefined);
  const [fileLines, setFileLines] = useState<number | undefined>(undefined);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const canQuery = status === "indexed";

  const summaryText = useMemo(() => {
    if (filesCount == null || chunksCount == null) return null;
    return `${filesCount} files, ${chunksCount} chunks indexed`;
  }, [filesCount, chunksCount]);

  const allResults = useMemo(() => history.flatMap((entry) => entry.results), [history]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const applyStatus = (data: StatusResponse) => {
    setStatus(data.status);
    setRepoName(data.repo || undefined);
    setStatusDetail(data.detail || undefined);
    setFilesCount(data.files ?? undefined);
    setChunksCount(data.chunks ?? undefined);
  };

  const refreshStatus = async () => {
    try {
      const data = await getStatus();
      applyStatus(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  useEffect(() => {
    if (status !== "indexing") return;
    const interval = window.setInterval(() => {
      refreshStatus();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== "indexed") return;
    const loadFiles = async () => {
      try {
        const data = await getFiles();
        setFiles(data.files);
      } catch (error) {
        console.error(error);
      }
    };
    loadFiles();
  }, [status]);

  const handleIndex = async () => {
    if (!repoPath.trim()) {
      setToast({ type: "error", message: "Please provide a repository path." });
      return;
    }

    setIsIndexing(true);
    setFiles([]);
    setSelectedFile(undefined);
    setFileContent(undefined);
    setFileLines(undefined);
    setFileError(null);
    try {
      const data = await indexRepository(repoPath.trim());
      applyStatus(data);
      setToast({ type: "success", message: "Indexing started." });
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Indexing failed."
      });
    } finally {
      setIsIndexing(false);
    }
  };

  const handleQuery = async () => {
    if (!question.trim()) {
      setToast({ type: "error", message: "Please enter a question." });
      return;
    }

    setLoadingQuery(true);
    try {
      const data = await askAiQuestion(question.trim());
      setAnswer(data.answer);
      setResults(data.results);
      setHistory((prev) => [
        {
          id: buildChatId(),
          question: question.trim(),
          answer: data.answer,
          results: data.results,
          createdAt: new Date().toLocaleString()
        },
        ...prev
      ]);
      setToast({ type: "success", message: "Query complete." });
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Query failed."
      });
    } finally {
      setLoadingQuery(false);
    }
  };

  const handleSelectFile = async (file: string) => {
    setSelectedFile(file);
    setFileLoading(true);
    setFileError(null);
    try {
      const data = await getFileContent(file);
      setFileContent(data.content);
      setFileLines(data.lines);
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Failed to load file.");
    } finally {
      setFileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 text-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar repoName={repoName} status={status} detail={statusDetail} />

        <main className="flex-1 px-6 py-8 lg:px-10">
          <header className="flex flex-col gap-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">RAG Dashboard</p>
            <div>
              <h2 className="text-3xl font-semibold text-white lg:text-4xl">
                Code Documentation Navigator
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Ask natural-language questions, get instant code context, and ship faster audits.
              </p>
              {summaryText ? (
                <p className="mt-2 text-xs text-slate-400">{summaryText}</p>
              ) : null}
            </div>
          </header>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <RepoIndexer
              repoPath={repoPath}
              onRepoPathChange={setRepoPath}
              onIndex={handleIndex}
              status={status}
              isIndexing={isIndexing || status === "indexing"}
            />
            <QueryBox
              question={question}
              onQuestionChange={setQuestion}
              onSubmit={handleQuery}
              disabled={!canQuery || status === "indexing"}
              loading={loadingQuery}
            />
          </div>

          <section className="mt-8">
            <FileExplorer
              files={files}
              selectedFile={selectedFile}
              code={fileContent}
              lines={fileLines}
              loading={fileLoading}
              error={fileError}
              onSelect={handleSelectFile}
            />
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <section className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">AI Answer</p>
                  <h3 className="text-xl font-semibold text-white">Human-readable summary</h3>
                </div>
                <div className="rounded-full border border-white/10 bg-surface-800/70 px-3 py-1 text-xs text-slate-300">
                  {results.length} snippets
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-surface-800/60 p-5 shadow-card">
                <p className="text-sm text-slate-200 whitespace-pre-line">
                  {answer || "Index a repository and ask a question to see contextual answers."}
                </p>
              </div>

              <div className="max-h-[520px] space-y-4 overflow-y-auto pr-2">
                {results.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-surface-800/40 p-8 text-center text-sm text-slate-400">
                    No snippets yet. Your results will appear here after you run a query.
                  </div>
                ) : (
                  results.map((result, index) => (
                    <AnswerCard key={`${result.file}-${index}`} result={result} index={index} />
                  ))
                )}
              </div>
            </section>

            <section className="space-y-6">
              <RiskDashboard results={allResults} />

              <div className="rounded-2xl border border-white/10 bg-surface-800/70 p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Chat History</p>
                    <h3 className="text-xl font-semibold text-white">All questions & answers</h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-surface-900/60 px-3 py-1 text-xs text-slate-300">
                    {history.length} chats
                  </span>
                </div>

                <div className="mt-4 max-h-[480px] space-y-4 overflow-y-auto pr-2">
                  {history.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-surface-900/60 p-6 text-center text-sm text-slate-400">
                      Your past questions will appear here after you run a query.
                    </div>
                  ) : (
                    history.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-xl border border-white/10 bg-surface-900/60 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-white">{entry.question}</p>
                          <span className="text-xs text-slate-400">{entry.createdAt}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-300 whitespace-pre-line">
                          {entry.answer}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                          <span className="rounded-full border border-white/10 bg-surface-800/70 px-2 py-1">
                            {entry.results.length} snippets
                          </span>
                          {entry.results[0] ? (
                            <span className="rounded-full border border-white/10 bg-surface-800/70 px-2 py-1">
                              {entry.results[0].file}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`rounded-xl border px-4 py-3 text-sm shadow-card backdrop-blur ${
              toast.type === "success"
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                : "border-rose-400/40 bg-rose-500/15 text-rose-200"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </div>
  );
}
