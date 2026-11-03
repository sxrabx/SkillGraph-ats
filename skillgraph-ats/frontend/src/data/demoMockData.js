/**
 * SkillGraph ATS — Demo Mock Data for Offline & UI Walkthrough
 */

export const sampleMatchData = {
  jd_title: "Senior Cloud & Distributed Systems Engineer",
  total_resumes_processed: 4,
  rankings: [
    {
      name: "Rohan Sahu",
      match_score: 95.4,
      role: "SDE II / Cloud Systems",
      matched_requirements: [
        { required_skill: "Container Orchestration", matched_with: "Kubernetes, Docker, Helm" },
        { required_skill: "Cloud Infrastructure", matched_with: "AWS ECS, Terraform, Prometheus" },
        { required_skill: "CI/CD Pipeline Automation", matched_with: "GitHub Actions, ArgoCD" }
      ],
      explicit_skills: ["Kubernetes", "Docker", "Terraform", "AWS", "Helm", "Prometheus", "Grafana", "Go", "Python"],
      projects: [
        { title: "Multi-Cluster Kubernetes Service Mesh", technologies: ["Kubernetes", "Istio", "Envoy", "Terraform"] },
        { title: "Automated GitOps Infrastructure Pipeline", technologies: ["ArgoCD", "Helm", "AWS EKS", "Datadog"] }
      ],
      annotated_pdf_url: null,
      summary: "Exceptional mastery of cloud infrastructure and container orchestration with 4.5 years of verifiable production experience."
    },
    {
      name: "Aditi Pradhan",
      match_score: 92.1,
      role: "Platform Engineer",
      matched_requirements: [
        { required_skill: "Infrastructure as Code", matched_with: "Terraform, CloudFormation" },
        { required_skill: "Cloud Architecture", matched_with: "AWS Lambda, API Gateway, DynamoDB" },
        { required_skill: "Security & Compliance", matched_with: "IAM Policies, SOC2 Hardening" }
      ],
      explicit_skills: ["AWS", "Terraform", "CI/CD", "Docker", "Python", "Linux", "CloudFormation"],
      projects: [
        { title: "Serverless Event-Driven Telemetry Pipeline", technologies: ["AWS Lambda", "Kinesis", "Terraform"] },
        { title: "Automated Multi-Region IAM Enforcement", technologies: ["AWS IAM", "CloudTrail", "Python"] }
      ],
      annotated_pdf_url: null,
      summary: "Platform specialist with heavy background in declarative cloud provisioning and enterprise compliance."
    },
    {
      name: "Sumit Kar",
      match_score: 89.3,
      role: "DevOps Engineer",
      matched_requirements: [
        { required_skill: "Linux Systems Engineering", matched_with: "Kernel Tuning, Bash, Systemd" },
        { required_skill: "Containerization", matched_with: "Docker, Helm, Kubernetes" }
      ],
      explicit_skills: ["Linux", "Kubernetes", "Helm", "Prometheus", "Bash", "Ansible", "Docker"],
      projects: [
        { title: "High-Availability Bare Metal Kubernetes", technologies: ["Kubernetes", "Cilium", "eBPF", "Linux"] }
      ],
      annotated_pdf_url: null,
      summary: "Reliability engineer with deep understanding of operating systems internals and bare-metal cluster management."
    },
    {
      name: "Mehul Das",
      match_score: 88.0,
      role: "SDE II",
      matched_requirements: [
        { required_skill: "Observability & Telemetry", matched_with: "OpenTelemetry, Jaeger, Grafana" },
        { required_skill: "Microservices", matched_with: "Golang, gRPC, Docker, GCP" }
      ],
      explicit_skills: ["GCP", "Golang", "Docker", "OpenTelemetry", "Grafana", "Prometheus", "gRPC"],
      projects: [
        { title: "Distributed Telemetry Ingestion Engine", technologies: ["Golang", "gRPC", "GCP Cloud Run"] }
      ],
      annotated_pdf_url: null,
      summary: "Strong systems developer with proven expertise in distributed tracing and telemetry data pipelines."
    }
  ]
}

export function getDemoChatReply(candidateName, question) {
  const q = question.toLowerCase()
  if (q.includes("why") || q.includes("score") || q.includes("match")) {
    return `Candidate ${candidateName} received a top-tier match rating because the SkillGraph DAG ontology deduced strong latent competencies. Their experience with Docker, Terraform, and Kubernetes mathematically mapped to the job's Cloud Infrastructure requirements with a 0.94 cosine similarity score in the 2048-dim NVIDIA embedding space.`
  }
  if (q.includes("gap") || q.includes("missing") || q.includes("weak")) {
    return `Based on verified PDF extraction, ${candidateName} has minor gaps in direct Kafka streaming and GraphQL schemas. However, their strong background in distributed systems and Go demonstrates high adaptability to fill these gaps within 2-3 weeks.`
  }
  if (q.includes("project") || q.includes("experience")) {
    return `${candidateName} has documented production projects including Multi-Cluster Service Meshes and Automated GitOps Infrastructure Pipelines, managing large-scale workloads across AWS and Kubernetes.`
  }
  return `SkillGraph AI Analysis for ${candidateName}: The candidate demonstrates verified engineering competency in Cloud Architecture, Container Orchestration, and Automated CI/CD. All evidence is grounded strictly in their uploaded resume.`
}

