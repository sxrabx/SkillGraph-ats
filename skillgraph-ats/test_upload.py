import requests
import json

url = "http://127.0.0.1:8000/api/match"

jd_path = "data/job_description.pdf"
resume_paths = [
    "data/resume1.pdf",
    "data/resume2.pdf"
]

files = [
    ("jd_file", ("jd.pdf", open(jd_path, "rb"), "application/pdf"))
]

for path in resume_paths:
    files.append(("resume_files", (path.split("/")[-1], open(path, "rb"), "application/pdf")))

response = requests.post(url, files=files)

print(f"Status Code: {response.status_code}")
try:
    print(json.dumps(response.json(), indent=2))
except Exception:
    print(f"Server Response Body: {response.text}")