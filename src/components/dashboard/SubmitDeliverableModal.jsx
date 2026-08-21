import { useState, useMemo, useRef } from "react";
import { T } from "../../tokens";
import { Btn, Spin } from "../../components/ui";
import { transactions } from "../../utils/api";
import { getCategoryConfig } from "../../config/submissionCategories";
import {
  buildSubmissionPayload,
  calculateSubmissionReadiness,
  validateSubmissionInputs,
} from "../../utils/submissionEngine";

function parseScopeDeliverables(scopeJson, activeMilestone) {
  if (!scopeJson && !activeMilestone) {
    return [{ id: "d1", name: "Milestone Deliverable", description: "Primary milestone scope work." }];
  }

  let parsed = scopeJson;
  if (typeof scopeJson === "string") {
    try {
      parsed = JSON.parse(scopeJson);
    } catch (e) {
      parsed = null;
    }
  }

  const items = [];
  let idx = 1;

  if (parsed && Array.isArray(parsed.deliverables) && parsed.deliverables.length > 0) {
    parsed.deliverables.forEach((d) => {
      if (typeof d === "string" && d.trim()) {
        items.push({ id: `d${idx++}`, name: d.trim(), description: "" });
      } else if (typeof d === "object" && d !== null) {
        items.push({
          id: d.scope_item_id || d.id || `d${idx++}`,
          name: d.name || d.title || `Deliverable ${idx}`,
          description: d.description || "",
        });
      }
    });
  }

  if (items.length === 0 && activeMilestone) {
    items.push({
      id: "d1",
      name: activeMilestone.title || "Milestone Deliverable",
      description: activeMilestone.description || activeMilestone.deliverable_note || "Milestone scope implementation.",
    });
  }

  return items;
}

export default function SubmitDeliverableModal({ job, activeMilestone, onClose, onSubmitSuccess }) {
  const categoryKey = job?.cat || job?.category || job?.type || "web";
  const catConfig = useMemo(() => getCategoryConfig(categoryKey), [categoryKey]);
  const scopeItems = useMemo(() => parseScopeDeliverables(job?.scope_json, activeMilestone), [job, activeMilestone]);

  const [deliverables, setDeliverables] = useState(() =>
    scopeItems.map((item) => ({
      scope_item_id: item.id,
      name: item.name,
      description: item.description,
      status: "completed",
      claim: "",
    }))
  );

  const [evidenceMap, setEvidenceMap] = useState(() => {
    const initialMap = {};
    (catConfig.evidenceTypes || []).forEach((ev) => {
      initialMap[ev.id] = { url: "", description: "" };
    });
    return initialMap;
  });

  const [customFieldsMap, setCustomFieldsMap] = useState(() => {
    const map = {};
    (catConfig.customFields || []).forEach((cf) => {
      map[cf.id] = cf.default !== undefined ? cf.default : "";
    });
    return map;
  });

  const [testingInfo, setTestingInfo] = useState({
    performed: catConfig.testing?.defaultPerformed ?? true,
    summary: "",
    reportUrl: "",
  });

  const [providerSummary, setProviderSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  // Track per-evidence-type uploading state: { [evId]: boolean }
  const [uploadingEvidence, setUploadingEvidence] = useState({});
  // Track uploaded file names for display: { [evId]: string }
  const [uploadedFileNames, setUploadedFileNames] = useState({});
  const fileInputRefs = useRef({});

  const updateItemStatus = (scopeId, newStatus) => {
    setDeliverables((prev) =>
      prev.map((item) => (item.scope_item_id === scopeId ? { ...item, status: newStatus } : item))
    );
  };

  const updateItemClaim = (scopeId, newClaim) => {
    setDeliverables((prev) =>
      prev.map((item) => (item.scope_item_id === scopeId ? { ...item, claim: newClaim } : item))
    );
  };

  const updateEvidenceUrl = (evId, url) => {
    setEvidenceMap((prev) => ({
      ...prev,
      [evId]: { ...(prev[evId] || {}), url },
    }));
  };

  const updateCustomField = (fieldId, val) => {
    setCustomFieldsMap((prev) => ({ ...prev, [fieldId]: val }));
  };

  const readiness = useMemo(
    () => calculateSubmissionReadiness(catConfig.id, deliverables, evidenceMap, testingInfo, customFieldsMap),
    [catConfig.id, deliverables, evidenceMap, testingInfo, customFieldsMap]
  );

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const valErr = validateSubmissionInputs(evidenceMap);
    if (valErr) {
      setErrorMsg(valErr);
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure deliverables claims and evidence are populated from the 3 artifacts
      const updatedDeliverables = deliverables.map((d, idx) => {
        const sid = d.scope_item_id || d.id || `d${idx + 1}`;
        let claimText = d.claim || "";

        if (idx === 0 || sid === "d1") {
          claimText = evidenceMap["zip_package"]?.url
            ? `ZIP implementation package provided: ${evidenceMap["zip_package"].url}`
            : (providerSummary || "ZIP package delivered.");
        } else if (idx === 1 || sid === "d2") {
          claimText = providerSummary.trim() || "Project text explanation and overview provided.";
        } else {
          claimText = providerSummary.trim() || claimText || "Deliverable completed.";
        }

        return {
          ...d,
          scope_item_id: sid,
          status: "completed",
          claim: claimText,
        };
      });

      const payload = buildSubmissionPayload({
        category: catConfig.id,
        summary: providerSummary,
        deliverables: updatedDeliverables,
        evidenceMap,
        testing: testingInfo,
        customFieldsMap,
        providerNotes: providerSummary,
      });

      const milestoneIdToSubmit = activeMilestone?.id;
      if (!milestoneIdToSubmit) {
        throw new Error("Active milestone ID is missing.");
      }

      const res = await transactions.updateMilestoneStatus(milestoneIdToSubmit, "submitted", {
        deliverable_note: providerSummary.trim() || `${catConfig.label} deliverable submitted for review`,
        submission_data: payload,
      });

      if (res.error) {
        setErrorMsg(res.error);
        setIsSubmitting(false);
        return;
      }

      onSubmitSuccess();
      onClose();
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMsg(err.message || "Failed to submit deliverable. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        zIndex: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}
    >
      <div
        style={{
          background: T.white,
          borderRadius: 20,
          width: "100%",
          maxWidth: 680,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,.28)",
          animation: "fadeUp .3s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: catConfig.bgGradient || "linear-gradient(135deg,#001637,#006c47)",
            padding: "20px 24px",
            color: T.white,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 2,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, display: "flex", alignItems: "center", gap: 8 }}>
              <span className="msym" style={{ fontSize: 22 }}>{catConfig.icon || "language"}</span>
              {catConfig.label} Submission
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
              {job?.title} &bull; {activeMilestone?.title || "Milestone Deliverable"}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: "rgba(255,255,255,.15)",
              border: "none",
              color: T.white,
              borderRadius: "50%",
              width: 32,
              height: 32,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {errorMsg && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {/* Banner: 2-Artifact Standard Guide */}
          <div
            style={{
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 22,
              fontSize: 12.5,
              color: "#0369a1",
              lineHeight: 1.55,
            }}
          >
            <strong>Standard Provider Submission:</strong> Submit your ZIP package and project text summary below. The AI Audit System will unpack your ZIP archive, inspect all source files inside, and evaluate your submission against the scope.
          </div>

          {/* Artifact 1: Complete Project ZIP Package */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: "16px",
              marginBottom: 16,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="msym" style={{ fontSize: 20, color: "#2563eb" }}>folder_zip</span>
              1. Complete Project Implementation Archive (ZIP File)
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
              Upload a ZIP package or paste a repository/ZIP URL containing all source code, assets, and project files.
            </div>

            <input
              type="url"
              placeholder="Paste repository/ZIP link (e.g., https://.../project_source.zip) or attach file below"
              value={evidenceMap["zip_package"]?.url || ""}
              onChange={(e) => updateEvidenceUrl("zip_package", e.target.value)}
              style={{
                width: "100%",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                padding: "9px 12px",
                fontSize: 13,
                boxSizing: "border-box",
                marginBottom: 8,
                background: "#ffffff",
              }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 600 }}>OR</span>
              <input
                ref={(el) => { fileInputRefs.current["zip_package"] = el; }}
                type="file"
                accept=".zip"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingEvidence((prev) => ({ ...prev, zip_package: true }));
                  const { data, error } = await transactions.uploadEvidenceFile(file);
                  setUploadingEvidence((prev) => ({ ...prev, zip_package: false }));
                  if (error) {
                    setErrorMsg(`ZIP upload failed: ${error}`);
                    return;
                  }
                  const backendBase = import.meta.env.VITE_API_URL
                    ? import.meta.env.VITE_API_URL.replace("/api", "")
                    : "http://localhost:4000";
                  const fullUrl = `${backendBase}${data.url}`;
                  updateEvidenceUrl("zip_package", fullUrl);
                  setUploadedFileNames((prev) => ({ ...prev, zip_package: data.original_name }));
                }}
                disabled={uploadingEvidence["zip_package"] || isSubmitting}
              />
              <button
                type="button"
                disabled={uploadingEvidence["zip_package"] || isSubmitting}
                onClick={() => fileInputRefs.current["zip_package"]?.click()}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  border: "1.5px dashed #2563eb",
                  borderRadius: 8,
                  background: "#eff6ff",
                  padding: "6px 12px",
                  fontSize: 12,
                  color: "#1d4ed8",
                  cursor: uploadingEvidence["zip_package"] || isSubmitting ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
              >
                {uploadingEvidence["zip_package"] ? (
                  <><Spin size={12} color="#1d4ed8" /> Uploading ZIP…</>
                ) : (
                  <><span className="msym" style={{ fontSize: 16 }}>attach_file</span> Attach ZIP Package</>
                )}
              </button>

              {uploadedFileNames["zip_package"] && evidenceMap["zip_package"]?.url && (
                <span style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: "#d1fae5", color: "#047857",
                  borderRadius: 20, padding: "3px 10px", fontSize: 11.5, fontWeight: 600,
                }}>
                  <span className="msym" style={{ fontSize: 13 }}>check_circle</span>
                  {uploadedFileNames["zip_package"]}
                  <button
                    type="button"
                    onClick={() => {
                      updateEvidenceUrl("zip_package", "");
                      setUploadedFileNames((prev) => ({ ...prev, zip_package: null }));
                    }}
                    style={{ background: "none", border: "none", color: "#047857", cursor: "pointer", padding: 0, fontSize: 13, marginLeft: 2 }}
                  >&times;</button>
                </span>
              )}
            </div>
          </div>

          {/* Artifact 2: Project Summary & Implementation Notes */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: "16px",
              marginBottom: 20,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="msym" style={{ fontSize: 20, color: "#16a34a" }}>description</span>
              2. Project Summary & Implementation Notes (Text Explanation)
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
              Provide a clear text explanation describing what was built, feature overview, setup/installation instructions, and verification notes.
            </div>

            <textarea
              placeholder="Type or paste your project overview, implementation details, setup instructions, and feature summary here..."
              value={providerSummary}
              onChange={(e) => {
                const textVal = e.target.value;
                setProviderSummary(textVal);
                updateItemClaim("d2", textVal);
                updateItemClaim("d1", textVal ? "ZIP package provided in Artifact #1" : "");
              }}
              style={{
                width: "100%",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                padding: "12px 14px",
                fontSize: 13,
                resize: "vertical",
                minHeight: 110,
                fontFamily: "inherit",
                boxSizing: "border-box",
                background: "#ffffff",
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* AI Pre-Audit Readiness Check Banner */}
          <div style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                <span className="msym" style={{ fontSize: 16, color: "#0284c7" }}>smart_toy</span>
                AI Submission Readiness Pre-Check
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: readiness.pct >= 75 ? "#059669" : "#d97706" }}>
                {readiness.pct}% Readiness
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: 11.5 }}>
              <span style={{ padding: "3px 8px", borderRadius: 12, fontWeight: 600, background: evidenceMap["zip_package"]?.url ? "#d1fae5" : "#fef3c7", color: evidenceMap["zip_package"]?.url ? "#047857" : "#b45309" }}>
                {evidenceMap["zip_package"]?.url ? "✓" : "⚠"} ZIP Package Attached
              </span>
              <span style={{ padding: "3px 8px", borderRadius: 12, fontWeight: 600, background: providerSummary.trim().length > 10 ? "#d1fae5" : "#fef3c7", color: providerSummary.trim().length > 10 ? "#047857" : "#b45309" }}>
                {providerSummary.trim().length > 10 ? "✓" : "⚠"} Text Explanation Provided
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn type="button" variant="outline" onClick={onClose} disabled={isSubmitting} style={{ flex: 1, fontSize: 13 }}>
              Cancel
            </Btn>
            <Btn type="submit" variant="accent" disabled={isSubmitting} style={{ flex: 2, fontSize: 13 }}>
              {isSubmitting ? (
                <>
                  <Spin size={14} color="#fff" /> Submitting Deliverable...
                </>
              ) : (
                <>
                  <span className="msym" style={{ fontSize: 16 }}>upload</span>
                  Submit Project Deliverables
                </>
              )}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
