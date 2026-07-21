# AI for Industrial Knowledge Intelligence
### Unified Asset & Operations Brain

> Turning fragmented industrial data into a living brain for operations.

An AI-powered platform that turns scattered industrial documents — manuals, SOPs, inspection reports, maintenance logs — into a connected, queryable, AI-reasoned knowledge base. Upload a document and get OCR extraction, a knowledge graph, a citation-backed AI copilot, predictive maintenance insights, and automated compliance checking, all in one place.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Python](https://img.shields.io/badge/python-3.11%2B-blue)
![Node](https://img.shields.io/badge/node-18%2B-339933)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Industrial plants generate enormous volumes of documentation — but it's scattered across 7–12 disconnected systems, and engineers spend more time searching for information than acting on it. This platform ingests every document a plant produces, understands it, and converts it into searchable, connected, actionable intelligence — with an AI copilot, a knowledge graph, predictive maintenance reasoning, and automated compliance auditing built on top.

## Features

| Module | What it does |
|---|---|
| **Document Ingestion** | Drag-and-drop upload for PDF, DOCX, TXT, and images, with live progress and a searchable library |
| **OCR / Text Extraction** | Native PDF text via PyMuPDF, automatic OCR fallback (RapidOCR) for scanned pages and images — mixed documents handled page by page |
| **AI Expert Copilot** | Retrieval-augmented Q&A (LangChain + FAISS + Gemini) — every answer cites the exact source document and chunk |
| **Knowledge Graph** | Auto-extracts equipment IDs, machine names, engineers, dates, maintenance events, and failure types into an interactive force-directed graph |
| **Maintenance Intelligence** | Detects recurring failures across documents; AI reasons out root cause, a preventive recommendation, severity, and next inspection date |
| **Compliance Intelligence** | Checks uploaded SOPs against a predefined industrial safety checklist, with a one-click downloadable PDF report |
| **Analytics Dashboard** | Ingestion trends, equipment health, failure category breakdown, compliance trend, recent maintenance activity |

## Tech Stack

**Frontend** — React 18/19 · Vite · TypeScript · Tailwind CSS · shadcn/ui · React Router · Recharts · D3 (force-directed graph)

**Backend** — FastAPI · SQLAlchemy + SQLite · PyMuPDF + RapidOCR (OCR) · LangChain + FAISS + Google Gemini (RAG) · NetworkX (knowledge graph) · ReportLab (PDF generation)

## Architecture

```
 Upload ──▶ OCR / Text Extraction ──▶ Chunk + Embed ──▶ FAISS Vector Store
    │                                                        │
    │                                                        ▼
    │                                              AI Copilot (Gemini RAG)
    │
    ▼
 Entity Extraction ──▶ Knowledge Graph (NetworkX) ──▶ Interactive Graph (D3)
    │
    ▼
 Maintenance Intelligence (recurring failures + AI reasoning)
    │
    ▼
 Compliance Intelligence (safety checklist matching + PDF report)
```

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py                          FastAPI entry point (lifespan startup, CORS)
│   │   ├── core/config.py                   Env-driven settings
│   │   ├── db/                               SQLAlchemy engine, session, declarative base
│   │   ├── models/document.py                Document ORM model
│   │   ├── schemas/document.py               Pydantic schemas
│   │   ├── services/
│   │   │   ├── ocr.py                        Text extraction (PyMuPDF + RapidOCR)
│   │   │   ├── vectorstore.py                FAISS chunking / embedding / retrieval
│   │   │   ├── copilot.py                    Gemini RAG answer generation
│   │   │   ├── knowledge_graph.py            Entity extraction + graph construction
│   │   │   ├── maintenance_intelligence.py   Recurring failure detection + RCA reasoning
│   │   │   ├── compliance.py                 Safety rule checklist + matching
│   │   │   └── compliance_pdf.py             PDF report generation
│   │   └── api/v1/
│   │       ├── router.py                     Route aggregation
│   │       └── endpoints/                    documents, copilot, knowledge_graph, maintenance, compliance
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/                           shadcn/ui primitives (button, card, badge, progress)
    │   │   ├── layout/                       AppShell, Sidebar, Topbar
    │   │   ├── shared/                       LoadingState, ErrorBanner, EmptyState, ErrorBoundary
    │   │   ├── dashboard/ · documents/ · knowledge-graph/ · copilot/ · maintenance/ · compliance/ · analytics/
    │   ├── hooks/useFetch.ts                 Shared data-fetching hook
    │   ├── pages/                            Dashboard, Documents, KnowledgeGraph, Copilot, Maintenance, Compliance, Analytics, NotFound
    │   ├── lib/                               api.ts, types.ts, dummy-data.ts, analytics-data.ts
    │   └── routes/index.tsx                  All routes
    └── package.json
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- A free Gemini API key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

No system-level OCR binary needed — OCR runs entirely through pip-installed packages (PyMuPDF + RapidOCR).

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and set your Gemini API key:
```
GOOGLE_API_KEY=your_key_here
```

Run:
```bash
uvicorn app.main:app --reload
```

- API: `http://127.0.0.1:8000`
- Interactive docs: `http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

- App: `http://127.0.0.1:5173`

## Environment Variables

**Backend (`backend/.env`)**

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLite connection string | `sqlite:///./industrial_ki.db` |
| `UPLOAD_DIR` | Where uploaded files are stored | `uploads` |
| `MAX_UPLOAD_SIZE_MB` | Max file size per upload | `50` |
| `ALLOWED_EXTENSIONS` | Accepted file types | `.pdf,.png,.jpg,.jpeg,.webp,.gif,.docx,.txt` |
| `GOOGLE_API_KEY` | Gemini API key — required for Copilot & Maintenance AI reasoning | — |
| `GEMINI_CHAT_MODEL` | Gemini model for chat/reasoning | `gemini-flash-latest` |
| `GEMINI_EMBEDDING_MODEL` | Gemini model for embeddings | `models/gemini-embedding-001` |
| `FAISS_INDEX_DIR` | Where the vector index is persisted | `faiss_index` |
| `CHUNK_SIZE` / `CHUNK_OVERLAP` | RAG text chunking parameters | `1000` / `150` |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `http://localhost:5173,http://127.0.0.1:5173` |

**Frontend (`frontend/.env`)**

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://127.0.0.1:8000/api/v1` |

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/documents` | Upload files (runs OCR + embedding automatically) |
| `GET` | `/api/v1/documents` | List all documents |
| `GET` | `/api/v1/documents/{id}/text` | Get a document's extracted text |
| `POST` | `/api/v1/documents/{id}/ocr` | Re-run OCR on a document |
| `POST` | `/api/v1/documents/{id}/embed` | Re-run embedding on a document |
| `DELETE` | `/api/v1/documents/{id}` | Delete a document (file, DB row, FAISS chunks) |
| `POST` | `/api/v1/copilot/ask` | Ask a question, get a grounded answer with citations |
| `GET` | `/api/v1/knowledge-graph` | Get the entity graph (nodes + edges) |
| `GET` | `/api/v1/maintenance/insights` | Recurring failures with AI-reasoned RCA |
| `GET` | `/api/v1/compliance/report` | Compliance check against the safety checklist |
| `GET` | `/api/v1/compliance/report/download` | Download the compliance report as PDF |

Full interactive reference at `/docs` once the backend is running.

## Troubleshooting

**`ModuleNotFoundError` on startup** — a backend file is missing or wasn't saved in the right folder. Confirm with `dir app\services` / `dir app\api\v1\endpoints`.

**CORS error in the browser console** — check `CORS_ORIGINS` in `backend/.env` includes your frontend's exact origin (e.g. `http://localhost:5173`), and that you restarted the backend after editing `.env`.

**`no such table: documents`** — the SQLite file doesn't have the current schema. Stop the backend, delete `industrial_ki.db`, and restart it (tables are created automatically on startup).

**Gemini `404 NOT_FOUND` for a model name** — Google renames/deprecates model aliases periodically. Fetch your key's actual available models:
```
https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY
```
Look for entries with `"embedContent"` (for `GEMINI_EMBEDDING_MODEL`) or `"generateContent"` (for `GEMINI_CHAT_MODEL`) in `supportedGenerationMethods`.

**PowerShell + `curl` behaving oddly** — Windows PowerShell aliases `curl` to `Invoke-WebRequest`, which uses different syntax. Use `curl.exe` explicitly, or use native `Invoke-RestMethod`.

**Copilot returns "GOOGLE_API_KEY is not set"** — confirm the key is in `backend/.env` (not `.env.example`), with no extra quotes, and that you restarted uvicorn after adding it.

## Roadmap

- Move OCR/embedding to a background task queue (Celery/RQ) for large files instead of synchronous processing
- Multi-plant / multi-tenant support
- Role-based access control
- Real-time ingestion pipeline (watch folders / email intake)

## License

MIT