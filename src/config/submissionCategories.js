/**
 * Comprehensive Submission Category Configuration Registry
 * Place this file at: frontend/src/config/submissionCategories.js
 *
 * Defines field structures, enabled evidence types, category-specific fields,
 * readiness weights, and AI audit hints for all 10 supported service categories.
 */

export const SUBMISSION_CATEGORIES = Object.freeze({
  // 1. Software Development
  software: {
    id: "software",
    label: "Software Development",
    icon: "terminal",
    color: "#2563eb",
    bgGradient: "linear-gradient(135deg,#0f172a,#1e3a8a)",
    sections: [
      { id: "deliverables", title: "1. Scope Deliverables & Provider Claims", type: "deliverables" },
      { id: "evidence", title: "2. Source Code & API Evidence", type: "evidence" },
      { id: "testing", title: "3. Testing & Code Coverage", type: "testing" },
      { id: "summary", title: "4. Submission Summary & Release Notes", type: "summary" },
    ],
    evidenceTypes: [
      {
        id: "repository",
        type: "repository",
        source_type: "url",
        label: "Source Code Repository URL",
        icon: "code",
        placeholder: "https://github.com/org/software-repo",
        description: "Git repository link containing source code implementation",
        recommended: true,
      },
      {
        id: "staging",
        type: "staging",
        source_type: "url",
        label: "Staging / Application Preview URL",
        icon: "public",
        placeholder: "https://staging-api.example.com",
        description: "Deployed application preview or API endpoint",
        recommended: true,
      },
      {
        id: "documentation",
        type: "documentation",
        source_type: "url",
        label: "API / Technical Documentation URL",
        icon: "description",
        placeholder: "https://docs.example.com or Swagger URL",
        description: "API specifications or architecture documentation",
        recommended: false,
      },
    ],
    testing: {
      enabled: true,
      label: "Were unit/integration tests executed?",
      defaultPerformed: true,
      summaryPlaceholder: "Test summary (e.g., 140/140 unit tests passing, 88% statement coverage)",
      reportUrlPlaceholder: "Automated test report or CI run URL",
    },
    readinessRules: {
      weights: { deliverables: 40, repository: 30, staging: 15, testing: 15 },
      recommendedTypes: ["repository", "staging"],
    },
    auditHints: {
      source_code_expected: true,
      api_docs_recommended: true,
    },
  },

  // 2. Mobile App Development
  mobile: {
    id: "mobile",
    label: "Mobile App Development",
    icon: "smartphone",
    color: "#7c3aed",
    bgGradient: "linear-gradient(135deg,#2e1065,#5b21b6)",
    sections: [
      { id: "deliverables", title: "1. Scope Deliverables & Provider Claims", type: "deliverables" },
      { id: "evidence", title: "2. App Build & Distribution Links", type: "evidence" },
      { id: "testing", title: "3. Mobile Device Testing & Crash QA", type: "testing" },
      { id: "summary", title: "4. Release Notes & Installation Instructions", type: "summary" },
    ],
    evidenceTypes: [
      {
        id: "build",
        type: "build",
        source_type: "url",
        label: "App Build / Distribution Link (TestFlight, APK, Firebase)",
        icon: "apk_install",
        placeholder: "https://testflight.apple.com/join/... or APK Download URL",
        description: "TestFlight, Firebase App Distribution, or direct APK link",
        recommended: true,
      },
      {
        id: "repository",
        type: "repository",
        source_type: "url",
        label: "Mobile Code Repository URL",
        icon: "code",
        placeholder: "https://github.com/org/mobile-app",
        description: "React Native, Flutter, iOS Swift, or Android Kotlin repo",
        recommended: true,
      },
      {
        id: "live_demo",
        type: "live_demo",
        source_type: "url",
        label: "App Video Demo / Staging Preview Link",
        icon: "play_circle",
        placeholder: "https://vimeo.com/... or Loom demo link",
        description: "Walkthrough video or live app demonstration link",
        recommended: false,
      },
    ],
    testing: {
      enabled: true,
      label: "Was device & compatibility testing performed?",
      defaultPerformed: true,
      summaryPlaceholder: "Tested on iOS 17 (iPhone 15) & Android 14 (Pixel 8), 0 critical crashes",
      reportUrlPlaceholder: "Device test matrix or crash analytics report URL",
    },
    readinessRules: {
      weights: { deliverables: 40, build: 30, repository: 15, testing: 15 },
      recommendedTypes: ["build", "repository"],
    },
    auditHints: {
      app_build_expected: true,
      device_testing_recommended: true,
    },
  },

  // 3. Web Development (Reference Implementation)
  web: {
    id: "web",
    label: "Web Development",
    icon: "language",
    color: "#10b981",
    bgGradient: "linear-gradient(135deg,#001637,#006c47)",
    sections: [
      { id: "deliverables", title: "1. Scope Deliverables & Provider Claims", type: "deliverables" },
      { id: "evidence", title: "2. Web Development Evidence & Links", type: "evidence" },
      { id: "testing", title: "3. Testing & QA Information", type: "testing" },
      { id: "summary", title: "4. Submission Summary / Release Notes", type: "summary" },
    ],
    evidenceTypes: [
      {
        id: "repository",
        type: "repository",
        source_type: "url",
        label: "Source Code Repository URL",
        icon: "code",
        placeholder: "https://github.com/org/project-repo",
        description: "Git repository containing frontend/backend source code",
        recommended: true,
      },
      {
        id: "staging",
        type: "staging",
        source_type: "url",
        label: "Live / Staging Preview URL",
        icon: "public",
        placeholder: "https://staging.myproject.com",
        description: "Active preview site or live deployed URL",
        recommended: true,
      },
      {
        id: "documentation",
        type: "documentation",
        source_type: "url",
        label: "Technical Documentation URL",
        icon: "description",
        placeholder: "https://docs.myproject.com or Readme link",
        description: "Web app architecture or deployment documentation",
        recommended: false,
      },
    ],
    testing: {
      enabled: true,
      label: "Was automated/manual testing performed?",
      defaultPerformed: true,
      summaryPlaceholder: "Testing summary (e.g., 95% unit test pass rate using Vitest)",
      reportUrlPlaceholder: "Test report URL (optional)",
    },
    readinessRules: {
      weights: { deliverables: 40, repository: 25, staging: 20, testing: 15 },
      recommendedTypes: ["repository", "staging"],
    },
    auditHints: {
      web_repo_expected: true,
      staging_url_expected: true,
    },
  },

  // 4. UI/UX Design
  uiux: {
    id: "uiux",
    label: "UI/UX Design",
    icon: "palette",
    color: "#ec4899",
    bgGradient: "linear-gradient(135deg,#831843,#be185d)",
    sections: [
      { id: "deliverables", title: "1. Design Deliverables & Screen Claims", type: "deliverables" },
      { id: "evidence", title: "2. Figma & Prototype Links", type: "evidence" },
      { id: "summary", title: "3. Design System & Handoff Notes", type: "summary" },
    ],
    evidenceTypes: [
      {
        id: "figma",
        type: "figma",
        source_type: "url",
        label: "Figma Master File URL",
        icon: "design_services",
        placeholder: "https://figma.com/file/...",
        description: "Master Figma file containing screens and design components",
        recommended: true,
      },
      {
        id: "live_demo",
        type: "live_demo",
        source_type: "url",
        label: "Interactive Prototype Link",
        icon: "touch_app",
        placeholder: "https://figma.com/proto/...",
        description: "Clickable interactive prototype link for user flows",
        recommended: true,
      },
      {
        id: "documentation",
        type: "documentation",
        source_type: "url",
        label: "Design Specs / Asset Package Link",
        icon: "folder_zip",
        placeholder: "https://drive.google.com/... or Figma export link",
        description: "Exported SVG/PNG assets, typography, and developer specs",
        recommended: false,
      },
    ],
    testing: { enabled: false },
    readinessRules: {
      weights: { deliverables: 50, figma: 30, live_demo: 20 },
      recommendedTypes: ["figma", "live_demo"],
    },
    auditHints: {
      figma_file_expected: true,
      prototype_recommended: true,
    },
  },

  // 5. Cybersecurity
  cyber: {
    id: "cyber",
    label: "Cybersecurity",
    icon: "shield",
    color: "#dc2626",
    bgGradient: "linear-gradient(135deg,#450a0a,#991b1b)",
    sections: [
      { id: "deliverables", title: "1. Scope Assessment & Audit Claims", type: "deliverables" },
      { id: "evidence", title: "2. Security Audit Reports & Evidence", type: "evidence" },
      { id: "findings", title: "3. Vulnerability Findings & Remediation Summary", type: "custom_fields" },
      { id: "summary", title: "4. Executive Security Summary & Retest Notes", type: "summary" },
    ],
    evidenceTypes: [
      {
        id: "security_report",
        type: "security_report",
        source_type: "url",
        label: "Security Audit / Penetration Test Report URL",
        icon: "verified_user",
        placeholder: "https://secure-vault.example.com/reports/pentest.pdf",
        description: "Formal penetration test report or vulnerability assessment document",
        recommended: true,
      },
      {
        id: "documentation",
        type: "documentation",
        source_type: "url",
        label: "Remediation & Patch Verification URL",
        icon: "fact_check",
        placeholder: "https://github.com/org/security-patches or report URL",
        description: "Documented patches, firewall policies, or retest evidence",
        recommended: true,
      },
    ],
    customFields: [
      { id: "criticalFindings", label: "Critical Findings", type: "number", default: 0 },
      { id: "highFindings", label: "High Findings", type: "number", default: 0 },
      { id: "remediatedFindings", label: "Remediated Findings", type: "number", default: 0 },
      { id: "retestStatus", label: "Retest Status", type: "select", options: ["Clean (All Fixed)", "Remediation in Progress", "Open Findings Remain", "Retest Pending"], default: "Clean (All Fixed)" },
    ],
    testing: { enabled: false },
    readinessRules: {
      weights: { deliverables: 40, security_report: 40, documentation: 20 },
      recommendedTypes: ["security_report"],
    },
    auditHints: {
      security_report_expected: true,
      flag_unresolved_high_findings: true,
    },
  },

  // 6. Cloud / DevOps
  cloud: {
    id: "cloud",
    label: "Cloud / DevOps",
    icon: "cloud",
    color: "#0284c7",
    bgGradient: "linear-gradient(135deg,#0c4a6e,#0369a1)",
    sections: [
      { id: "deliverables", title: "1. Scope Deliverables & Infrastructure Claims", type: "deliverables" },
      { id: "evidence", title: "2. Infrastructure as Code & Dashboard Links", type: "evidence" },
      { id: "testing", title: "3. CI/CD & Monitoring Verification", type: "testing" },
      { id: "summary", title: "4. Deployment & Access Handoff Notes", type: "summary" },
    ],
    evidenceTypes: [
      {
        id: "repository",
        type: "repository",
        source_type: "url",
        label: "Infrastructure as Code Repo (Terraform, CloudFormation, Helm)",
        icon: "cloud_done",
        placeholder: "https://github.com/org/terraform-infra",
        description: "IaC repository or Kubernetes manifest repository",
        recommended: true,
      },
      {
        id: "dashboard",
        type: "dashboard",
        source_type: "url",
        label: "Monitoring / Metrics Dashboard Link (Grafana, CloudWatch)",
        icon: "insights",
        placeholder: "https://grafana.example.com/d/infra-overview",
        description: "Live monitoring dashboard or logging dashboard URL",
        recommended: true,
      },
      {
        id: "architecture",
        type: "architecture",
        source_type: "url",
        label: "Cloud Architecture Diagram URL",
        icon: "account_tree",
        placeholder: "https://lucid.app/... or architecture diagram URL",
        description: "Cloud topology diagram or network architecture spec",
        recommended: false,
      },
    ],
    testing: {
      enabled: true,
      label: "Were deployment pipelines & failover tests verified?",
      defaultPerformed: true,
      summaryPlaceholder: "CI/CD deployment automated via GitHub Actions, zero downtime blue/green verified",
      reportUrlPlaceholder: "Pipeline build log or deployment report URL",
    },
    readinessRules: {
      weights: { deliverables: 40, repository: 30, dashboard: 15, testing: 15 },
      recommendedTypes: ["repository", "dashboard"],
    },
    auditHints: {
      iac_repo_expected: true,
      monitoring_dashboard_recommended: true,
    },
  },

  // 7. AI Development / Data Science
  ai: {
    id: "ai",
    label: "AI Development / Data Science",
    icon: "psychology",
    color: "#d97706",
    bgGradient: "linear-gradient(135deg,#451a03,#b45309)",
    sections: [
      { id: "deliverables", title: "1. Scope Deliverables & Model Claims", type: "deliverables" },
      { id: "evidence", title: "2. Model Repository & Endpoint Evidence", type: "evidence" },
      { id: "metrics", title: "3. Model Evaluation Metrics", type: "custom_fields" },
      { id: "summary", title: "4. Dataset & Model Handoff Notes", type: "summary" },
    ],
    evidenceTypes: [
      {
        id: "repository",
        type: "repository",
        source_type: "url",
        label: "AI / ML Code Repository URL",
        icon: "model_training",
        placeholder: "https://github.com/org/ml-model-repo",
        description: "Model training, pipeline code, or HuggingFace repo",
        recommended: true,
      },
      {
        id: "staging",
        type: "staging",
        source_type: "url",
        label: "Inference API / Model Demo Endpoint URL",
        icon: "api",
        placeholder: "https://api.model-demo.example.com/v1/predict",
        description: "Live inference API endpoint or Gradio/Streamlit demo",
        recommended: true,
      },
      {
        id: "documentation",
        type: "documentation",
        source_type: "url",
        label: "Evaluation & Validation Report URL",
        icon: "analytics",
        placeholder: "https://docs.example.com/eval-results.pdf",
        description: "Benchmark test results, confusion matrix, or validation report",
        recommended: false,
      },
    ],
    customFields: [
      { id: "accuracy", label: "Accuracy / Score", type: "text", default: "94.5%" },
      { id: "f1Score", label: "F1 Score", type: "text", default: "0.92" },
      { id: "latencyMs", label: "Inference Latency (ms)", type: "text", default: "120ms" },
    ],
    testing: { enabled: false },
    readinessRules: {
      weights: { deliverables: 40, repository: 30, staging: 20, documentation: 10 },
      recommendedTypes: ["repository", "staging"],
    },
    auditHints: {
      compare_metrics_to_acceptance_criteria: true,
      model_repository_expected: true,
    },
  },

  // 8. IT Consulting
  it: {
    id: "it",
    label: "IT Consulting",
    icon: "business_center",
    color: "#4f46e5",
    bgGradient: "linear-gradient(135deg,#1e1b4b,#3730a3)",
    sections: [
      { id: "deliverables", title: "1. Consulting Scope & Deliverables", type: "deliverables" },
      { id: "evidence", title: "2. Strategy Reports & Presentations", type: "evidence" },
      { id: "summary", title: "3. Executive Recommendations & Roadmap Summary", type: "summary" },
    ],
    evidenceTypes: [
      {
        id: "documentation",
        type: "documentation",
        source_type: "url",
        label: "Strategy Report / Deliverable Document URL",
        icon: "article",
        placeholder: "https://drive.google.com/... or Notion strategy document",
        description: "Comprehensive PDF/Doc report containing analysis and strategy",
        recommended: true,
      },
      {
        id: "live_demo",
        type: "live_demo",
        source_type: "url",
        label: "Executive Presentation Slides URL",
        icon: "slideshow",
        placeholder: "https://slides.google.com/... or PowerPoint URL",
        description: "Presentation deck summarizing key findings & recommendations",
        recommended: true,
      },
    ],
    testing: { enabled: false },
    readinessRules: {
      weights: { deliverables: 50, documentation: 30, live_demo: 20 },
      recommendedTypes: ["documentation"],
    },
    auditHints: {
      strategy_document_expected: true,
    },
  },

  // 9. Data Analytics & BI
  data: {
    id: "data",
    label: "Data Analytics & BI",
    icon: "bar_chart",
    color: "#0891b2",
    bgGradient: "linear-gradient(135deg,#155e75,#0e7490)",
    sections: [
      { id: "deliverables", title: "1. Scope Deliverables & KPI Claims", type: "deliverables" },
      { id: "evidence", title: "2. Dashboard & Data Pipeline Evidence", type: "evidence" },
      { id: "summary", title: "3. Data Dictionary & Refresh Documentation", type: "summary" },
    ],
    evidenceTypes: [
      {
        id: "dashboard",
        type: "dashboard",
        source_type: "url",
        label: "BI Dashboard URL (PowerBI, Tableau, Looker, Metabase)",
        icon: "monitoring",
        placeholder: "https://app.powerbi.com/groups/... or Tableau link",
        description: "Live interactive BI dashboard link",
        recommended: true,
      },
      {
        id: "repository",
        type: "repository",
        source_type: "url",
        label: "SQL / dbt / ETL Pipeline Repo URL",
        icon: "dataset",
        placeholder: "https://github.com/org/dbt-analytics-repo",
        description: "dbt data models, SQL queries, or ETL pipeline code",
        recommended: true,
      },
      {
        id: "documentation",
        type: "documentation",
        source_type: "url",
        label: "Data Dictionary & Metric Specs URL",
        icon: "book",
        placeholder: "https://docs.example.com/data-dictionary",
        description: "KPI definitions, schema specs, or data dictionary link",
        recommended: false,
      },
    ],
    testing: { enabled: false },
    readinessRules: {
      weights: { deliverables: 40, dashboard: 35, repository: 25 },
      recommendedTypes: ["dashboard", "repository"],
    },
    auditHints: {
      dashboard_url_expected: true,
      sql_repo_recommended: true,
    },
  },

  // 10. Technical Documentation
  docs: {
    id: "docs",
    label: "Technical Documentation",
    icon: "auto_stories",
    color: "#059669",
    bgGradient: "linear-gradient(135deg,#064e3b,#047857)",
    sections: [
      { id: "deliverables", title: "1. Documentation Scope & Coverage Claims", type: "deliverables" },
      { id: "evidence", title: "2. Documentation Portal & Repository Links", type: "evidence" },
      { id: "summary", title: "3. Portal Summary & Maintenance Guide", type: "summary" },
    ],
    evidenceTypes: [
      {
        id: "documentation",
        type: "documentation",
        source_type: "url",
        label: "Live Documentation Portal URL (GitBook, Docusaurus, Readme)",
        icon: "menu_book",
        placeholder: "https://docs.mycompany.com",
        description: "Deployed documentation portal or OpenAPI docs",
        recommended: true,
      },
      {
        id: "repository",
        type: "repository",
        source_type: "url",
        label: "Source Markdown / OpenAPI Repo URL",
        icon: "code",
        placeholder: "https://github.com/org/tech-docs-repo",
        description: "Source code repository containing Markdown/OpenAPI files",
        recommended: true,
      },
    ],
    testing: { enabled: false },
    readinessRules: {
      weights: { deliverables: 50, documentation: 30, repository: 20 },
      recommendedTypes: ["documentation"],
    },
    auditHints: {
      documentation_portal_expected: true,
    },
  },
});

/**
 * Normalizes category key or falls back safely to 'web'.
 */
export function getCategoryConfig(categoryKey) {
  if (!categoryKey) return SUBMISSION_CATEGORIES.web;
  const rawKey = String(categoryKey).trim().toLowerCase();
  
  // Mapping common category aliases
  const aliasMap = {
    software: "software",
    "software dev": "software",
    mobile: "mobile",
    "mobile app": "mobile",
    web: "web",
    "web dev": "web",
    uiux: "uiux",
    "ui/ux design": "uiux",
    cyber: "cyber",
    cybersecurity: "cyber",
    cloud: "cloud",
    "cloud/devops": "cloud",
    ai: "ai",
    "ai development": "ai",
    it: "it",
    "it consulting": "it",
    data: "data",
    "data analytics": "data",
    docs: "docs",
    "technical documentation": "docs",
  };

  const matchedId = aliasMap[rawKey] || rawKey;
  return SUBMISSION_CATEGORIES[matchedId] || SUBMISSION_CATEGORIES.web;
}
