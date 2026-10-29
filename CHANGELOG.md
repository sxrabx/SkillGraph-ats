# SkillGraph ATS — Official Changelog

All notable changes to the **SkillGraph ATS** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and adheres to semantic versioning (`MAJOR.MINOR.PATCH`).

---

## [2.0.0] — 2026-10-15

### `2026-10-15 00:28:00 IST` ────► **MODULAR MULTI-DOCUMENTATION SYSTEM & MIND MAPS**
* **Added:**
  * Exhaustive architecture guide in `docs/architecture.md` with system diagrams and technology justifications.
  * Workflow guide in `docs/workflows.md` with end-to-end data flow and high-level Mermaid Mind Map.
  * Full API reference manual in `docs/api.md` with request/response schemas and verified cURL snippets.
  * Setup guide in `docs/setup-and-configuration.md` with 1-click batch launcher instructions.
  * Diagnostic and FAQ guide in `docs/troubleshooting.md`.
  * Complete audit trail in `docs/development-history.md`.
  * Open-source collaboration guidelines in `CONTRIBUTING.md`.

### `2026-10-15 00:25:00 IST` ────► **DARK GLASSMORPHISM UI OVERHAUL & CSS PURGE**
* **Changed:**
  * Purged restrictive default Vite container styles in `frontend/src/index.css` (`#root { max-width: 1280px; text-align: center; }`).
  * Replaced flat UI with dark glassmorphism styling (`frontend/src/App.css`), featuring electric blue accents, responsive 2-column layout, and animated circular score meters.
* **Fixed:**
  * Fixed narrow column compression on high-resolution widescreen monitors.

### `2026-10-15 00:05:00 IST` ────► **ZERO-CORS MULTI-PAGE PDF STREAMING & MANUAL DOWNLOAD DECOUPLING**
* **Added:**
  * High-performance PyMuPDF rasterization endpoints: `GET /api/pdf/pages/{filename}` and `GET /api/pdf/page/{filename}/{page_num}`.
  * Modular `frontend/src/components/PdfViewer.jsx` component featuring multi-page flipping, dynamic zoom, and fit-to-width modes.
* **Fixed:**
  * Eliminated automatic PDF download prompts when calculating matches.
  * Bypassed browser cross-origin PDF iframe sandboxing errors (`Failed to load PDF with Mozilla PDF.js engine`).

---

## [1.1.0] — 2026-10-14

### `2026-10-14 18:05:19 IST` ────► **AI TEMPERATURE TUNING & RECRUITER CHAT GUARDRAILS**
* **Changed:**
  * Standardized Groq model temperatures: `0.2` in `app/parser.py` for deterministic JSON extraction; `0.3` in `app/main.py` for recruiter chat.
* **Security:**
  * Enforced strict domain guardrails in `/api/chat` preventing prompt injection, off-topic chat, and hallucinated candidate skills.

### `2026-10-14 17:49:45 IST` ────► **PYMUPDF PDF ANNOTATION ENGINE & HIGHLIGHTS**
* **Added:**
  * `app/annotator.py` module generating color-coded highlights (Yellow: matched skills, Cyan: all skills, Magenta: projects).
  * Annotated PDF file serving in `app/main.py` via `temp_uploads/annotated_<filename>.pdf`.

### `2026-10-14 17:30:28 IST` ────► **NVIDIA NIM CLOUD GPU EMBEDDINGS INTEGRATION**
* **Changed:**
  * Replaced local CPU `sentence-transformers` (`all-MiniLM-L6-v2`, 384 dimensions) with **NVIDIA NIM Cloud API** (`nvidia/nemotron-3-embed-1b`, 2048 dimensions).
  * Upgraded semantic similarity matching threshold to $0.40$.

---

## [1.0.0] — 2026-10-10

### `2026-10-10 21:35:07 IST` ────► **INITIAL RELEASE: SKILLGRAPH ATS FOUNDATION**
* **Commit:** `e088abb47ea16c83bf13530b808d45530577e0bf`
* **Added:**
  * FastAPI backend with endpoints `/health`, `/api/match`, and `/api/chat`.
  * PDF text parsing via `pypdf.PdfReader`.
  * Structured JSON entity extraction using Groq `qwen/qwen3.8-27b` and Pydantic.
  * Directed acyclic graph (DAG) ontology engine using `networkx.DiGraph`.
  * Initial React 19 frontend with Vite 8.
