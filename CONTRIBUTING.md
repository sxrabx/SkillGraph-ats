# Contributing to SkillGraph ATS

Thank you for your interest in contributing to **SkillGraph ATS**! We welcome contributions from developers, machine learning engineers, and talent acquisition domain experts.

---

## 🛠️ Development Setup

1. **Fork & Clone:**
   ```bash
   git clone https://github.com/your-username/skillgraph-ats.git
   cd skillgraph-ats
   ```

2. **Backend Setup:**
   ```bash
   cd skillgraph-ats
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate

   pip install -r requirements.txt
   cp .env.example .env
   # Add your GROQ_API_KEY and NVIDIA_API_KEY to .env
   ```

3. **Frontend Setup:**
   ```bash
   cd skillgraph-ats/frontend
   npm install
   npm run dev
   ```

4. **1-Click Launch (Windows):**
   Simply double-click `run_all.bat` in the workspace root.

---

## 🌿 Branching Strategy & Git Workflow

- Create feature branches from `main`:
  ```bash
  git checkout -b feature/your-feature-name
  ```
- Use semantic, descriptive commit messages:
  - `feat(matcher): add weighted cosine scoring for preferred skills`
  - `fix(annotator): handle rotation in multi-page PDF bounding boxes`
  - `docs(api): update Swagger endpoint response schemas`
- Keep Pull Requests focused and include test verification steps.

---

## 🧠 Expanding the Skill Ontology Graph

The Directed Acyclic Graph (DAG) ontology resides in [`skillgraph-ats/app/graph.py`](file:///d:/MAJOR%20PROJECT%20-%20Copy/skillgraph-ats/app/graph.py).

To contribute new skill implications:
1. Locate `build_skill_graph()`.
2. Add directed edges indicating that knowing child skill $A$ implies parent competency $B$:
   ```python
   # Example: Knowing Rust implies Systems Programming and Memory Safety
   graph.add_edge("Rust", "Systems Programming")
   graph.add_edge("Rust", "Memory Safety")
   ```
3. Test using `python app/matcher.py` to ensure acyclic integrity and verify inference propagation.

---

## 🧪 Testing Guidelines

Before opening a PR:
1. Verify the backend integration endpoint:
   ```bash
   python skillgraph-ats/test_upload.py
   ```
2. Verify frontend compilation:
   ```bash
   cd skillgraph-ats/frontend
   npm run build
   ```
3. Ensure no secret API keys or temporary PDFs are staged.

---

## 📄 Code of Conduct

Be respectful, constructive, and collaborative in all issues, discussions, and code reviews.
