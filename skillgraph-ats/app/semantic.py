from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Import your new parser
from parser import parse_resume

model = SentenceTransformer('all-MiniLM-L6-v2')
taxonomy = ["Backend Web Frameworks", "Cloud Infrastructure", "CI/CD Pipelines", "Database Administration"]
taxonomy_embeddings = model.encode(taxonomy)

# 1. Get structured dictionary
resume_dict = parse_resume("dummy text")

# 2. Combine all extracted skills and project technologies from the dict
extracted_skills = resume_dict["skills"]
for project in resume_dict["projects"]:
    extracted_skills.extend(project["technologies"])

# 3. Run the EXACT same semantic normalization
skill_embeddings = model.encode(extracted_skills)
similarity_matrix = cosine_similarity(skill_embeddings, taxonomy_embeddings)

for i, skill in enumerate(extracted_skills):
    best_match_idx = np.argmax(similarity_matrix[i])
    score = similarity_matrix[i][best_match_idx]
    if score > 0.40:
        print(f"Raw: '{skill}' -> Mapped: '{taxonomy[best_match_idx]}'")