import { useState } from "react";
import { T, fs } from "../../tokens";
import { Btn, Spin, FormField as F } from "../../components/ui";
import { ai } from "../../utils/api";

function parseScopeState(scope, catLabel, currentAmount) {
  if (!scope) {
    return {
      res: null,
      editTitle: "",
      editOverview: "",
      editDeliverables: [],
      editAcceptance: [],
      editMilestones: [],
      editTimeline: "",
      editRevisions: "",
      editMilestonesCount: "2",
      editReviewDays: "3",
      editAmount: currentAmount ? String(currentAmount) : "",
      milestoneDueDates: {},
    };
  }

  const delivs = (scope.deliverables || []).map((d) =>
    typeof d === "string"
      ? d
      : d?.name
      ? `${d.name}${d.description ? ": " + d.description : ""}`
      : JSON.stringify(d)
  );

  const accepts = (scope.acceptance || []).map((a) =>
    typeof a === "string" ? a : a?.description || a?.text || JSON.stringify(a)
  );

  const rawMs = Array.isArray(scope.milestones) && scope.milestones.length > 0
    ? scope.milestones
    : [
        { name: "Phase 1: Initial Implementation", description: "Core project setup and initial feature delivery", timeline: "Phase 1" },
        { name: "Phase 2: Final Delivery & Handover", description: "Testing, polish, final documentation and deployment", timeline: "Phase 2" },
      ];

  const ms = rawMs.map((m, idx) => ({
    name: m.name || m.title || `Phase ${idx + 1}`,
    description: m.description || "",
    timeline: m.timeline || m.ai_suggested_timeline || `Phase ${idx + 1}`,
    expected_project_progress: m.expected_project_progress ?? Math.round(((idx + 1) / rawMs.length) * 100),
    due_date: m.due_date || m.dueDate || "",
    deliverables: (Array.isArray(m.deliverables) ? m.deliverables : []).map((d) =>
      typeof d === "string" ? d : d?.name || d?.description || JSON.stringify(d)
    ),
    acceptance_criteria: (Array.isArray(m.acceptance_criteria) ? m.acceptance_criteria : []).map((c) =>
      typeof c === "string" ? c : c?.description || c?.text || JSON.stringify(c)
    ),
  }));

  const dates = {};
  ms.forEach((m, idx) => {
    dates[idx] = m.due_date || "";
  });

  return {
    res: scope,
    editTitle: scope.title || `${catLabel || "Project"} Scope`,
    editOverview: scope.overview || "",
    editDeliverables: delivs.length > 0 ? delivs : ["Complete Project Implementation Archive (ZIP)", "Project Summary & Implementation Notes"],
    editAcceptance: accepts.length > 0 ? accepts : ["Project deliverable assets are submitted, verified, and match project scope specifications."],
    editMilestones: ms,
    editTimeline: scope.timeline || "2 weeks",
    editRevisions: scope.revisions || "2 revisions included per milestone",
    editMilestonesCount: String(ms.length || 2),
    editReviewDays: String(scope.review_days || 3),
    editAmount: scope.amount ? String(scope.amount) : currentAmount ? String(currentAmount) : "",
    milestoneDueDates: dates,
  };
}

const ScopeModal = ({ catLabel, currentAmount, transactionId, initialScope, onClose, onApply }) => {
  const [desc, setDesc] = useState("");
  const [ld, setLd] = useState(false);

  const initialParsed = parseScopeState(initialScope, catLabel, currentAmount);

  const [res, setRes] = useState(initialParsed.res);
  const [editTitle, setEditTitle] = useState(initialParsed.editTitle);
  const [editOverview, setEditOverview] = useState(initialParsed.editOverview);
  const [editDeliverables, setEditDeliverables] = useState(initialParsed.editDeliverables);
  const [editAcceptance, setEditAcceptance] = useState(initialParsed.editAcceptance);
  const [editMilestones, setEditMilestones] = useState(initialParsed.editMilestones);

  const [editTimeline, setEditTimeline] = useState(initialParsed.editTimeline);
  const [editRevisions, setEditRevisions] = useState(initialParsed.editRevisions);
  const [editMilestonesCount, setEditMilestonesCount] = useState(initialParsed.editMilestonesCount);
  const [editReviewDays, setEditReviewDays] = useState(initialParsed.editReviewDays);
  const [editAmount, setEditAmount] = useState(initialParsed.editAmount);
  const [milestoneDueDates, setMilestoneDueDates] = useState(initialParsed.milestoneDueDates);

  const loadScopeIntoState = (scope) => {
    const parsed = parseScopeState(scope, catLabel, currentAmount);
    setRes(parsed.res);
    setEditTitle(parsed.editTitle);
    setEditOverview(parsed.editOverview);
    setEditDeliverables(parsed.editDeliverables);
    setEditAcceptance(parsed.editAcceptance);
    setEditMilestones(parsed.editMilestones);
    setEditTimeline(parsed.editTimeline);
    setEditRevisions(parsed.editRevisions);
    setEditMilestonesCount(parsed.editMilestonesCount);
    setEditReviewDays(parsed.editReviewDays);
    if (parsed.editAmount) setEditAmount(parsed.editAmount);
    setMilestoneDueDates(parsed.milestoneDueDates);
  };

  const gen = async () => {
    if (!desc.trim()) return;
    setLd(true);
    const { data, error } = await ai.generateScope(catLabel, desc.trim(), transactionId);
    if (error) {
      alert(error);
      setLd(false);
      return;
    }
    if (data && data.scope) {
      loadScopeIntoState(data.scope);
    }
    setLd(false);
  };

  // ── Deliverable item handlers ───────────────────────────────────────
  const handleDeliverableChange = (idx, val) => {
    setEditDeliverables((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleAddDeliverable = () => {
    setEditDeliverables((prev) => [...prev, ""]);
  };

  const handleRemoveDeliverable = (idx) => {
    setEditDeliverables((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Acceptance Criteria item handlers ──────────────────────────────
  const handleAcceptanceChange = (idx, val) => {
    setEditAcceptance((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleAddAcceptance = () => {
    setEditAcceptance((prev) => [...prev, ""]);
  };

  const handleRemoveAcceptance = (idx) => {
    setEditAcceptance((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Milestone handlers ─────────────────────────────────────────────
  const handleMilestoneFieldChange = (mIdx, field, val) => {
    setEditMilestones((prev) => {
      const next = [...prev];
      next[mIdx] = { ...next[mIdx], [field]: val };
      return next;
    });
  };

  const handleAddMilestone = () => {
    const nextIdx = editMilestones.length + 1;
    const newM = {
      name: `Phase ${nextIdx}: Additional Scope`,
      description: `Phase ${nextIdx} deliverables and inspection criteria`,
      timeline: `Phase ${nextIdx}`,
      expected_project_progress: Math.min(100, Math.round((nextIdx / (nextIdx + 1)) * 100)),
      due_date: "",
      deliverables: ["Key phase deliverable archive / assets"],
      acceptance_criteria: ["Client review and acceptance"],
    };
    const updated = [...editMilestones, newM];
    setEditMilestones(updated);
    setEditMilestonesCount(String(updated.length));
  };

  const handleRemoveMilestone = (mIdx) => {
    if (editMilestones.length <= 1) return;
    const updated = editMilestones.filter((_, i) => i !== mIdx);
    setEditMilestones(updated);
    setEditMilestonesCount(String(updated.length));

    // Shift due dates
    const newDates = {};
    updated.forEach((_, idx) => {
      newDates[idx] = milestoneDueDates[idx >= mIdx ? idx + 1 : idx] || "";
    });
    setMilestoneDueDates(newDates);
  };

  const handleMsDeliverableChange = (mIdx, dIdx, val) => {
    setEditMilestones((prev) => {
      const next = [...prev];
      const mDelivs = [...(next[mIdx].deliverables || [])];
      mDelivs[dIdx] = val;
      next[mIdx] = { ...next[mIdx], deliverables: mDelivs };
      return next;
    });
  };

  const handleAddMsDeliverable = (mIdx) => {
    setEditMilestones((prev) => {
      const next = [...prev];
      const mDelivs = [...(next[mIdx].deliverables || []), ""];
      next[mIdx] = { ...next[mIdx], deliverables: mDelivs };
      return next;
    });
  };

  const handleRemoveMsDeliverable = (mIdx, dIdx) => {
    setEditMilestones((prev) => {
      const next = [...prev];
      const mDelivs = (next[mIdx].deliverables || []).filter((_, i) => i !== dIdx);
      next[mIdx] = { ...next[mIdx], deliverables: mDelivs };
      return next;
    });
  };

  const handleMsCriteriaChange = (mIdx, cIdx, val) => {
    setEditMilestones((prev) => {
      const next = [...prev];
      const mCrits = [...(next[mIdx].acceptance_criteria || [])];
      mCrits[cIdx] = val;
      next[mIdx] = { ...next[mIdx], acceptance_criteria: mCrits };
      return next;
    });
  };

  const handleAddMsCriteria = (mIdx) => {
    setEditMilestones((prev) => {
      const next = [...prev];
      const mCrits = [...(next[mIdx].acceptance_criteria || []), ""];
      next[mIdx] = { ...next[mIdx], acceptance_criteria: mCrits };
      return next;
    });
  };

  const handleRemoveMsCriteria = (mIdx, cIdx) => {
    setEditMilestones((prev) => {
      const next = [...prev];
      const mCrits = (next[mIdx].acceptance_criteria || []).filter((_, i) => i !== cIdx);
      next[mIdx] = { ...next[mIdx], acceptance_criteria: mCrits };
      return next;
    });
  };

  // Sync when Number of Milestones select dropdown changes
  const handleMilestoneCountChange = (val) => {
    setEditMilestonesCount(val);
    const targetCount = parseInt(val) || 1;
    let current = [...editMilestones];
    if (targetCount > current.length) {
      for (let i = current.length; i < targetCount; i++) {
        current.push({
          name: `Phase ${i + 1}`,
          description: `Phase ${i + 1} deliverable inspection and approval`,
          timeline: `Phase ${i + 1}`,
          expected_project_progress: Math.round(((i + 1) / targetCount) * 100),
          due_date: "",
          deliverables: ["Deliverable assets & implementation files"],
          acceptance_criteria: ["Meets acceptance criteria for this phase"],
        });
      }
    } else if (targetCount < current.length) {
      current = current.slice(0, targetCount);
    }
    setEditMilestones(current);
  };

  const handleUseScope = () => {
    if (!res) return;

    // Attach due dates to milestones
    const finalMilestones = editMilestones.map((m, idx) => {
      const dueDate = milestoneDueDates[idx] || m.due_date;
      return {
        ...m,
        due_date: dueDate || undefined,
        deliverables: (m.deliverables || []).filter((d) => (typeof d === "string" ? d.trim() : d)),
        acceptance_criteria: (m.acceptance_criteria || []).filter((c) => (typeof c === "string" ? c.trim() : c)),
      };
    });

    const lastDueDate = milestoneDueDates[finalMilestones.length - 1] || finalMilestones[finalMilestones.length - 1]?.due_date;
    const parsedAmt = parseFloat(editAmount);
    const finalAmount = !isNaN(parsedAmt) && parsedAmt > 0 ? parsedAmt : (res.amount || (currentAmount ? parseFloat(currentAmount) : null));

    const finalScope = {
      ...res,
      title: editTitle.trim() || res.title || `${catLabel || "Project"} Scope`,
      overview: editOverview.trim() || res.overview || "",
      deliverables: editDeliverables.map((d) => d.trim()).filter(Boolean),
      acceptance: editAcceptance.map((a) => a.trim()).filter(Boolean),
      amount: finalAmount,
      timeline: editTimeline.trim() || res.timeline || "Flexible Timeline",
      revisions: editRevisions.trim() || res.revisions || "2 revisions included per milestone",
      milestones_count: finalMilestones.length,
      review_days: Math.min(30, Math.max(1, parseInt(editReviewDays) || 3)),
      milestones: finalMilestones,
      ...(lastDueDate ? { agreed_deadline: lastDueDate } : {}),
    };

    onApply(finalScope);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        zIndex: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
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
        <div
          style={{
            background: "linear-gradient(135deg,#0f766e,#0d9488)",
            padding: "20px 24px",
            color: T.white,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, display: "flex", alignItems: "center", gap: 8 }}>
              <span className="msym" style={{ fontSize: 20 }}>assignment</span>
              AI Scope Generator
            </div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
              Generate and customize every aspect of your project scope &amp; milestone contract
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,.15)",
              border: "none",
              color: T.white,
              borderRadius: "50%",
              width: 30,
              height: 30,
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {!res ? (
            <>
              <div
                style={{
                  background: T.tealLt,
                  border: `1px solid #a7f3d0`,
                  borderRadius: 10,
                  padding: "13px 15px",
                  fontSize: 13,
                  color: "#005235",
                  marginBottom: 18,
                  lineHeight: 1.7,
                }}
              >
                Describe what you need in plain English. AI will generate deliverables, milestones, and acceptance criteria — which you can fully edit and adjust before attaching to your escrow contract.
              </div>
              <F label="Project Description" req>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={6}
                  placeholder={`e.g. "I need a ${catLabel || "Software Application"} with user auth, a dashboard, CSV export, and an admin panel. Target completion in 10 days."`}
                  style={{ ...fs, resize: "vertical", lineHeight: 1.7 }}
                />
              </F>
              <Btn
                variant="teal"
                onClick={gen}
                disabled={!desc.trim() || ld}
                style={{ width: "100%", marginTop: 16, fontSize: 15 }}
              >
                {ld ? (
                  <>
                    <Spin />
                    Generating scope…
                  </>
                ) : (
                  "Generate Scope with AI →"
                )}
              </Btn>
            </>
          ) : (
            <>
              {/* Editable Scope Title & Overview Banner */}
              <div
                style={{
                  background: "#f0fdfa",
                  border: "1.5px solid #99f6e4",
                  borderRadius: 12,
                  padding: "16px 18px",
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: "#0f766e", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
                  Project Title &amp; Summary (Editable)
                </div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Project Title"
                  style={{
                    ...fs,
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#0f766e",
                    background: "#ffffff",
                    border: "1px solid #99f6e4",
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: 10,
                    width: "100%",
                  }}
                />
                <textarea
                  rows={3}
                  value={editOverview}
                  onChange={(e) => setEditOverview(e.target.value)}
                  placeholder="Project Overview / Summary"
                  style={{
                    ...fs,
                    fontSize: 13,
                    color: "#134e4a",
                    background: "#ffffff",
                    border: "1px solid #99f6e4",
                    borderRadius: 8,
                    padding: "8px 12px",
                    lineHeight: 1.6,
                    resize: "vertical",
                    width: "100%",
                  }}
                />
              </div>

              {/* ── Project Deliverables (Editable List) ── */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: T.primary, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>Deliverables</span>
                    <span style={{ fontSize: 11, background: "#e0e7ff", color: "#4338ca", fontWeight: 700, padding: "1px 7px", borderRadius: 10 }}>
                      {editDeliverables.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #86efac",
                      color: "#166534",
                      borderRadius: 6,
                      padding: "3px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    + Add Deliverable
                  </button>
                </div>

                {editDeliverables.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <span style={{ color: T.teal, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>✓</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleDeliverableChange(i, e.target.value)}
                      placeholder={`Deliverable #${i + 1}`}
                      style={{
                        ...fs,
                        fontSize: 13,
                        color: T.gray800,
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        flex: 1,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(i)}
                      title="Remove deliverable"
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#ef4444",
                        borderRadius: 6,
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* ── Acceptance Criteria (Editable List) ── */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: T.primary, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>Acceptance Criteria</span>
                    <span style={{ fontSize: 11, background: "#e0e7ff", color: "#4338ca", fontWeight: 700, padding: "1px 7px", borderRadius: 10 }}>
                      {editAcceptance.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAcceptance}
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #86efac",
                      color: "#166534",
                      borderRadius: 6,
                      padding: "3px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    + Add Criterion
                  </button>
                </div>

                {editAcceptance.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <span style={{ color: "#0284c7", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>✓</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleAcceptanceChange(i, e.target.value)}
                      placeholder={`Acceptance Criterion #${i + 1}`}
                      style={{
                        ...fs,
                        fontSize: 13,
                        color: T.gray800,
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        flex: 1,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAcceptance(i)}
                      title="Remove criterion"
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#ef4444",
                        borderRadius: 6,
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* ── Proposed Milestones (Editable Cards) ── */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: T.primary }}>
                    Proposed Milestones ({editMilestones.length})
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    style={{
                      background: "#eef2ff",
                      border: "1px solid #c7d2fe",
                      color: "#4338ca",
                      borderRadius: 6,
                      padding: "4px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    + Add Phase / Milestone
                  </button>
                </div>

                {editMilestones.map((m, i) => {
                  const msDeliverables = Array.isArray(m.deliverables) ? m.deliverables : [];
                  const msCriteria = Array.isArray(m.acceptance_criteria) ? m.acceptance_criteria : [];

                  return (
                    <div
                      key={i}
                      style={{
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: 10,
                        padding: "14px 14px",
                        marginBottom: 14,
                        fontSize: 12.5,
                      }}
                    >
                      {/* Milestone header with name, timeline & checkpoint */}
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "#4338ca",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 11,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => handleMilestoneFieldChange(i, "name", e.target.value)}
                          placeholder={`Phase ${i + 1} Name`}
                          style={{
                            ...fs,
                            fontWeight: 700,
                            fontSize: 13,
                            color: "#0f172a",
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            flex: 2,
                            minWidth: 160,
                          }}
                        />
                        <input
                          type="text"
                          value={m.timeline || ""}
                          onChange={(e) => handleMilestoneFieldChange(i, "timeline", e.target.value)}
                          placeholder="e.g. Day 3"
                          title="Milestone timeline"
                          style={{
                            ...fs,
                            fontSize: 12,
                            color: "#4338ca",
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: "1px solid #c7d2fe",
                            background: "#eef2ff",
                            width: 80,
                          }}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <span style={{ fontSize: 11, color: "#6d28d9", fontWeight: 700 }}>🎯</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={m.expected_project_progress ?? ""}
                            onChange={(e) => handleMilestoneFieldChange(i, "expected_project_progress", e.target.value ? parseInt(e.target.value) : 0)}
                            placeholder="%"
                            title="Expected progress % checkpoint"
                            style={{
                              ...fs,
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: "#7c3aed",
                              background: "#ede9fe",
                              border: "1px solid #ddd6fe",
                              borderRadius: 6,
                              padding: "4px 6px",
                              width: 52,
                              textAlign: "center",
                            }}
                          />
                          <span style={{ fontSize: 11, color: "#6d28d9", fontWeight: 700 }}>%</span>
                        </div>

                        {editMilestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMilestone(i)}
                            title="Delete this milestone"
                            style={{
                              background: "#fef2f2",
                              border: "1px solid #fecaca",
                              color: "#ef4444",
                              borderRadius: 6,
                              padding: "3px 8px",
                              fontSize: 11,
                              cursor: "pointer",
                              marginLeft: "auto",
                            }}
                          >
                            × Remove Phase
                          </button>
                        )}
                      </div>

                      {/* Milestone Description */}
                      <textarea
                        rows={2}
                        value={m.description || ""}
                        onChange={(e) => handleMilestoneFieldChange(i, "description", e.target.value)}
                        placeholder={`Phase ${i + 1} summary and description...`}
                        style={{
                          ...fs,
                          fontSize: 12,
                          color: "#334155",
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "1px solid #e2e8f0",
                          width: "100%",
                          marginBottom: 8,
                          resize: "vertical",
                        }}
                      />

                      {/* Editable Due Date per Milestone */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#334155", whiteSpace: "nowrap" }}>
                          📅 Due Date{i === editMilestones.length - 1 ? " (Project Deadline)" : ""}:
                        </label>
                        <input
                          type="date"
                          value={milestoneDueDates[i] || m.due_date || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMilestoneDueDates((prev) => ({ ...prev, [i]: val }));
                            handleMilestoneFieldChange(i, "due_date", val);
                          }}
                          style={{
                            fontSize: 12,
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            background: "#fff",
                            color: "#0f172a",
                            fontFamily: "inherit",
                            maxWidth: 180,
                          }}
                          min={i > 0 && milestoneDueDates[i - 1] ? milestoneDueDates[i - 1] : undefined}
                        />
                        {(milestoneDueDates[i] || m.due_date) && (
                          <span style={{ fontSize: 10.5, color: "#15803d", fontWeight: 600 }}>
                            {new Date((milestoneDueDates[i] || m.due_date) + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </div>

                      {/* Milestone Deliverables Sub-list */}
                      <div style={{ background: "#ffffff", border: "1px solid #ede9fe", borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#6d28d9", textTransform: "uppercase", letterSpacing: ".05em" }}>
                            Phase Deliverables
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddMsDeliverable(i)}
                            style={{ background: "none", border: "none", color: "#7c3aed", fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "1px 4px" }}
                          >
                            + Add Item
                          </button>
                        </div>
                        {msDeliverables.map((d, di) => (
                          <div key={di} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 5 }}>
                            <span style={{ color: "#7c3aed", fontSize: 12, flexShrink: 0 }}>•</span>
                            <input
                              type="text"
                              value={typeof d === "string" ? d : d.name || d.description || ""}
                              onChange={(e) => handleMsDeliverableChange(i, di, e.target.value)}
                              placeholder={`Deliverable item #${di + 1}`}
                              style={{
                                ...fs,
                                fontSize: 11.5,
                                color: "#374151",
                                padding: "4px 7px",
                                borderRadius: 5,
                                border: "1px solid #e2e8f0",
                                flex: 1,
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveMsDeliverable(i, di)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                                fontSize: 13,
                                padding: "2px 4px",
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Milestone Acceptance Criteria Sub-list */}
                      <div style={{ background: "#ffffff", border: "1px solid #e0f2fe", borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: ".05em" }}>
                            Phase Acceptance Criteria
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddMsCriteria(i)}
                            style={{ background: "none", border: "none", color: "#0284c7", fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "1px 4px" }}
                          >
                            + Add Item
                          </button>
                        </div>
                        {msCriteria.map((c, ci) => (
                          <div key={ci} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 5 }}>
                            <span style={{ color: "#0369a1", fontSize: 12, flexShrink: 0 }}>✓</span>
                            <input
                              type="text"
                              value={typeof c === "string" ? c : c.description || c.text || ""}
                              onChange={(e) => handleMsCriteriaChange(i, ci, e.target.value)}
                              placeholder={`Acceptance criterion #${ci + 1}`}
                              style={{
                                ...fs,
                                fontSize: 11.5,
                                color: "#374151",
                                padding: "4px 7px",
                                borderRadius: 5,
                                border: "1px solid #e2e8f0",
                                flex: 1,
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveMsCriteria(i, ci)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                                fontSize: 13,
                                padding: "2px 4px",
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customizable Contract Terms */}
              <div
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: "#334155" }}>
                  ⚙ Customize Contract Terms
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <F label="Agreed Project Amount (USD)">
                    <input
                      type="number"
                      style={{ ...fs, fontSize: 12.5 }}
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      placeholder="e.g. 500 or 700"
                    />
                  </F>
                  <F label="Project Duration / Timeline">
                    <input
                      style={{ ...fs, fontSize: 12.5 }}
                      value={editTimeline}
                      onChange={(e) => setEditTimeline(e.target.value)}
                      placeholder="e.g. 2 days, 10 days, 2 weeks"
                    />
                  </F>
                  <F label="Number of Milestones">
                    <select
                      style={{ ...fs, fontSize: 12.5 }}
                      value={editMilestonesCount}
                      onChange={(e) => handleMilestoneCountChange(e.target.value)}
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} milestone{n > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </F>
                  <F label="Review Window (Days)">
                    <select
                      style={{ ...fs, fontSize: 12.5 }}
                      value={editReviewDays}
                      onChange={(e) => setEditReviewDays(e.target.value)}
                    >
                      {[1, 2, 3, 5, 7, 10, 14].map((n) => (
                        <option key={n} value={n}>
                          {n} day{n > 1 ? "s" : ""} per milestone
                        </option>
                      ))}
                    </select>
                  </F>
                  <F label="Revision Policy" style={{ gridColumn: "span 2" }}>
                    <input
                      style={{ ...fs, fontSize: 12.5 }}
                      value={editRevisions}
                      onChange={(e) => setEditRevisions(e.target.value)}
                      placeholder="e.g. 2 revisions per milestone"
                    />
                  </F>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="outline" onClick={() => setRes(null)} style={{ flex: 1 }}>
                  ← Regenerate
                </Btn>
                <Btn variant="teal" onClick={handleUseScope} style={{ flex: 1 }}>
                  Use This Scope →
                </Btn>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScopeModal;
