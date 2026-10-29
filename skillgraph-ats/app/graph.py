import networkx as nx
from typing import List, Set

def build_skill_graph() -> nx.DiGraph:
    """
    Builds a directed graph mapping specific tools to broader competencies.
    An edge from A to B means "Knowing A implies knowing B".
    """
    G = nx.DiGraph()
    
    # Define "Implies" relationships
    edges = [
        # Cloud & DevOps
        ("Docker", "Containerization"),
        ("Docker", "Cloud Infrastructure"),
        ("Kubernetes", "Containerization"),
        ("GitHub Actions", "CI/CD Pipelines"),
        ("Jenkins", "CI/CD Pipelines"),
        
        # Backend & Databases
        ("FastAPI", "Python"),
        ("FastAPI", "REST APIs"),
        ("FastAPI", "Backend Development"),
        ("PostgreSQL", "SQL"),
        ("PostgreSQL", "Database Administration"),
    ]
    
    G.add_edges_from(edges)
    return G

def infer_latent_skills(extracted_skills: List[str], graph: nx.DiGraph) -> Set[str]:
    """
    Traverses the graph to find all implied latent skills based on explicit skills.
    """
    inferred_skills = set(extracted_skills)
    
    for skill in extracted_skills:
        # If the skill exists in our graph, find all skills it implies (successors)
        if graph.has_node(skill):
            # nx.descendants finds all nodes reachable from the given skill
            implied = nx.descendants(graph, skill)
            inferred_skills.update(implied)
            
    return inferred_skills

if __name__ == "__main__":
    G = build_skill_graph()
    
    # Simulate a candidate who only listed specific tools, not broad categories
    candidate_explicit_skills = ["FastAPI", "Docker", "GitHub Actions"]
    
    expanded_profile = infer_latent_skills(candidate_explicit_skills, G)
    
    print(f"Explicit Skills Found: {candidate_explicit_skills}")
    print(f"Total Inferred Profile: {expanded_profile}")