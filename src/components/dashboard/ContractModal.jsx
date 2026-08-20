import { useState, useEffect } from "react";
import { T } from "../../tokens";
import { Btn } from "../../components/ui";
import { transactions } from "../../utils/api";

import ScopeModal from "./ScopeModal";

// ─── helper: parse JSON that may already be an object ───────────────
function parseScopeField(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch { return null; }
}

// ─── small presentational helpers ───────────────────────────────────
const SectionHeader = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 800, letterSpacing: ".08em",
    textTransform: "uppercase", color: "#4338ca", marginTop: 22,
    marginBottom: 8, paddingBottom: 4,
    borderBottom: "1.5px solid #e0e7ff"
  }}>
    {children}
  </div>
);

const Item = ({ n, text }) => {
  const renderText = typeof text === "string" ? text : (text && typeof text === "object" ? (text.name ? `${text.name}${text.description ? ": " + text.description : ""}` : JSON.stringify(text)) : String(text || ""));
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 7, alignItems: "flex-start", fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>
      <span style={{ minWidth: 22, height: 22, borderRadius: "50%", background: "#4338ca", color: "#fff", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{n}</span>
      <span>{renderText}</span>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", gap: 6, marginBottom: 5, fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
    <span style={{ fontWeight: 700, minWidth: 180, flexShrink: 0, color: "#475569" }}>{label}:</span>
    <span>{value}</span>
  </div>
);

const MilestoneCard = ({ m, i }) => {
  const name = m.name || m.title || `Milestone ${i + 1}`;
  const desc = m.description || null;
  const aiTimeline = m.timeline || m.ai_suggested_timeline || null;
  const startDate = m.startDate || m.start_date ? new Date(m.startDate || m.start_date).toLocaleDateString() : null;
  const dueDate = m.dueDate || m.due_date ? new Date(m.dueDate || m.due_date).toLocaleDateString() : null;

  return (
    <div style={{ background: "#f8faff", border: "1px solid #e0e7ff", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: desc || aiTimeline || startDate ? 8 : 0 }}>
        <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#4338ca", color: "#fff", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
        <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>{name}</span>
      </div>
      {desc && <div style={{ fontSize: 12.5, color: "#475569", marginBottom: 5, paddingLeft: 36, lineHeight: 1.6 }}>{desc}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 18px", paddingLeft: 36 }}>
        {aiTimeline && <span style={{ fontSize: 11.5, color: "#4338ca", fontWeight: 600, background: "#eef2ff", borderRadius: 6, padding: "2px 8px" }}>🤖 AI Estimate: {aiTimeline}</span>}
        {startDate && <span style={{ fontSize: 11.5, color: "#006c47", fontWeight: 600, background: "#f0fdf4", borderRadius: 6, padding: "2px 8px" }}>▶ Start: {startDate}</span>}
        {dueDate && <span style={{ fontSize: 11.5, color: "#b45309", fontWeight: 600, background: "#fffbeb", borderRadius: 6, padding: "2px 8px" }}>⏱ Due: {dueDate}</span>}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────
const ContractModal = ({ tx, scope, onClose, onScopeUpdated }) => {
  const [confirmedScope, setConfirmedScope] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [requestMsg, setRequestMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', text: '' }
  const [providerRequests, setProviderRequests] = useState([]);

  useEffect(() => {
    // Priority: tx.scope_json (DB) > tx.scope > scope prop
    const parsed =
      parseScopeField(tx?.scope_json) ||
      parseScopeField(tx?.scope) ||
      parseScopeField(scope);
    setConfirmedScope(parsed);

    // Fetch transaction history to check for provider contract change requests
    const txId = tx?.realId || tx?.id;
    if (txId) {
      transactions.getHistory(txId).then(({ data }) => {
        if (Array.isArray(data)) {
          const reqs = data.filter(e => e.action === "contract_change_requested");
          setProviderRequests(reqs);
        }
      }).catch(err => console.error("Failed to load tx history:", err));
    }
  }, [tx, scope]);

  const handleSendChangeRequest = async () => {
    if (!requestMsg.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    const txId = tx?.realId || tx?.id;
    try {
      const res = await transactions.requestScopeChanges(txId, requestMsg);
      if (res.error) {
        setFeedback({ type: "error", text: res.error });
      } else {
        setFeedback({ type: "success", text: res.data?.message || "Change request sent to client!" });
        setShowForm(false);
        setRequestMsg("");
      }
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "Failed to send request." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyNewScope = async (newScope) => {
    const txId = tx?.realId || tx?.id;
    if (!txId) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await transactions.confirmScope(txId, { scope_json: newScope });
      if (res.error) {
        setFeedback({ type: "error", text: res.error });
      } else {
        setConfirmedScope(newScope);
        setFeedback({ type: "success", text: "Contract scope successfully updated!" });
        setShowScopeModal(false);
        if (onScopeUpdated) onScopeUpdated();
      }
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "Failed to update scope." });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived display values ─────────────────────────────────────
  const title     = confirmedScope?.title || tx?.title || "Tech Services Project";
  const category  = tx?.type || tx?.category || "Software Development";
  const amount    = `${tx?.currency || "USD"} ${(parseFloat(tx?.amount) || 0).toLocaleString()}`;
  const buyerName = tx?.buyer_name  || (tx?.other && tx?.role === "seller" ? tx.other : "Client");
  const sellerName= tx?.seller_name || (tx?.other && tx?.role === "buyer"  ? tx.other : "Service Provider");

  const overview  = confirmedScope?.overview || null;

  const deliverables   = Array.isArray(confirmedScope?.deliverables) && confirmedScope.deliverables.length ? confirmedScope.deliverables : null;
  const acceptance     = Array.isArray(confirmedScope?.acceptance)   && confirmedScope.acceptance.length   ? confirmedScope.acceptance   : null;

  const milestones = (() => {
    if (Array.isArray(confirmedScope?.milestones) && confirmedScope.milestones.length) {
      return confirmedScope.milestones;
    }
    if (Array.isArray(tx?.milestones) && tx.milestones.length) {
      return tx.milestones.map(m => ({
        name: m.title,
        description: m.description,
        timeline: m.ai_suggested_timeline,
        start_date: m.start_date,
        due_date: m.due_date,
      }));
    }
    return null;
  })();

  const aiTimeline     = confirmedScope?.timeline || tx?.ai_estimated_timeline || null;
  const agreedDuration = tx?.agreed_duration || null;
  const agreedDeadline = tx?.agreed_deadline ? new Date(tx.agreed_deadline).toLocaleDateString() : null;
  const reviewDays     = tx?.review_days || 3;
  const revisionTerms  = tx?.revision_policy || confirmedScope?.revisions || "2 rounds of minor revisions included per milestone";

  const hasScope = !!confirmedScope;
  const canRequestChanges = !tx?.status || ["pending", "funded"].includes(tx?.status);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: T.white, borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,.28)", animation: "fadeUp .3s ease" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#3730a3,#4338ca)", padding: "22px 26px", color: T.white, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, display: "flex", alignItems: "center", gap: 8 }}>
              <span className="msym" style={{ fontSize: 20 }}>description</span>
              Escrow Contract
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 3 }}>{title}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.12)", border: "none", color: T.white, borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 26px" }}>

          {/* Feedback message banner */}
          {feedback && (
            <div style={{
              background: feedback.type === "error" ? "#fef2f2" : "#f0fdf4",
              border: `1px solid ${feedback.type === "error" ? "#fecaca" : "#bbf7d0"}`,
              borderRadius: 10, padding: "12px 14px", fontSize: 13,
              color: feedback.type === "error" ? "#dc2626" : "#166534",
              marginBottom: 16, display: "flex", alignItems: "center", gap: 8
            }}>
              <span className="msym" style={{ fontSize: 18 }}>{feedback.type === "error" ? "error" : "check_circle"}</span>
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Provider Contract Change Request Notes Box */}
          {providerRequests.length > 0 && (
            <div style={{ background: "#fff7ed", border: "1.5px solid #fdba74", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#c2410c", marginBottom: 16, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <span className="msym" style={{ fontSize: 18 }}>mark_email_unread</span>
                Provider Contract Change Request ({providerRequests.length})
              </div>
              {providerRequests.map((req, idx) => (
                <div key={idx} style={{ background: "#fff", border: "1px solid #fed7aa", borderRadius: 8, padding: "8px 12px", marginTop: 6, fontSize: 12.5, color: "#431407" }}>
                  <strong>{req.name || sellerName}:</strong> "{req.note || req.metadata?.message}"
                  <div style={{ fontSize: 11, color: "#9a3412", marginTop: 2 }}>{new Date(req.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}

          {/* Notice banner */}
          <div style={{ background: hasScope ? "#eef2ff" : "#fffbeb", border: `1px solid ${hasScope ? "#c7d2fe" : "#fde68a"}`, borderRadius: 10, padding: "11px 14px", fontSize: 13, color: hasScope ? "#3730a3" : "#92400e", lineHeight: 1.65, marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span className="msym" style={{ fontSize: 16, verticalAlign: "middle", flexShrink: 0, marginTop: 1 }}>
              {hasScope ? "check_circle" : "info"}
            </span>
            <span>
              {hasScope
                ? "This contract reflects the confirmed AI-generated project scope agreed upon at transaction creation."
                : "No AI scope was attached to this transaction. The contract shows general escrow terms."}
            </span>
          </div>

          {/* Request Changes Form Panel */}
          {showForm && (
            <div style={{ background: "#fffbeb", border: "1.5px solid #fcd34d", borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#92400e", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <span className="msym" style={{ fontSize: 18 }}>edit_note</span>
                Request Contract / Scope Changes
              </div>
              <p style={{ fontSize: 12.5, color: "#78350f", marginBottom: 12, lineHeight: 1.5 }}>
                Describe what specific items you disagree with or want adjusted. The client will receive an immediate notification with your notes.
              </p>
              <textarea
                value={requestMsg}
                onChange={e => setRequestMsg(e.target.value)}
                placeholder="e.g., Deliverable #2 in Milestone 1 includes mobile responsive design which wasn't part of our initial agreement."
                rows={4}
                style={{ width: "100%", borderRadius: 8, border: "1px solid #d97706", padding: "10px 12px", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", outline: "none", marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Btn variant="outline" style={{ fontSize: 12.5, padding: "6px 14px" }} onClick={() => setShowForm(false)}>Cancel</Btn>
                <Btn variant="accent" style={{ fontSize: 12.5, padding: "6px 16px" }} disabled={submitting || !requestMsg.trim()} onClick={handleSendChangeRequest}>
                  {submitting ? "Sending..." : "Submit Change Request →"}
                </Btn>
              </div>
            </div>
          )}

          {/* ── PARTIES ── */}
          <SectionHeader>1. Parties &amp; Project</SectionHeader>
          <InfoRow label="Client"          value={buyerName} />
          <InfoRow label="Service Provider" value={sellerName} />
          <InfoRow label="Project Title"   value={title} />
          <InfoRow label="Category"        value={category} />
          <InfoRow label="Escrow Value"    value={amount} />

          {/* ── PROJECT OVERVIEW ── */}
          {overview && <>
            <SectionHeader>2. Project Overview</SectionHeader>
            <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.75, margin: 0 }}>{overview}</p>
          </>}

          {/* ── DELIVERABLES ── */}
          {deliverables ? <>
            <SectionHeader>3. Confirmed Deliverables</SectionHeader>
            {deliverables.map((d, i) => <Item key={i} n={i + 1} text={d} />)}
          </> : <>
            <SectionHeader>3. Deliverables</SectionHeader>
            <p style={{ fontSize: 13, color: "#64748b", fontStyle: "italic", margin: 0 }}>Deliverables as described in the agreed project brief.</p>
          </>}

          {/* ── ACCEPTANCE CRITERIA ── */}
          {acceptance ? <>
            <SectionHeader>4. Acceptance Criteria</SectionHeader>
            {acceptance.map((a, i) => <Item key={i} n={i + 1} text={a} />)}
          </> : <>
            <SectionHeader>4. Acceptance Criteria</SectionHeader>
            <p style={{ fontSize: 13, color: "#64748b", fontStyle: "italic", margin: 0 }}>Work accepted upon satisfactory delivery per the agreed brief.</p>
          </>}

          {/* ── MILESTONES ── */}
          <SectionHeader>5. Milestone Breakdown &amp; Schedule</SectionHeader>
          {milestones ? milestones.map((m, i) => <MilestoneCard key={i} m={m} i={i} />) : (
            <p style={{ fontSize: 13, color: "#64748b", fontStyle: "italic", margin: 0 }}>Milestones distributed equally across the project value.</p>
          )}

          {/* ── TIMELINE ── */}
          <SectionHeader>6. Project Timeline &amp; Deadlines</SectionHeader>
          {aiTimeline && (
            <div style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 9, padding: "10px 13px", marginBottom: 8, fontSize: 13 }}>
              <span style={{ fontWeight: 700, color: "#3730a3" }}>🤖 AI Estimated Timeline:</span>{" "}
              <span style={{ color: "#1e293b" }}>{aiTimeline}</span>
              <div style={{ fontSize: 11.5, color: "#6366f1", marginTop: 3 }}>This is an AI estimate only — not the final contractual deadline.</div>
            </div>
          )}
          {agreedDuration && <InfoRow label="Agreed Contract Duration" value={agreedDuration} />}
          {agreedDeadline && <InfoRow label="Agreed Final Deadline"    value={agreedDeadline} />}
          {!agreedDeadline && !agreedDuration && (
            <InfoRow label="Agreed Deadline" value="Per milestone completion schedule (no fixed date set)" />
          )}
          <InfoRow label="Review Window" value={`${reviewDays} business days per milestone submission`} />

          {/* ── REVISION TERMS ── */}
          <SectionHeader>7. Revision Terms</SectionHeader>
          <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7 }}>
            <div>• {revisionTerms}</div>
            <div>• Revisions apply strictly to the agreed scope of work above.</div>
          </div>

          {/* ── ESCROW TERMS ── */}
          <SectionHeader>8. Escrow &amp; Payment Terms</SectionHeader>
          <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7 }}>
            <div>• Funds of <strong>{amount}</strong> are deposited and held securely in Escrow regulated trust accounts.</div>
            <div>• Milestone funds are released to the Service Provider upon Client approval and verification.</div>
            <div>• Unresolved disputes are adjudicated via Escrow Binding Arbitration.</div>
          </div>

          {/* ── GOVERNING LAW ── */}
          <SectionHeader>9. Governing Law</SectionHeader>
          <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, margin: 0 }}>
            This Agreement is binding between the Client and Service Provider upon confirmation of the escrow transaction.
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 26px", borderTop: `1px solid ${T.gray100}`, display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
          <Btn variant="outline" onClick={onClose} style={{ flex: 1 }}>Close</Btn>
          {canRequestChanges && (
            <Btn variant="outline" style={{ flex: 1.2, border: "1px solid #d97706", color: "#b45309" }} onClick={() => setShowForm(!showForm)}>
              <span className="msym" style={{ fontSize: 17 }}>edit_note</span>
              Request Changes
            </Btn>
          )}
          {canRequestChanges && (
            <Btn variant="teal" style={{ flex: 1.2 }} onClick={() => setShowScopeModal(true)}>
              <span className="msym" style={{ fontSize: 17 }}>smart_toy</span>
              Edit / Update Scope
            </Btn>
          )}
          <Btn variant="primary" onClick={onClose} style={{ flex: 1 }}>
            <span className="msym" style={{ fontSize: 17 }}>check_circle</span>
            Acknowledged ✓
          </Btn>
        </div>

      </div>

      {showScopeModal && (
        <ScopeModal
          catLabel={category}
          onClose={() => setShowScopeModal(false)}
          onApply={handleApplyNewScope}
        />
      )}
    </div>
  );
};

export default ContractModal;
