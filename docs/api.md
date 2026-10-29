# SkillGraph ATS — Complete API Reference Manual

> **API Version:** 2.0.0  
> **Backend Framework:** FastAPI 0.115+ (Python 3.11/3.12)  
> **Interactive Swagger UI:** `http://127.0.0.1:8000/docs`  
> **ReDoc Documentation:** `http://127.0.0.1:8000/redoc`  
> **Default Local Base URL:** `http://127.0.0.1:8000`

---

## 🧭 API Architecture & Protocol Overview

The SkillGraph ATS backend is an asynchronous RESTful microservice built with **FastAPI**. It coordinates unstructured document ingestion, neuro-symbolic knowledge graph evaluation, dense cloud GPU embeddings, automated visual PDF annotation, and retrieval-augmented conversational evaluation.

### Global CORS Policy
The API includes permissive development CORS headers configured via `fastapi.middleware.cors.CORSMiddleware`:
* **Allowed Origins:** `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`, `http://127.0.0.1:3000`, `http://localhost:8000`, `*`
* **Allowed Methods:** All HTTP verbs (`GET`, `POST`, `OPTIONS`, `HEAD`)
* **Exposed Headers:** `Accept-Ranges`, `Content-Range`, `Content-Length`, `Content-Disposition` (vital for PDF range requests and streaming canvas rendering)

---

## 📋 Endpoint Summary Table

| Endpoint | Method | Content-Type | Auth | Description |
| :--- | :--- | :--- | :--- | :--- |
| [`/health`](#1-system-health-check) | `GET` | `application/json` | None | Returns engine operational status, active model versions, and endpoint manifest. |
| [`/api/match`](#2-candidate--job-description-matcher) | `POST` | `multipart/form-data` | Server `.env` | Uploads 1 JD PDF and $N$ Resume PDFs, parses them via Groq LLM, runs graph inference, computes NVIDIA embeddings, annotates PDFs, and returns ranked candidates. |
| [`/api/pdf/pages/{filename}`](#3-pdf-page-manifest) | `GET` | `application/json` | None | Returns total page count and an array of individual page image URLs for in-app rasterization. |
| [`/api/pdf/page/{filename}/{page_num}`](#4-rasterized-pdf-page-image) | `GET` | `image/png` | None | Renders a specific page of a PDF as a high-fidelity 150 DPI PNG image using PyMuPDF pixmap rasterization. |
| [`/api/pdf/{filename}`](#5-raw--annotated-pdf-download) | `GET` | `application/pdf` | None | Streams the raw binary PDF file with inline disposition for downloading or browser rendering. |
| [`/api/chat`](#6-graphrag-recruiter-assistant-chat) | `POST` | `application/x-www-form-urlencoded` | Server `.env` | Guardrailed conversational Q&A grounded exclusively in the latest candidate match context and knowledge graph profile. |

---

## 🔍 Detailed Endpoint Documentation

### 1. System Health Check

#### `GET /health` or `GET /`

Returns the operational status of the backend, the active AI inference engines, and an endpoint directory.

##### Beginner View
> **What it does:** Like checking if a website is online before you try logging in. It replies: *"I am awake, healthy, and connected to the cloud AI models!"*

##### Request Details
* **Method:** `GET`
* **Path:** `/health` (alias `/`)
* **Headers:** None required
* **Parameters:** None

##### Success Response (`200 OK`)
```json
{
  "status": "online",
  "service": "SkillGraph ATS Backend",
  "model": "NVIDIA Nemotron-3-Embed-1B (Cloud GPU) + Groq qwen/qwen3.8-27b",
  "endpoints": {
    "match": "/api/match (POST)",
    "chat": "/api/chat (POST)",
    "docs": "/docs"
  }
}
```

##### cURL Example
```bash
curl -X GET "http://127.0.0.1:8000/health" -H "Accept: application/json"
```

---

### 2. Candidate & Job Description Matcher

#### `POST /api/match`

The core pipeline entry point. Ingests one Job Description PDF and multiple candidate Resume PDFs. Parses text, extracts structured entities using Groq `qwen/qwen3.8-27b`, expands skills via the NetworkX knowledge graph, measures cosine similarity against 2048-dimensional NVIDIA NIM Cloud embeddings, annotates resumes with visual color highlights, and saves the session for GraphRAG chat.

##### Beginner View
> **What it does:** You hand the system a job description PDF and a stack of resume PDFs. It reads every document, figures out what skills each person actually has (even unspoken ones!), matches them against the job requirements, colors in the resume like a highlighter pen, and ranks who should get an interview.

##### Request Details
* **Method:** `POST`
* **Path:** `/api/match`
* **Content-Type:** `multipart/form-data`
* **Request Fields:**
  * `jd_file` *(UploadFile, required)*: Binary PDF of the target job description.
  * `resume_files` *(List[UploadFile], required)*: One or more binary PDFs representing candidate resumes.

##### Processing Workflow
1. Staged into `temp_uploads/`.
2. Extracted via `pypdf.PdfReader`.
3. Entity extraction via Groq LLM (`temperature=0.2`).
4. Graph expansion via `nx.descendants`.
5. NVIDIA NIM Cloud embedding generation (`nvidia/nemotron-3-embed-1b`).
6. Cosine similarity threshold scoring ($\ge 0.40$).
7. PyMuPDF highlights generated and saved as `annotated_<filename>`.
8. State cached in `session_db`.

##### Success Response (`200 OK`)
```json
{
  "jd_title": "Senior AI & Cloud Infrastructure Engineer",
  "total_resumes_processed": 2,
  "rankings": [
    {
      "name": "Jane Smith",
      "match_score": 100.0,
      "explicit_skills": [
        "Python",
        "FastAPI",
        "Docker",
        "Kubernetes",
        "PostgreSQL",
        "PyTorch"
      ],
      "inferred_skills": [
        "Containerization",
        "Cloud Infrastructure",
        "REST APIs",
        "Backend Engineering",
        "Relational Databases",
        "Machine Learning"
      ],
      "matched_requirements": [
        {
          "required_skill": "Cloud Infrastructure",
          "matched_with": "Cloud Infrastructure",
          "confidence": 1.0
        },
        {
          "required_skill": "Containerization",
          "matched_with": "Containerization",
          "confidence": 1.0
        },
        {
          "required_skill": "Python",
          "matched_with": "Python",
          "confidence": 1.0
        },
        {
          "required_skill": "Relational Databases",
          "matched_with": "Relational Databases",
          "confidence": 1.0
        }
      ],
      "missing_skills": [],
      "projects": [
        {
          "title": "Cloud Orchestration Platform",
          "description": "Built automated Kubernetes clusters deploying microservices.",
          "technologies": ["Kubernetes", "Docker", "Go"]
        }
      ],
      "annotated_pdf_url": "/api/pdf/annotated_resume1.pdf",
      "original_pdf_url": "/api/pdf/resume1.pdf"
    }
  ]
}
```

##### Error Responses
* **`400 Bad Request`**: Missing file fields or invalid PDF stream.
* **`500 Internal Server Error`**: Groq API rate limit or missing `NVIDIA_API_KEY`.

##### cURL Example
```bash
curl -X POST "http://127.0.0.1:8000/api/match" \
  -F "jd_file=@data/job_description.pdf;type=application/pdf" \
  -F "resume_files=@data/resume1.pdf;type=application/pdf" \
  -F "resume_files=@data/resume2.pdf;type=application/pdf"
```

---

### 3. PDF Page Manifest

#### `GET /api/pdf/pages/{filename}`

Returns metadata regarding a PDF file stored in `temp_uploads/`, including total page count and the list of streamable image page URLs.

##### Beginner View
> **What it does:** Asks the backend: *"How many pages does this PDF have, and where can I download picture snapshots of each page?"*

##### Request Details
* **Method:** `GET`
* **Path:** `/api/pdf/pages/{filename}`
* **Path Parameters:**
  * `filename` *(string, required)*: The basename of the PDF file (e.g., `annotated_resume1.pdf` or `resume1.pdf`). Path traversal sequences (`../`) are automatically sanitized using `os.path.basename`.

##### Success Response (`200 OK`)
```json
{
  "filename": "annotated_resume1.pdf",
  "total_pages": 2,
  "pages": [
    "/api/pdf/page/annotated_resume1.pdf/1",
    "/api/pdf/page/annotated_resume1.pdf/2"
  ]
}
```

##### Error Responses
* **`404 Not Found`**: File does not exist in `temp_uploads/`.
  ```json
  {"detail": "PDF not found"}
  ```

##### cURL Example
```bash
curl -X GET "http://127.0.0.1:8000/api/pdf/pages/annotated_resume1.pdf"
```

---

### 4. Rasterized PDF Page Image

#### `GET /api/pdf/page/{filename}/{page_num}`

Streams a high-resolution, rasterized PNG image of the requested PDF page directly to the client. This bypasses browser-native PDF sandboxing and prevents cross-origin `iframe` security blocks.

##### Beginner View
> **What it does:** Takes a single page from a resume PDF and converts it into a crystal-clear picture (PNG image) so the React app can display it instantly without browser security warnings or unwanted downloads.

##### Request Details
* **Method:** `GET`
* **Path:** `/api/pdf/page/{filename}/{page_num}`
* **Path Parameters:**
  * `filename` *(string, required)*: The basename of the file in `temp_uploads/`.
  * `page_num` *(integer, required, 1-indexed)*: The page number to render (1 to `total_pages`).
* **Query Parameters:**
  * `dpi` *(integer, optional, default: 150)*: Dots per inch resolution for PyMuPDF rasterization.

##### Response Headers
* `Content-Type: image/png`
* `Cache-Control: public, max-age=3600`
* `Access-Control-Allow-Origin: *`

##### Error Responses
* **`400 Bad Request`**: `page_num` is $< 1$ or $> \text{total\_pages}$.
  ```json
  {"detail": "Invalid page number 3"}
  ```
* **`404 Not Found`**: The requested file does not exist.

##### cURL Example
```bash
curl -X GET "http://127.0.0.1:8000/api/pdf/page/annotated_resume1.pdf/1?dpi=150" \
  --output page_1.png
```

---

### 5. Raw / Annotated PDF Download

#### `GET /api/pdf/{filename}`

Serves the binary `.pdf` file with standard inline disposition headers. Used by the manual download button in the React dashboard to trigger a local file save without automatic browser hijacking.

##### Request Details
* **Method:** `GET`
* **Path:** `/api/pdf/{filename}`
* **Path Parameters:**
  * `filename` *(string, required)*: File basename.

##### Response Headers
* `Content-Type: application/pdf`
* `Content-Disposition: inline; filename="annotated_resume1.pdf"`
* `Cache-Control: no-cache`
* `Access-Control-Allow-Origin: *`

##### cURL Example
```bash
curl -X GET "http://127.0.0.1:8000/api/pdf/annotated_resume1.pdf" \
  --output my_annotated_resume.pdf
```

---

### 6. GraphRAG Recruiter Assistant Chat

#### `POST /api/chat`

Allows recruiters to ask plain-English questions regarding a candidate's evaluation, skills, fit, or gaps. Grounded directly in the parsed Pydantic data and graph inference results from the most recent `/api/match` run.

##### Strict Guardrail System
To prevent prompt injection, hallucination, and off-topic misuse, the system prompt strictly enforces:
1. Answers must only evaluate the requested candidate against the job requirements.
2. If asked to write general code, solve math, tell jokes, or answer unrelated queries, it responds with:
   > *"I am a recruiting assistant. I can only answer questions related to candidate evaluation."*
3. Hallucination prevention: Only explicit or graph-inferred skills present in the candidate profile may be referenced.

##### Request Details
* **Method:** `POST`
* **Path:** `/api/chat`
* **Content-Type:** `application/x-www-form-urlencoded`
* **Form Fields:**
  * `candidate_name` *(string, required)*: The candidate name matching one of the records from the latest match.
  * `question` *(string, required)*: The recruiter's question.

##### Success Response (`200 OK`)
```json
{
  "reply": "Jane Smith matches 100% of the required skills. Although she did not explicitly write 'Cloud Infrastructure' on her resume, she possesses extensive hands-on experience with Kubernetes and Docker, which our Knowledge Graph infers as direct competencies in Cloud Infrastructure and Containerization."
}
```

##### Guardrail Rejection Response (`200 OK`)
```json
{
  "reply": "I am a recruiting assistant. I can only answer questions related to candidate evaluation."
}
```

##### Error Responses
* **`400 Bad Request`**: No match has been run in this backend session yet.
  ```json
  {"detail": "Please run a match first."}
  ```
* **`404 Not Found`**: Candidate name was not found in the latest match results.
  ```json
  {"detail": "Candidate Alex Smith not found in latest match."}
  ```

##### cURL Example
```bash
curl -X POST "http://127.0.0.1:8000/api/chat" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "candidate_name=Jane Smith" \
  -d "question=Why did she receive credit for Cloud Infrastructure?"
```

---

## 🔒 Security & Environment Guardrails

* **API Keys:** All external AI requests (Groq and NVIDIA NIM) require valid API keys loaded securely into the environment (`.env`). Keys are never sent to the client browser.
* **Path Traversal Protection:** All file access endpoints wrap user-supplied filenames in `os.path.basename()` before resolving paths within `temp_uploads/`.
* **In-Memory Session Isolation:** `session_db` stores the most recent match data in RAM. In a production multi-tenant deployment, this will be backed by a Redis session store.
