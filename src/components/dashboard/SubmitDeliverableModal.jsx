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
      const payload = buildSubmissionPayload({
        category: catConfig.id,
        summary: providerSummary,
        deliverables,
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

          {/* Section 1: Scope Deliverables */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.primary, marginBottom: 4 }}>
              1. Scope Deliverables & Provider Claims
            </div>
            <p style={{ fontSize: 12.5, color: T.gray500, marginBottom: 12 }}>
              Select completion status and provide explanation for each contract requirement.
            </p>

            {deliverables.map((item, idx) => (
              <div
                key={item.scope_item_id}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: "14px",
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a" }}>
                    #{idx + 1}. {item.name}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {[
                      ["completed", "Completed", "#10b981"],
                      ["partial", "Partial", "#f59e0b"],
                      ["not_completed", "Not Completed", "#ef4444"],
                      ["not_applicable", "N/A", "#64748b"],
                    ].map(([stVal, stLabel, stColor]) => (
                      <button
                        key={stVal}
                        type="button"
                        onClick={() => updateItemStatus(item.scope_item_id, stVal)}
                        style={{
                          border: `1px solid ${item.status === stVal ? stColor : "#cbd5e1"}`,
                          background: item.status === stVal ? stColor : "#ffffff",
                          color: item.status === stVal ? "#ffffff" : "#475569",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: 14,
                          cursor: "pointer",
                          transition: "all .15s ease",
                        }}
                      >
                        {stLabel}
                      </button>
                    ))}
                  </div>
                </div>

                {item.description && (
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{item.description}</div>
                )}

                <textarea
                  placeholder="Explain what was completed for this requirement..."
                  value={item.claim}
                  onChange={(e) => updateItemClaim(item.scope_item_id, e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    padding: "8px 10px",
                    fontSize: 12.5,
                    resize: "vertical",
                    minHeight: 50,
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    background: "#ffffff",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Section 2: Category Evidence Inputs */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.primary, marginBottom: 4 }}>
              2. {catConfig.label} Evidence & Links
            </div>
            <p style={{ fontSize: 12.5, color: T.gray500, marginBottom: 12 }}>
              Provide a URL <strong>or</strong> upload a file (PNG, JPG, PDF, ZIP — max 10 MB) as evidence.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(catConfig.evidenceTypes || []).map((ev) => {
                const isUploading = !!uploadingEvidence[ev.id];
                const uploadedName = uploadedFileNames[ev.id];
                const currentUrl = evidenceMap[ev.id]?.url || "";

                const handleFileSelect = async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingEvidence((prev) => ({ ...prev, [ev.id]: true }));
                  const { data, error } = await transactions.uploadEvidenceFile(file);
                  setUploadingEvidence((prev) => ({ ...prev, [ev.id]: false }));
                  if (error) {
                    setErrorMsg(`File upload failed: ${error}`);
                    return;
                  }
                  const backendBase = import.meta.env.VITE_API_URL
                    ? import.meta.env.VITE_API_URL.replace("/api", "")
                    : "http://localhost:4000";
                  const fullUrl = `${backendBase}${data.url}`;
                  updateEvidenceUrl(ev.id, fullUrl);
                  setUploadedFileNames((prev) => ({ ...prev, [ev.id]: data.original_name }));
                  // Reset file input so the same file can be re-selected
                  if (fileInputRefs.current[ev.id]) fileInputRefs.current[ev.id].value = "";
                };

                return (
                  <div key={ev.id}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      <span className="msym" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>{ev.icon}</span>
                      {ev.label}
                    </label>

                    {/* URL input */}
                    <input
                      type="url"
                      placeholder={ev.placeholder || "https://..."}
                      value={currentUrl}
                      onChange={(e) => {
                        updateEvidenceUrl(ev.id, e.target.value);
                        if (e.target.value === "") setUploadedFileNames((prev) => ({ ...prev, [ev.id]: null }));
                      }}
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        padding: "9px 12px",
                        fontSize: 13,
                        boxSizing: "border-box",
                        marginBottom: 6,
                      }}
                    />

                    {/* OR divider + file upload button */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 600 }}>OR</span>
                      <input
                        ref={(el) => { fileInputRefs.current[ev.id] = el; }}
                        type="file"
                        accept="image/*,.pdf,.zip,.txt,.md"
                        style={{ display: "none" }}
                        onChange={handleFileSelect}
                        disabled={isUploading || isSubmitting}
                      />
                      <button
                        type="button"
                        disabled={isUploading || isSubmitting}
                        onClick={() => fileInputRefs.current[ev.id]?.click()}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          border: "1.5px dashed #94a3b8",
                          borderRadius: 8,
                          background: "#f8fafc",
                          padding: "6px 12px",
                          fontSize: 12,
                          color: "#334155",
                          cursor: isUploading || isSubmitting ? "not-allowed" : "pointer",
                          fontWeight: 600,
                          transition: "border-color .15s",
                        }}
                      >
                        {isUploading ? (
                          <><Spin size={12} color="#334155" /> Uploading…</>
                        ) : (
                          <><span className="msym" style={{ fontSize: 14 }}>attach_file</span> Attach File</>
                        )}
                      </button>

                      {/* Uploaded file badge */}
                      {uploadedName && currentUrl && (
                        <span style={{
                          display: "flex", alignItems: "center", gap: 4,
                          background: "#d1fae5", color: "#047857",
                          borderRadius: 20, padding: "3px 10px", fontSize: 11.5, fontWeight: 600,
                        }}>
                          <span className="msym" style={{ fontSize: 13 }}>check_circle</span>
                          {uploadedName.length > 28 ? uploadedName.slice(0, 26) + "…" : uploadedName}
                          <button
                            type="button"
                            onClick={() => {
                              updateEvidenceUrl(ev.id, "");
                              setUploadedFileNames((prev) => ({ ...prev, [ev.id]: null }));
                            }}
                            style={{ background: "none", border: "none", color: "#047857", cursor: "pointer", padding: 0, fontSize: 13, lineHeight: 1, marginLeft: 2 }}
                          >×</button>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Custom Fields (if configured for category e.g. Cyber findings, AI metrics) */}
          {Array.isArray(catConfig.customFields) && catConfig.customFields.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.primary, marginBottom: 4 }}>
                3. Category Metrics & Details
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {catConfig.customFields.map((cf) => (
                  <div key={cf.id}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      {cf.label}
                    </label>
                    {cf.type === "select" ? (
                      <select
                        value={customFieldsMap[cf.id] || ""}
                        onChange={(e) => updateCustomField(cf.id, e.target.value)}
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          padding: "8px 10px",
                          fontSize: 12.5,
                          background: "#fff",
                        }}
                      >
                        {cf.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={cf.type === "number" ? "number" : "text"}
                        value={customFieldsMap[cf.id] ?? ""}
                        onChange={(e) => updateCustomField(cf.id, e.target.value)}
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          padding: "8px 10px",
                          fontSize: 12.5,
                          boxSizing: "border-box",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Testing & QA */}
          {catConfig.testing?.enabled && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.primary, marginBottom: 4 }}>
                {catConfig.customFields?.length ? "4. Testing & QA" : "3. Testing & QA"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{catConfig.testing.label}</span>
                <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 13 }}>
                  <input
                    type="radio"
                    name="testingRadio"
                    checked={testingInfo.performed}
                    onChange={() => setTestingInfo((t) => ({ ...t, performed: true }))}
                  />
                  Yes
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 13 }}>
                  <input
                    type="radio"
                    name="testingRadio"
                    checked={!testingInfo.performed}
                    onChange={() => setTestingInfo((t) => ({ ...t, performed: false }))}
                  />
                  No
                </label>
              </div>

              {testingInfo.performed && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="text"
                    placeholder={catConfig.testing.summaryPlaceholder}
                    value={testingInfo.summary}
                    onChange={(e) => setTestingInfo((t) => ({ ...t, summary: e.target.value }))}
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      padding: "8px 12px",
                      fontSize: 12.5,
                      boxSizing: "border-box",
                    }}
                  />
                  <input
                    type="url"
                    placeholder={catConfig.testing.reportUrlPlaceholder}
                    value={testingInfo.reportUrl}
                    onChange={(e) => setTestingInfo((t) => ({ ...t, reportUrl: e.target.value }))}
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      padding: "8px 12px",
                      fontSize: 12.5,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Section 5: General Release Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 4 }}>
              Submission Summary / Release Notes
            </label>
            <textarea
              placeholder="Provide a general summary describing what was achieved in this milestone..."
              value={providerSummary}
              onChange={(e) => setProviderSummary(e.target.value)}
              style={{
                width: "100%",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                padding: "10px 12px",
                fontSize: 13,
                resize: "vertical",
                minHeight: 70,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* AI Pre-Audit Readiness Check Banner */}
          <div style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                <span className="msym" style={{ fontSize: 16, color: "#0284c7" }}>smart_toy</span>
                AI Submission Readiness Pre-Check ({catConfig.label})
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: readiness.pct >= 75 ? "#059669" : "#d97706" }}>
                {readiness.pct}% Readiness
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: 11.5 }}>
              <span style={{ padding: "3px 8px", borderRadius: 12, fontWeight: 600, background: readiness.addressed === readiness.total ? "#d1fae5" : "#fef3c7", color: readiness.addressed === readiness.total ? "#047857" : "#b45309" }}>
                {readiness.addressed === readiness.total ? "✓" : "⚠"} {readiness.addressed}/{readiness.total} Scope Items Addressed
              </span>
              {(!readiness.warnings || readiness.warnings.length === 0) ? (
                <span style={{ padding: "3px 8px", borderRadius: 12, fontWeight: 600, background: "#d1fae5", color: "#047857" }}>
                  ✓ Recommended Evidence Attached
                </span>
              ) : (
                (readiness.warnings || []).map((w, idx) => (
                  <span key={idx} style={{ padding: "3px 8px", borderRadius: 12, fontWeight: 600, background: "#fef3c7", color: "#b45309" }}>
                    ⚠ {w}
                  </span>
                ))
              )}
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
                  Submit {catConfig.label} Deliverable
                </>
              )}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
