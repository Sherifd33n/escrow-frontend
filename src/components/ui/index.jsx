import { useState } from "react";
import { T, fs } from "../../tokens";
import { SCFG } from "../../data/constants";

export const Btn = ({ children, variant="primary", onClick, style, className="", disabled, type="button" }) => {
  const base = {
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
    border:"none", borderRadius:8, cursor:disabled?"not-allowed":"pointer",
    fontWeight:700, fontSize:15, padding:"11px 24px",
    opacity:disabled?.55:1, whiteSpace:"nowrap", transition:"all .18s"
  };
  const v = {
    primary:  { background:T.primary,  color:T.white },
    accent:   { background:T.accent,   color:T.white },
    outline:  { background:"transparent", color:T.primary, border:`2px solid ${T.primary}` },
    outlineW: { background:"transparent", color:T.white,   border:"2px solid rgba(255,255,255,.5)" },
    green:    { background:T.green,    color:T.white },
    ghost:    { background:"transparent", color:T.gray600, padding:"9px 16px" },
    purple:   { background:T.purple,   color:T.white },
    red:      { background:T.red,      color:T.white },
    teal:     { background:T.teal,     color:T.white },
    dark:     { background:T.primaryDk,color:T.white },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      className={`btn-${variant} ${className}`}
      style={{ ...base, ...(v[variant]||v.primary), ...style }}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, color=T.primary, sz="sm" }) => (
  <span style={{
    display:"inline-block", background:color+"18", color,
    fontWeight:700, fontSize:sz==="sm"?11:13,
    padding:sz==="sm"?"3px 11px":"5px 14px",
    borderRadius:20, border:`1px solid ${color}25`, letterSpacing:".02em"
  }}>
    {children}
  </span>
);

export const Spin = ({ size=17, color="#fff" }) => (
  <span style={{
    display:"inline-block", width:size, height:size,
    border:`2.5px solid rgba(255,255,255,.25)`,
    borderTopColor:color, borderRadius:"50%",
    animation:"spin .7s linear infinite", flexShrink:0
  }}/>
);

export const SectionTitle = ({ badge, title, sub, light=false }) => (
  <div style={{ textAlign:"center", marginBottom:52 }}>
    {badge && <Badge color={light?T.gold:T.primary} sz="md">{badge}</Badge>}
    <h2 style={{
      fontFamily:"'Inter',sans-serif",
      fontSize:"clamp(26px,3.5vw,44px)", fontWeight:700,
      color:light?T.white:T.primary, marginTop:14,
      letterSpacing:"-.5px", lineHeight:1.2
    }}>{title}</h2>
    {sub && (
      <p style={{
        color:light?"rgba(255,255,255,.6)":T.gray500,
        fontSize:"clamp(14px,1.8vw,17px)", maxWidth:560,
        margin:"12px auto 0", lineHeight:1.75
      }}>{sub}</p>
    )}
  </div>
);

export const FormField = ({ label, children, req }) => (
  <div>
    <label style={{ display:"block", fontSize:13, fontWeight:600, color:T.gray700, marginBottom:5 }}>
      {label}{req && " *"}
    </label>
    {children}
  </div>
);

export const StatusBadge = ({ status }) => {
  const c = SCFG[status] || SCFG.pending;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      background:c.bg, borderRadius:20, padding:"3px 10px",
      fontSize:11, fontWeight:700, color:c.dot
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:c.dot, display:"inline-block" }}/>
      {c.label}
    </span>
  );
};

export const EvidenceViewer = ({ evidence }) => {
  const [activeImage, setActiveImage] = useState(null);

  if (!evidence) {
    return <div style={{ fontSize: 13.5, color: T.gray500, fontStyle: "italic" }}>No evidence uploaded.</div>;
  }

  let text = evidence;
  let images = [];
  let files = [];

  if (typeof evidence === "string" && evidence.trim().startsWith("{") && evidence.trim().endsWith("}")) {
    try {
      const parsed = JSON.parse(evidence);
      text = parsed.text || "";
      images = parsed.images || [];
      files = parsed.files || [];
    } catch (e) {
      text = evidence;
    }
  }

  return (
    <div>
      {/* Evidence text description */}
      <div style={{ fontSize: 13.5, color: T.gray700, background: T.offWhite, padding: 12, borderRadius: 8, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
        {text || "No description provided."}
      </div>

      {/* Evidence Images */}
      {images.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.gray400, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
            Attached Evidence Images ({images.length})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setActiveImage(img.data || img.url || img)}
                style={{
                  border: `1.5px solid ${T.gray100}`,
                  borderRadius: 10,
                  overflow: "hidden",
                  cursor: "pointer",
                  background: T.white,
                  transition: "all .15s ease",
                  boxShadow: "0 2px 6px rgba(0,0,0,.04)"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,.12)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,.04)";
                }}
              >
                <img
                  src={img.data || img.url || img}
                  alt={img.name || `evidence-${i}`}
                  style={{ width: "100%", height: 95, objectFit: "cover", display: "block" }}
                />
                <div style={{ padding: "6px 8px", fontSize: 11, fontWeight: 600, color: T.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", background: T.offWhite }}>
                  📷 {img.name || `Image ${i + 1}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-Image Attachments */}
      {files.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {files.map((f, i) => (
            <span key={i} style={{ fontSize: 12, background: T.offWhite, border: `1px solid ${T.gray100}`, borderRadius: 6, padding: "4px 10px", color: T.primary, fontWeight: 500 }}>
              📎 {f.name}
            </span>
          ))}
        </div>
      )}

      {/* Image Lightbox Modal */}
      {activeImage && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}
          onClick={() => setActiveImage(null)}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center" }} onClick={e => e.stopPropagation()}>
            <img src={activeImage} alt="Evidence full preview" style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: 12, boxShadow: "0 20px 50px rgba(0,0,0,.6)", objectFit: "contain" }} />
            <button
              onClick={() => setActiveImage(null)}
              style={{ position: "absolute", top: -16, right: -16, background: T.white, color: T.primary, border: "none", borderRadius: "50%", width: 36, height: 36, fontSize: 18, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { fs };
