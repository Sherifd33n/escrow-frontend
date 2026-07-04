import { useState, useEffect, useRef } from "react";
import { T, fs } from "../../tokens";
import { Btn, Spin } from "../ui";

const COUNTRY_CODES = [
  { code: "+234", label: "🇳🇬 +234" },
  { code: "+1",   label: "🇺🇸 +1" },
  { code: "+44",  label: "🇬🇧 +44" },
  { code: "+233", label: "🇬🇭 +233" },
  { code: "+27",  label: "🇿🇦 +27" },
];

const PhoneVerifyModal = ({ onClose, onVerified }) => {
  const [step, setStep] = useState("phone"); // phone | otp | done
  const [countryCode, setCountryCode] = useState("+234");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [ld, setLd] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (step === "otp") refs[0].current?.focus();
  }, [step]);

  useEffect(() => {
    if (step !== "otp") return;
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, step]);

  const sendCode = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) return setErr("Enter a valid phone number.");
    setErr(""); setLd(true);
    setTimeout(() => {
      setLd(false);
      setStep("otp");
      setCountdown(59);
      setCanResend(false);
    }, 1200);
  };

  const handleChange = (i, val) => {
    const v = val.replace(/\D/g, "").slice(0, 1);
    const next = [...otp]; next[i] = v; setOtp(next); setErr("");
    if (v && i < 5) refs[i + 1].current?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs[i - 1].current?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs[i - 1].current?.focus();
    if (e.key === "ArrowRight" && i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next = ["", "", "", "", "", ""];
    paste.forEach((v, i) => { next[i] = v; });
    setOtp(next);
    refs[Math.min(paste.length, 5)].current?.focus();
  };

  const confirmCode = () => {
    const code = otp.join("");
    if (code.length < 6) return setErr("Please enter all 6 digits.");
    setLd(true); setErr("");
    setTimeout(() => {
      setLd(false);
      setStep("done");
      setTimeout(() => onVerified(`${countryCode} ${phone}`), 1100);
    }, 1300);
  };

  const resend = () => {
    if (!canResend) return;
    setOtp(["", "", "", "", "", ""]);
    setCountdown(59); setCanResend(false);
    refs[0].current?.focus();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: T.white, borderRadius: 20, width: "100%", maxWidth: 440, boxShadow: "0 32px 80px rgba(0,0,0,.22)", animation: "fadeUp .3s ease", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${T.primary},${T.primaryDk})`, padding: "22px 26px", color: T.white, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 17, display: "flex", alignItems: "center", gap: 8 }}>
            <span className="msym" style={{ fontSize: 20 }}>smartphone</span>Phone Verification
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.12)", border: "none", color: T.white, borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ padding: "26px" }}>

          {/* STEP 1 — Enter phone number */}
          {step === "phone" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <p style={{ fontSize: 13.5, color: T.gray500, lineHeight: 1.7 }}>We'll send a 6-digit code to confirm this number. Standard SMS rates may apply.</p>

              {err && <div style={{ background: "#ffdad6", border: "1px solid #ba1a1a33", borderRadius: 9, padding: "10px 14px", fontSize: 13.5, color: "#93000a", display: "flex", alignItems: "center", gap: 8 }}><span className="msym" style={{ fontSize: 18 }}>error</span>{err}</div>}

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.gray700, marginBottom: 6 }}>Phone Number</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={countryCode} onChange={e => setCountryCode(e.target.value)} style={{ ...fs, width: 110, flexShrink: 0 }}>
                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                  <input
                    style={fs}
                    type="tel"
                    placeholder="801 234 5678"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/[^\d\s]/g, ""))}
                    onKeyDown={e => e.key === "Enter" && sendCode()}
                  />
                </div>
              </div>

              <Btn variant="primary" onClick={sendCode} disabled={ld} style={{ width: "100%" }}>
                {ld ? <><Spin /> Sending code…</> : <><span className="msym" style={{ fontSize: 18 }}>sms</span>Send Verification Code</>}
              </Btn>
            </div>
          )}

          {/* STEP 2 — Enter OTP */}
          {step === "otp" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <p style={{ fontSize: 13.5, color: T.gray500, lineHeight: 1.7, textAlign: "center" }}>
                Enter the 6-digit code sent to<br/>
                <span style={{ fontWeight: 700, color: T.primary }}>{countryCode} {phone}</span>
              </p>

              <div>
                <div style={{ display: "flex", gap: "clamp(5px,1.5vw,8px)", justifyContent: "center", width: "100%" }}>
                  {otp.map((v, i) => (
                    <input
                      key={i}
                      ref={refs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={v}
                      onChange={e => handleChange(i, e.target.value)}
                      onKeyDown={e => handleKey(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      style={{
                        flex: "1 1 0", minWidth: 0, maxWidth: 44, height: "clamp(42px,11vw,52px)", textAlign: "center", fontSize: "clamp(16px,4.5vw,20px)", fontWeight: 700,
                        fontFamily: "'Inter',sans-serif", color: T.primary,
                        background: v ? "rgba(0,22,55,.05)" : T.offWhite,
                        border: `2px solid ${v ? T.primary : err ? T.red : T.gray100}`,
                        borderRadius: 10, outline: "none", transition: "all .15s",
                      }}
                    />
                  ))}
                </div>
                {err && <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, justifyContent: "center", fontSize: 13, color: T.red }}><span className="msym" style={{ fontSize: 16 }}>error</span>{err}</div>}
              </div>

              <Btn variant="primary" onClick={confirmCode} disabled={ld || otp.join("").length < 6} style={{ width: "100%" }}>
                {ld ? <><Spin /> Verifying…</> : <><span className="msym" style={{ fontSize: 18 }}>verified</span>Confirm Code</>}
              </Btn>

              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
                <button onClick={resend} disabled={!canResend} style={{ background: "none", border: "none", cursor: canResend ? "pointer" : "default", fontSize: 13, fontWeight: 700, color: canResend ? T.accent : T.gray500, fontFamily: "'Inter',sans-serif", padding: 0 }}>
                  {canResend ? "Resend Code →" : `Resend in ${countdown}s`}
                </button>
                <button onClick={() => setStep("phone")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, color: T.gray500, fontFamily: "'Inter',sans-serif", padding: 0 }}>
                  Wrong number? Go back
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Done */}
          {step === "done" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ width: 60, height: 60, background: T.greenLt, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <span className="msym" style={{ fontSize: 32, color: T.green }}>check_circle</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, color: T.primary, marginBottom: 5 }}>Phone Verified!</div>
              <div style={{ fontSize: 13.5, color: T.gray500 }}>{countryCode} {phone} is now confirmed.</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PhoneVerifyModal;
