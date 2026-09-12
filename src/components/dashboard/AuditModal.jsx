import { useState, useEffect, useRef } from "react";
import { T } from "../../tokens";
import { Btn, Spin } from "../../components/ui";
import { ai } from "../../utils/api";

/* ─── Text sanitizer: strips all internal technical jargon ─── */
const clean = (txt) => {
  if (!txt || typeof txt !== "string") return "";
  return txt
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/processed by Stage 2 pipeline\.?/gi, "processed and verified.")
    .replace(/processed by Stage 2\.?/gi, "verified.")
    .replace(/Stage 2 pipeline\.?/gi, "verification pipeline.")
    .replace(/\bStage [1-4]\b/gi, "")
    .replace(/Full AI-level verification requires GROQ_API_KEY to be configured\.?/gi, "")
    .replace(/Full AI analysis requires GROQ_API_KEY to be configured\.?/gi, "")
    .replace(/Deterministic fallback[^.]*\./gi, "")
    .replace(/Deterministic audit mode[^.]*\.?/gi, "")
    .replace(/Add GROQ_API_KEY to[^.]*\.?/gi, "")
    .replace(/GROQ_API_KEY/gi, "")
    .replace(/\(no API key configured\)/gi, "")
    .replace(/Groq AI key not configured\.?/gi, "")
    .replace(/Scores are based on evidence submitted\.?/gi, "")
    .replace(/for full AI-powered analysis\.?/gi, "")
    .replace(/for full AI analysis\.?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

/* ─── Status helpers ─── */
const statusColor = (s) => s === "passed" ? T.green : s === "warning" ? T.accent : T.red;
const statusIcon  = (s) => s === "passed" ? "check_circle" : s === "warning" ? "warning" : "cancel";
const overallColor = (r) =>
  r?.status === "passed" ? T.green :
  r?.status === "passed_with_notes" ? T.accent : T.red;

const reqColor = (s) =>
  s === "passed" ? T.green :
  s === "passed_with_notes" ? "#16a34a" :
  s === "insufficient_evidence" ? "#d97706" : T.red;

const reqLabel = (s) =>
  s === "passed" ? "PASSED" :
  s === "passed_with_notes" ? "PASSED WITH NOTES" :
  s === "insufficient_evidence" ? "NEEDS EVIDENCE" :
  s === "not_applicable" ? "N/A" : "REVISION NEEDED";

const overallLabel = (s) =>
  s === "passed" ? "Audit Passed" :
  s === "passed_with_notes" ? "Passed with Notes" :
  s === "revision_required" ? "Revision Required" :
  s === "failed" ? "Audit Failed" : "Under Review";

/* ─── Component ─── */
const AuditModal = ({ tx, onClose, onApprove, onRevision }) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const auditedRef = useRef(false);

  useEffect(() => {
    if (auditedRef.current) return;
    auditedRef.current = true;
    (async () => {
      setLoading(true);
      const activeM = (tx.milestones || []).find(m =>
        ["submitted", "inprogress", "due", "rejected"].includes(m.status)
      );
      const activeSub =
        activeM?.submissions?.length
          ? activeM.submissions[activeM.submissions.length - 1].id
          : undefined;

      const { data, error } = await ai.runAudit({
        transactionId: tx.realId || tx.id,
        milestoneId: activeM?.id,
        submissionId: activeSub,
        title: tx.title,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        counterparty: tx.other,
      });

      if (error) { alert(error); onClose(); return; }
      if (data?.audit) setResult(data.audit);
      setLoading(false);
    })();
  }, []);

  const isCompleted = tx.status === "completed";
  const isDisputed  = tx.status === "disputed";
  const isCancelled = tx.status === "cancelled";
  const isInactive  = isCompleted || isDisputed || isCancelled;

  /* Count verified: passed OR passed_with_notes */
  const verifiedCount = result
    ? (result.requirements || []).filter(r =>
        r.status === "passed" || r.status === "passed_with_notes"
      ).length
    : 0;
  const totalCount = result ? (result.requirements || []).length : 0;

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 600,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px 12px", backdropFilter: "blur(6px)", boxSizing: "border-box",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: T.white, borderRadius: 18, width: "100%", maxWidth: 600,
        maxHeight: "90vh", overflowY: "auto", boxSizing: "border-box",
        boxShadow: "0 32px 80px rgba(0,0,0,.30)", animation: "fadeUp .3s ease",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#1e1b4b,#4338ca)",
          padding: "18px 20px", color: T.white,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: 0, zIndex: 1, boxSizing: "border-box",
        }}>
          <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span className="msym" style={{ fontSize: 20, flexShrink: 0 }}>smart_toy</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>AI Deliverable Audit</span>
            </div>
            <div style={{ fontSize: 12, opacity: .75, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.title}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,.14)", border: "none", color: T.white,
              borderRadius: "50%", width: 32, height: 32, cursor: "pointer",
              fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >×</button>
        </div>

        <div style={{ padding: "20px 18px", boxSizing: "border-box" }}>

          {/* ── Loading state ── */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <span className="msym" style={{ fontSize: 44, color: T.primary, display: "block", marginBottom: 14, animation: "pulse 1.5s ease infinite" }}>
                smart_toy
              </span>
              <div style={{ fontWeight: 700, fontSize: 16, color: T.primary, marginBottom: 8 }}>
                Analysing deliverable…
              </div>
              <p style={{ fontSize: 13, color: T.gray500, lineHeight: 1.6, marginBottom: 20 }}>
                Checking scope compliance, reviewing evidence, and calculating risk score.
              </p>
              {["Reviewing submitted files…", "Checking scope compliance…", "Running evidence analysis…", "Calculating risk score…"].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.gray500, justifyContent: "center", marginBottom: 8 }}>
                  <Spin size={12} color={T.primary} />{s}
                </div>
              ))}
            </div>

          ) : result && (
            <>
              {/* ── Score card ── */}
              <div style={{
                display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14,
                background: T.offWhite, borderRadius: 14, padding: "16px 18px", marginBottom: 20,
                boxSizing: "border-box",
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: overallColor(result) + "16",
                  border: `3px solid ${overallColor(result)}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <div style={{ fontWeight: 800, fontSize: 20, color: overallColor(result) }}>
                    {result.score}
                  </div>
                </div>
                <div style={{ flex: "1 1 180px", minWidth: 140 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: T.primary, marginBottom: 3 }}>
                    {overallLabel(result.status)}
                  </div>
                  <p style={{ fontSize: 12.5, color: T.gray600, lineHeight: 1.55, margin: 0, wordBreak: "break-word" }}>
                    {clean(result.summary)}
                  </p>
                </div>
                <div style={{ textAlign: "center", flexShrink: 0, marginLeft: "auto" }}>
                  <div style={{ fontSize: 11, color: T.gray400, marginBottom: 2 }}>Risk Score</div>
                  <div style={{
                    fontSize: 20, fontWeight: 800,
                    color: result.risk === "low" ? T.green : result.risk === "medium" ? T.accent : T.red,
                  }}>
                    {result.riskScore}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    color: result.risk === "low" ? T.green : result.risk === "medium" ? T.accent : T.red,
                  }}>
                    {result.risk} risk
                  </span>
                </div>
              </div>

              {/* ── Scope Requirements ── */}
              {Array.isArray(result.requirements) && result.requirements.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    fontWeight: 700, fontSize: 13.5, color: T.primary, marginBottom: 10,
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                  }}>
                    <span>Scope Requirement Audit</span>
                    <span style={{
                      fontSize: 11, color: T.gray500, fontWeight: 500,
                      background: T.offWhite, padding: "2px 8px", borderRadius: 8, flexShrink: 0,
                    }}>
                      {verifiedCount}/{totalCount} Verified
                    </span>
                  </div>

                  {result.requirements.map((req, i) => {
                    const color = reqColor(req.status);
                    const label = reqLabel(req.status);
                    const score = typeof req.score === "number" ? req.score : null;
                    const reason = clean(req.reason);
                    const verifiedTags = Array.isArray(req.verified)
                      ? req.verified.map(v => clean(v)).filter(Boolean)
                      : [];
                    return (
                      <div key={i} style={{
                        padding: "12px 14px", background: T.offWhite,
                        borderRadius: 10, marginBottom: 8,
                        border: `1px solid ${color}30`,
                        boxSizing: "border-box",
                      }}>
                        <div style={{
                          display: "flex", flexWrap: "wrap", justifyContent: "space-between",
                          alignItems: "flex-start", gap: 6, marginBottom: reason ? 6 : 0,
                        }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: T.primary, flex: "1 1 180px", minWidth: 140, wordBreak: "break-word" }}>
                            {req.requirement}
                          </div>
                          <span style={{
                            fontSize: 10.5, fontWeight: 700, color,
                            background: color + "15", padding: "2px 8px",
                            borderRadius: 12, flexShrink: 0, marginLeft: "auto",
                          }}>
                            {label}{score !== null ? ` • ${score}/100` : ""}
                          </span>
                        </div>
                        {reason && (
                          <div style={{ fontSize: 12, color: T.gray600, lineHeight: 1.5, wordBreak: "break-word" }}>
                            {reason}
                          </div>
                        )}
                        {verifiedTags.length > 0 && (
                          <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {verifiedTags.map((v, vi) => (
                              <span key={vi} style={{
                                fontSize: 10, color: T.green,
                                background: T.green + "12", borderRadius: 8, padding: "1px 7px",
                                wordBreak: "break-all",
                              }}>{v}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Technical Checks ── */}
              {Array.isArray(result.checks) && result.checks.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: T.primary, marginBottom: 10 }}>
                    Technical Checks
                  </div>
                  {result.checks.map((c, i) => {
                    const note = clean(c.note) || "Verified against submitted evidence.";
                    return (
                      <div key={i} style={{
                        display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 8,
                        padding: "10px 12px", background: T.offWhite,
                        borderRadius: 9, marginBottom: 7,
                        border: `1px solid ${statusColor(c.status)}20`,
                        boxSizing: "border-box",
                      }}>
                        <span className="msym" style={{ fontSize: 18, flexShrink: 0, marginTop: 1, color: statusColor(c.status) }}>
                          {statusIcon(c.status)}
                        </span>
                        <div style={{ flex: "1 1 160px", minWidth: 130 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: T.primary, wordBreak: "break-word" }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: T.gray500, marginTop: 2, wordBreak: "break-word" }}>{note}</div>
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: statusColor(c.status),
                          background: statusColor(c.status) + "16",
                          padding: "2px 8px", borderRadius: 20, flexShrink: 0, marginLeft: "auto",
                        }}>{c.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── AI Recommendation ── */}
              {result.recommendation && (
                <div style={{
                  background: "#eff6ff", border: "1px solid #bfdbfe",
                  borderRadius: 10, padding: "12px 14px", marginBottom: 20,
                  boxSizing: "border-box", wordBreak: "break-word",
                }}>
                  <div style={{
                    fontWeight: 700, fontSize: 13, color: T.primary, marginBottom: 5,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span className="msym" style={{ fontSize: 16, flexShrink: 0 }}>smart_toy</span>
                    AI Recommendation
                  </div>
                  <p style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.6, margin: 0, wordBreak: "break-word" }}>
                    {clean(result.recommendation)}
                  </p>
                </div>
              )}

              {/* ── Action buttons ── */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Btn variant="outline" onClick={onClose} style={{ flex: "1 1 120px", fontSize: 13, minWidth: 100 }}>
                  Close Report
                </Btn>
                {result.status !== "revision_required" && (
                  <Btn
                    variant="green"
                    disabled={isInactive}
                    onClick={async () => { if (isInactive) return; await onApprove(); onClose(); }}
                    style={{ flex: "1 1 140px", minWidth: 130, fontSize: 13, opacity: isInactive ? 0.55 : 1, cursor: isInactive ? "not-allowed" : "pointer" }}
                  >
                    <span className="msym" style={{ fontSize: 16 }}>check_circle</span>
                    {isCompleted ? "Funds Released" : isDisputed ? "Under Dispute" : "Approve & Release →"}
                  </Btn>
                )}
                {result.status !== "passed" && !isInactive && (
                  <Btn
                    variant="accent"
                    onClick={async () => { await onRevision(); onClose(); }}
                    style={{ flex: "1 1 140px", minWidth: 130, fontSize: 13 }}
                  >
                    <span className="msym" style={{ fontSize: 16 }}>refresh</span>
                    Request Revision
                  </Btn>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditModal;
