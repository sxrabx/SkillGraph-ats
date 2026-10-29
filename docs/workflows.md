# SkillGraph ATS — Detailed Workflows, Mind Maps & Data-Flow Diagrams

> **Document Version:** 2.0.0  
> **Last Updated:** October 15, 2026 | 00:25 IST  
> **Target Audience:** Developers, Integrators, QA Engineers, and Technical Reviewers  
> **Related Architecture Document:** [`docs/architecture.md`](file:///d:/MAJOR%20PROJECT%20-%20Copy/docs/architecture.md)

---

## 🧠 1. Platform Taxonomy Mind Map

This mind map visualizes how users, user interfaces, cloud AI services, inference engines, and data artifacts connect across SkillGraph ATS:

```mermaid
mindmap
  root((⚡ SkillGraph ATS))
    User Personas
      Technical Recruiter
      Hiring Manager
      Talent Acquisition Lead
    Input Artifacts
      Job Description PDF
      Candidate Resumes PDFs
      Target Competency Profiles
    Ingestion & Preprocessing
      PyPDF Text Extractor
      Carriage Return Sanitizer
      File Staging in temp_uploads
    AI Reasoning Core
      Groq Cloud LPU
        Qwen 3.8 27B LLM
        Temperature 0.2
        Pydantic JSON Validation
      NetworkX Graph Ontology
        Directed Implication Edges
        Descendant Traversal
        Latent Skill Expansion
      NVIDIA NIM Cloud
        Nemotron 3 Embed 1B
        2048-dim Dense Vectors
        Cosine Similarity Engine
        Threshold 0.40 Filter
    Visual Proof Layer
      PyMuPDF Fitzpatrick
      Collision-Free Bounding Boxes
      Green Matched Skills
      Purple Projects and Tools
      Blue Profile Skills
      High-DPI 150 DPI Page Rasterizer
    Interactive User Interface
      React 19 & Vite 8
      Plus Jakarta Sans Typography
      Interactive Dropzones
      Gold Rank Badges and Score Bars
      In-App Document Viewer
      Continuous and Single Page Views
      Manual-Only PDF Download
      GraphRAG AI Chat Assistant temp 0.3
      Fullscreen Pop-Out Modal
```

### 📖 Plain-English Explanation:
The platform connects **Recruiters and Hiring Managers** directly to candidates through an intelligent, automated pipeline. Instead of relying on manual resume scanning, the system accepts raw PDF documents, structures them with **Groq AI**, expands hidden competencies with **NetworkX Knowledge Graphs**, calculates mathematical match confidence with **NVIDIA Cloud GPUs**, paints visual proof directly on the resume with **PyMuPDF**, and presents it all within a high-performance **React 19** dashboard.

---

## 🔄 2. End-to-End Pipeline Workflow (User Action to Output)

The diagram below maps the complete user journey from uploading files to inspecting match scores and interrogating the GraphRAG recruiter assistant. It highlights all decision branches and failure recovery paths.

```mermaid
flowchart TD
    Start(["User Opens Dashboard http://localhost:5173"]) --> DropFiles["User Drops JD PDF & Resume PDFs into Dropzones"]
    DropFiles --> ClickMatch{"User Clicks 'Calculate Match Scores'"}

    ClickMatch -->|Missing Files| WarnUser["Alert: 'Please select a Job Description and at least one Resume'"]
    WarnUser --> DropFiles

    ClickMatch -->|Files Valid| SendMultipart["POST /api/match (Multipart FormData)"]
    SendMultipart --> SaveStaging["Save to temp_uploads/ with Sanitized Basenames"]

    SaveStaging --> ExtractJD["pypdf: Extract Raw Text from JD PDF"]
    ExtractJD --> ParseJDGroq["Groq LLM (Qwen 3.8 27B, temp=0.2): Extract JobDescriptionData Schema"]

    ParseJDGroq -->|JD LLM Failure| ReturnErr500["Return HTTP 500: Failed to parse JD"]
    ReturnErr500 --> ShowUIError["Dashboard displays error alert to recruiter"]

    ParseJDGroq -->|JD Parsed Successfully| LoopResumes["Iterate Over Each Candidate Resume PDF"]

    subgraph Candidate_Processing_Loop ["Per-Candidate Processing Pipeline"]
        LoopResumes --> ExtractResText["pypdf: Extract Raw Text from Candidate Resume PDF"]
        ExtractResText --> ParseResGroq["Groq LLM (temp=0.2): Extract ResumeData Schema"]
        
        ParseResGroq --> GraphExpansion["NetworkX: Traverse Descendants for Latent Skills"]
        GraphExpansion --> BuildProfile["Assemble Expanded Profile (Explicit + Latent + Projects)"]

        BuildProfile --> NvidiaEmbed["NVIDIA NIM Cloud API: Fetch 2048-dim Vectors"]
        NvidiaEmbed -->|NVIDIA API Error| FallbackEmbed["Raise RuntimeError: NVIDIA NIM API Error"]
        
        NvidiaEmbed --> CosineCalc["Scikit-Learn: Compute Cosine Similarity Matrix against JD Requirements"]
        CosineCalc --> ScoreThreshold{"Cosine Similarity >= 0.40?"}
        ScoreThreshold -->|Yes| MarkMatched["Add to matched_requirements"]
        ScoreThreshold -->|No| MarkMissing["Add to missing_skills"]

        MarkMatched & MarkMissing --> CalcScore["Compute Match Score %: (Matched / Total Required) * 100"]
        CalcScore --> AnnotatePDF["PyMuPDF: Apply Green, Purple & Blue Highlights with Collision Filtering"]
        AnnotatePDF --> SaveAnnotPDF["Save temp_uploads/annotated_<filename>.pdf"]
        SaveAnnotPDF --> CalcPages["Pre-calculate total page count & /api/pdf/page/ stream URLs"]
    end

    CalcPages --> RankCandidates["Sort candidates descending by Match Score"]
    RankCandidates --> CacheSession["Save latest_jd & latest_rankings to session_db"]
    CacheSession --> ReturnJSON["Return JSON response to React Dashboard"]

    ReturnJSON --> RenderDashboard["React renders Candidate Cards, Score Bars, and Dropdowns"]
    RenderDashboard --> SelectCandidate["Default select Candidate #1"]

    SelectCandidate --> StreamDoc["PdfViewer fetches page images from /api/pdf/page/{file}/{num}"]
    StreamDoc --> DisplayResume["Resume displays with 100% vector highlights, zero download popups!"]

    DisplayResume --> UserActionChoice{"Recruiter Next Action"}

    UserActionChoice -->|Wants Fullscreen View| OpenModal["Click '⛶ Fullscreen Inspector' -> Opens high-res modal"]
    UserActionChoice -->|Wants to Save PDF| ClickDownload["Click '📥 Download PDF' -> Saves annotated_resume.pdf to computer"]
    UserActionChoice -->|Wants Explanation| AskChat["Type question in GraphRAG Chat Window"]

    AskChat --> SendChatQuery["POST /api/chat with candidate_name & question"]
    SendChatQuery --> CheckGuardrail{"Question within domain?"}
    CheckGuardrail -->|Off-topic / Code / General| RefuseReply["Reply: 'I am a recruiting assistant. I can only answer...'"]
    CheckGuardrail -->|Evaluation Question| GroundedReply["Groq LLM (temp=0.3) synthesizes answer from Graph Context"]
    RefuseReply & GroundedReply --> DisplayChat["Show answer in Chat Window"]
```

### 📖 Plain-English Explanation:
1. **Initiation:** The recruiter drops a job description and resumes into the dashboard and clicks **"Calculate Match Scores"**.
2. **Validation:** If files are missing, the UI prompts for them immediately.
3. **Extraction & Inference:** The backend extracts text, parses schemas via Groq, expands implied skills via NetworkX, and offloads vector comparison to NVIDIA Cloud.
4. **Visual Annotation:** PyMuPDF highlights the matching resume sections directly on the document.
5. **Presentation:** The frontend renders ranked candidate cards, visual score bars, and streams document pages with zero unwanted downloads.
6. **Exploration:** The recruiter can zoom in, toggle continuous pages, view fullscreen, download a copy if desired, or chat with the AI about specific candidate qualifications.

---

## 🔍 3. Feature-Specific Workflows

### Feature A: Document Ingestion & Structured Schema Parsing

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter as Recruiter (Browser)
    participant UI as React Frontend
    participant API as FastAPI Backend
    participant PyPDF as pypdf Engine
    participant Groq as Groq Cloud LPU (Qwen 3.8 27B)

    Recruiter->>UI: Selects resume.pdf and job_description.pdf
    UI->>API: POST /api/match (multipart/form-data)
    API->>API: Sanitize filenames and stage in temp_uploads/
    API->>PyPDF: Extract text from job_description.pdf
    PyPDF-->>API: Raw JD text string
    API->>Groq: Prompt with raw text + JobDescriptionData JSON Schema (temp=0.2)
    Groq-->>API: Validated JSON Object
    API->>API: Validate against Pydantic model JobDescriptionData(**json)

    API->>PyPDF: Extract text from resume.pdf
    PyPDF-->>API: Raw Resume text string
    API->>Groq: Prompt with raw text + ResumeData JSON Schema (temp=0.2)
    Groq-->>API: Validated JSON Object
    API->>API: Validate against Pydantic model ResumeData(**json)
```

#### Explanation:
By strictly passing the Pydantic schema definition to Groq with `temperature=0.2` and `response_format={"type": "json_object"}`, the model cannot return free-form conversational text. It returns validated JSON contracts that Python parses directly into typed data objects.

---

### Feature B: Latent Skill Inference via Graph Traversal

```mermaid
flowchart LR
    CandidateExplicit["Candidate Skills: ['FastAPI', 'Docker', 'PyTorch']"] --> GraphEngine["NetworkX DiGraph Engine"]

    subgraph Ontology_Traversal ["Ontology Traversal (nx.descendants)"]
        FastAPI_Node["'FastAPI'"] -->|implies| Python_Node["'Python'"]
        FastAPI_Node -->|implies| REST_Node["'REST APIs'"]
        FastAPI_Node -->|implies| Backend_Node["'Backend Development'"]

        Docker_Node["'Docker'"] -->|implies| Container_Node["'Containerization'"]
        Docker_Node -->|implies| Cloud_Node["'Cloud Infrastructure'"]

        PyTorch_Node["'PyTorch'"] -->|implies| DL_Node["'Deep Learning'"]
        PyTorch_Node -->|implies| ML_Node["'Machine Learning'"]
    end

    GraphEngine --> Ontology_Traversal
    Ontology_Traversal --> ExpandedProfile["Expanded Profile: 3 Explicit + 7 Inferred = 10 Total Competencies"]
```

#### Explanation:
A candidate who built a project using `FastAPI` might not write "REST APIs" or "Backend Development" in their resume skills list. The NetworkX engine traverses directed implication edges to infer these latent competencies automatically.

---

### Feature C: NVIDIA Cloud Semantic Vector Matching

```mermaid
flowchart TD
    CandProfile["Expanded Candidate Profile (10 Skills)"] --> NVIDIA_API["NVIDIA NIM Cloud API (/v1/embeddings)"]
    JDRequirements["JD Requirements (6 Required Skills)"] --> NVIDIA_API

    NVIDIA_API --> Model["Model: nvidia/nemotron-3-embed-1b (Cloud GPU)"]
    Model --> CandVectors["Candidate Vectors: shape=(10, 2048)"]
    Model --> JDVectors["JD Vectors: shape=(6, 2048)"]

    CandVectors & JDVectors --> CosineMatrix["Pairwise Cosine Similarity: shape=(6, 10)"]

    CosineMatrix --> RowEvaluation["For each JD Requirement i: Find max_j(Similarity[i, j])"]

    RowEvaluation --> DecisionBranch{"max similarity >= 0.40?"}
    DecisionBranch -->|Yes| Matched["Requirement i is Matched (e.g. 0.84 match)"]
    DecisionBranch -->|No| Missing["Requirement i is Missing"]

    Matched & Missing --> ScoreFormula["Match Score % = (Matched Count / Total Required) * 100"]
```

#### Explanation:
Vector embeddings capture semantic meaning rather than literal spelling. Because embeddings run on NVIDIA NIM Cloud GPUs, high-dimensional 2048-element vectors are generated in under 150 milliseconds without consuming local CPU or memory.

---

### Feature D: Visual Resume Annotation & Page Streaming

```mermaid
flowchart TD
    OrigPDF["Original Resume PDF (e.g. resume1.pdf)"] --> PyMuPDF["PyMuPDF (fitz) Engine"]
    MatchData["Match Results: Matched Skills, Projects, Profile Skills"] --> PyMuPDF

    subgraph Highlighting_Passes ["Ordered Highlighting Passes with Collision Protection"]
        Pass1["Pass 1: Green Highlights for Direct Matched Skills"]
        Pass2["Pass 2: Purple Highlights for Projects & Project Tech"]
        Pass3["Pass 3: Blue Highlights for Profile Skills"]

        Pass1 --> CollisionCheck1{"Rect overlaps existing highlighted area > 30%?"}
        CollisionCheck1 -->|No| ApplyGreen["page.add_highlight_annot(rect, color=GREEN)"]
        CollisionCheck1 -->|Yes| SkipGreen["Skip to prevent color clash"]

        ApplyGreen & SkipGreen --> Pass2
        Pass2 --> CollisionCheck2{"Rect overlaps existing?"}
        CollisionCheck2 -->|No| ApplyPurple["page.add_highlight_annot(rect, color=PURPLE)"]
        CollisionCheck2 -->|Yes| SkipPurple["Skip"]

        ApplyPurple & SkipPurple --> Pass3
        Pass3 --> CollisionCheck3{"Rect overlaps existing?"}
        CollisionCheck3 -->|No| ApplyBlue["page.add_highlight_annot(rect, color=BLUE)"]
        CollisionCheck3 -->|Yes| SkipBlue["Skip"]
    end

    PyMuPDF --> Highlighting_Passes
    Highlighting_Passes --> SaveAnnot["doc.save('temp_uploads/annotated_resume1.pdf')"]

    SaveAnnot --> ServerStreaming["FastAPI Endpoint: GET /api/pdf/page/{filename}/{page_num}"]
    ServerStreaming --> Rasterize["page.get_pixmap(dpi=150).tobytes('png')"]
    Rasterize --> ReturnImage["Response(content=img_bytes, media_type='image/png')"]
    ReturnImage --> ReactViewer["PdfViewer renders <img> card directly in React (Zero Auto-Downloads!)"]
```

#### Explanation:
By rasterizing each annotated page to a crisp 150 DPI image on demand, the browser receives pure image data. This completely bypasses the browser's PDF plugin, guaranteeing that:
1. No black or gray `#525659` boxes appear.
2. The browser never automatically downloads the PDF when viewing match results.
3. Text and highlights remain razor sharp.

---

### Feature E: GraphRAG Recruiter Assistant with Strict Guardrails

```mermaid
flowchart TD
    UserQuery["Recruiter asks: 'Why did Priyangshu score 54.5%?'"] --> API["POST /api/chat"]

    API --> FetchContext["Retrieve Context from session_db: latest_jd & candidate_data"]
    FetchContext --> BuildPrompt["Inject Context + Strict Guardrail Instructions into System Prompt"]

    BuildPrompt --> GroqCall["Call Groq Qwen 3.8 27B (temperature=0.3)"]

    GroqCall --> GuardrailCheck{"Is user asking off-topic question (code, math, jokes)?"}
    GuardrailCheck -->|Yes| StandardRefusal["'I am a recruiting assistant. I can only answer questions related to candidate evaluation.'"]
    GuardrailCheck -->|No| GroundedResponse["Synthesize structured explanation citing exact matched and missing skills"]

    StandardRefusal & GroundedResponse --> ReturnReply["Return JSON: {'reply': '...'}"]
    ReturnReply --> ChatUI["Display explanation in recruiter chat window"]
```

#### Explanation:
The GraphRAG recruiter assistant acts as an explainable auditor. It has access to the candidate's exact graph inference data, missing requirements, and match scores. The strict guardrails and `0.3` temperature setting prevent the model from drifting into hallucination or answering non-recruitment queries.

---

## ⚡ 4. 1-Click Launchers Execution Flow

```mermaid
flowchart TD
    UserClicks["User double-clicks run_all.bat"] --> EnvCheck{"Does .venv/Scripts/python.exe exist?"}

    EnvCheck -->|No| FailVenv["Echo: 'Virtual environment folder .venv was not found' -> Pause"]
    EnvCheck -->|Yes| KeyCheck{"Are GROQ_API_KEY and NVIDIA_API_KEY in .env?"}

    KeyCheck -->|Missing Keys| WarnKey["Echo WARNING: API keys missing in .env"]
    KeyCheck -->|Configured| OKKey["Echo: '[STATUS: OK] API Keys detected'"]

    WarnKey & OKKey --> SpawnBackend["Start dedicated cmd window: run_backend.bat"]
    SpawnBackend --> RunUvicorn["Execute: python -m uvicorn app.main:app --reload --port 8000"]

    RunUvicorn --> Wait3Sec["Timeout 3 seconds to let FastAPI initialize"]
    Wait3Sec --> NodeCheck{"Is Node.js and npm installed?"}

    NodeCheck -->|No| FailNode["Echo: 'Node.js is required' -> Pause"]
    NodeCheck -->|Yes| SpawnFrontend["Start dedicated cmd window: run_frontend.bat"]
    SpawnFrontend --> RunVite["Execute: npm run dev -- --port 5173"]

    RunVite --> LaunchBrowser["Start http://localhost:5173 in default browser"]
```

### 📖 Plain-English Explanation:
The `run_all.bat` launcher removes all manual terminal setup for Windows users. It automatically verifies your Python virtual environment, validates your API keys, checks that Node.js is present, opens the backend and frontend in separate dedicated windows, and launches your web browser directly to the dashboard.
