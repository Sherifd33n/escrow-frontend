import { useState } from "react";
import { Spin } from "../components/ui";
import AuthShell from "./AuthShell";
import { auth } from "../utils/api";

const ResetPasswordPage = ({ token, navigate }) => {
  const [newPass, setNewPass]     = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [ld, setLd]               = useState(false);
  const [err, setErr]             = useState("");
  const [done, setDone]           = useState(false);

  // Password strength helpers
  const checks = [
    { label: "8+ characters",   ok: newPass.length >= 8 },
  ];
  const valid = newPass.length >= 8;

  const sub = async e => {
    e.preventDefault();
    if (!newPass)            return setErr("Please enter a new password.");
    if (newPass !== confirm) return setErr("Passwords do not match.");
    if (newPass.length < 8)  return setErr("Password must be at least 8 characters long.");
    setLd(true); setErr("");
    const { error } = await auth.resetPassword(token, newPass);
    setLd(false);
    if (error) return setErr(error);
    setDone(true);
  };

  return (
    <AuthShell navigate={navigate}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div className="auth-card">

          {done ? (
            /* ── Success state ── */
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              <div style={{ width: 56, height: 56, background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <span className="msym" style={{ fontSize: 30, color: "#1e9e5e" }}>check_circle</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#001637", marginBottom: 8 }}>Password reset!</div>
              <p style={{ fontSize: 13.5, color: "#44474e", lineHeight: 1.7, marginBottom: 24 }}>
                Your password has been updated. You can now log in with your new password.
              </p>
              <button className="auth-btn-primary" onClick={() => navigate("login")}>
                <span className="msym" style={{ fontSize: 18 }}>login</span> Back to Login
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, background: "rgba(0,22,55,.1)", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <span className="msym" style={{ fontSize: 30, color: "#001637" }}>lock_reset</span>
                </div>
                <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 700, color: "#1b1b1e", marginBottom: 8 }}>Set New Password</h1>
                <p style={{ fontSize: 13.5, color: "#44474e", lineHeight: 1.65 }}>Choose a strong password for your Escrow account.</p>
              </div>

              <form onSubmit={sub} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {err && (
                  <div style={{ background: "#ffdad6", borderRadius: 9, padding: "10px 14px", fontSize: 13.5, color: "#93000a", display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="msym" style={{ fontSize: 18 }}>error</span>{err}
                  </div>
                )}

                {/* New password */}
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#44474e", marginBottom: 6, letterSpacing: ".02em" }}>NEW PASSWORD</label>
                  <div style={{ position: "relative" }}>
                    <span className="msym" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: "#75777f", pointerEvents: "none" }}>lock</span>
                    <input
                      className="auth-input"
                      type={showPass ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={newPass}
                      onChange={e => { setNewPass(e.target.value); setErr(""); }}
                      required
                      autoFocus
                      style={{ paddingRight: 44 }}
                    />
                    <span
                      className="msym"
                      onClick={() => setShowPass(p => !p)}
                      style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: "#75777f", cursor: "pointer" }}
                    >
                      {showPass ? "visibility_off" : "visibility"}
                    </span>
                  </div>
                  {/* Strength meter */}
                  {newPass && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                        <div style={{ flex: 1, height: 3, borderRadius: 2, background: valid ? "#22c55e" : "#dc2626", transition: "background .3s" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {checks.map(c => (
                            <span key={c.label} style={{ fontSize: 11, color: c.ok ? "#006c47" : "#75777f", display: "flex", alignItems: "center", gap: 3 }}>
                              <span className="msym" style={{ fontSize: 12 }}>{c.ok ? "check_circle" : "radio_button_unchecked"}</span>
                              {c.label}
                            </span>
                          ))}
                        </div>
                        {newPass.length > 0 && <span style={{ fontSize: 11.5, fontWeight: 700, color: valid ? "#22c55e" : "#dc2626" }}>{valid ? "Valid" : "Too short"}</span>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#44474e", marginBottom: 6, letterSpacing: ".02em" }}>CONFIRM PASSWORD</label>
                  <div style={{ position: "relative" }}>
                    <span className="msym" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: "#75777f", pointerEvents: "none" }}>lock_check</span>
                    <input
                      className="auth-input"
                      type={showPass ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={confirm}
                      onChange={e => { setConfirm(e.target.value); setErr(""); }}
                      required
                    />
                    {confirm && (
                      <span className="msym" style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: newPass === confirm ? "#006c47" : "#93000a" }}>
                        {newPass === confirm ? "check_circle" : "cancel"}
                      </span>
                    )}
                  </div>
                </div>

                <button type="submit" className="auth-btn-primary" disabled={ld}>
                  {ld ? <><Spin />Resetting…</> : <>Reset Password <span className="msym" style={{ fontSize: 18 }}>arrow_forward</span></>}
                </button>
                <div style={{ textAlign: "center" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13.5, color: "#001637", fontWeight: 700, cursor: "pointer" }} onClick={() => navigate("login")}>
                    <span className="msym" style={{ fontSize: 18 }}>arrow_back</span> Back to Login
                  </span>
                </div>
              </form>
            </>
          )}

        </div>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 11.5, color: "#75777f", lineHeight: 1.6 }}>
          Escrow uses bank-grade encryption to protect your account and financial transactions.
        </p>
      </div>
    </AuthShell>
  );
};

export default ResetPasswordPage;
