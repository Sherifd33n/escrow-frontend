import { useEffect, useState } from "react";
import { T } from "../tokens";
import { Btn, Spin } from "../components/ui";
import { payments, wallet } from "../utils/api";
import { sseEmitter } from "../utils/useSSE";

export default function PaystackCallback({ navigate }) {
  const [reference] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("reference") || params.get("trxref") || "";
  });
  const [loading, setLoading] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference") || params.get("trxref");
    return !!ref;
  });
  const [error, setError] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference") || params.get("trxref");
    return ref ? null : "No payment reference was found in the return link.";
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!reference) return;

    let isMounted = true;
    const verify = async () => {
      try {
        const { data, error: apiErr } = await payments.verify(reference);
        if (!isMounted) return;
        setLoading(false);
        if (apiErr) {
          setError(apiErr);
        } else if (data && !data.success && !data.alreadyProcessed) {
          setError(data.message || "Payment was not completed or failed on Paystack.");
        } else {
          setResult(data);
          sseEmitter.emit("wallet_update", data);
          // Clean query parameters from URL bar
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch {
        if (!isMounted) return;
        setLoading(false);
        setError("Network connection issue while verifying payment. Your wallet will update automatically via webhook if payment was successful.");
      }
    };

    verify();
    return () => {
      isMounted = false;
    };
  }, [reference]);

  const handleReturn = async () => {
    try {
      const { data } = await wallet.get();
      if (data) {
        sseEmitter.emit("wallet_update", data);
      }
    } catch {
      // ignore
    }
    navigate("dashboard");
  };


  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(100% 50% at 50% 0%, #001637 0%, ${T.bg} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Brand Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: T.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: T.white,
            fontWeight: 800,
            fontSize: 18,
            boxShadow: "0 8px 20px rgba(0,22,55,0.25)",
          }}
        >
          E
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: T.white, letterSpacing: "-0.5px" }}>
          ESCROW <span style={{ fontSize: 11, fontWeight: 700, color: T.green, background: "rgba(16,185,129,0.15)", padding: "3px 8px", borderRadius: 12, marginLeft: 6, verticalAlign: "middle" }}>PAYSTACK SECURE</span>
        </span>
      </div>

      <div
        style={{
          background: T.white,
          borderRadius: 24,
          border: `1px solid ${T.gray100}`,
          boxShadow: "0 25px 60px rgba(0,22,55,0.12)",
          padding: "40px 32px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent border bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            background: loading
              ? `linear-gradient(90deg, ${T.primary}, #3b82f6)`
              : result
              ? `linear-gradient(90deg, ${T.green}, #34d399)`
              : `linear-gradient(90deg, ${T.red}, #f87171)`,
          }}
        />

        {/* LOADING STATE */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "10px 0" }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Spin size={36} color={T.primary} />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: T.primary, marginBottom: 8 }}>
                Verifying Payment
              </h3>
              <p style={{ fontSize: 14, color: T.gray500, lineHeight: 1.6, maxWidth: 360, margin: "0 auto" }}>
                We are validating your transaction reference directly with Paystack. Please do not close or refresh this page.
              </p>
            </div>

            {reference && (
              <div
                style={{
                  background: T.gray50,
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontFamily: "monospace",
                  color: T.gray600,
                  border: `1px solid ${T.gray200}`,
                }}
              >
                Ref: {reference}
              </div>
            )}
          </div>
        )}

        {/* SUCCESS STATE */}
        {!loading && result && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: T.greenLt,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px rgba(16,185,129,0.2)",
              }}
            >
              <span className="msym" style={{ fontSize: 40, color: T.green }}>
                check_circle
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: T.primary, marginBottom: 6 }}>
                Deposit Successful!
              </h3>
              <p style={{ fontSize: 14, color: T.gray600, lineHeight: 1.5 }}>
                Your payment was verified by Paystack and credited to your wallet balance.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div
              style={{
                background: T.gray50,
                borderRadius: 16,
                border: `1px solid ${T.gray200}`,
                padding: "18px 20px",
                width: "100%",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: T.gray500 }}>Payment Provider</span>
                <span style={{ fontWeight: 700, color: T.primary, display: "flex", alignItems: "center", gap: 4 }}>
                  <span className="msym" style={{ fontSize: 15, color: T.green }}>security</span> Paystack
                </span>
              </div>

              {reference && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: T.gray500 }}>Reference</span>
                  <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: T.primary }}>
                    {reference}
                  </span>
                </div>
              )}

              <div style={{ height: 1, background: T.gray200, margin: "2px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.gray700 }}>Available Wallet Balance</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: T.green }}>
                  ${parseFloat(result.balance || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <Btn onClick={handleReturn} style={{ width: "100%", fontSize: 15, padding: "12px 0", marginTop: 6 }}>
              <span className="msym" style={{ fontSize: 18 }}>account_balance_wallet</span>
              Return to Wallet
            </Btn>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px rgba(239,68,68,0.15)",
              }}
            >
              <span className="msym" style={{ fontSize: 40, color: T.red }}>
                error
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: T.primary, marginBottom: 6 }}>
                Payment Verification Failed
              </h3>
              <p style={{ fontSize: 14, color: T.gray600, lineHeight: 1.6, maxWidth: 380 }}>
                {error}
              </p>
            </div>

            <div
              style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 12.5,
                color: "#92400e",
                lineHeight: 1.5,
                textAlign: "left",
                width: "100%",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span className="msym" style={{ fontSize: 18, color: "#d97706", flexShrink: 0 }}>
                help_outline
              </span>
              <div>
                If your bank account was charged, don't worry. Webhooks will automatically update your wallet within a few minutes.
              </div>
            </div>

            <Btn onClick={handleReturn} style={{ width: "100%", fontSize: 15, padding: "12px 0", marginTop: 4, background: T.primary }}>
              <span className="msym" style={{ fontSize: 18 }}>arrow_back</span>
              Return to Wallet
            </Btn>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div style={{ marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
        Protected by 256-bit SSL Encryption &bull; Escrow Platform Paystack Gateway
      </div>
    </div>
  );
}
