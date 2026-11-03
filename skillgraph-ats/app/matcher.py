import os
from typing import List, Dict, Any, Optional
import requests
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
from schemas import ResumeData, JobDescriptionData, Project
from graph import build_skill_graph, infer_latent_skills

load_dotenv()

# NVIDIA NIM Cloud Embeddings Configuration
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
NVIDIA_EMBED_URL = "https://integrate.api.nvidia.com/v1/embeddings"
NVIDIA_MODEL = "nvidia/nemotron-3-embed-1b"

# High-performance in-memory cache for skill embeddings (prevents redundant API calls)
_EMBEDDING_CACHE: Dict[str, np.ndarray] = {}

def get_embeddings(texts: List[str]) -> np.ndarray:
    """
    Computes text embeddings using NVIDIA NIM Cloud API with fast in-memory caching.
    Runs 100% on NVIDIA Cloud GPUs with zero redundant network requests for cached skills.
    """
    if not texts:
        return np.empty((0, 2048))

    # Identify uncached texts
    uncached_texts = []
    for t in texts:
        clean_t = t.strip()
        if clean_t and clean_t not in _EMBEDDING_CACHE:
            uncached_texts.append(clean_t)

    # Fetch uncached embeddings in batch from NVIDIA NIM
    if uncached_texts:
        api_key = os.getenv("NVIDIA_API_KEY") or NVIDIA_API_KEY
        if not api_key:
            raise ValueError("NVIDIA_API_KEY is not configured in .env")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "input": uncached_texts,
            "model": NVIDIA_MODEL,
            "input_type": "query"
        }
        
        response = requests.post(NVIDIA_EMBED_URL, headers=headers, json=payload, timeout=20)
        if response.status_code != 200:
            raise RuntimeError(f"NVIDIA NIM API Error ({response.status_code}): {response.text}")
            
        data = response.json()
        for idx, item in enumerate(data.get("data", [])):
            clean_t = uncached_texts[idx]
            _EMBEDDING_CACHE[clean_t] = np.array(item["embedding"], dtype=np.float32)

    # Assemble output array preserving original order
    results = []
    for t in texts:
        clean_t = t.strip()
        if clean_t in _EMBEDDING_CACHE:
            results.append(_EMBEDDING_CACHE[clean_t])
        else:
            # Fallback zero vector if text was whitespace only
            results.append(np.zeros((2048,), dtype=np.float32))

    return np.array(results)

# Initialize the inference graph
skill_graph = build_skill_graph()

def evaluate_candidate(
    candidate_profile: List[str], 
    required_skills: List[str], 
    threshold: float = 0.40,
    precomputed_required_vectors: Optional[np.ndarray] = None
) -> Dict[str, Any]:
    """
    Compares the candidate's expanded profile against JD requirements
    using NVIDIA Cloud Embeddings and vector cosine similarity.
    Supports precomputed JD vectors to eliminate redundant embeddings computation.
    """
    if not candidate_profile or not required_skills:
        return {"matched": [], "missing": required_skills, "score": 0.0}

    candidate_vectors = get_embeddings(candidate_profile)
    required_vectors = precomputed_required_vectors if precomputed_required_vectors is not None else get_embeddings(required_skills)
    
    sim_matrix = cosine_similarity(required_vectors, candidate_vectors)

    matched = []
    missing = []

    for i, req_skill in enumerate(required_skills):
        best_idx = int(np.argmax(sim_matrix[i]))
        best_score = float(sim_matrix[i][best_idx])
        
        if best_score >= threshold:
            matched.append({
                "required_skill": req_skill,
                "matched_with": candidate_profile[best_idx],
                "confidence": round(best_score, 2)
            })
        else:
            missing.append(req_skill)

    match_percentage = round((len(matched) / len(required_skills)) * 100, 2)
    return {"matched": matched, "missing": missing, "score": match_percentage}

def rank_candidates(candidates: List[ResumeData], jd: JobDescriptionData, top_k: int = 10) -> List[Dict[str, Any]]:
    """
    Evaluates all candidates using their graph-inferred profiles and returns the top K.
    Precomputes the JD embeddings once upfront for optimal multi-candidate throughput.
    """
    results = []

    # Precompute JD required skills vectors ONCE for the entire batch
    required_vectors = get_embeddings(jd.required_skills) if jd.required_skills else np.empty((0, 2048))

    for candidate in candidates:
        # 1. Aggregate explicit skills from their list and projects
        explicit_skills = set(candidate.skills)
        for proj in candidate.projects:
            explicit_skills.update(proj.technologies)

        # 2. Graph Inference: Expand profile using 'Implies' edges
        expanded_profile = infer_latent_skills(list(explicit_skills), skill_graph)

        # 3. Evaluate expanded profile against the JD with precomputed vectors
        evaluation = evaluate_candidate(
            candidate_profile=list(expanded_profile), 
            required_skills=jd.required_skills,
            precomputed_required_vectors=required_vectors
        )

        # Track what was directly written vs what the graph inferred
        inferred_only = expanded_profile - explicit_skills

        results.append({
            "name": candidate.candidate_name,
            "match_score": evaluation["score"],
            "explicit_skills": list(explicit_skills),
            "inferred_skills": list(inferred_only),
            "matched_requirements": evaluation["matched"],
            "missing_skills": evaluation["missing"],
            "projects": [p.model_dump() for p in candidate.projects]
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:top_k]

if __name__ == "__main__":
    target_jd = JobDescriptionData(
        role_title="Backend Engineer",
        required_skills=["Python", "Cloud Infrastructure", "CI/CD Pipelines", "Database Administration"]
    )

    test_candidate = ResumeData(
        candidate_name="Alex Doe",
        skills=["FastAPI", "PostgreSQL"],
        projects=[Project(title="Deployment", description="Setup", technologies=["Docker", "GitHub Actions"])]
    )

    top_candidates = rank_candidates([test_candidate], target_jd, top_k=1)
    for cand in top_candidates:
        print(f"Candidate: {cand['name']} | Score: {cand['match_score']}%")
