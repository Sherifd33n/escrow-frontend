import { useState } from "react";
import { T, fs } from "../../tokens";
import { Btn } from "../ui";
import { admin } from "../../utils/api";

const PLANS = [
  {
    id: "silver",
    name: "Silver",
    tier: 2,
    badgeColor: "#64748b",
    bgGradient: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
    activeBorder: "#94a3b8",
    monthlyPrice: 19,
    annualPrice: 15.2,
    annualTotal: 182.4,
    highlights: [
      "Up to $5,000 max escrow",
      "3 active deals simultaneously",
      "3.5% escrow fee",
      "2 AI contract audits / mo",
      "Tier 2 Entitlements",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    tier: 3,
    badgeColor: "#d97706",
    bgGradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    activeBorder: "#f59e0b",
    monthlyPrice: 59,
    annualPrice: 47.2,
    annualTotal: 566.4,
    popular: true,
    highlights: [
      "Up to $50,000 max escrow",
      "15 active deals simultaneously",
      "2.5% escrow fee rate",
      "15 AI contract audits / mo",
      "Multi-currency support",
      "Unlimited contracts & Tier 3",
    ],
  },
  {
    id: "diamond",
    name: "Diamond",
    tier: 4,
    badgeColor: "#7c3aed",
    bgGradient: "linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)",
    activeBorder: "#8b5cf6",
    monthlyPrice: 149,
    annualPrice: 119.2,
    annualTotal: 1430.4,
    highlights: [
      "Unlimited max escrow value",
      "Unlimited active deals",
      "1.5% lowest escrow fee",
      "Unlimited AI audits",
      "White-label branding",
      "Dedicated account manager & Tier 4",
    ],
  },
];

function AdminSubscriptionModalContent({ user, onClose, onSaved }) {
  const currentPlanId = user?.subscription_plan?.toLowerCase() || "";
  const currentStatus = user?.subscription_status || "none";
  const hasActiveSub = currentStatus === "active";

  const [selectedPlan, setSelectedPlan] = useState(
    currentPlanId && ["silver", "gold", "diamond"].includes(currentPlanId)
      ? currentPlanId
      : "gold"
  );
  const [billingCycle, setBillingCycle] = useState(
    user?.subscription_billing_cycle || "monthly"
  );
  const [autoRenew, setAutoRenew] = useState(
    user?.subscription_auto_renew !== undefined ? !!user.subscription_auto_renew : true
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!selectedPlan) {
      alert("Please select a subscription plan.");
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await admin.subscribeUser(user.id, {
        planId: selectedPlan,
        billingCycle,
        autoRenew: autoRenew ? 1 : 0,
        notes: notes.trim() || `Granted by admin for user ${user.name}`,
      });

      if (error) {
        alert(error);
      } else {
        alert(data?.message || "Subscription activated successfully!");
        onSaved?.();
        onClose();
      }
    } catch (err) {
      alert(err.message || "Failed to grant subscription.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSub = async (actionType) => {
    const isExpire = actionType === "expire_now";
    const confirmMsg = isExpire
      ? `Immediately terminate ${user.name}'s subscription? All paid entitlements will end immediately.`
      : `Cancel auto-renewal for ${user.name}'s subscription?`;

    if (!window.confirm(confirmMsg)) return;

    setCancelling(true);
    try {
      const { data, error } = await admin.cancelUserSubscription(user.id, {
        action: actionType,
        reason: notes.trim() || "Cancelled by administrator from Admin Panel",
      });

      if (error) {
        alert(error);
      } else {
        alert(data?.message || "Subscription updated successfully!");
        onSaved?.();
        onClose();
      }
    } catch (err) {
      alert(err.message || "Failed to cancel subscription.");
    } finally {
      setCancelling(false);
    }
  };

  const planObj = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 22, 55, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 12px",
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.white,
          borderRadius: 16,
          width: "100%",
          maxWidth: 680,
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "20px 18px",
          boxShadow: "0 24px 80px rgba(0,22,55,.28)",
          animation: "fadeUp .25s ease",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            borderBottom: `1px solid ${T.gray100}`,
            paddingBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg, #1e1b4b, #3730a3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f59e0b",
                flexShrink: 0,
              }}
            >
              <span className="msym" style={{ fontSize: 20 }}>
                workspace_premium
              </span>
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: 16.5,
                  fontWeight: 800,
                  color: T.primary,
                  margin: 0,
                }}
              >
                Manage User Subscription
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: T.gray500 }}>
                Grant, upgrade, or revoke membership plans directly.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.gray400,
              display: "flex",
              alignItems: "center",
              padding: 6,
              borderRadius: 6,
            }}
          >
            <span className="msym" style={{ fontSize: 20 }}>
              close
            </span>
          </button>
        </div>

        {/* User Info Bar */}
        <div
          style={{
            background: T.offWhite,
            border: `1px solid ${T.gray200}`,
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: T.primary, wordBreak: "break-word" }}>
              {user.name} <span style={{ fontWeight: 500, color: T.gray500, fontSize: 12 }}>({user.email})</span>
            </div>
            <div style={{ fontSize: 11.5, color: T.gray500, marginTop: 3 }}>
              Role: <strong style={{ textTransform: "capitalize", color: T.primary }}>{user.role}</strong>
              {" · "}
              Wallet: <strong style={{ color: T.green }}>${parseFloat(user.wallet_balance || 0).toLocaleString()}</strong>
            </div>
          </div>

          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 10.5, color: T.gray500, textTransform: "uppercase", fontWeight: 700, letterSpacing: ".04em" }}>
              Current Status
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              {hasActiveSub ? (
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 800,
                    padding: "3px 9px",
                    borderRadius: 20,
                    background: "#d1fae5",
                    color: "#065f46",
                    border: "1px solid #6ee7b7",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span className="msym" style={{ fontSize: 13 }}>verified</span>
                  {user.subscription_plan?.toUpperCase()} ({user.subscription_billing_cycle || "monthly"})
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 20,
                    background: T.gray100,
                    color: T.gray600,
                    border: `1px solid ${T.gray200}`,
                  }}
                >
                  Free / No Active Plan
                </span>
              )}
            </div>
            {hasActiveSub && user.subscription_ends_at && (
              <div style={{ fontSize: 10.5, color: T.gray400, marginTop: 2 }}>
                Expires: {new Date(user.subscription_ends_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubscribe}>
          {/* Billing Cycle Toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 700, color: T.primary }}>
              Select Subscription Plan:
            </span>

            <div
              style={{
                display: "flex",
                background: T.offWhite,
                padding: 3,
                borderRadius: 10,
                border: `1px solid ${T.gray200}`,
              }}
            >
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                style={{
                  padding: "4px 12px",
                  borderRadius: 8,
                  fontSize: 11.5,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: billingCycle === "monthly" ? T.primary : "transparent",
                  color: billingCycle === "monthly" ? T.white : T.gray500,
                  transition: "all .15s",
                }}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                style={{
                  padding: "4px 12px",
                  borderRadius: 8,
                  fontSize: 11.5,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: billingCycle === "annual" ? T.primary : "transparent",
                  color: billingCycle === "annual" ? T.white : T.gray500,
                  transition: "all .15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                Annual
                <span
                  style={{
                    background: "#10b981",
                    color: "#fff",
                    fontSize: 9,
                    padding: "1px 5px",
                    borderRadius: 10,
                  }}
                >
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Plan Selector Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 10,
              marginBottom: 18,
            }}
          >
            {PLANS.map((p) => {
              const isSelected = selectedPlan === p.id;
              const isCurrent = currentPlanId === p.id && hasActiveSub;
              const price = billingCycle === "annual" ? p.annualPrice : p.monthlyPrice;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  style={{
                    border: `2px solid ${isSelected ? p.activeBorder : T.gray200}`,
                    borderRadius: 12,
                    padding: "14px 12px",
                    cursor: "pointer",
                    background: isSelected ? p.bgGradient : T.white,
                    boxShadow: isSelected ? `0 0 0 1px ${p.activeBorder}` : "none",
                    position: "relative",
                    transition: "all .15s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  {p.popular && (
                    <div
                      style={{
                        position: "absolute",
                        top: -9,
                        right: 10,
                        background: "#d97706",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "1px 6px",
                        borderRadius: 6,
                        textTransform: "uppercase",
                      }}
                    >
                      Most Popular
                    </div>
                  )}

                  {isCurrent && (
                    <div
                      style={{
                        position: "absolute",
                        top: -9,
                        left: 10,
                        background: "#059669",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "1px 6px",
                        borderRadius: 6,
                        textTransform: "uppercase",
                      }}
                    >
                      Current Plan
                    </div>
                  )}

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 14.5, color: p.badgeColor }}>
                        {p.name}
                      </span>
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: `1.5px solid ${isSelected ? p.badgeColor : T.gray300}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: isSelected ? p.badgeColor : "transparent",
                          color: "#fff",
                        }}
                      >
                        {isSelected && (
                          <span className="msym" style={{ fontSize: 13, fontWeight: "bold" }}>
                            check
                          </span>
                        )}
                      </span>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: T.primary }}>
                        ${price}
                      </span>
                      <span style={{ fontSize: 11, color: T.gray500 }}> /mo</span>
                      {billingCycle === "annual" && (
                        <div style={{ fontSize: 10, color: T.gray400 }}>
                          ${p.annualTotal}/year
                        </div>
                      )}
                    </div>

                    {/* Feature bullets */}
                    <div style={{ fontSize: 11, color: T.gray600, display: "flex", flexDirection: "column", gap: 3.5 }}>
                      {p.highlights.map((h) => (
                        <div key={h} style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
                          <span className="msym" style={{ fontSize: 12.5, color: p.badgeColor, marginTop: 1, flexShrink: 0 }}>
                            done
                          </span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Admin Note & Auto-Renew */}
          <div
            style={{
              background: T.offWhite,
              border: `1px solid ${T.gray200}`,
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 16,
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.gray600,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Admin Grant Notes / Reason (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. VIP account grant, promotional pass, manual wire verified"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  ...fs,
                  fontSize: 12.5,
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: 8,
                  background: T.white,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: T.primary,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                style={{ width: 15, height: 15, cursor: "pointer", accentColor: T.accent }}
              />
              Enable Auto-Renewal flag on subscription
            </label>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              borderTop: `1px solid ${T.gray100}`,
              paddingTop: 14,
            }}
          >
            <div>
              {hasActiveSub && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => handleCancelSub("expire_now")}
                    disabled={cancelling}
                    style={{
                      background: "none",
                      border: `1px solid #fca5a5`,
                      color: "#b91c1c",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "6px 10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    title="Immediately terminate subscription access"
                  >
                    <span className="msym" style={{ fontSize: 13 }}>
                      delete_forever
                    </span>
                    Revoke Now
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancelSub("cancel")}
                    disabled={cancelling}
                    style={{
                      background: "none",
                      border: `1px solid ${T.gray300}`,
                      color: T.gray600,
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "6px 10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    title="Cancel auto-renew but retain access until period ends"
                  >
                    <span className="msym" style={{ fontSize: 13 }}>
                      cancel
                    </span>
                    Cancel Renewal
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto", flexWrap: "wrap" }}>
              <Btn variant="outline" style={{ fontSize: 12.5, padding: "7px 14px" }} type="button" onClick={onClose}>
                Close
              </Btn>
              <Btn
                variant="green"
                style={{ fontSize: 12.5, padding: "7px 18px" }}
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className="msym" style={{ fontSize: 14, animation: "spin 1s linear infinite" }}>
                      progress_activity
                    </span>
                    Activating…
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className="msym" style={{ fontSize: 15 }}>
                      verified
                    </span>
                    Grant {planObj.name} Plan
                  </span>
                )}
              </Btn>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminSubscriptionModal({ user, isOpen, onClose, onSaved }) {
  if (!isOpen || !user) return null;
  return (
    <AdminSubscriptionModalContent
      key={user.id}
      user={user}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
