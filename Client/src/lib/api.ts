export type IndexStatus = "not_indexed" | "indexing" | "indexed" | "error";

export interface IndexResponse {
  status: IndexStatus;
  repo?: string | null;
  files?: number | null;
  chunks?: number | null;
  detail?: string | null;
  updated_at?: string | null;
}

export interface StatusResponse {
  status: IndexStatus;
  repo?: string | null;
  files?: number | null;
  chunks?: number | null;
  detail?: string | null;
  updated_at?: string | null;
}

export interface RiskModel {
  score: number;
  reason: string;
}

export interface QueryResult {
  file: string;
  content: string;
  line_start: number;
  line_end: number;
  risk: RiskModel;
}

export interface QueryResponse {
  answer: string;
  results: QueryResult[];
}

export interface FileListResponse {
  files: string[];
}

export interface FileContentResponse {
  file: string;
  content: string;
  lines: number;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const detail = (data && (data.detail || data.message)) as string | undefined;
    throw new Error(detail || res.statusText || "Request failed");
  }
  return data as T;
}

export async function getStatus(): Promise<StatusResponse> {
  const res = await fetch(`${API_BASE}/status`);
  return parseResponse<StatusResponse>(res);
}

export async function indexRepository(path: string): Promise<IndexResponse> {
  const res = await fetch(`${API_BASE}/index`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path })
  });
  return parseResponse<IndexResponse>(res);
}

export async function queryRepository(question: string): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });
  return parseResponse<QueryResponse>(res);
}

export async function askAiQuestion(question: string): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE}/ask-ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });
  return parseResponse<QueryResponse>(res);
}

export async function getFiles(): Promise<FileListResponse> {
  const res = await fetch(`${API_BASE}/files`);
  return parseResponse<FileListResponse>(res);
}

export async function getFileContent(path: string): Promise<FileContentResponse> {
  const res = await fetch(`${API_BASE}/file?path=${encodeURIComponent(path)}`);
  return parseResponse<FileContentResponse>(res);
}
