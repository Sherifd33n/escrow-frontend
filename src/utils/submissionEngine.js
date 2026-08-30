/**
 * Reusable Submission Engine
 * Place this file at: frontend/src/utils/submissionEngine.js
 *
 * Handles client-side submission serialization, evidence normalization,
 * custom field processing, pre-audit readiness calculations, and input validation
 * for all 10 service categories.
 */

import { getCategoryConfig } from "../config/submissionCategories";

/**
 * Safely extracts a trimmed URL string from either a string or an evidence object.
 */
function extractUrlString(val) {
  if (!val) return "";
  if (typeof val === "string") return val.trim();
  if (typeof val === "object" && typeof val.url === "string") return val.url.trim();
  return "";
}

/**
 * Normalizes UI inputs into Phase 1 canonical submission_data JSON payload.
 */
export function buildSubmissionPayload({
  category = "web",
  summary = "",
  deliverables = [],
  evidenceMap = {},
  testing = {},
  customFieldsMap = {},
  providerNotes = "",
}) {
  const catConfig = getCategoryConfig(category);
  const commonEvidence = [];

  // Map category evidence configuration to structured evidence list
  (catConfig.evidenceTypes || []).forEach((evType) => {
    const evValue = evidenceMap[evType.id] || evidenceMap[evType.type];
    const url = extractUrlString(evValue);
    const desc = typeof evValue === "object" && evValue.description ? String(evValue.description).trim() : "";

    if (url) {
      commonEvidence.push({
        id: `e_${evType.id}`,
        type: evType.type,
        source_type: evType.source_type || "url",
        label: evType.label,
        url: url,
        file_name: null,
        description: desc || evType.description || "",
      });
    }
  });

  // Map deliverables with claims & evidence
  const formattedDeliverables = deliverables.map((d) => ({
    scope_item_id: d.scope_item_id || d.id,
    status: d.status || "completed",
    claim: String(d.claim || "").trim() || `Provider marked deliverable as ${d.status || "completed"}.`,
    evidence: commonEvidence,
  }));

  // Map testing evidence
  const testingEvidence = [];
  if (testing.reportUrl && String(testing.reportUrl).trim()) {
    testingEvidence.push({
      id: "e_testing_report",
      type: "test_report",
      source_type: "url",
      label: "Automated Test Report",
      url: String(testing.reportUrl).trim(),
      file_name: null,
      description: "Test execution report",
    });
  }

  return {
    version: 1,
    category: catConfig.id,
    summary: String(summary || "").trim() || `Submitted deliverables for ${catConfig.label} milestone.`,
    deliverables: formattedDeliverables,
    testing: {
      performed: !!testing.performed,
      summary: String(testing.summary || "").trim(),
      results: [],
      evidence: testingEvidence,
    },
    custom_fields: customFieldsMap || {},
    additional_evidence: commonEvidence,
    provider_notes: String(providerNotes || summary || "").trim(),
  };
}

/**
 * Calculates deterministic client-side submission readiness for any of the 10 categories.
 */
export function calculateSubmissionReadiness(
  category,
  deliverables = [],
  evidenceMap = {},
  testing = {},
  customFieldsMap = {}
) {
  const catConfig = getCategoryConfig(category);
  const total = Array.isArray(deliverables) ? deliverables.length : 0;
  const addressed = Array.isArray(deliverables)
    ? deliverables.filter((d) => d && d.status !== "not_completed").length
    : 0;

  const weights = catConfig.readinessRules?.weights || { deliverables: 50 };
  let score = 0;

  // Scope deliverables weight
  if (total > 0 && weights.deliverables) {
    score += (addressed / total) * weights.deliverables;
  }

  // Evidence presence weight
  (catConfig.evidenceTypes || []).forEach((ev) => {
    const evWeight = weights[ev.id] || weights[ev.type] || 0;
    const url = extractUrlString(evidenceMap[ev.id]) || extractUrlString(evidenceMap[ev.type]);
    if (url) {
      score += evWeight;
    }
  });

  // Testing weight if enabled
  if (catConfig.testing?.enabled && weights.testing) {
    const hasTesting = testing?.performed && (!!testing?.summary?.trim() || !!testing?.reportUrl?.trim());
    if (hasTesting) score += weights.testing;
  }

  // Summary warnings
  const warnings = [];
  if (addressed < total) warnings.push(`${total - addressed} scope item(s) unaddressed`);

  (catConfig.readinessRules?.recommendedTypes || []).forEach((recTypeId) => {
    const evConf = (catConfig.evidenceTypes || []).find((e) => e.id === recTypeId || e.type === recTypeId);
    const url = extractUrlString(evidenceMap[recTypeId]);
    if (!url && evConf) {
      warnings.push(`${evConf.label} missing`);
    }
  });

  return {
    total,
    addressed,
    pct: Math.min(100, Math.round(score)),
    warnings,
  };
}

/**
 * Client-side validation helper for all categories.
 */
export function validateSubmissionInputs(evidenceMap = {}) {
  const isValidUrl = (str) => {
    if (!str || !String(str).trim()) return true;
    try {
      const u = new URL(String(str).trim());
      return ["http:", "https:", "ftp:"].includes(u.protocol);
    } catch (err) {
      return false;
    }
  };

  for (const [key, val] of Object.entries(evidenceMap)) {
    const urlStr = extractUrlString(val);
    if (urlStr && !isValidUrl(urlStr)) {
      return `Invalid URL format for ${key}: "${urlStr}"`;
    }
  }
  return null;
}
