# SkillGraph ATS — Troubleshooting & Diagnostic Guide

> **Guide Version:** 2.0.0  
> **Document Purpose:** Practical diagnostic workflows, root-cause analyses, resolved edge cases, and frequently asked questions for operators and developers.

---

## 🩺 Diagnostic Quick-Reference

| Symptom | Primary Suspect | Quick Resolution |
| :--- | :--- | :--- |
| **PDF Viewer displays blank white screen or error icon** | Browser blocked cross-origin iframe or missing `pymupdf` | Verify backend has `pymupdf>=1.24.0` installed; check that `/api/pdf/pages/{filename}` returns HTTP 200. |
| **PDF automatically downloads when clicking "Calculate Matches"** | Legacy auto-trigger in frontend state | Resolved in v2.0.0. Ensure `frontend/src/components/PdfViewer.jsx` is used, where download requires explicit click. |
| **Backend crashes with `NVIDIA_API_KEY is not configured`** | Missing key in `.env` | Add `NVIDIA_API_KEY=nvapi-...` to `skillgraph-ats/.env` and restart backend. |
| **HTTP 429: Groq Rate Limit Exceeded** | Free tier TPM (Tokens Per Minute) cap reached | Wait 60 seconds; process fewer resumes simultaneously; or upgrade to developer tier. |
| **UI displays centered, squeezed narrow column** | Legacy Vite starter CSS constraints | Ensure `skillgraph-ats/frontend/src/index.css` has `#root` width restrictions removed. |
| **Backend reports `Address already in use` on Port 8000** | A dangling Python/Uvicorn process holds port | Kill process using `taskkill` (Windows) or `lsof/kill` (Linux/macOS). |

---

## 🔍 Detailed Problem Breakdowns & Solutions

### 1. PDF Preview & Rendering Issues

#### ⚠️ Problem: "Failed to load PDF" or Browser Auto-Downloads the File
* **Root Cause Analysis:** Modern web browsers (Chromium, Firefox, Safari) enforce strict security sandboxing on embedded `<iframe src="...pdf">` elements across differing ports (`http://localhost:5173` vs `http://127.0.0.1:8000`). Browsers often respond by either displaying a grey blocked plugin icon or automatically popping up a "Save As..." download prompt.
* **The Architectural Solution (v2.0.0):**
  We replaced raw browser PDF embedding with a server-side PyMuPDF rasterization engine:
  1. Frontend requests page manifest: `GET /api/pdf/pages/{filename}`
  2. Backend inspects document and returns page count.
  3. Frontend requests rendered 150 DPI PNG images: `GET /api/pdf/page/{filename}/{page_num}`
  4. Pages render cleanly in standard HTML `<img>` tags inside `PdfViewer.jsx` with zoom and navigation controls.
* **How to Verify:**
  Test direct page rendering in your browser or via curl:
  ```bash
  curl -I "http://127.0.0.1:8000/api/pdf/page/annotated_resume1.pdf/1"
  ```
  Should return `HTTP/1.1 200 OK` and `content-type: image/png`.

---

### 2. Unwanted Automatic PDF Downloads

#### ⚠️ Problem: Clicking "Calculate Matches" triggers an immediate browser file download
* **Root Cause:** Prior versions of frontend match handlers attached file URLs to hidden anchor tags that fired download events immediately upon receiving the `/api/match` payload.
* **The Solution:** The download action was completely decoupled. In `App.jsx` and `PdfViewer.jsx`, the candidate's PDF is loaded strictly into memory state for previewing. A distinct **Download Annotated PDF** button exists in the viewer header that only downloads when clicked by the recruiter:
  ```jsx
  const handleManualDownload = async () => {
    const res = await fetch(pdfUrl);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdfUrl.split('/').pop();
    a.click();
    window.URL.revokeObjectURL(url);
  };
  ```

---

### 3. NVIDIA Cloud API Errors (`NVIDIA_API_KEY`)

#### ⚠️ Problem: `RuntimeError: NVIDIA NIM API Error (401): Unauthorized`
* **Root Cause:** The key in `.env` is invalid, expired, missing, or has an invalid prefix. NVIDIA NIM keys typically begin with `nvapi-`.
* **Resolution Steps:**
  1. Open [build.nvidia.com](https://build.nvidia.com) and log in.
  2. Navigate to **nemotron-3-embed-1b**.
  3. Click **Get API Key** and generate a fresh key.
  4. Edit `skillgraph-ats/.env`:
     ```ini
     NVIDIA_API_KEY=nvapi-your_new_key_here
     ```
  5. Restart the backend:
     ```bash
     .\run_backend.bat
     ```

---

### 4. Groq Rate Limits & Model Timeouts

#### ⚠️ Problem: `groq.RateLimitError: Error code: 429`
* **Root Cause:** The Groq free tier enforces rate limits per minute (RPM/TPM) depending on model size. Extracting structured JSON from multiple multi-page resumes concurrently can briefly exceed the token cap.
* **Resolution Steps:**
  * **Batching:** When processing large applicant pools, upload resumes in batches of 3–5 candidates.
  * **Deterministic Temperature:** Ensure `temperature=0.2` is configured in `app/parser.py`. Higher temperatures increase token generation variance and latency.
  * **Model Verification:** Confirm that `app/parser.py` references `qwen/qwen3.8-27b` (or active Groq production checkpoints).

---

### 5. Port Conflicts & Lingering Processes

#### ⚠️ Problem: `[Errno 10048] error while attempting to bind on address ('127.0.0.1', 8000)`
* **Root Cause:** A previous instance of Uvicorn was terminated abnormally (e.g., terminal window closed without `Ctrl+C`) and continues running in the background.
* **Resolution on Windows:**
  1. Open PowerShell and find the Process ID (PID):
     ```powershell
     netstat -ano | findstr :8000
     ```
  2. Note the PID in the rightmost column (e.g., `14820`).
  3. Terminate the process:
     ```powershell
     taskkill /F /PID 14820
     ```
  4. Re-run `run_backend.bat`.

* **Resolution on macOS / Linux:**
  ```bash
  lsof -ti :8000 | xargs kill -9
  ```

---

### 6. Recruiter Chat Guardrail Triggering

#### ⚠️ Problem: Recruiter Chat replies: *"I am a recruiting assistant. I can only answer questions related to candidate evaluation."*
* **Root Cause:** This is an intentional security guardrail, not a bug.
* **Explanation:**
  The GraphRAG system prompt includes strict boundaries to prevent prompt injections, jailbreaks, and off-topic misuse. If a recruiter asks:
  * *"Can you write me a Python script to sort a list?"*
  * *"Tell me a funny joke about recruiters."*
  * *"What is the capital of France?"*
  The LLM will reject the prompt and return the guardrail message.
* **Valid Queries:**
  * *"Why did this candidate receive 100% on Cloud Infrastructure?"*
  * *"What specific projects demonstrate their Docker experience?"*
  * *"What required skills is this candidate missing?"*

---

## ❓ Frequently Asked Questions (FAQ)

### Q1: Why use NVIDIA Cloud NIM instead of running SentenceTransformers locally?
**Answer:** Running dense 2048-dimensional embedding models locally consumes substantial system RAM (2–4 GB) and produces high CPU/GPU thermal load, making it unsuitable for lightweight developer laptops or battery-powered environments. The NVIDIA NIM Cloud API offloads all vector math to NVIDIA datacenter GPUs, returning 2048-dim vectors in under 80 milliseconds with zero local compute strain.

### Q2: Why are temperatures set to 0.2 and 0.3?
**Answer:**
* In `app/parser.py`, `temperature=0.2` is used for **Pydantic JSON schema extraction**. Near-zero temperature minimizes hallucinations and guarantees strict JSON structural conformance.
* In `app/main.py`, `temperature=0.3` is used for **GraphRAG chat**. This provides natural, recruiter-friendly conversational explanations while adhering strictly to verified candidate facts.

### Q3: Are uploaded candidate resumes stored permanently?
**Answer:** Resumes and annotated PDFs are stored temporarily in the `temp_uploads/` folder on local disk for the duration of the server session. In production deployments, this folder can be mounted to an ephemeral volume or configured with a cron job to purge files older than 24 hours.

### Q4: How do I add new skills to the Knowledge Graph?
**Answer:** Open `skillgraph-ats/app/graph.py` and add entries to the `EDGES` list:
```python
EDGES = [
    # Existing edges...
    ("Rust", "Systems Programming"),
    ("Solidity", "Blockchain Engineering"),
    ("Next.js", "React"),
]
```
The graph will automatically build the new implication branches upon backend restart.
