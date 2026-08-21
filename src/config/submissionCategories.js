/**
 * Comprehensive Submission Category Configuration Registry
 * Place this file at: frontend/src/config/submissionCategories.js
 *
 * Defines field structures, enabled evidence types, category-specific fields,
 * readiness weights, and AI audit hints for all 10 supported service categories.
 */

export const STANDARD_TWO_EVIDENCE_TYPES = Object.freeze([
  {
    id: "zip_package",
    type: "zip",
    source_type: "file",
    label: "1. Complete Project Implementation Archive (ZIP File)",
    icon: "folder_zip",
    placeholder: "Upload ZIP file or paste ZIP/Repo URL (e.g. project_source.zip)",
    description: "ZIP package containing all source code, implementation files, assets, and runnable artifacts.",
    recommended: true,
    required: true,
  },
  {
    id: "documentation",
    type: "documentation",
    source_type: "text",
    label: "2. Project Summary & Implementation Notes (Text Explanation)",
    icon: "description",
    placeholder: "Provide a detailed explanation of what was built, features implemented, and setup notes...",
    description: "Text explanation describing delivered features, installation/setup instructions, and verification notes.",
    recommended: true,
    required: true,
  },
]);

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
      { id: "evidence", title: "2. Required Deliverable Artifacts (ZIP & Text)", type: "evidence" },
      { id: "summary", title: "3. Project Explanation & Overview Notes", type: "summary" },
    ],
    evidenceTypes: STANDARD_TWO_EVIDENCE_TYPES,
    testing: { enabled: false },
    readinessRules: {
      weights: { deliverables: 50, zip_package: 30, documentation: 20 },
      recommendedTypes: ["zip_package", "documentation"],
    },
    auditHints: {
      zip_expected: true,
      text_summary_expected: true,
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
      { id: "evidence", title: "2. Required Deliverable Artifacts (ZIP & Text)", type: "evidence" },
      { id: "summary", title: "3. Project Explanation & Overview Notes", type: "summary" },
    ],
    evidenceTypes: STANDARD_TWO_EVIDENCE_TYPES,
    testing: { enabled: false },
    readinessRules: { weights: { deliverables: 50, zip_package: 30, documentation: 20 } },
  },

  // 3. Web Development
  web: {
    id: "web",
    label: "Web Development",
    icon: "language",
    color: "#10b981",
    bgGradient: "linear-gradient(135deg,#001637,#006c47)",
    sections: [
      { id: "deliverables", title: "1. Scope Deliverables & Provider Claims", type: "deliverables" },
      { id: "evidence", title: "2. Required Deliverable Artifacts (ZIP & Text)", type: "evidence" },
      { id: "summary", title: "3. Project Explanation & Overview Notes", type: "summary" },
    ],
    evidenceTypes: STANDARD_TWO_EVIDENCE_TYPES,
    testing: { enabled: false },
    readinessRules: { weights: { deliverables: 50, zip_package: 30, documentation: 20 } },
  },

  // 4. UI/UX Design
  uiux: {
    id: "uiux",
    label: "UI/UX Design",
    icon: "palette",
    color: "#ec4899",
    bgGradient: "linear-gradient(135deg,#831843,#be185d)",
    sections: [
      { id: "deliverables", title: "1. Scope Deliverables & Provider Claims", type: "deliverables" },
      { id: "evidence", title: "2. Required Deliverable Artifacts (ZIP & Text)", type: "evidence" },
      { id: "summary", title: "3. Project Explanation & Overview Notes", type: "summary" },
    ],
    evidenceTypes: STANDARD_TWO_EVIDENCE_TYPES,
    testing: { enabled: false },
    readinessRules: { weights: { deliverables: 50, zip_package: 30, documentation: 20 } },
  },

  // 5. Cybersecurity
  cyber: {
    id: "cyber",
    label: "Cybersecurity",
    icon: "shield",
    color: "#dc2626",
    bgGradient: "linear-gradient(135deg,#450a0a,#991b1b)",
    sections: [
      { id: "deliverables", title: "1. Scope Deliverables & Provider Claims", type: "deliverables" },
      { id: "evidence", title: "2. Required Deliverable Artifacts (ZIP & Text)", type: "evidence" },
      { id: "summary", title: "3. Project Explanation & Overview Notes", type: "summary" },
    ],
    evidenceTypes: STANDARD_TWO_EVIDENCE_TYPES,
    testing: { enabled: false },
    readinessRules: { weights: { deliverables: 50, zip_package: 30, documentation: 20 } },
  },

  // 6. Cloud / DevOps
  cloud: {
    id: "cloud",
    label: "Cloud / DevOps",
    icon: "cloud",
    color: "#0284c7",
    bgGradient: "linear-gradient(135deg,#0c4a6e,#0369a1)",
    sections: [
      { id: "deliverables", title: "1. Scope Deliverables & Provider Claims", type: "deliverables" },
      { id: "evidence", title: "2. Required Deliverable Artifacts (ZIP & Text)", type: "evidence" },
      { id: "summary", title: "3. Project Explanation & Overview Notes", type: "summary" },
    ],
    evidenceTypes: STANDARD_TWO_EVIDENCE_TYPES,
    testing: { enabled: false },
    readinessRules: { weights: { deliverables: 50, zip_package: 30, documentation: 20 } },
  },

  // 7. AI Development / Data Science
  ai: {
    id: "ai",
    label: "AI Development / Data Science",
    icon: "psychology",
    color: "#d97706",
    bgGradient: "linear-gradient(135deg,#451a03,#b45309)",
    sections: [
      { id: "deliverables", title: "1. Scope Deliverables & Provider Claims", type: "deliverables" },
      { id: "evidence", title: "2. Required Deliverable Artifacts (ZIP & Text)", type: "evidence" },
      { id: "summary", title: "3. Project Explanation & Overview Notes", type: "summary" },
    ],
    evidenceTypes: STANDARD_TWO_EVIDENCE_TYPES,
    testing: { enabled: false },
    readinessRules: { weights: { deliverables: 50, zip_package: 30, documentation: 20 } },
  },

  // 8. IT Consulting
  it: {
    id: "it",
    label: "IT Consulting",
    icon: "business_center",
    color: "#4f46e5",
    bgGradient: "linear-gradient(135deg,#1e1b4b,#3730a3)",
    sections: [
      { id: "deliverables", title: "1. Scope Deliverables & Provider Claims", type: "deliverables" },
      { id: "evidence", title: "2. Required Deliverable Artifacts (ZIP & Text)", type: "evidence" },
      { id: "summary", title: "3. Project Explanation & Overview Notes", type: "summary" },
    ],
    evidenceTypes: STANDARD_TWO_EVIDENCE_TYPES,
    testing: { enabled: false },
    readinessRules: { weights: { deliverables: 50, zip_package: 30, documentation: 20 } },
  },

  // 9. Data Analytics & BI
  data: {
    id: "data",
    label: "Data Analytics & BI",
    icon: "bar_chart",
    color: "#0891b2",
    bgGradient: "linear-gradient(135deg,#155e75,#0e7490)",
    sections: [
      { id: "deliverables", title: "1. Scope Deliverables & Provider Claims", type: "deliverables" },
      { id: "evidence", title: "2. Required Deliverable Artifacts (ZIP & Text)", type: "evidence" },
      { id: "summary", title: "3. Project Explanation & Overview Notes", type: "summary" },
    ],
    evidenceTypes: STANDARD_TWO_EVIDENCE_TYPES,
    testing: { enabled: false },
    readinessRules: { weights: { deliverables: 50, zip_package: 30, documentation: 20 } },
  },

  // 10. Technical Documentation
  docs: {
    id: "docs",
    label: "Technical Documentation",
    icon: "auto_stories",
    color: "#059669",
    bgGradient: "linear-gradient(135deg,#064e3b,#047857)",
    sections: [
      { id: "deliverables", title: "1. Scope Deliverables & Provider Claims", type: "deliverables" },
      { id: "evidence", title: "2. Required Deliverable Artifacts (ZIP & Text)", type: "evidence" },
      { id: "summary", title: "3. Project Explanation & Overview Notes", type: "summary" },
    ],
    evidenceTypes: STANDARD_TWO_EVIDENCE_TYPES,
    testing: { enabled: false },
    readinessRules: { weights: { deliverables: 50, zip_package: 30, documentation: 20 } },
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
