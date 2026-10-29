# SkillGraph ATS — Setup, Installation & Configuration Guide

> **System Guide Version:** 2.0.0  
> **Supported Platforms:** Windows 10/11 (native PowerShell & CMD batch), macOS (Terminal / bash / zsh), Linux (Ubuntu 20.04+, Debian, Fedora)  
> **Python Target:** Python 3.10 – 3.12 (virtual environment recommended)  
> **Node Target:** Node.js v18.0.0+ (LTS recommended) and npm v9+

---

## ⚡ Quick-Start (1-Click Launch on Windows)

If you are running on Windows and already have Python and Node.js installed, the repository provides turnkey automation scripts at the root directory:

```plaintext
d:/MAJOR PROJECT - Copy/
├── run_all.bat         <-- Double-click to launch Backend & Frontend concurrently in dedicated consoles
├── run_backend.bat     <-- Launches FastAPI on http://127.0.0.1:8000 (auto-checks .venv and .env)
└── run_frontend.bat    <-- Launches Vite/React on http://localhost:5173 (auto-runs npm install if needed)
```

1. Double-click `run_all.bat` (or run `.\run_all.bat` in PowerShell / CMD).
2. Two command windows will open:
   * **SkillGraph ATS - Backend Server:** Runs Uvicorn on `http://127.0.0.1:8000`.
   * **SkillGraph ATS - Frontend Client:** Runs Vite on `http://localhost:5173`.
3. Open your browser and navigate to `http://localhost:5173`.

---

## 🛠️ Prerequisites & System Requirements

Before running the platform manually or on non-Windows operating systems, ensure the following prerequisites are installed:

| Component | Minimum Version | Recommended Version | Verification Command | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Python** | 3.10.x | 3.11.x / 3.12.x | `python --version` | Powers FastAPI backend, PyMuPDF parsing, and inference pipelines. |
| **Node.js** | 18.0.0 | 20.x LTS | `node -v` | JavaScript runtime powering Vite and the React 19 UI. |
| **npm** | 9.0.0 | 10.x+ | `npm -v` | Node package manager for installing frontend packages. |
| **Git** | 2.30+ | Latest | `git --version` | Version control and repository management. |
| **Groq API Key** | N/A | Active Account | Free tier at [console.groq.com](https://console.groq.com) | Fast LPU inference for structured extraction and GraphRAG chat (`qwen/qwen3.8-27b`). |
| **NVIDIA API Key**| N/A | Active Account | Free credits at [build.nvidia.com](https://build.nvidia.com) | Cloud GPU dense embeddings (`nvidia/nemotron-3-embed-1b`). |

---

## 🔐 Environment Configuration (`.env`)

SkillGraph ATS requires two cloud API keys. These keys **must never be committed to Git**. A pre-configured `.gitignore` protects `.env` files in both root and subdirectories.

### 1. Create the `.env` File
In `skillgraph-ats/` (or the project root), create a `.env` file:

```bash
# Windows PowerShell
cd "d:\MAJOR PROJECT - Copy\skillgraph-ats"
New-Item -ItemType File -Name ".env" -Force

# Linux / macOS
cd skillgraph-ats
touch .env
```

### 2. Populate Safe Environment Variables
Copy and paste the template below into your `.env` file, replacing the placeholder strings with your actual API keys:

```ini
# =========================================================================
# SkillGraph ATS — Environment Configuration Template
# =========================================================================

# 1. Groq Cloud API Key (Required for Structured LLM Extraction & Recruiter Chat)
# Obtain free API key at: https://console.groq.com/keys
GROQ_API_KEY=gsk_your_actual_groq_api_key_here

# 2. NVIDIA NIM Cloud API Key (Required for 2048-dim Cloud GPU Embeddings)
# Obtain free API credits at: https://build.nvidia.com/nvidia/nemotron-3-embed-1b
NVIDIA_API_KEY=nvapi-your_actual_nvidia_api_key_here

# 3. Optional Backend Server Overrides (Defaults apply if omitted)
# PORT=8000
# HOST=127.0.0.1
# ENVIRONMENT=development
```

> [!WARNING]
> **API Key Safety:** Never paste real API keys into public repositories, chat messages, or screenshots. If an API key is accidentally exposed, revoke it immediately via the respective provider dashboard.

---

## 🐍 Manual Backend Setup (Step-by-Step)

### Step 1: Navigate to the Backend Directory
```bash
cd "d:\MAJOR PROJECT - Copy\skillgraph-ats"
```

### Step 2: Create and Activate a Python Virtual Environment
Creating a virtual environment ensures Python packages do not conflict with global system tools:

```bash
# Windows PowerShell / CMD:
python -m venv .venv
.\.venv\Scripts\activate

# macOS / Linux:
python3 -m venv .venv
source .venv/bin/activate
```

### Step 3: Upgrade pip and Install Dependencies
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

#### What `requirements.txt` Installs:
* `fastapi` & `uvicorn[standard]`: High-performance asynchronous web framework and ASGI server.
* `python-multipart`: Form-data parsing for multi-file PDF uploads.
* `python-dotenv`: Environment variable management.
* `pydantic`: Robust data validation and JSON schema coercion.
* `groq`: Official Python client for Groq LPU inference.
* `pypdf`: Text extraction from uploaded PDF resumes and job descriptions.
* `scikit-learn` & `numpy`: High-speed vector cosine similarity matrix mathematics.
* `networkx`: Directed graph data structures for ontological skill implication.
* `requests`: Synchronous HTTP client for calling the NVIDIA NIM Cloud API.
* `pymupdf>=1.24.0`: Real-time visual PDF annotation and in-memory PNG pixmap rendering.
* `reportlab>=4.0.0`: Synthetic test PDF generation.

### Step 4: Run the Backend Development Server
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

You should see startup banner logs:
```plaintext
==========================================================
  [ONLINE] SkillGraph ATS Backend is READY!
  - Host URL:     http://127.0.0.1:8000
  - Swagger Docs: http://127.0.0.1:8000/docs
  - Health Check: http://127.0.0.1:8000/health
==========================================================
```

---

## ⚛️ Manual Frontend Setup (Step-by-Step)

### Step 1: Open a New Terminal and Navigate to Frontend
```bash
cd "d:\MAJOR PROJECT - Copy\skillgraph-ats\frontend"
```

### Step 2: Install Node Dependencies
```bash
npm install
```

#### Key Frontend Dependencies:
* `react` & `react-dom` (v19.0.0): Modern component architecture with concurrency.
* `lucide-react`: Lightweight SVG icon system.
* `canvas-confetti`: Celebratory visual micro-interactions upon evaluation completion.
* `vite` (v8.x): Fast next-generation frontend build tooling and Hot Module Replacement (HMR).

### Step 3: Launch the Frontend Development Server
```bash
npm run dev
```

Vite will serve the application:
```plaintext
  VITE v8.x.x  ready in 240 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## 🧪 Verification & Testing Procedures

### 1. Test Backend Health Endpoint
Verify that the FastAPI server is running and responding:
```bash
curl -X GET "http://127.0.0.1:8000/health"
```
*Expected Output:* Status `online` with model declarations.

### 2. Verify Sample Data
The repository includes pre-populated sample PDFs in `skillgraph-ats/data/` for immediate testing:
* `data/job_description_ai_engineer.pdf` (Benchmark AI Engineer JD)
* `data/job_description.pdf` (Sample HR JD)
* `data/resume1.pdf` & `data/resume2.pdf` (Sample Technical Resumes)

### 3. Run the Automated Upload & Match Test
Execute the automated end-to-end test script:
```bash
cd "d:\MAJOR PROJECT - Copy\skillgraph-ats"
python test_upload.py
```

*Expected Terminal Output:*
```plaintext
Status Code: 200
Response:
{
  "jd_title": "AI / Machine Learning Engineer",
  "total_resumes_processed": 2,
  "rankings": [
    {
      "name": "Alex Mercer",
      "match_score": 100.0,
      "annotated_pdf_url": "/api/pdf/annotated_resume1.pdf"
      ...
    }
  ]
}
```

---

## 🌐 Network Ports & Firewall Considerations

| Port | Service | Protocol | Default URL | Customization |
| :--- | :--- | :--- | :--- | :--- |
| **8000** | FastAPI / Uvicorn Backend | HTTP / REST | `http://127.0.0.1:8000` | Modify port flag in `run_backend.bat` (`--port 8080`) |
| **5173** | Vite Dev Server Frontend | HTTP / WS | `http://localhost:5173` | Modify `vite.config.js` (`server: { port: 3000 }`) |

> [!NOTE]
> When testing from a separate device on the local network (LAN), launch Vite with `npm run dev -- --host` and configure Uvicorn with `--host 0.0.0.0`. Ensure Windows Firewall allows incoming connections on port 8000 and 5173.
