import os
import json
from pathlib import Path
from dotenv import load_dotenv
from pypdf import PdfReader
from groq import Groq
from schemas import ResumeData, JobDescriptionData

# Explicitly load .env from the project root
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Initialize Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def extract_text_from_pdf(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    return "\n".join([page.extract_text() or "" for page in reader.pages])

def parse_resume(raw_text: str) -> dict:
    prompt = f"""
    You are an expert technical recruiter. Extract structured information from the resume text below.
    Return ONLY a raw JSON object matching this schema:
    {json.dumps(ResumeData.model_json_schema())}

    Resume Text:
    {raw_text}
    """
    
    response = client.chat.completions.create(
        model="qwen/qwen3.8-27b",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.2
    )
    return json.loads(response.choices[0].message.content)

def parse_jd(raw_text: str) -> dict:
    prompt = f"""
    You are an expert technical recruiter. Extract structured role requirements from the job description below.
    Return ONLY a raw JSON object matching this schema:
    {json.dumps(JobDescriptionData.model_json_schema())}

    JD Text:
    {raw_text}
    """
    
    response = client.chat.completions.create(
        model="qwen/qwen3.8-27b",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.2
    )
    return json.loads(response.choices[0].message.content)