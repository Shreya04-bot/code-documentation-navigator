import os
import time
import threading
from typing import Dict, List

import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

from rag.risk import analyze_code_risk

CHUNK_SIZE = 50
CHUNK_OVERLAP = 10
ALLOWED_EXTENSIONS = (".py", ".js", ".ts", ".tsx")
IGNORED_DIRS = {
    ".git",
    ".hg",
    ".svn",
    "node_modules",
    "venv",
    ".venv",
    "__pycache__",
    "dist",
    "build",
}

model = SentenceTransformer("all-MiniLM-L6-v2")

_index = None
_documents: List[Dict] = []
_repo_root: str | None = None
_status = {
    "status": "not_indexed",
    "repo": None,
    "files": 0,
    "chunks": 0,
    "detail": "No repository indexed yet",
    "updated_at": None,
}
_lock = threading.Lock()


def _now() -> str:
    return time.strftime("%Y-%m-%d %H:%M:%S")


def _update_status(status: str, **kwargs) -> None:
    with _lock:
        _status["status"] = status
        _status["updated_at"] = _now()
        for key, value in kwargs.items():
            _status[key] = value


def get_status() -> Dict:
    with _lock:
        return dict(_status)


def chunk_file(content: str, file_path: str) -> List[Dict]:
    lines = content.split("\n")
    chunks: List[Dict] = []

    step = CHUNK_SIZE - CHUNK_OVERLAP
    for i in range(0, len(lines), step):
        start_line = i + 1
        end_line = min(i + CHUNK_SIZE, len(lines))
        chunk = "\n".join(lines[i:end_line])
        if chunk.strip():
            chunks.append({
                "file": file_path,
                "content": chunk,
                "line_start": start_line,
                "line_end": end_line,
            })
    return chunks


def _iter_source_files(repo_path: str):
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
        for file in files:
            if file.endswith(ALLOWED_EXTENSIONS):
                yield os.path.join(root, file)


def index_repository(repo_path: str) -> Dict:
    abs_path = os.path.abspath(repo_path)
    if not os.path.exists(abs_path):
        raise ValueError("Repository path does not exist.")
    if not os.path.isdir(abs_path):
        raise ValueError("Repository path must be a directory.")

    new_documents: List[Dict] = []

    for full_path in _iter_source_files(abs_path):
        try:
            with open(full_path, "r", encoding="utf-8", errors="ignore") as handle:
                content = handle.read()
        except OSError:
            continue

        risk = analyze_code_risk(content, full_path)
        for chunk in chunk_file(content, full_path):
            chunk["risk"] = risk
            new_documents.append(chunk)

    if not new_documents:
        raise ValueError("No supported source files found to index.")

    texts = [doc["content"] for doc in new_documents]
    embeddings = model.encode(texts)
    if len(embeddings) == 0:
        raise ValueError("No embeddings were generated during indexing.")

    dim = embeddings.shape[1]
    new_index = faiss.IndexFlatL2(dim)
    new_index.add(np.array(embeddings, dtype=np.float32))

    with _lock:
        global _index, _documents, _repo_root
        _index = new_index
        _documents = new_documents
        _repo_root = abs_path

    repo_name = os.path.basename(abs_path) or abs_path
    return {
        "repo": repo_name,
        "files": len(set(doc["file"] for doc in new_documents)),
        "chunks": len(new_documents),
    }


def get_indexed_files() -> List[str]:
    with _lock:
        files = sorted({doc["file"] for doc in _documents})
    return files


def get_file_content(file_path: str) -> Dict:
    if not file_path or not file_path.strip():
        raise ValueError("File path is required.")

    with _lock:
        repo_root = _repo_root

    if not repo_root:
        raise ValueError("Repository has not been indexed yet.")

    abs_path = os.path.abspath(file_path)
    common = os.path.commonpath([abs_path, repo_root])
    if common != repo_root:
        raise ValueError("Requested file is outside the indexed repository.")

    try:
        with open(abs_path, "r", encoding="utf-8", errors="ignore") as handle:
            content = handle.read()
    except OSError as exc:
        raise ValueError(f"Unable to read file: {exc}") from exc

    return {
        "file": abs_path,
        "content": content,
        "lines": len(content.splitlines()),
    }


def start_indexing(repo_path: str) -> Dict:
    abs_path = os.path.abspath(repo_path)
    if not repo_path or not repo_path.strip():
        raise ValueError("Repository path is required.")
    if not os.path.exists(abs_path):
        raise ValueError("Repository path does not exist.")
    if not os.path.isdir(abs_path):
        raise ValueError("Repository path must be a directory.")

    current = get_status()
    if current["status"] == "indexing":
        raise RuntimeError("Indexing is already in progress.")

    repo_name = os.path.basename(abs_path) or abs_path
    _update_status(
        "indexing",
        repo=repo_name,
        files=0,
        chunks=0,
        detail="Indexing started",
    )

    return get_status()


def run_indexing(repo_path: str) -> None:
    try:
        summary = index_repository(repo_path)
        _update_status(
            "indexed",
            repo=summary["repo"],
            files=summary["files"],
            chunks=summary["chunks"],
            detail="Indexing complete",
        )
    except Exception as exc:
        _update_status(
            "error",
            detail=f"Indexing failed: {exc}",
        )


def query_repository(question: str, top_k: int = 5) -> Dict:
    if not question or not question.strip():
        raise ValueError("Question is required.")

    with _lock:
        if _index is None or not _documents:
            raise ValueError("Repository has not been indexed yet.")
        index = _index
        documents = list(_documents)

    k = min(top_k, len(documents))
    q_emb = model.encode([question])
    distances, indices = index.search(np.array(q_emb, dtype=np.float32), k)

    results = []
    for idx in indices[0]:
        if idx == -1:
            continue
        doc = documents[idx]
        results.append({
            "file": doc["file"],
            "content": doc["content"],
            "line_start": doc["line_start"],
            "line_end": doc["line_end"],
            "risk": doc["risk"],
        })

    answer = f"Found {len(results)} relevant snippet(s) for: {question}"
    return {"answer": answer, "results": results}
