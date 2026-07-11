import { T } from "../tokens";

export default function Footer() {
  return (
    <footer style={{ background: `linear-gradient(135deg,${T.primaryDk},#0a2d5a)`, color: T.white, padding: "56px 1.5rem 28px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="fg" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 36, marginBottom: 48 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, background: T.primary, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: T.white, fontWeight: 800, fontSize: 16 }}>E</div>
              <span style={{ color: T.gold }}>Escrow</span>
            </div>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.44)", lineHeight: 1.85, maxWidth: 280, marginBottom: 18 }}>The AI-powered escrow platform for tech services — protecting clients and providers worldwide.</p>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {["AI Auditing", "KYC", "Dispute AI", "$5B+ Protected"].map(b => (
                <span key={b} style={{ fontSize: 11, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 6, padding: "3px 9px", color: "rgba(255,255,255,.44)", whiteSpace: "nowrap" }}>{b}</span>
              ))}
            </div>
          </div>
          {[
            { title: "Services",    links: ["Software Dev Escrow","Mobile App Escrow","Website Escrow","UI/UX Escrow","Cybersecurity","Cloud & DevOps","AI Development","IT Consulting","Data Analytics","Tech Docs"] },
            { title: "AI Features", links: ["Scope Generator","Contract Generator","Deliverable Auditor","Fraud Detection","Dispute Assistant","Risk Scoring","Health Monitor"] },
            { title: "Business",    links: ["Enterprise Plans","Escrow API","White Label","Become a Partner","API Documentation","Webhooks","Sandbox"] },
            { title: "Company",     links: ["About Escrow","Careers","Blog","Press","Help Center","Contact Us","Terms of Service","Privacy Policy"] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontWeight: 700, fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".08em", color: "rgba(255,255,255,.35)", marginBottom: 14 }}>{col.title}</div>
              {col.links.map(l => <div key={l} className="nl" style={{ fontSize: 13, color: "rgba(255,255,255,.48)", marginBottom: 9, cursor: "pointer" }}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.28)" }}>© 2005–2025 Escrow Inc. All rights reserved. Licensed financial services provider.</span>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {["Privacy", "Terms", "Licenses", "Legal", "Cookies", "GDPR"].map(l => (
              <span key={l} style={{ fontSize: 12, color: "rgba(255,255,255,.28)", cursor: "pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
