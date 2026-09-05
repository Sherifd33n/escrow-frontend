import { useState } from "react";
import { T } from "../../tokens";
import { Badge, Btn } from "../ui";

export default function AIDisputeAnalysisCard({
  analysis,
  history = [],
  loading = false,
  isResolved = false,
  onReanalyze,
  onAdoptRecommendation,
}) {
  const [selectedVersion, setSelectedVersion] = useState(null);

  const activeAnalysis =
    selectedVersion !== null
      ? history.find((h) => h.analysis_version === selectedVersion) || analysis
      : analysis;

  if (loading) {
    return (
      <div
        style={{
          background: T.white,
          border: `1px solid ${T.gray100}`,
          borderRadius: 16,
          padding: 28,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#eef2ff",
            color: "#4f46e5",
            marginBottom: 12,
            animation: "spin 1.2s linear infinite",
          }}
        >
          <span className="msym" style={{ fontSize: 26 }}>
            autorenew
          </span>
        </div>
        <h4 style={{ fontSize: 16, fontWeight: 700, color: T.primary, margin: "0 0 6px" }}>
          AI Dispute Arbitrator Running...
        </h4>
        <p style={{ fontSize: 13, color: T.gray500, margin: 0 }}>
          Synthesizing contractual scope, milestone deliverables, technical audits, and evidence...
        </p>
      </div>
    );
  }

  if (!activeAnalysis) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #f8fafc, #eff6ff)",
          border: "1px dashed #cbd5e1",
          borderRadius: 16,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#e0e7ff",
            color: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className="msym" style={{ fontSize: 24 }}>
            smart_toy
          </span>
        </div>
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: T.primary, margin: "0 0 4px" }}>
            AI Dispute Analysis Not Generated Yet
          </h4>
          <p style={{ fontSize: 13, color: T.gray500, margin: 0, maxWidth: 440 }}>
            Run the AI Arbitrator to analyze contractual deliverables, technical test audits, and party claims for this dispute.
          </p>
        </div>
        <Btn
          variant="purple"
          onClick={onReanalyze}
          style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}
        >
          <span className="msym" style={{ fontSize: 16 }}>
            psychology
          </span>
          Generate AI Dispute Analysis
        </Btn>
      </div>
    );
  }

  // Parse JSON properties safely
  const contract =
    typeof activeAnalysis.contract_analysis === "string"
      ? JSON.parse(activeAnalysis.contract_analysis || "{}")
      : activeAnalysis.contract_analysis || {};

  const findings = Array.isArray(activeAnalysis.findings)
    ? activeAnalysis.findings
    : typeof activeAnalysis.findings === "string"
    ? JSON.parse(activeAnalysis.findings || "[]")
    : [];

  const fault =
    typeof activeAnalysis.fault_attribution === "string"
      ? JSON.parse(activeAnalysis.fault_attribution || "{}")
      : activeAnalysis.fault_attribution || {};

  const split =
    typeof activeAnalysis.recommended_split === "string"
      ? JSON.parse(activeAnalysis.recommended_split || "{}")
      : activeAnalysis.recommended_split || {};

  const riskFactors = Array.isArray(activeAnalysis.risk_factors)
    ? activeAnalysis.risk_factors
    : typeof activeAnalysis.risk_factors === "string"
    ? JSON.parse(activeAnalysis.risk_factors || "[]")
    : [];

  const rec = (activeAnalysis.recommendation || "").toLowerCase();
  const confidence = Number(activeAnalysis.confidence_score || 70);

  // Verdict style mapping
  const verdictConfig = {
    buyer: {
      title: "Favours Buyer (Full Refund)",
      subtitle: "AI recommends a 100% refund of the escrow balance to the buyer.",
      bg: "#f0fdf4",
      border: "#86efac",
      textColor: "#166534",
      badgeColor: "#16a34a",
      icon: "assignment_return",
    },
    seller: {
      title: "Favours Seller (Full Payout)",
      subtitle: "AI recommends a 100% release of the escrow balance to the seller.",
      bg: "#f5f3ff",
      border: "#c4b5fd",
      textColor: "#4338ca",
      badgeColor: "#6366f1",
      icon: "payments",
    },
    split: {
      title: `Split Resolution Recommended (${split.buyer_percentage || 50}% Buyer / ${split.seller_percentage || 50}% Seller)`,
      subtitle: `AI recommends distributing $${parseFloat(split.buyer_amount || 0).toLocaleString()} to Buyer and $${parseFloat(split.seller_amount || 0).toLocaleString()} to Seller.`,
      bg: "#fffbeb",
      border: "#fde68a",
      textColor: "#92400e",
      badgeColor: "#d97706",
      icon: "balance",
    },
    manual_investigation: {
      title: "Manual Officer Review Recommended",
      subtitle: "Evidence is inconclusive. Officer should contact parties directly.",
      bg: "#f8fafc",
      border: "#cbd5e1",
      textColor: "#334155",
      badgeColor: "#64748b",
      icon: "help_outline",
    },
  };

  const verdict = verdictConfig[rec] || verdictConfig.manual_investigation;

  return (
    <div
      style={{
        background: T.white,
        border: `1px solid ${T.gray100}`,
        borderRadius: 16,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        position: "relative",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          borderBottom: `1px solid ${T.gray100}`,
          paddingBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: T.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(79, 70, 229, 0.25)",
            }}
          >
            <span className="msym" style={{ fontSize: 22 }}>
              smart_toy
            </span>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.primary, margin: 0 }}>
                AI Dispute Resolution Arbitrator
              </h3>
              <Badge color="#4f46e5">
                v{activeAnalysis.analysis_version || 1}
              </Badge>
            </div>
            <div style={{ fontSize: 12, color: T.gray400, marginTop: 2 }}>
              Advisory Intelligence Model: {activeAnalysis.model_used || "llama-3.3-70b"}
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {history.length > 1 && (
            <select
              value={selectedVersion || activeAnalysis.analysis_version}
              onChange={(e) => setSelectedVersion(Number(e.target.value))}
              style={{
                fontSize: 12,
                padding: "5px 10px",
                borderRadius: 6,
                border: `1px solid ${T.gray100}`,
                background: T.white,
                color: T.primary,
                fontWeight: 600,
                outline: "none",
                cursor: "pointer",
              }}
            >
              {history.map((h) => (
                <option key={h.id} value={h.analysis_version}>
                  Version {h.analysis_version} ({new Date(h.created_at).toLocaleTimeString()})
                </option>
              ))}
            </select>
          )}

          <Btn
            variant="purple"
            onClick={onReanalyze}
            style={{
              fontSize: 12,
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span className="msym" style={{ fontSize: 15 }}>
              autorenew
            </span>
            Re-Analyze
          </Btn>
        </div>
      </div>

      {/* Verdict & Confidence Banner */}
      <div
        style={{
          background: verdict.bg,
          border: `1px solid ${verdict.border}`,
          borderRadius: 12,
          padding: "16px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: verdict.badgeColor,
              color: T.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span className="msym" style={{ fontSize: 20 }}>
              {verdict.icon}
            </span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: verdict.textColor }}>
              {verdict.title}
            </div>
            <div style={{ fontSize: 12.5, color: verdict.textColor, opacity: 0.9, marginTop: 2 }}>
              {verdict.subtitle}
            </div>
          </div>
        </div>

        {/* Confidence Meter */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${verdict.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            minWidth: 120,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: T.gray500, textTransform: "uppercase" }}>
            Confidence
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            <div
              style={{
                width: 70,
                height: 8,
                borderRadius: 4,
                background: "#e2e8f0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${confidence}%`,
                  height: "100%",
                  background:
                    confidence >= 80 ? "#16a34a" : confidence >= 60 ? "#d97706" : "#ba1a1a",
                  borderRadius: 4,
                }}
              />
            </div>
            <span style={{ fontWeight: 800, fontSize: 14, color: T.primary }}>
              {confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Fault Attribution Split Bar */}
      {fault && (fault.buyer_fault_percentage !== undefined || fault.seller_fault_percentage !== undefined) && (
        <div
          style={{
            background: "#f8fafc",
            border: `1px solid ${T.gray100}`,
            borderRadius: 10,
            padding: "12px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              fontWeight: 700,
              color: T.gray500,
              marginBottom: 6,
            }}
          >
            <span>Buyer Fault: {fault.buyer_fault_percentage || 0}%</span>
            <span>Seller Fault: {fault.seller_fault_percentage || 0}%</span>
          </div>
          <div
            style={{
              height: 10,
              borderRadius: 5,
              display: "flex",
              overflow: "hidden",
              background: "#e2e8f0",
            }}
          >
            <div
              style={{
                width: `${fault.buyer_fault_percentage || 0}%`,
                background: "#3b82f6",
                transition: "width 0.4s ease",
              }}
            />
            <div
              style={{
                width: `${fault.seller_fault_percentage || 0}%`,
                background: "#8b5cf6",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          {fault.notes && (
            <div style={{ fontSize: 11.5, color: T.gray500, marginTop: 6, lineHeight: 1.4 }}>
              <strong>Attribution Note:</strong> {fault.notes}
            </div>
          )}
        </div>
      )}

      {/* Executive Summary & Detailed Reasoning */}
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: T.gray400,
            textTransform: "uppercase",
            letterSpacing: ".06em",
            marginBottom: 4,
          }}
        >
          Executive Summary
        </div>
        <div style={{ fontSize: 13.5, color: T.primary, lineHeight: 1.6, fontWeight: 500 }}>
          {activeAnalysis.summary}
        </div>
      </div>

      {activeAnalysis.reasoning && (
        <div
          style={{
            background: "#f9fafb",
            borderLeft: "3px solid #4f46e5",
            padding: "10px 14px",
            borderRadius: "0 8px 8px 0",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", marginBottom: 2 }}>
            Impartial Arbitrator Rationale
          </div>
          <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>
            {activeAnalysis.reasoning}
          </p>
        </div>
      )}

      {/* Contract & Deliverables Alignment */}
      {contract && Object.keys(contract).length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "#f8fafc",
              border: `1px solid ${T.gray100}`,
              borderRadius: 8,
              padding: "10px 14px",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: T.gray400, textTransform: "uppercase", marginBottom: 2 }}>
              Scope Compliance
            </div>
            <div style={{ fontSize: 12.5, color: T.primary, fontWeight: 600 }}>
              {contract.scope_compliance || "Evaluated against contract terms"}
            </div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: `1px solid ${T.gray100}`,
              borderRadius: 8,
              padding: "10px 14px",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: T.gray400, textTransform: "uppercase", marginBottom: 2 }}>
              Acceptance Criteria Met
            </div>
            <div style={{ fontSize: 12.5, color: T.primary, fontWeight: 600 }}>
              {contract.acceptance_criteria_met === true
                ? "Criteria Verified & Met"
                : contract.acceptance_criteria_met === false
                ? "Criteria Unfulfilled"
                : String(contract.acceptance_criteria_met || "Evaluated")}
            </div>
          </div>
        </div>
      )}

      {/* Key Findings List */}
      {findings.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: T.gray400,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              marginBottom: 8,
            }}
          >
            Key Findings & Evidence Evaluation
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {findings.map((f, idx) => (
              <div
                key={idx}
                style={{
                  border: `1px solid ${T.gray100}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <span
                  className="msym"
                  style={{
                    fontSize: 18,
                    color:
                      f.severity === "high"
                        ? T.red
                        : f.severity === "medium"
                        ? "#d97706"
                        : "#2563eb",
                    marginTop: 1,
                  }}
                >
                  {f.severity === "high" ? "error" : f.severity === "medium" ? "warning" : "info"}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: T.primary }}>
                      {f.title}
                    </span>
                    {f.severity && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: 4,
                          textTransform: "uppercase",
                          background:
                            f.severity === "high"
                              ? "#fee2e2"
                              : f.severity === "medium"
                              ? "#fef3c7"
                              : "#e0f2fe",
                          color:
                            f.severity === "high"
                              ? "#991b1b"
                              : f.severity === "medium"
                              ? "#92400e"
                              : "#075985",
                        }}
                      >
                        {f.severity}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: T.gray500, marginTop: 2, lineHeight: 1.4 }}>
                    {f.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Factors & Suggested Action */}
      {(riskFactors.length > 0 || activeAnalysis.suggested_action) && (
        <div
          style={{
            background: "#fefce8",
            border: "1px solid #fef08a",
            borderRadius: 10,
            padding: "12px 16px",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 12,
              color: "#854d0e",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <span className="msym" style={{ fontSize: 16 }}>
              shield
            </span>
            Officer Considerations & Suggested Action
          </div>
          {activeAnalysis.suggested_action && (
            <div style={{ fontSize: 12.5, color: "#713f12", fontWeight: 600, marginBottom: 4 }}>
              → {activeAnalysis.suggested_action}
            </div>
          )}
          {riskFactors.length > 0 && (
            <ul style={{ margin: "4px 0 0 18px", padding: 0, fontSize: 12, color: "#854d0e" }}>
              {riskFactors.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Footer Adopt Action / Advisory Disclaimer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          paddingTop: 8,
          borderTop: `1px solid ${T.gray100}`,
        }}
      >
        <div style={{ fontSize: 11.5, color: T.gray400, display: "flex", alignItems: "center", gap: 4 }}>
          <span className="msym" style={{ fontSize: 14 }}>
            gavel
          </span>
          Advisory Intelligence: Platform Officer holds sole final authority to move funds.
        </div>

        {!isResolved && (
          <Btn
            variant="green"
            onClick={() =>
              onAdoptRecommendation({
                winner: rec === "split" ? "split" : rec === "seller" ? "seller" : "buyer",
                buyerPercentage: split.buyer_percentage || (rec === "buyer" ? 100 : 0),
                sellerPercentage: split.seller_percentage || (rec === "seller" ? 100 : 0),
                reasoning: activeAnalysis.reasoning || activeAnalysis.summary,
                analysisId: activeAnalysis.id,
              })
            }
            style={{
              fontSize: 12.5,
              padding: "7px 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span className="msym" style={{ fontSize: 16 }}>
              done_all
            </span>
            Adopt AI Recommendation →
          </Btn>
        )}
      </div>
    </div>
  );
}
