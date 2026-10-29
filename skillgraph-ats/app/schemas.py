from typing import List, Optional
from pydantic import BaseModel, Field

class Project(BaseModel):
    title: str
    description: str
    technologies: List[str] = Field(default_factory=list)

class Experience(BaseModel):
    role: str
    company: str
    duration: Optional[str] = None
    bullet_points: List[str] = Field(default_factory=list)

class ResumeData(BaseModel):
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)

class JobDescriptionData(BaseModel):
    role_title: str
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    min_years_experience: Optional[int] = None
    responsibilities: List[str] = Field(default_factory=list)