import os
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field, root_validator

from rag.engine import (
    get_file_content,
    get_indexed_files,
    get_status,
    query_repository,
    run_indexing,
    start_indexing,
)
from utils.ai_service import generate_human_answer

router = APIRouter()


class IndexRequest(BaseModel):
    path: str = Field(..., min_length=1)

    @root_validator(pre=True)
    def normalize_path(cls, values):
        if "path" not in values:
            if "repoPath" in values:
                values["path"] = values["repoPath"]
            elif "repo_path" in values:
                values["path"] = values["repo_path"]
        return values


class IndexResponse(BaseModel):
    status: str
    repo: Optional[str] = None
    files: Optional[int] = None
    chunks: Optional[int] = None
    detail: Optional[str] = None
    updated_at: Optional[str] = None


class StatusResponse(BaseModel):
    status: str
    repo: Optional[str] = None
    files: int = 0
    chunks: int = 0
    detail: Optional[str] = None
    updated_at: Optional[str] = None


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1)


class RiskModel(BaseModel):
    score: int
    reason: str


class QueryResult(BaseModel):
    file: str
    content: str
    line_start: int
    line_end: int
    risk: RiskModel


class QueryResponse(BaseModel):
    answer: str
    results: List[QueryResult]


class FileListResponse(BaseModel):
    files: List[str]


class FileContentResponse(BaseModel):
    file: str
    content: str
    lines: int


@router.get("/status", response_model=StatusResponse)
def index_status():
    return get_status()


@router.get("/files", response_model=FileListResponse)
def list_files():
    try:
        return {"files": get_indexed_files()}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/file", response_model=FileContentResponse)
def read_file(path: str):
    try:
        return get_file_content(path)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/index", response_model=IndexResponse, status_code=202)
def index_repo(req: IndexRequest, background_tasks: BackgroundTasks):
    try:
        status = start_indexing(req.path)
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    background_tasks.add_task(run_indexing, req.path)
    return status


@router.post("/query", response_model=QueryResponse)
def ask_question(req: QueryRequest):
    try:
        return query_repository(req.question)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Query failed due to server error.")


@router.post("/ask", response_model=QueryResponse)
def ask_question_legacy(req: QueryRequest):
    return ask_question(req)


@router.post("/ask-ai", response_model=QueryResponse)
async def ask_question_ai(req: QueryRequest):
    try:
        response = query_repository(req.question)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Query failed due to server error.")

    try:
        # AI-generated answer is safe for direct display in the UI.
        response["answer"] = await generate_human_answer(req.question, response["results"])
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=502, detail="AI service failed to generate an answer.")

    return response
