import os
import json
import time
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

# Primary and fallback models for high-throughput zero-downtime extraction
PRIMARY_MODEL = "openai/gpt-oss-20b"
FALLBACK_MODEL = "qwen/qwen3.8-27b"

def extract_text_from_pdf(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    return "\n".join([page.extract_text() or "" for page in reader.pages])

def _call_groq_json_with_failover(prompt: str) -> dict:
    models = [PRIMARY_MODEL, FALLBACK_MODEL]
    last_err = None

    for model in models:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            last_err = e
            continue

    # Brief backoff retry in case of transient free-tier OTPM rate limits
    time.sleep(2.5)
    for model in models:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            last_err = e
            continue

    raise RuntimeError(f"All LLM extraction models failed: {last_err}")

def parse_resume(raw_text: str) -> dict:
    prompt = f"""
    You are an expert technical recruiter. Extract structured information from the resume text below.
    Return ONLY a raw JSON object matching this schema:
    {json.dumps(ResumeData.model_json_schema())}

    Resume Text:
    {raw_text}
    """
    return _call_groq_json_with_failover(prompt)

def parse_jd(raw_text: str) -> dict:
    prompt = f"""
    You are an expert technical recruiter. Extract structured role requirements from the job description below.
    Return ONLY a raw JSON object matching this schema:
    {json.dumps(JobDescriptionData.model_json_schema())}

    JD Text:
    {raw_text}
    """
    return _call_groq_json_with_failover(prompt)
