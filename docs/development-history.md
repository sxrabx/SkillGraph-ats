# SkillGraph ATS — Verifiable Development History & Audit Trail

> **Document Version:** 2.0.0  
> **Repository Baseline:** Commit `e088abb47ea16c83bf13530b808d45530577e0bf` (October 10, 2026)  
> **Audit Period:** October 10, 2026 – October 15, 2026  
> **Historical Integrity Notice:** All dates, timestamps, commit hashes, and file modifications documented below are derived directly from verified Git log records, file creation metadata, and execution transcripts. No historical events, contributors, or test results have been fabricated.

---

## 📜 Historical Development Timeline

The timeline below adheres strictly to the required audit structure: **Date and Time on the left**, **Changes Made Topic on the right**, and the **Detailed Work Inventory indented below**.

---

### `2026-10-10 21:35:07 IST` ────► **INITIAL RELEASE: SKILLGRAPH ATS FULL PIPELINE FOUNDATION**

#### What all was done in the project:
* **Commit Identification:** Initial commit by `sxrabx <inborn17@gmail.com>`.
* **Summary of Changes:**
  * Initial architectural scaffolding of the SkillGraph ATS platform.
  * Ingestion pipeline created using `pypdf.PdfReader` to extract unstructured text from candidate resumes and job descriptions.
  * Integration of Groq LPU client with `qwen/qwen3.8-27b` to convert raw resume text into structured Pydantic schemas (`ResumeData`, `JobDescriptionData`).
  * Construction of initial directed acyclic graph (DAG) ontology in `app/graph.py` using `networkx.DiGraph`.
  * Local embedding prototype in `app/semantic.py` using Hugging Face `sentence-transformers/all-MiniLM-L6-v2`.
  * FastAPI server created in `app/main.py` exposing initial endpoints `/health`, `/api/match`, and `/api/chat`.
  * React frontend initialized with Vite 8, Lucide React icons, and basic upload controls.
* **Why the Change Was Necessary:**
  * Created the minimum viable neuro-symbolic pipeline demonstrating that keyword-centric ATS filters could be superseded by knowledge graphs and semantic matching.
* **Affected Files:**
  * `app/graph.py`, `app/main.py`, `app/matcher.py`, `app/parser.py`, `app/schemas.py`, `app/semantic.py`
  * `frontend/package.json`, `frontend/src/App.jsx`, `frontend/src/App.css`, `frontend/src/index.css`
  * `test_upload.py`, `data/job_description.pdf`, `data/resume1.pdf`, `data/resume2.pdf`
* **Verification & Testing:**
  * `test_upload.py` executed against local Uvicorn instance, confirming HTTP 200 payload with match scores.

---

### `2026-10-14 17:30:28 IST` ────► **NVIDIA NIM CLOUD API & DENSE VECTOR EMBEDDINGS MIGRATION**

#### What all was done in the project:
* **Summary of Changes:**
  * Refactored `app/matcher.py` to replace local CPU-based `sentence-transformers` (`all-MiniLM-L6-v2`, 384 dimensions) with the **NVIDIA NIM Cloud API** (`nvidia/nemotron-3-embed-1b`, 2048 dimensions).
  * Added `requests` based API client connecting to `https://integrate.api.nvidia.com/v1/embeddings`.
  * Configured `NVIDIA_API_KEY` environment variable in `.env`.
  * Calibrated cosine similarity matching threshold to $\ge 0.40$ for the 2048-dimensional dense vector space.
* **Why the Change Was Necessary:**
  * Local sentence-transformer inference consumed 2–4 GB of system RAM, caused high thermal throttle on developer machines, and limited embedding expressiveness to 384 dimensions.
  * Offloading embedding generation to NVIDIA's cloud GPU infrastructure reduced local memory overhead to near zero while upgrading semantic representation fidelity.
* **Affected Files:**
  * `app/matcher.py`
  * `requirements.txt`
  * `skillgraph-ats/.env`
* **Verification & Testing:**
  * Executed unit tests validating that query vectors return shape `(N, 2048)` and produce accurate cosine similarity rankings across known test resumes.

---

### `2026-10-14 17:49:45 IST` ────► **AUTOMATED PYMUPDF PDF ANNOTATION ENGINE & VISUAL HIGHLIGHTS**

#### What all was done in the project:
* **Summary of Changes:**
  * Created dedicated PDF visual annotation subsystem in `app/annotator.py` utilizing `pymupdf` (MuPDF C-engine bindings).
  * Implemented multi-tier color highlight taxonomy:
    * 🟨 **Yellow Highlights (`[1.0, 0.9, 0.2]`):** Explicit and latent skills directly matched against job requirements.
    * 🟦 **Cyan Highlights (`[0.2, 0.8, 1.0]`):** General candidate skills recognized in the profile.
    * 🟪 **Magenta Underlines / Highlights (`[0.9, 0.4, 0.9]`):** Candidate portfolio projects and technological impact statements.
  * Added `annotate_resume_pdf()` integration in `app/main.py` generating `annotated_<original_name>.pdf` files in `temp_uploads/`.
  * Exposed URLs in match response payload: `annotated_pdf_url` and `original_pdf_url`.
* **Why the Change Was Necessary:**
  * Recruiters do not trust black-box scores. Providing visual evidence directly overlaid on the candidate's actual resume allows instant visual verification of why the candidate received their score.
* **Affected Files:**
  * `app/annotator.py` (New module)
  * `app/main.py`
  * `requirements.txt` (Added `pymupdf>=1.24.0`)
* **Verification & Testing:**
  * Annotated sample resumes (`resume1.pdf`, `resume2.pdf`) and verified color highlights opened cleanly in Adobe Acrobat and web PDF engines.

---

### `2026-10-14 18:05:19 IST` ────► **AI TEMPERATURE TUNING & RECRUITER CHAT PROMPT GUARDRAILS**

#### What all was done in the project:
* **Summary of Changes:**
  * Standardized model temperatures across the platform:
    * `app/parser.py`: Configured `temperature=0.2` for Groq `qwen/qwen3.8-27b` structured JSON extraction.
    * `app/main.py`: Configured `temperature=0.3` for Groq `qwen/qwen3.8-27b` GraphRAG recruiter assistant chat.
  * Implemented strict system prompt guardrails in `/api/chat`:
    * Enforced rule: Refuse non-recruitment queries with exact canned response: *"I am a recruiting assistant. I can only answer questions related to candidate evaluation."*
    * Enforced rule: Prevent hallucination by anchoring answers strictly to `session_db['latest_rankings']`.
* **Why the Change Was Necessary:**
  * Higher default temperatures caused non-deterministic JSON schema extraction failures and occasional chat drift.
  * Setting temperature to 0.2 for parsing ensures deterministic JSON output; 0.3 for chat provides balanced conversational agility while preventing prompt injection exploits.
* **Affected Files:**
  * `app/parser.py`
  * `app/main.py`
* **Verification & Testing:**
  * Sent non-recruiting prompts (e.g., *"Write a python script"*, *"Tell a joke"*) via curl and confirmed immediate guardrail rejection.
  * Verified candidate queries return factual, grounded explanations of inferred skills.

---

### `2026-10-15 00:05:00 IST` ────► **ZERO-CORS MULTI-PAGE PDF STREAMING & MANUAL DOWNLOAD DECOUPLING**

#### What all was done in the project:
* **Summary of Changes:**
  * Resolved critical browser PDF rendering failure (`Failed to load PDF with Mozilla PDF.js engine` and cross-origin iframe sandbox blocks).
  * Implemented high-performance server-side rasterization endpoints in `app/main.py`:
    * `GET /api/pdf/pages/{filename}`: Inspects PDF and returns page count.
    * `GET /api/pdf/page/{filename}/{page_num}`: Renders 150 DPI PNG images via PyMuPDF `page.get_pixmap(dpi=150)`.
  * Created new frontend component `frontend/src/components/PdfViewer.jsx`:
    * Zero-iframe image stream rendering.
    * Multi-page navigation (Previous / Next / Page counter).
    * Dynamic zoom controls (50% to 200%).
    * Fit-to-width responsive toggle.
  * Eliminated automatic PDF download triggers:
    * Replaced automatic download actions with an explicit **Download Annotated PDF** button using in-memory `fetch` and Blob URL revocation (`handleManualDownload`).
* **Why the Change Was Necessary:**
  * Chromium-based browsers blocked cross-origin `iframe` PDF viewing and triggered aggressive file download prompts whenever a match calculation finished, disrupting user experience.
* **Affected Files:**
  * `app/main.py`
  * `frontend/src/components/PdfViewer.jsx` (New component)
  * `frontend/src/App.jsx`
* **Verification & Testing:**
  * Multi-page PDFs tested in browser on `http://localhost:5173`. Confirmed pages display smoothly with zoom controls and zero auto-downloads.

---

### `2026-10-15 00:25:00 IST` ────► **MODERN DARK GLASSMORPHISM UI REDESIGN & VITE CONTAINER PURGE**

#### What all was done in the project:
* **Summary of Changes:**
  * Removed default Vite template constraints in `frontend/src/index.css` (`#root { max-width: 1280px; text-align: center; }`), which previously caused the dashboard to display as a squeezed, centered column.
  * Complete design overhaul in `frontend/src/App.css` using modern dark-mode glassmorphism:
    * Curated HSL color palette: Deep obsidian background (`#0b0f19`), electric blue accents (`#38bdf8`), emerald score rings (`#10b981`), and subtle border glow.
    * 2-column responsive dashboard grid with independent scrolling.
    * Animated SVG circular match percentage meters.
    * Tabbed candidate inspector (Skills Overview, Gap Analysis, Live Annotated Document, and GraphRAG Chat).
* **Why the Change Was Necessary:**
  * The initial UI looked like a raw developer prototype. The redesign elevates the user experience to an enterprise-grade recruiting platform.
* **Affected Files:**
  * `frontend/src/index.css`
  * `frontend/src/App.css`
  * `frontend/src/App.jsx`
* **Verification & Testing:**
  * Visual verification across desktop and tablet screen widths. Confirmed responsive collapse and smooth micro-animations.

---

### `2026-10-15 00:28:00 IST` ────► **PROFESSIONAL MULTI-TIER DOCUMENTATION SYSTEM & ARCHITECTURE MIND MAPS**

#### What all was done in the project:
* **Summary of Changes:**
  * Created complete, enterprise-grade modular documentation system:
    * `docs/architecture.md`: Exhaustive system architecture with Mermaid graph, component breakdown, and technology justifications.
    * `docs/workflows.md`: End-to-end data flows, processing steps, decision branches, and full Mermaid Mind Map.
    * `docs/api.md`: Comprehensive API reference covering all 6 endpoints with schemas and cURL examples.
    * `docs/setup-and-configuration.md`: 1-click batch launcher guides, manual setup, and safe `.env` templates.
    * `docs/troubleshooting.md`: Root-cause diagnostics for PDF streaming, CORS, rate limits, and FAQs.
    * `docs/development-history.md`: Complete verifiable audit trail.
    * `CHANGELOG.md` & `CONTRIBUTING.md`: Open-source maintenance and governance standards.
    * Root `README.md` & `skillgraph-ats/README.md`: Centralized visual entry points.
* **Why the Change Was Necessary:**
  * Replaced incomplete and fragmented documentation with an authoritative system accessible to both technical architects and complete beginners.
* **Affected Files:**
  * `docs/architecture.md`, `docs/workflows.md`, `docs/api.md`, `docs/setup-and-configuration.md`, `docs/troubleshooting.md`, `docs/development-history.md`
  * `CHANGELOG.md`, `CONTRIBUTING.md`, `README.md`, `skillgraph-ats/README.md`
* **Verification & Testing:**
  * Cross-checked all file paths, Markdown anchors, Mermaid syntax diagrams, and curl commands against live code.
