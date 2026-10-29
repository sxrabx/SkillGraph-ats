from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, Response
import pymupdf
from typing import List
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
# -------------------------------------------------------------------------



os.makedirs("temp_uploads", exist_ok=True)

# Temporary in-memory storage so the chat endpoint can access the latest match data
session_db = {}

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
    jd_path = f"temp_uploads/{jd_file.filename}"
    with open(jd_path, "wb") as buffer:
        buffer.write(await jd_file.read())
    
    jd_text = extract_text_from_pdf(jd_path)
    structured_jd = JobDescriptionData(**parse_jd(jd_text))

    candidates = []
    file_map = {}
    for res_file in resume_files:
        res_path = f"temp_uploads/{res_file.filename}"
        with open(res_path, "wb") as buffer:
            buffer.write(await res_file.read())
        
        res_text = extract_text_from_pdf(res_path)
        cand_data = ResumeData(**parse_resume(res_text))
        candidates.append(cand_data)
        file_map[cand_data.candidate_name or res_file.filename] = res_path

    ranked_results = rank_candidates(candidates, structured_jd, top_k=len(candidates))

    # Generate annotated PDFs with color-coded skill & project highlights
    for r in ranked_results:
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

@app.post("/api/chat")
async def recruiter_chat(candidate_name: str = Form(...), question: str = Form(...)):
    """
    GraphRAG Chat Endpoint with strict domain guardrails.
    """
    if "latest_rankings" not in session_db:
        raise HTTPException(status_code=400, detail="Please run a match first.")
    
    # Locate the requested candidate's data
    candidate_data = next((c for c in session_db["latest_rankings"] if c["name"] == candidate_name), None)
    if not candidate_data:
        raise HTTPException(status_code=404, detail=f"Candidate {candidate_name} not found in latest match.")

    # Apply strict prompt engineering boundaries
    system_prompt = f"""
    You are an AI match-explanation assistant for technical recruiters.
    Your objective is to explain candidate match scores based on our Graph Inference Engine data.
    
    CONTEXT DATA:
    - Job Requirements: {session_db['latest_jd']}
    - Candidate Profile & Score: {candidate_data}
    
    STRICT GUARDRAILS:
    1. You must ONLY answer questions related to this specific candidate's skills, gaps, or fit for the role.
    2. If the user asks you to write code, tell a joke, solve math, or answer general knowledge questions, you MUST refuse and reply exactly: "I am a recruiting assistant. I can only answer questions related to candidate evaluation."
    3. Do not hallucinate skills; only reference the 'explicit_skills' or 'inferred_skills' provided in the context data.
    """

    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    response = client.chat.completions.create(
        model="qwen/qwen3.8-27b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ],
        temperature=0.3
    )

    return {"reply": response.choices[0].message.content}