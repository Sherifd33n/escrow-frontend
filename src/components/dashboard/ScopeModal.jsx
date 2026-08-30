import { useState } from "react";
import { T, fs } from "../../tokens";
import { Btn, Spin, FormField as F } from "../../components/ui";
import { ai } from "../../utils/api";

const ScopeModal = ({ catLabel, currentAmount, onClose, onApply }) => {
  const [desc, setDesc] = useState("");
  const [ld, setLd] = useState(false);
  const [res, setRes] = useState(null);
  const [editTimeline, setEditTimeline] = useState("");
  const [editRevisions, setEditRevisions] = useState("");
  const [editMilestonesCount, setEditMilestonesCount] = useState("2");
  const [editReviewDays, setEditReviewDays] = useState("3");
  const [editAmount, setEditAmount] = useState(currentAmount ? String(currentAmount) : "");

  const gen = async () => {
    if (!desc.trim()) return;
    setLd(true);
    const { data, error } = await ai.generateScope(catLabel, desc.trim());
    if (error) {
      alert(error);
      setLd(false);
      return;
    }
    if (data && data.scope) {
      setRes(data.scope);
      setEditTimeline(data.scope.timeline || "2 weeks");
      setEditRevisions(data.scope.revisions || "2 revisions included per milestone");
      setEditMilestonesCount(String(data.scope.milestones_count || data.scope.milestones?.length || 2));
      setEditReviewDays(String(data.scope.review_days || 3));
      if (data.scope.amount) setEditAmount(String(data.scope.amount));
    }
    setLd(false);
  };

  const handleUseScope = () => {
    if (!res) return;
    const mCount = Math.min(100, Math.max(1, parseInt(editMilestonesCount) || res.milestones?.length || 1));
    let finalMilestones = Array.isArray(res.milestones) ? [...res.milestones] : [];
    
    if (finalMilestones.length !== mCount) {
      const updated = [];
      for (let i = 0; i < mCount; i++) {
        if (finalMilestones[i]) {
          updated.push(finalMilestones[i]);
        } else {
          updated.push({
            name: `Milestone ${i + 1}`,
            description: `Phase ${i + 1} deliverable inspection and milestone approval`,
            timeline: `Phase ${i + 1}`,
          });
        }
      }
      finalMilestones = updated;
    }

    const parsedAmt = parseFloat(editAmount);
    const finalAmount = !isNaN(parsedAmt) && parsedAmt > 0 ? parsedAmt : (res.amount || (currentAmount ? parseFloat(currentAmount) : null));

    const finalScope = {
      ...res,
      amount: finalAmount,
      timeline: editTimeline.trim() || res.timeline || "Flexible Timeline",
      revisions: editRevisions.trim() || res.revisions || "2 revisions included per milestone",
      milestones_count: mCount,
      review_days: Math.min(30, Math.max(1, parseInt(editReviewDays) || 3)),
      milestones: finalMilestones,
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
          maxWidth: 620,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,.28)",
          animation: "fadeUp .3s ease",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg,#0f766e,#0d9488)",
            padding: "22px 26px",
            color: T.white,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, display: "flex", alignItems: "center", gap: 8 }}>
              <span className="msym" style={{ fontSize: 20 }}>assignment</span>
              AI Scope Generator
            </div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 3 }}>
              Describe your project — AI drafts the full scope &amp; milestone schedule
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,.12)",
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

        <div style={{ padding: "26px" }}>
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
                Describe what you need in plain English. AI will generate deliverables, milestones, and acceptance criteria — ready to attach to your escrow contract.
              </div>
              <F label="Project Description" req>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={6}
                  placeholder={`e.g. "I need a ${catLabel} with user auth, a dashboard, CSV export, and an admin panel. Target completion in 10 days."`}
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
              <div
                style={{
                  background: T.tealLt,
                  border: `1px solid #99f6e4`,
                  borderRadius: 12,
                  padding: "16px 18px",
                  marginBottom: 20,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f766e", marginBottom: 4 }}>
                  {res.title}
                </div>
                <p style={{ fontSize: 13, color: "#0f766e", lineHeight: 1.65, margin: 0 }}>
                  {res.overview}
                </p>
              </div>

              {[["Deliverables", res.deliverables], ["Acceptance Criteria", res.acceptance]].map(
                ([t, items]) => (
                  <div key={t} style={{ marginBottom: 18 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: T.primary, marginBottom: 10 }}>
                      {t}
                    </div>
                    {items?.map((d, i) => {
                      const label =
                        typeof d === "string"
                          ? d
                          : d && typeof d === "object"
                          ? `${d.name || ""}${d.description ? " — " + d.description : ""}`
                          : String(d || "");
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: 9,
                            alignItems: "flex-start",
                            marginBottom: 7,
                            fontSize: 13,
                            color: T.gray700,
                          }}
                        >
                          <span style={{ color: T.teal, fontWeight: 700, flexShrink: 0 }}>✓</span>
                          {label}
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* Milestones Preview */}
              {Array.isArray(res.milestones) && res.milestones.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: T.primary, marginBottom: 10 }}>
                    Proposed Milestones ({res.milestones.length})
                  </div>
                  {res.milestones.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        padding: "10px 12px",
                        marginBottom: 6,
                        fontSize: 12.5,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>
                        {i + 1}. {m.name || m.title || `Phase ${i + 1}`} {m.timeline ? `(${m.timeline})` : ""}
                      </div>
                      {m.description && <div style={{ color: "#64748b", fontSize: 12 }}>{m.description}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Customizable Timeline & Revision Terms */}
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
                      onChange={(e) => setEditMilestonesCount(e.target.value)}
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
