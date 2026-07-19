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

export { fs };
