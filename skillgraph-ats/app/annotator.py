import os
import re
from typing import List, Dict, Any, Union
import pymupdf

# RGB Color Palettes (0.0 to 1.0)
COLOR_MATCHED = [0.35, 0.88, 0.35]     # Vibrant Green for Matched JD Skills
COLOR_SKILL = [0.45, 0.75, 1.0]        # Sky Blue for Candidate Skills
COLOR_PROJECT = [0.85, 0.60, 0.95]     # Soft Purple for Projects & Tech

def rects_overlap(r1, r2, threshold=0.3):
    """Checks if two rectangles have significant intersection."""
    intersect = r1 & r2
    if intersect.is_empty:
        return False
    area_intersect = intersect.get_area()
    min_area = min(r1.get_area(), r2.get_area())
    if min_area == 0:
        return False
    return (area_intersect / min_area) > threshold

def highlight_terms(page, terms: List[str], color: List[float], highlighted_rects: list):
    """
    Finds and highlights terms on a single page, avoiding overlapping highlights.
    """
    for term in terms:
        if not term or len(term.strip()) < 2:
            continue
        cleaned_term = term.strip()
        # Search page for occurrences
        try:
            matches = page.search_for(cleaned_term)
        except Exception:
            continue
            
        for rect in matches:
            # Check overlap with any already highlighted area
            if any(rects_overlap(rect, existing) for existing in highlighted_rects):
                continue
                
            try:
                annot = page.add_highlight_annot(rect)
                annot.set_colors(stroke=color)
                annot.update()
                highlighted_rects.append(rect)
            except Exception:
                pass

def annotate_resume_pdf(
    input_pdf_path: str,
    output_pdf_path: str,
    matched_skills: List[str],
    all_skills: List[str],
    projects: List[Dict[str, Any]]
) -> str:
    """
    Generates an annotated version of candidate's PDF with color-coded highlights:
    - Green: Direct JD Match Skills
    - Purple: Projects and Project Technologies
    - Blue: Other Extracted Skills
    """
    if not os.path.exists(input_pdf_path):
        raise FileNotFoundError(f"Source PDF not found: {input_pdf_path}")

    doc = pymupdf.open(input_pdf_path)
    
    # Collect project titles and project technologies
    project_terms = []
    for proj in projects:
        if isinstance(proj, dict):
            if proj.get("title"):
                project_terms.append(proj["title"])
            if proj.get("technologies"):
                project_terms.extend(proj["technologies"])
        elif hasattr(proj, "title"):
            if proj.title:
                project_terms.append(proj.title)
            if hasattr(proj, "technologies") and proj.technologies:
                project_terms.extend(proj.technologies)

    # Clean skill lists
    clean_matched = [s for s in matched_skills if s]
    clean_projects = [p for p in project_terms if p and p not in clean_matched]
    clean_other_skills = [
        s for s in all_skills 
        if s and s not in clean_matched and s not in clean_projects
    ]

    for page in doc:
        highlighted_rects = []
        
        # 1. First priority: Green for Matched Skills
        highlight_terms(page, clean_matched, COLOR_MATCHED, highlighted_rects)
        
        # 2. Second priority: Purple for Projects & Project Tech
        highlight_terms(page, clean_projects, COLOR_PROJECT, highlighted_rects)
        
        # 3. Third priority: Blue for Other Skills
        highlight_terms(page, clean_other_skills, COLOR_SKILL, highlighted_rects)

    os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)
    doc.save(output_pdf_path)
    doc.close()
    
    return output_pdf_path
