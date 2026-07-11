import { useState, useEffect, useRef } from "react";
import { T } from "../tokens";
import { Btn } from "./ui";
import { NAV_ITEMS } from "../data/constants";

export default function Navbar({ onLogin, onSignup, navigate, user, onLogout }) {
  const [open, setOpen] = useState(null);
  const [sc, setSc] = useState(false);
  const [mob, setMob] = useState(false);
  const [me, setMe] = useState(null);
  const t = useRef(null);

  useEffect(() => {
    const h = () => setSc(window.scrollY > 8);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      <nav style={{ background: T.white, position: "sticky", top: 0, zIndex: 300, boxShadow: sc ? "0 2px 20px rgba(0,0,0,.1)" : "0 1px 0 #e2e8f0", transition: "box-shadow .2s" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }} onClick={() => { navigate(user ? "dashboard" : "home"); setMob(false); }}>
            <div style={{ width: 38, height: 38, background: `linear-gradient(135deg,${T.primary},${T.primaryDk})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: T.white, fontWeight: 800, fontSize: 18, fontFamily: "'Inter',sans-serif" }}>E</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: T.primary, letterSpacing: "-.4px" }}><span style={{ color: T.green }}>Escrow</span></span>
          </div>
          <div className="ndsk" style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 28, flex: 1 }}>
            {NAV_ITEMS.map(item => (
              <div key={item.label} style={{ position: "relative" }} onMouseEnter={() => { clearTimeout(t.current); setOpen(item.label); }} onMouseLeave={() => { t.current = setTimeout(() => setOpen(null), 140); }}>
                <button className="nl" style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 12px", fontWeight: 600, fontSize: 13.5, color: open === item.label ? T.accent : T.gray700, display: "flex", alignItems: "center", gap: 4 }}>
                  {item.label}
                  <svg width="9" height="5" viewBox="0 0 10 6" fill="none" style={{ transition: "transform .2s", transform: open === item.label ? "rotate(180deg)" : "none" }}>
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {open === item.label && (
                  <div className="dm" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: T.white, border: `1px solid ${T.gray100}`, borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,.13)", minWidth: 240, zIndex: 400, overflow: "hidden" }}>
                    <div style={{ padding: "8px 0" }}>
                      {item.ch.map(ch => (
                        <button key={ch.l} className="nl" style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "10px 18px", textAlign: "left" }}>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: T.gray900 }}>{ch.l}</div>
                          <div style={{ fontSize: 11.5, color: T.gray500, marginTop: 2 }}>{ch.d}</div>
                        </button>
                      ))}
                    </div>
                    <div style={{ background: T.offWhite, borderTop: `1px solid ${T.gray100}`, padding: "12px 18px" }}>
                      <Btn variant="accent" style={{ fontSize: 12, padding: "7px 16px" }} onClick={onSignup}>Get Started Free</Btn>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="ndsk" style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 12, flexShrink: 0 }}>
            {user ? (
              <>
                <Btn variant="ghost" onClick={() => navigate("dashboard")} style={{ fontSize: 14 }}>Dashboard</Btn>
                <Btn variant="accent" onClick={onLogout} style={{ fontSize: 14, padding: "9px 20px" }}>Sign Out</Btn>
              </>
            ) : (
              <>
                <Btn variant="ghost" onClick={onLogin} style={{ fontSize: 14 }}>Login</Btn>
                <Btn variant="accent" onClick={onSignup} style={{ fontSize: 14, padding: "9px 20px" }}>Create Account →</Btn>
              </>
            )}
          </div>
          <button className="mbb" onClick={() => { setMob(o => !o); setMe(null); }} style={{ display: "none", marginLeft: "auto", background: "none", border: "none", cursor: "pointer", flexDirection: "column", gap: 5, padding: 8 }} aria-label="Menu">
            {mob ? <span className="msym" style={{ fontSize: 24, color: T.gray700 }}>close</span> : [0, 1, 2].map(i => <span key={i} style={{ display: "block", width: 24, height: 2, background: T.gray700, borderRadius: 2 }} />)}
          </button>
        </div>
      </nav>
      {mob && (
        <div style={{ background: T.white, borderBottom: `1px solid ${T.gray100}`, boxShadow: "0 4px 20px rgba(0,0,0,.07)", zIndex: 299, position: "fixed", top: 64, left: 0, right: 0, maxHeight: "calc(100vh - 64px)", overflowY: "auto" }}>
          {NAV_ITEMS.map(item => (
            <div key={item.label} style={{ borderBottom: `1px solid ${T.gray100}` }}>
              <button onClick={() => setMe(p => p === item.label ? null : item.label)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 1.5rem", fontWeight: 700, fontSize: 15, color: me === item.label ? T.primary : T.gray900 }}>
                {item.label}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transition: "transform .2s", transform: me === item.label ? "rotate(180deg)" : "none" }}>
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {me === item.label && (
                <div style={{ background: T.offWhite, paddingBottom: 8 }}>
                  {item.ch.map(ch => (
                    <button key={ch.l} onClick={() => setMob(false)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "10px 1.5rem 10px 2rem" }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: T.gray900 }}>{ch.l}</div>
                      <div style={{ fontSize: 12, color: T.gray500, marginTop: 2 }}>{ch.d}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px 1.5rem 22px" }}>
            {user ? (
              <>
                <Btn variant="outline" onClick={() => { navigate("dashboard"); setMob(false); }} style={{ width: "100%" }}>Dashboard</Btn>
                <Btn variant="accent" onClick={() => { onLogout(); setMob(false); }} style={{ width: "100%" }}>Sign Out</Btn>
              </>
            ) : (
              <>
                <Btn variant="outline" onClick={() => { onLogin(); setMob(false); }} style={{ width: "100%" }}>Login</Btn>
                <Btn variant="accent" onClick={() => { onSignup(); setMob(false); }} style={{ width: "100%" }}>Sign Up Free →</Btn>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
