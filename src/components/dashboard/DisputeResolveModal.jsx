import { useState, useEffect } from "react";
import { T } from "../../tokens";
import { Btn } from "../ui";

export default function DisputeResolveModal({
  dispute,
  transaction,
  aiAnalysis,
  initialData = null,
  isOpen,
  onClose,
  onConfirm,
}) {
  const escrowBal = parseFloat(transaction?.escrow_balance || transaction?.amount || 0);

  const [winner, setWinner] = useState(initialData?.winner || "buyer");
  const [buyerPct, setBuyerPct] = useState(
    initialData?.buyerPercentage ?? (initialData?.winner === "seller" ? 0 : initialData?.winner === "split" ? 50 : 100)
  );
  const [resolutionText, setResolutionText] = useState(initialData?.reasoning || "");
  const [adminFeedback, setAdminFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && isOpen) {
      setWinner(initialData.winner || "buyer");
      setBuyerPct(
        initialData.buyerPercentage ??
          (initialData.winner === "buyer" ? 100 : initialData.winner === "seller" ? 0 : 50)
      );
      setResolutionText(initialData.reasoning || "");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Update percentages when winner tab changes manually
  const handleSelectWinner = (w) => {
    setWinner(w);
    if (w === "buyer") setBuyerPct(100);
    else if (w === "seller") setBuyerPct(0);
    else if (w === "split") setBuyerPct(50);
  };

  const calculatedBuyerAmount = Number(((escrowBal * buyerPct) / 100).toFixed(2));
  const calculatedSellerAmount = Number((escrowBal - calculatedBuyerAmount).toFixed(2));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionText.trim()) {
      alert("Please enter a resolution decision explanation.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({
        winner,
        resolution: resolutionText.trim(),
        splitDetails:
          winner === "split"
            ? {
                buyerPercentage: buyerPct,
                sellerPercentage: 100 - buyerPct,
                buyerAmount: calculatedBuyerAmount,
                sellerAmount: calculatedSellerAmount,
              }
            : null,
        aiAnalysisId: initialData?.analysisId || aiAnalysis?.id || null,
        adminFeedback: adminFeedback.trim() || null,
      });
      onClose();
    } catch (err) {
      alert(err.message || "Failed to resolve dispute.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 22, 55, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.white,
          borderRadius: 16,
          width: "100%",
          maxWidth: 620,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 28,
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            borderBottom: `1px solid ${T.gray100}`,
            paddingBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#006c47",
                color: T.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="msym" style={{ fontSize: 20 }}>
                gavel
              </span>
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: T.primary, margin: 0 }}>
                Final Dispute Resolution
              </h3>
              <div style={{ fontSize: 12, color: T.gray500, marginTop: 1 }}>
                Dispute #{dispute?.id} • Escrow: ${escrowBal.toLocaleString()}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.gray400,
              fontSize: 20,
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Winner Selector Tabs */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: T.primary,
                display: "block",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              Select Verdict / Settlement Mode
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <button
                type="button"
                onClick={() => handleSelectWinner("buyer")}
                style={{
                  padding: "12px 10px",
                  borderRadius: 10,
                  border: `2px solid ${winner === "buyer" ? "#006c47" : T.gray100}`,
                  background: winner === "buyer" ? "#e8f5ee" : T.white,
                  color: winner === "buyer" ? "#006c47" : T.primary,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  transition: "all .15s",
                }}
              >
                <span className="msym" style={{ fontSize: 20 }}>
                  assignment_return
                </span>
                100% Refund Buyer
              </button>

              <button
                type="button"
                onClick={() => handleSelectWinner("seller")}
                style={{
                  padding: "12px 10px",
                  borderRadius: 10,
                  border: `2px solid ${winner === "seller" ? "#4f46e5" : T.gray100}`,
                  background: winner === "seller" ? "#eef2ff" : T.white,
                  color: winner === "seller" ? "#4f46e5" : T.primary,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  transition: "all .15s",
                }}
              >
                <span className="msym" style={{ fontSize: 20 }}>
                  payments
                </span>
                100% Release Seller
              </button>

              <button
                type="button"
                onClick={() => handleSelectWinner("split")}
                style={{
                  padding: "12px 10px",
                  borderRadius: 10,
                  border: `2px solid ${winner === "split" ? "#d97706" : T.gray100}`,
                  background: winner === "split" ? "#fffbeb" : T.white,
                  color: winner === "split" ? "#d97706" : T.primary,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  transition: "all .15s",
                }}
              >
                <span className="msym" style={{ fontSize: 20 }}>
                  balance
                </span>
                Split Resolution
              </button>
            </div>
          </div>

          {/* Split Percentage Slider if winner is split */}
          {winner === "split" && (
            <div
              style={{
                background: "#f9fafb",
                border: `1px solid ${T.gray100}`,
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                <span style={{ color: "#006c47" }}>
                  Buyer Refund: {buyerPct}% (${calculatedBuyerAmount.toLocaleString()})
                </span>
                <span style={{ color: "#4f46e5" }}>
                  Seller Payout: {100 - buyerPct}% (${calculatedSellerAmount.toLocaleString()})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={buyerPct}
                onChange={(e) => setBuyerPct(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#006c47", cursor: "pointer" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: T.gray400,
                  marginTop: 4,
                }}
              >
                <span>0% (All to Seller)</span>
                <span>50% (Equal Split)</span>
                <span>100% (All to Buyer)</span>
              </div>
            </div>
          )}

          {/* Settlement Distribution Summary Banner */}
          <div
            style={{
              background: "#f8fafc",
              border: `1px solid ${T.gray100}`,
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: T.gray500 }}>Funds to Transfer:</span>
            <span style={{ fontWeight: 700, color: T.primary }}>
              {winner === "buyer"
                ? `$${escrowBal.toLocaleString()} refunded to Buyer`
                : winner === "seller"
                ? `$${escrowBal.toLocaleString()} released to Seller`
                : `$${calculatedBuyerAmount.toLocaleString()} to Buyer / $${calculatedSellerAmount.toLocaleString()} to Seller`}
            </span>
          </div>

          {/* Resolution Explanation */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: T.primary,
                display: "block",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              Officer Decision Explanation (Required)
            </label>
            <textarea
              rows={4}
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              placeholder="Provide clear rationale for the parties detailing the verdict..."
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: `1.5px solid ${T.gray100}`,
                fontSize: 13.5,
                color: T.primary,
                outline: "none",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>

          {/* Officer Feedback on AI Recommendation (Optional) */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: T.gray500,
                display: "block",
                marginBottom: 4,
              }}
            >
              Officer Feedback / Notes on AI Arbitrator (Optional)
            </label>
            <input
              type="text"
              value={adminFeedback}
              onChange={(e) => setAdminFeedback(e.target.value)}
              placeholder="e.g. AI analysis matched scope evidence well."
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${T.gray100}`,
                fontSize: 13,
                color: T.primary,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 10,
              borderTop: `1px solid ${T.gray100}`,
              paddingTop: 16,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "10px 18px",
                borderRadius: 8,
                border: `1px solid ${T.gray100}`,
                background: T.white,
                color: T.gray600,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <Btn
              variant="green"
              type="submit"
              disabled={isSubmitting}
              style={{
                fontSize: 13,
                padding: "10px 22px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="msym" style={{ fontSize: 16, animation: "spin 1s linear infinite" }}>
                    autorenew
                  </span>
                  Executing Settlement...
                </>
              ) : (
                <>
                  <span className="msym" style={{ fontSize: 16 }}>
                    check
                  </span>
                  Confirm & Settle Escrow
                </>
              )}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
