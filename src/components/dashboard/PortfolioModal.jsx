import { useState } from "react";
import { T, fs } from "../../tokens";
import { Btn, Spin } from "../ui";
import { users } from "../../utils/api";

export default function PortfolioModal({ onClose, onVerified, currentUrl = "" }) {
  const [url, setUrl] = useState(currentUrl || "");
  const [err, setErr] = useState("");
  const [ld, setLd] = useState(false);
  const [done, setDone] = useState(false);

  const handleVerify = async (e) => {
    e?.preventDefault();
    const clean = url.trim();
    if (!clean) {
      setErr("Please enter your portfolio or personal website link.");
      return;
    }

    setErr("");
    setLd(true);

    const { data, error } = await users.verifyPortfolio(clean);
    setLd(false);

    if (error) {
      setErr(error);
      return;
    }

    setDone(true);
    setTimeout(() => {
      onVerified?.(data?.portfolio_url || clean);
      onClose();
    }, 1500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        zIndex: 600,
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
          maxWidth: 440,
          boxShadow: "0 32px 80px rgba(0,0,0,.22)",
          animation: "fadeUp .3s ease",
          overflow: "hidden",
          margin: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg,${T.primary},${T.primaryDk})`,
            padding: "22px 26px",
            color: T.white,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 17,
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            <span className="msym" style={{ fontSize: 20, color: "#93c5fd" }}>
              link
            </span>
            Submit Portfolio for Review
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,.15)",
              border: "none",
              color: T.white,
              borderRadius: "50%",
              width: 28,
              height: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "26px 26px 28px" }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#dcfce7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <span
                  className="msym"
                  style={{ fontSize: 30, color: "#16a34a" }}
                >
                  mark_email_read
                </span>
              </div>
              <h3
                style={{
                  margin: "0 0 6px",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#001637",
                }}
              >
                Submitted for Review!
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: "#75777f",
                  lineHeight: 1.5,
                }}
              >
                Your portfolio link was submitted to our verification team. Once an officer verifies your work samples, your badge will turn verified!
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerify}>
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    fontSize: 13.5,
                    color: "#001637",
                    marginBottom: 6,
                  }}
                >
                  Portfolio or Personal Website URL
                </label>
                <p
                  style={{
                    fontSize: 12.5,
                    color: "#75777f",
                    margin: "0 0 12px",
                    lineHeight: 1.45,
                  }}
                >
                  Enter your GitHub, Behance, Dribbble, or live website. Our review team will check your identity and work samples.
                </p>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setErr("");
                    }}
                    placeholder="https://github.com/username or yoursite.com"
                    style={{
                      ...fs,
                      width: "100%",
                      paddingLeft: 38,
                      borderColor: err ? "#ef4444" : "#cbd5e1",
                    }}
                    disabled={ld}
                    autoFocus
                  />
                  <span
                    className="msym"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 18,
                      color: "#94a3b8",
                      pointerEvents: "none",
                    }}
                  >
                    language
                  </span>
                </div>
              </div>

              {err && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fee2e2",
                    borderRadius: 8,
                    padding: "10px 12px",
                    color: "#dc2626",
                    fontSize: 12.5,
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span className="msym" style={{ fontSize: 16 }}>
                    error
                  </span>
                  <span>{err}</span>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                <Btn
                  variant="ghost"
                  type="button"
                  style={{ flex: 1 }}
                  onClick={onClose}
                  disabled={ld}
                >
                  Cancel
                </Btn>
                <Btn
                  variant="primary"
                  type="submit"
                  style={{ flex: 1.5, display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}
                  disabled={ld || !url.trim()}
                >
                  {ld ? (
                    <>
                      <Spin size={16} color="#fff" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span className="msym" style={{ fontSize: 18 }}>
                        send
                      </span>
                      <span>Submit for Review</span>
                    </>
                  )}
                </Btn>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
