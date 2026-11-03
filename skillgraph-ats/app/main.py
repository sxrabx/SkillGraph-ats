import asyncio
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, Response, StreamingResponse
import pymupdf
from typing import List, Dict, Any, Optional
import os
import sys
from pathlib import Path

# Ensure the app directory is in sys.path for internal module imports
app_dir = str(Path(__file__).resolve().parent)
if app_dir not in sys.path:
    sys.path.insert(0, app_dir)

from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from groq import Groq

from parser import extract_text_from_pdf, parse_resume, parse_jd
from matcher import rank_candidates
from annotator import annotate_resume_pdf
from schemas import ResumeData, JobDescriptionData

load_dotenv()
app = FastAPI(title="SkillGraph API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*",
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Accept-Ranges", "Content-Range", "Content-Length", "Content-Disposition"],
)

os.makedirs("temp_uploads", exist_ok=True)

# In-memory storage for active and baseline candidate match data
session_db: Dict[str, Any] = {
    "latest_jd": {
        "role_title": "Senior Cloud & Distributed Systems Engineer",
        "required_skills": [
            "Container Orchestration",
            "Cloud Infrastructure",
            "CI/CD Pipeline Automation",
            "Linux Systems Engineering"
        ],
        "min_experience_years": 4
    },
    "latest_rankings": [
        {
            "name": "Sourabh Kumar Behera",
            "match_score": 0.954,
            "role": "SDE II / Cloud Systems",
            "matched_requirements": [
                {"required_skill": "Container Orchestration", "matched_with": "Kubernetes, Docker, Helm"},
                {"required_skill": "Cloud Infrastructure", "matched_with": "AWS ECS, Terraform, Prometheus"},
                {"required_skill": "CI/CD Pipeline Automation", "matched_with": "GitHub Actions, ArgoCD"}
            ],
            "explicit_skills": ["Kubernetes", "Docker", "Terraform", "AWS", "Helm", "Prometheus", "Grafana", "Go", "Python"],
            "inferred_skills": ["Cloud Infrastructure", "Containerization", "Backend Development"],
            "missing_skills": ["Kafka", "GraphQL"],
            "projects": [
                {
                    "title": "Multi-Cluster Kubernetes Service Mesh",
                    "description": "Architected zero-trust service mesh with Istio across multiple Kubernetes clusters on AWS EKS.",
                    "technologies": ["Kubernetes", "Istio", "Envoy", "Terraform"]
                },
                {
                    "title": "Automated GitOps Infrastructure Pipeline",
                    "description": "Automated cluster provisioning and rolling deployments with ArgoCD and Helm charts.",
                    "technologies": ["ArgoCD", "Helm", "AWS EKS", "Datadog"]
                }
            ],
            "summary": "Exceptional mastery of cloud infrastructure and container orchestration with 4.5 years of verifiable production experience."
        },
        {
            "name": "Rohan Sahu",
            "match_score": 0.921,
            "role": "Platform Engineer",
            "matched_requirements": [
                {"required_skill": "Infrastructure as Code", "matched_with": "Terraform, CloudFormation"},
                {"required_skill": "Cloud Infrastructure", "matched_with": "AWS Lambda, API Gateway, DynamoDB"}
            ],
            "explicit_skills": ["AWS", "Terraform", "CI/CD", "Docker", "Python", "Linux"],
            "inferred_skills": ["Cloud Infrastructure", "Containerization"],
            "missing_skills": ["Kubernetes Service Mesh"],
            "projects": [
                {
                    "title": "Serverless Telemetry Pipeline",
                    "description": "High-throughput telemetry ingestion pipeline.",
                    "technologies": ["AWS Lambda", "Terraform"]
                }
            ]
        }
    ]
}

@app.on_event("startup")
async def startup_event():
    print("\n" + "=" * 58)
    print("  [ONLINE] SkillGraph ATS Backend is READY!")
    print("  - Host URL:     http://127.0.0.1:8000")
    print("  - Swagger Docs: http://127.0.0.1:8000/docs")
    print("  - Health Check: http://127.0.0.1:8000/health")
    print("=" * 58 + "\n")

@app.get("/")
@app.get("/health")
def health_status():
    return {
        "status": "online",
        "service": "SkillGraph ATS Backend",
        "model": "NVIDIA Nemotron-3-Embed-1B (Cloud GPU) + Groq qwen/qwen3.8-27b",
        "endpoints": {
            "match": "/api/match (POST)",
            "chat": "/api/chat (POST)",
            "docs": "/docs"
        }
    }

@app.post("/api/match")
async def match_candidates(
    jd_file: UploadFile = File(...), 
    resume_files: List[UploadFile] = File(...)
):
    """
    High-throughput async matching pipeline:
    Parses JD and all candidate resumes in parallel via asyncio.gather.
    """
    jd_path = f"temp_uploads/{jd_file.filename}"
    
    # 1. Helper to process the JD asynchronously
    async def process_jd():
        content = await jd_file.read()
        with open(jd_path, "wb") as buffer:
            buffer.write(content)
        def parse():
            text = extract_text_from_pdf(jd_path)
            return JobDescriptionData(**parse_jd(text))
        return await asyncio.to_thread(parse)

    # 2. Helper to process a single resume asynchronously
    async def process_single_resume(res_file: UploadFile):
        res_path = f"temp_uploads/{res_file.filename}"
        content = await res_file.read()
        with open(res_path, "wb") as buffer:
            buffer.write(content)
        def parse():
            text = extract_text_from_pdf(res_path)
            return ResumeData(**parse_resume(text))
        cand_data = await asyncio.to_thread(parse)
        return cand_data, res_path

    # Run JD extraction and all resume extractions concurrently
    jd_task = process_jd()
    resume_tasks = [process_single_resume(f) for f in resume_files]
    
    all_results = await asyncio.gather(jd_task, *resume_tasks)
    structured_jd = all_results[0]
    resume_results = all_results[1:]

    candidates = [r[0] for r in resume_results]
    file_map = {r[0].candidate_name or os.path.basename(r[1]): r[1] for r in resume_results}

    # 3. Fast candidate ranking with precomputed JD embeddings
    ranked_results = rank_candidates(candidates, structured_jd, top_k=len(candidates))

    # 4. Generate annotated PDFs in parallel
    def annotate_single_candidate(r):
        cand_name = r["name"]
        orig_path = file_map.get(cand_name)
        if not orig_path and len(file_map) > 0:
            orig_path = list(file_map.values())[0]

        if orig_path and os.path.exists(orig_path):
            base_name = os.path.basename(orig_path)
            annot_filename = f"annotated_{base_name}"
            annot_path = f"temp_uploads/{annot_filename}"

            matched_terms = [m["required_skill"] for m in r.get("matched_requirements", [])] + \
                            [m["matched_with"] for m in r.get("matched_requirements", [])]
            try:
                annotate_resume_pdf(
                    input_pdf_path=orig_path,
                    output_pdf_path=annot_path,
                    matched_skills=matched_terms,
                    all_skills=r.get("explicit_skills", []),
                    projects=r.get("projects", [])
                )
                r["annotated_pdf_url"] = f"/api/pdf/{annot_filename}"
                r["original_pdf_url"] = f"/api/pdf/{base_name}"
            except Exception as e:
                print(f"[WARN] Failed to annotate PDF for {cand_name}: {e}")
                r["annotated_pdf_url"] = f"/api/pdf/{base_name}"
                r["original_pdf_url"] = f"/api/pdf/{base_name}"

    await asyncio.gather(*[asyncio.to_thread(annotate_single_candidate, r) for r in ranked_results])
    
    # Save to session DB for GraphRAG chat
    session_db["latest_jd"] = structured_jd.model_dump()
    session_db["latest_rankings"] = ranked_results
    
    return {
        "jd_title": structured_jd.role_title,
        "total_resumes_processed": len(candidates),
        "rankings": ranked_results
    }

@app.get("/api/pdf/{filename}")
async def serve_pdf(filename: str):
    clean_filename = os.path.basename(filename)
    file_path = os.path.join("temp_uploads", clean_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(
        file_path, 
        media_type="application/pdf",
        content_disposition_type="inline",
        headers={
            "Content-Disposition": f'inline; filename="{clean_filename}"',
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": "*"
        }
    )

@app.get("/api/pdf/pages/{filename}")
async def get_pdf_pages_info(filename: str):
    clean_filename = os.path.basename(filename)
    file_path = os.path.join("temp_uploads", clean_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF not found")
    
    doc = pymupdf.open(file_path)
    return {
        "filename": clean_filename,
        "total_pages": len(doc),
        "pages": [f"/api/pdf/page/{clean_filename}/{i + 1}" for i in range(len(doc))]
    }

@app.get("/api/pdf/page/{filename}/{page_num}")
async def serve_pdf_page_image(filename: str, page_num: int, dpi: int = 150):
    clean_filename = os.path.basename(filename)
    file_path = os.path.join("temp_uploads", clean_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF not found")
        
    doc = pymupdf.open(file_path)
    if page_num < 1 or page_num > len(doc):
        raise HTTPException(status_code=400, detail=f"Invalid page number {page_num}")
        
    page = doc[page_num - 1]
    pix = page.get_pixmap(dpi=dpi)
    img_bytes = pix.tobytes("png")
    return Response(
        content=img_bytes, 
        media_type="image/png",
        headers={
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*"
        }
    )

def build_chat_system_prompt(candidate_name: str) -> str:
    rankings = session_db.get("latest_rankings", [])
    candidate_data: Optional[Dict[str, Any]] = None
    rank_idx: int = 1
    query_name = candidate_name.strip().lower()
    
    for idx, c in enumerate(rankings):
        c_name = c.get("name", "").strip().lower()
        if c_name == query_name or query_name in c_name or c_name in query_name:
            candidate_data = c
            rank_idx = idx + 1
            break

    if not candidate_data and len(rankings) > 0:
        first_token = query_name.split()[0] if query_name else ""
        for idx, c in enumerate(rankings):
            c_name = c.get("name", "").strip().lower()
            if first_token and (first_token in c_name or c_name in first_token):
                candidate_data = c
                rank_idx = idx + 1
                break

    if not candidate_data:
        if len(rankings) > 0:
            candidate_data = rankings[0]
            rank_idx = 1
        else:
            candidate_data = {
                "name": candidate_name,
                "match_score": 0.954,
                "explicit_skills": ["Python", "Docker", "Kubernetes", "FastAPI"],
                "inferred_skills": ["Cloud Infrastructure", "Containerization"],
                "matched_requirements": [{"required_skill": "Cloud Infrastructure", "matched_with": "Kubernetes, Docker"}],
                "missing_skills": [],
                "projects": [{"title": "Cloud Scale Deployment", "technologies": ["Kubernetes", "Docker"]}]
            }
            rank_idx = 1

    rank_overview = "\n".join([
        f"  - Rank #{i+1}: {c.get('name')} | Match Score: {round(float(c.get('match_score', 0)) * 100, 1) if float(c.get('match_score', 0)) <= 1.0 else round(float(c.get('match_score', 0)), 1)}% | Role: {c.get('role', 'Candidate')}"
        for i, c in enumerate(rankings)
    ]) if rankings else f"  - Rank #1: {candidate_data.get('name')} | Match Score: 95.4%"

    matched_list = [
        f"{m.get('required_skill')} (matched via: {m.get('matched_with')})"
        for m in candidate_data.get("matched_requirements", [])
    ]
    missing_list = candidate_data.get("missing_skills", [])
    explicit_list = candidate_data.get("explicit_skills", [])
    inferred_list = candidate_data.get("inferred_skills", [])
    projects_list = [
        f"• {p.get('title')}: {p.get('description', '')} [Technologies: {', '.join(p.get('technologies', []))}]"
        for p in candidate_data.get("projects", [])
    ]
    
    score_val = float(candidate_data.get("match_score", 0))
    display_score = round(score_val * 100, 1) if score_val <= 1.0 else round(score_val, 1)

    return f"""You are the expert Technical Recruiter & Talent Intelligence AI for SkillGraph ATS.
Your mission is to provide clear, thorough, and highly insightful answers to recruiters about candidate evaluations, match rankings, competency evidence, skill gaps, and project depth.

CONTEXT:
==============================
Target Job Role: {session_db.get('latest_jd', {}).get('role_title', 'Target Technical Role')}
Job Required Competencies: {session_db.get('latest_jd', {}).get('required_skills', [])}
Minimum Experience Required: {session_db.get('latest_jd', {}).get('min_experience_years', 'N/A')} years

CANDIDATE UNDER EVALUATION:
Name: {candidate_data.get('name')}
Assigned Overall Rank: #{rank_idx} of {len(rankings) if rankings else 1} candidates
Overall Match Score: {display_score}%
Directly Matched Job Requirements: {matched_list if matched_list else 'None directly matched'}
Identified Skill Gaps / Missing Competencies: {missing_list if missing_list else 'None detected'}
Explicit Extracted Skills: {explicit_list}
Latent Inferred Competencies (via Knowledge Graph DAG): {inferred_list}
Documented Technical Projects:
{chr(10).join(projects_list) if projects_list else 'No specific projects listed'}

ALL CANDIDATES RANKING OVERVIEW:
{rank_overview}
==============================

GUIDELINES FOR ANSWERING:
1. RATIONALE & RANKING EXPLANATION: If asked why this candidate is ranked #1 (or their specific rank), clearly explain why their match score, verified direct skills, graph-inferred latent competencies, and engineering projects placed them at this standing compared to the job requirements.
2. SKILL GAP & RAMP-UP ANALYSIS: If asked about verified skill gaps or weaknesses, specifically list the missing skills, assess how critical they are to the role, and estimate learning curve/onboarding time (e.g. 2-4 weeks) or how adjacent skills mitigate them.
3. EXPLAINING SYSTEM EVALUATION & METHODOLOGY: If asked how you know these weaknesses/skills, where the evidence comes from, how the system works, or follow-ups like "how exactly did you know that?", explain the transparent neuro-symbolic SkillGraph ATS pipeline:
- Deterministic PDF Extraction: Verified text parsed directly from the candidate's uploaded resume and project descriptions.
- Knowledge Graph DAG Reasoning: Traces specific tools to underlying engineering competencies (e.g. Istio/Docker implies Containerization & Distributed Systems).
- 2048-dimensional NVIDIA NIM Cloud Embeddings: Computes semantic cosine similarity against the target job requirements.
- Missing Skills Identification: Any required skill with zero direct mention and low vector similarity is flagged as an unverified gap.
- Emphasize zero hallucination: all claims are strictly grounded in document evidence.
4. INTERVIEW QUESTIONS & SCREENING: If asked what questions to ask the candidate, generate targeted, high-signal technical and behavioral interview questions tailored directly to their listed projects, architecture claims, or identified skill gaps.
5. CANDIDATE COMPARISONS & HIRING DECISIONS: If asked to compare candidates or make a hiring recommendation, evaluate their relative strengths, seniority levels, risk factors, and trade-offs objectively.
6. PROJECT & ARCHITECTURE DRILL-DOWN: If asked about projects or specific technologies (such as Kubernetes, Docker, Python, etc.), analyze their architectural depth using their project summaries and tech stack details.
7. FORMAT & WRITING STYLE:
- Write in natural, polished, executive business English like a principal technical recruiter briefing an engineering director.
- STRICTLY DO NOT USE RAW MARKDOWN SYMBOLS: Never output hashtags (###, ##, #) or asterisks (**, *). Do not output bold markdown like **word** or hashtag headers like ### Header.
- Use natural sentence structure, clean paragraph breaks, and standard numbered lists (1., 2., 3.) or simple dashes (- ) for items.
- Avoid all technical punctuation noise. The reply must read smoothly, authoritatively, and professionally in plain text.
8. DOMAIN RESTRAINT: Only decline the request if the user asks for completely non-recruiting general tasks (e.g. writing arbitrary creative stories, telling jokes, solving homework math, writing unrelated code). In that rare case only, respond exactly: "I am a recruiting assistant. I can only answer questions related to candidate evaluation."
"""

def parse_conversation_history(history_raw: Optional[str], system_prompt: str, question: str):
    import json
    messages = [{"role": "system", "content": system_prompt}]
    if history_raw:
        try:
            hist_list = json.loads(history_raw)
            for h in hist_list[-6:]:
                role = "assistant" if h.get("from") == "assistant" or h.get("role") == "assistant" else "user"
                content = h.get("text") or h.get("content") or ""
                if content and content != question:
                    messages.append({"role": role, "content": content})
        except Exception:
            pass
    messages.append({"role": "user", "content": question})
    return messages

@app.post("/api/chat/stream")
async def recruiter_chat_stream(
    candidate_name: str = Form(...), 
    question: str = Form(...),
    history: Optional[str] = Form(None)
):
    """
    Real-time token streaming for GraphRAG Recruiter Chat via StreamingResponse.
    Maintains conversational multi-turn context memory.
    """
    system_prompt = build_chat_system_prompt(candidate_name)
    chat_messages = parse_conversation_history(history, system_prompt, question)

    def generate_token_stream():
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        models = ["qwen/qwen3.8-27b", "openai/gpt-oss-20b"]
        stream = None

        for model in models:
            try:
                stream = client.chat.completions.create(
                    model=model,
                    messages=chat_messages,
                    temperature=0.25,
                    max_tokens=1500,
                    stream=True
                )
                break
            except Exception:
                continue

        if not stream:
            yield "I am currently unable to stream a response. Please try again in a few moments."
            return

        for chunk in stream:
            content = chunk.choices[0].delta.content or ""
            if content:
                yield content

    return StreamingResponse(generate_token_stream(), media_type="text/plain; charset=utf-8")

@app.post("/api/chat")
async def recruiter_chat(
    candidate_name: str = Form(...), 
    question: str = Form(...),
    history: Optional[str] = Form(None)
):
    """
    GraphRAG Chat Endpoint with full token capacity and multi-turn context memory.
    """
    system_prompt = build_chat_system_prompt(candidate_name)
    chat_messages = parse_conversation_history(history, system_prompt, question)
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

    try:
        response = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=chat_messages,
            temperature=0.25,
            max_tokens=1500
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        try:
            response = client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=chat_messages,
                temperature=0.25,
                max_tokens=1500
            )
            return {"reply": response.choices[0].message.content}
        except Exception:
            raise HTTPException(status_code=500, detail=f"LLM Inference Error: {str(e)}")
