import { useState, useEffect, useRef } from "react";

/* ─── GLOBAL TOKENS ──────────────────────────────────────── */
const T = {
  primary:   "#1a56a0",
  primaryDk: "#0f3d7a",
  primaryLt: "#2266c0",
  accent:    "#f0820f",
  accentLt:  "#fff4e6",
  green:     "#1e9e5e",
  greenLt:   "#e8f8f0",
  white:     "#ffffff",
  offWhite:  "#f8f9fc",
  gray50:    "#f1f4f9",
  gray100:   "#e2e8f0",
  gray300:   "#a0aec0",
  gray500:   "#718096",
  gray700:   "#4a5568",
  gray900:   "#1a202c",
  red:       "#e53e3e",
  gold:      "#f6c90e",
  teal:      "#0d9488",
  tealLt:    "#e6faf8",
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,600;0,700;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #fff; color: #1a202c; }
  input, select, textarea, button { font-family: 'Plus Jakarta Sans', sans-serif; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #f1f4f9; }
  ::-webkit-scrollbar-thumb { background: #a0aec0; border-radius: 3px; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  @keyframes slideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
  @keyframes spin { to { transform:rotate(360deg) } }

  .fade-up   { animation: fadeUp 0.55s ease both; }
  .fade-up-2 { animation: fadeUp 0.55s 0.1s ease both; }
  .fade-up-3 { animation: fadeUp 0.55s 0.2s ease both; }
  .fade-up-4 { animation: fadeUp 0.55s 0.3s ease both; }

  .nav-link:hover { color: ${T.accent} !important; }
  .btn-primary:hover  { background: ${T.primaryLt} !important; transform:translateY(-1px); box-shadow:0 6px 20px rgba(26,86,160,0.32)!important; }
  .btn-accent:hover   { background: #d97008 !important; transform:translateY(-1px); box-shadow:0 6px 20px rgba(240,130,15,0.32)!important; }
  .btn-outline:hover  { background: ${T.primary} !important; color:#fff !important; }
  .btn-green:hover    { background: #178050 !important; transform:translateY(-1px); }
  .card-hover:hover   { transform:translateY(-4px); box-shadow:0 14px 40px rgba(26,86,160,0.13)!important; }
  .card-hover         { transition: transform 0.2s, box-shadow 0.2s; }
  .dropdown-menu      { animation: slideDown 0.18s ease; }
  .tx-btn:hover       { border-color:${T.accent}!important; background:${T.accentLt}!important; }
  .tx-btn             { transition: all 0.15s; }
  .tx-btn.active      { border-color:${T.primary}!important; background:rgba(26,86,160,0.07)!important; }
  .table-row:hover    { background:${T.gray50}!important; }
  .table-row          { transition: background 0.12s; }
  .feature-card       { transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
  .feature-card:hover { border-color:${T.accent}!important; }
  .nav-link           { transition: color 0.15s; }

  @media (max-width: 1024px) {
    .grid-4 { grid-template-columns: repeat(2,1fr) !important; }
    .grid-3 { grid-template-columns: repeat(2,1fr) !important; }
    .grid-2 { grid-template-columns: 1fr !important; }
    .footer-grid { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 768px) {
    .grid-4 { grid-template-columns: 1fr 1fr !important; }
    .grid-3 { grid-template-columns: 1fr !important; }
    .grid-2 { grid-template-columns: 1fr !important; }
    .hero-grid { grid-template-columns: 1fr !important; }
    .hide-mobile { display: none !important; }
    .steps-row { flex-direction: column !important; align-items: center !important; }
    .steps-connector { display: none !important; }
    .footer-grid { grid-template-columns: 1fr !important; }
    .cta-banner { flex-direction: column !important; text-align: center !important; }
    .fee-grid { grid-template-columns: 1fr !important; }
    .nav-desktop { display: none !important; }
    .mobile-menu-btn { display: flex !important; }
    .stats-row { grid-template-columns: 1fr 1fr !important; }
    .tx-grid { grid-template-columns: repeat(2,1fr) !important; }
    .hero-cta { flex-direction: column !important; }
    .hero-trust { flex-direction: column !important; gap: 10px !important; }
    .domain-grid { grid-template-columns: 1fr !important; }
    .pay-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 480px) {
    .grid-4 { grid-template-columns: 1fr !important; }
    .stats-row { grid-template-columns: 1fr !important; }
    .tx-grid  { grid-template-columns: repeat(2,1fr) !important; }
  }
`;

/* ─── SHARED UI ──────────────────────────────────────────── */
const Btn = ({ children, variant="primary", onClick, style, className, disabled, type }) => {
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, border:"none", borderRadius:8, cursor:disabled?"not-allowed":"pointer", fontWeight:700, fontSize:15, padding:"12px 26px", opacity:disabled?0.55:1, whiteSpace:"nowrap", transition:"all 0.18s" };
  const variants = {
    primary: { background:T.primary, color:T.white },
    accent:  { background:T.accent,  color:T.white },
    outline: { background:"transparent", color:T.primary, border:`2px solid ${T.primary}` },
    outlineW:{ background:"transparent", color:T.white, border:"2px solid rgba(255,255,255,0.5)" },
    green:   { background:T.green, color:T.white },
    ghost:   { background:"transparent", color:T.gray700, padding:"10px 18px" },
  };
  return <button type={type||"button"} disabled={disabled} className={`btn-${variant} ${className||""}`} style={{...base,...variants[variant],...style}} onClick={onClick}>{children}</button>;
};

const Badge = ({ children, color=T.primary }) => (
  <span style={{ display:"inline-block", background:color+"18", color, fontWeight:700, fontSize:12, padding:"4px 12px", borderRadius:20, border:`1px solid ${color}28`, letterSpacing:"0.02em" }}>{children}</span>
);

const Spinner = () => (
  <span style={{ display:"inline-block", width:17, height:17, border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
);

/* ─── NAVBAR ─────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label:"Consumer",  children:[{label:"How It Works",desc:"5-step escrow process"},{label:"Benefits",desc:"Why use escrow"},{label:"Fee Calculator",desc:"Low transparent fees"}] },
  { label:"Business",  children:[{label:"For Business",desc:"Enterprise protection"},{label:"Escrow Pay",desc:"One-line integration"},{label:"Escrow API",desc:"Full API access"},{label:"Become a Partner",desc:"Grow your revenue"}] },
  { label:"Developer", children:[{label:"API Docs",desc:"Built for developers"},{label:"Webhooks",desc:"Real-time events"},{label:"Sandbox",desc:"Test environment"},{label:"SDKs",desc:"All major languages"}] },
  { label:"Help",      children:[{label:"What is Escrow?",desc:"Learn how we work"},{label:"Fees",desc:"Fee schedule"},{label:"Contact Us",desc:"Get in touch"},{label:"Help Center",desc:"Browse FAQs"}] },
];

const Navbar = ({ onLogin, onSignup, navigate }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const enter = (l) => { clearTimeout(timer.current); setOpenMenu(l); };
  const leave = () => { timer.current = setTimeout(() => setOpenMenu(null), 120); };

  return (
    <nav style={{ background:T.white, position:"sticky", top:0, zIndex:200, boxShadow: scrolled?"0 2px 20px rgba(0,0,0,0.1)":"0 1px 0 #e2e8f0", transition:"box-shadow 0.2s" }}>
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 1.5rem", display:"flex", alignItems:"center", height:64 }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", flexShrink:0 }} onClick={() => navigate("home")}>
          <div style={{ width:38, height:38, background:`linear-gradient(135deg,${T.primary},${T.primaryDk})`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:T.white, fontWeight:800, fontSize:18, fontFamily:"'Lora',serif" }}>V</span>
          </div>
          <span style={{ fontWeight:800, fontSize:20, color:T.primary, letterSpacing:"-0.4px" }}>Vault<span style={{ color:T.accent }}>Pay</span></span>
        </div>

        {/* Desktop nav */}
        <div className="nav-desktop" style={{ display:"flex", alignItems:"center", gap:2, marginLeft:36, flex:1 }}>
          {NAV_ITEMS.map(item => (
            <div key={item.label} style={{ position:"relative" }} onMouseEnter={() => enter(item.label)} onMouseLeave={leave}>
              <button className="nav-link" style={{ background:"none", border:"none", cursor:"pointer", padding:"8px 14px", fontWeight:600, fontSize:14, color: openMenu===item.label ? T.accent : T.gray700, display:"flex", alignItems:"center", gap:5 }}>
                {item.label}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transition:"transform 0.2s", transform: openMenu===item.label?"rotate(180deg)":"none" }}>
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {openMenu === item.label && (
                <div className="dropdown-menu" style={{ position:"absolute", top:"calc(100% + 6px)", left:0, background:T.white, border:`1px solid ${T.gray100}`, borderRadius:12, boxShadow:"0 8px 40px rgba(0,0,0,0.13)", minWidth:260, zIndex:300, overflow:"hidden" }}>
                  <div style={{ padding:"8px 0" }}>
                    {item.children.map(ch => (
                      <button key={ch.label} className="nav-link" style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"11px 20px", textAlign:"left" }}>
                        <div style={{ fontWeight:600, fontSize:14, color:T.gray900 }}>{ch.label}</div>
                        <div style={{ fontSize:12, color:T.gray500, marginTop:2 }}>{ch.desc}</div>
                      </button>
                    ))}
                  </div>
                  <div style={{ background:T.offWhite, borderTop:`1px solid ${T.gray100}`, padding:"14px 20px" }}>
                    <div style={{ fontWeight:700, fontSize:13, color:T.primary, marginBottom:8 }}>Start a Transaction →</div>
                    <Btn variant="accent" style={{ fontSize:13, padding:"8px 18px" }} onClick={onSignup}>Get Started Free</Btn>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="nav-desktop" style={{ display:"flex", alignItems:"center", gap:10, marginLeft:16, flexShrink:0 }}>
          <Btn variant="ghost" onClick={onLogin} style={{ fontSize:14 }}>Login</Btn>
          <Btn variant="accent" onClick={onSignup} style={{ fontSize:14, padding:"10px 22px" }}>Sign Up Free →</Btn>
        </div>

        {/* Mobile menu button */}
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(o=>!o)} style={{ display:"none", marginLeft:"auto", background:"none", border:"none", cursor:"pointer", flexDirection:"column", gap:5, padding:8 }}>
          {[0,1,2].map(i => <span key={i} style={{ display:"block", width:24, height:2, background:T.gray700, borderRadius:2 }} />)}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background:T.white, borderTop:`1px solid ${T.gray100}`, padding:"16px 1.5rem 24px" }}>
          {NAV_ITEMS.map(item => (
            <div key={item.label}>
              <div style={{ fontWeight:700, fontSize:14, color:T.primary, padding:"10px 0", borderBottom:`1px solid ${T.gray100}` }}>{item.label}</div>
              {item.children.map(ch => (
                <div key={ch.label} style={{ fontSize:14, color:T.gray700, padding:"8px 12px" }}>{ch.label}</div>
              ))}
            </div>
          ))}
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:20 }}>
            <Btn variant="outline" onClick={onLogin} style={{ width:"100%" }}>Login</Btn>
            <Btn variant="accent" onClick={onSignup} style={{ width:"100%" }}>Sign Up Free →</Btn>
          </div>
        </div>
      )}
    </nav>
  );
};

/* ─── HERO ───────────────────────────────────────────────── */
const TX_TYPES = [
  { id:"domain",      icon:"🌐", label:"Domain Names",      color:"#3b82f6" },
  { id:"vehicle",     icon:"🚗", label:"Motor Vehicles",    color:"#f59e0b" },
  { id:"merchandise", icon:"📦", label:"Merchandise",       color:"#8b5cf6" },
  { id:"services",    icon:"⚙️", label:"Milestone Services",color:"#10b981" },
  { id:"realestate",  icon:"🏠", label:"Real Estate",       color:"#ef4444" },
  { id:"jewelry",     icon:"💎", label:"Jewelry & Watches", color:"#ec4899" },
];
const CURRENCIES = ["USD","AUD","EUR","GBP","CAD"];

const Hero = ({ onSignup }) => {
  const [role, setRole]     = useState("buying");
  const [txType, setTxType] = useState("domain");
  const [amount, setAmount] = useState("");
  const [currency, setCur]  = useState("USD");

  return (
    <section style={{ background:`linear-gradient(150deg,${T.primaryDk} 0%,${T.primary} 55%,#1a6bb5 100%)`, color:T.white, padding:"70px 1.5rem 0", overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", right:"-5%", top:"-15%", width:600, height:600, background:"radial-gradient(circle,rgba(240,130,15,0.12) 0%,transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", left:"0", bottom:"-5%", width:350, height:350, background:"radial-gradient(circle,rgba(255,255,255,0.05) 0%,transparent 70%)", pointerEvents:"none" }} />

      <div className="hero-grid" style={{ maxWidth:1280, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:56, alignItems:"center" }}>
        <div>
          <div style={{ marginBottom:20 }}><Badge color={T.gold}>🔒 Secure Online Escrow Since 2005</Badge></div>
          <h1 className="fade-up" style={{ fontFamily:"'Lora',serif", fontSize:"clamp(32px,4.5vw,58px)", fontWeight:700, lineHeight:1.15, marginBottom:20, letterSpacing:"-0.5px" }}>
            Buy & sell online<br/>with <span style={{ color:T.gold }}>total confidence</span>
          </h1>
          <p className="fade-up-2" style={{ fontSize:"clamp(15px,2vw,17px)", color:"rgba(255,255,255,0.75)", lineHeight:1.8, marginBottom:36, maxWidth:480 }}>
            VaultPay holds your payment securely in escrow and only releases funds when both parties are fully satisfied. No chargebacks. No fraud. No stress.
          </p>
          <div className="hero-cta fade-up-3" style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:40 }}>
            <Btn variant="accent" style={{ fontSize:"clamp(14px,2vw,16px)", padding:"13px 30px" }} onClick={onSignup}>Start a Transaction Free →</Btn>
            <Btn variant="outlineW" style={{ fontSize:"clamp(14px,2vw,16px)", padding:"13px 26px" }}>See How It Works</Btn>
          </div>
          <div className="hero-trust fade-up-4" style={{ display:"flex", gap:24, flexWrap:"wrap", alignItems:"center" }}>
            {[{ icon:"🏆", text:"BBB A+ Rated" },{ icon:"🏛️", text:"Fully Licensed & Audited" },{ icon:"🛡️", text:"$5B+ Protected" }].map(b => (
              <div key={b.text} style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"rgba(255,255,255,0.6)" }}>
                <span style={{ fontSize:16 }}>{b.icon}</span>{b.text}
              </div>
            ))}
          </div>
        </div>

        {/* Transaction card */}
        <div className="fade-up-2" style={{ paddingBottom:48 }}>
          <div style={{ background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.14)", borderRadius:20, padding:"28px 24px", boxShadow:"0 28px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontWeight:700, fontSize:17, marginBottom:18 }}>Start a Transaction</div>
            {/* Role selector */}
            <div style={{ display:"flex", gap:0, background:"rgba(0,0,0,0.2)", borderRadius:9, padding:3, marginBottom:18 }}>
              {["Selling","Buying","Brokering"].map(r => (
                <button key={r} onClick={() => setRole(r.toLowerCase())} style={{ flex:1, padding:"9px 0", border:"none", borderRadius:7, cursor:"pointer", fontWeight:700, fontSize:13, transition:"all 0.15s", background:role===r.toLowerCase()?T.white:"transparent", color:role===r.toLowerCase()?T.primary:"rgba(255,255,255,0.6)", boxShadow:role===r.toLowerCase()?"0 2px 8px rgba(0,0,0,0.15)":"none" }}>
                  {r}
                </button>
              ))}
            </div>
            {/* TX type grid */}
            <div className="tx-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:18 }}>
              {TX_TYPES.map(t => (
                <button key={t.id} className={`tx-btn ${txType===t.id?"active":""}`} style={{ border:`1.5px solid ${txType===t.id?t.color:"rgba(255,255,255,0.15)"}`, borderRadius:10, padding:"10px 6px", cursor:"pointer", textAlign:"center", background:txType===t.id?"rgba(255,255,255,0.13)":"rgba(255,255,255,0.04)" }} onClick={() => setTxType(t.id)}>
                  <div style={{ fontSize:22 }}>{t.icon}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.88)", marginTop:4, lineHeight:1.3 }}>{t.label}</div>
                </button>
              ))}
            </div>
            {/* Amount */}
            <div style={{ display:"flex", gap:0, marginBottom:14 }}>
              <div style={{ position:"relative", flex:1 }}>
                <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.4)", fontSize:15 }}>$</span>
                <input type="number" placeholder="Transaction amount" value={amount} onChange={e=>setAmount(e.target.value)} style={{ width:"100%", padding:"12px 12px 12px 28px", background:"rgba(0,0,0,0.25)", border:"1.5px solid rgba(255,255,255,0.15)", borderRight:"none", borderRadius:"8px 0 0 8px", color:T.white, fontSize:15, outline:"none" }} />
              </div>
              <select value={currency} onChange={e=>setCur(e.target.value)} style={{ padding:"12px 10px", background:"rgba(0,0,0,0.35)", border:"1.5px solid rgba(255,255,255,0.15)", borderRadius:"0 8px 8px 0", color:T.white, fontSize:14, outline:"none", cursor:"pointer", minWidth:72 }}>
                {CURRENCIES.map(c => <option key={c} style={{ background:"#0f3d7a" }}>{c}</option>)}
              </select>
            </div>
            <Btn variant="accent" style={{ width:"100%", fontSize:15, padding:"13px 0", borderRadius:9 }} onClick={onSignup}>
              Get Started as {role.charAt(0).toUpperCase()+role.slice(1)} →
            </Btn>
            <p style={{ textAlign:"center", fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:10 }}>Free to register · No credit card required</p>
          </div>
        </div>
      </div>

      {/* Famous domains strip */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", marginTop:40, padding:"18px 0" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", flexWrap:"wrap", gap:0, padding:"0 1.5rem" }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginRight:18, whiteSpace:"nowrap" }}>Notable transactions:</span>
          {["uber.com","twitter.com","snapchat.com","gmail.com","slack.com","spacex.com"].map(d => (
            <span key={d} style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.28)", padding:"5px 14px", borderRight:"1px solid rgba(255,255,255,0.08)", whiteSpace:"nowrap" }}>{d}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── STATS BANNER ───────────────────────────────────────── */
const StatsBanner = () => (
  <section style={{ background:`linear-gradient(90deg,${T.accent},#e07010)`, color:T.white, padding:"28px 1.5rem" }}>
    <div className="stats-row" style={{ maxWidth:1280, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, textAlign:"center" }}>
      {[["$5B+","Total value protected"],["1.8M+","Customers worldwide"],["Since 2005","Trusted escrow service"],["From 1%","Low transparent fees"]].map(([n,l]) => (
        <div key={l}>
          <div style={{ fontFamily:"'Lora',serif", fontWeight:700, fontSize:"clamp(18px,3vw,28px)", letterSpacing:"-0.4px" }}>{n}</div>
          <div style={{ fontSize:13, opacity:0.82, marginTop:3 }}>{l}</div>
        </div>
      ))}
    </div>
  </section>
);

/* ─── HOW IT WORKS ───────────────────────────────────────── */
const HowItWorks = ({ onSignup }) => {
  const steps = [
    { n:1, icon:"🤝", title:"Agree on terms",           desc:"Buyer and seller agree on item description, price, inspection period, and delivery method." },
    { n:2, icon:"💳", title:"Buyer pays VaultPay",      desc:"The buyer submits payment via bank transfer, card, or crypto. Funds are held in our trust account." },
    { n:3, icon:"📦", title:"Seller delivers",          desc:"Once payment is confirmed, the seller ships the goods or delivers the agreed service." },
    { n:4, icon:"✅", title:"Buyer approves",            desc:"The buyer inspects during the agreed inspection window and approves once satisfied." },
    { n:5, icon:"💰", title:"VaultPay releases payment", desc:"We release the funds to the seller. Both parties protected from start to finish." },
  ];
  return (
    <section style={{ background:T.offWhite, padding:"90px 1.5rem" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:60 }}>
          <Badge color={T.teal}>Simple 5-Step Process</Badge>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:"clamp(26px,3.5vw,44px)", fontWeight:700, color:T.primary, marginTop:14, marginBottom:14, letterSpacing:"-0.5px" }}>How VaultPay Works</h2>
          <p style={{ color:T.gray500, fontSize:"clamp(14px,2vw,17px)", maxWidth:520, margin:"0 auto" }}>Transparent protection for every transaction — from the first dollar to the last.</p>
        </div>
        <div className="steps-row" style={{ display:"flex", alignItems:"flex-start", gap:0, position:"relative" }}>
          <div className="steps-connector" style={{ position:"absolute", top:44, left:"8%", right:"8%", height:2, background:`linear-gradient(90deg,${T.accent},${T.primary})`, zIndex:0, borderRadius:2 }} />
          {steps.map((s,i) => (
            <div key={s.n} style={{ flex:1, minWidth:160, textAlign:"center", padding:"0 12px", position:"relative", zIndex:1, marginBottom:16 }}>
              <div style={{ width:88, height:88, background:T.white, border:`3px solid ${T.accent}`, borderRadius:"50%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", boxShadow:`0 4px 16px rgba(240,130,15,0.18)` }}>
                <span style={{ fontSize:26 }}>{s.icon}</span>
                <span style={{ fontSize:11, fontWeight:700, color:T.accent, marginTop:2 }}>Step {s.n}</span>
              </div>
              <h3 style={{ fontWeight:700, fontSize:14, color:T.primary, marginBottom:8, lineHeight:1.35 }}>{s.title}</h3>
              <p style={{ fontSize:13, color:T.gray500, lineHeight:1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:48 }}>
          <Btn variant="primary" onClick={onSignup} style={{ fontSize:15, padding:"13px 30px" }}>Start a Transaction →</Btn>
          <Btn variant="ghost" style={{ fontSize:14, color:T.gray500, marginLeft:12 }}>Learn More</Btn>
        </div>
      </div>
    </section>
  );
};

/* ─── CATEGORIES ─────────────────────────────────────────── */
const CATEGORIES = [
  { icon:"🌐", title:"Domain Names",       desc:"The most trusted escrow for domain sales — from single domains to full portfolios.", color:"#3b82f6" },
  { icon:"🚗", title:"Motor Vehicles",      desc:"Cars, boats, motorcycles, aircraft. We handle titles, liens, and shipping docs.", color:"#f59e0b" },
  { icon:"💻", title:"Electronics",         desc:"Large computer setups, AV equipment, servers — protected with every transaction.", color:"#8b5cf6" },
  { icon:"📦", title:"General Merchandise", desc:"From luxury goods to hardware — buy and sell safely with full worldwide coverage.", color:"#10b981" },
  { icon:"🔗", title:"Milestone Payments",  desc:"Release payments in stages as work is completed — perfect for long projects.", color:"#ef4444" },
  { icon:"💎", title:"Jewelry & Watches",   desc:"High-value pieces where trust matters most. Authenticate before funds are released.", color:"#ec4899" },
  { icon:"🏠", title:"Real Estate Deposits",desc:"Secure earnest money and deposit handling with a fully regulated provider.", color:"#14b8a6" },
  { icon:"🎨", title:"Art & Collectibles",  desc:"Fine art, rare items, and collectibles — provenance and condition protected.", color:"#f97316" },
];

const Categories = ({ onSignup }) => (
  <section style={{ padding:"90px 1.5rem", background:T.white }}>
    <div style={{ maxWidth:1280, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:48, flexWrap:"wrap", gap:20 }}>
        <div>
          <Badge color={T.primary}>What We Protect</Badge>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:"clamp(24px,3vw,40px)", fontWeight:700, color:T.primary, marginTop:12, letterSpacing:"-0.5px" }}>Safely buy & sell<br/>anything from $100 to $100M+</h2>
        </div>
        <p style={{ color:T.gray500, fontSize:15, maxWidth:360, lineHeight:1.75 }}>Every category, every deal size — VaultPay has the experience and licensing to protect it.</p>
      </div>
      <div className="grid-4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18 }}>
        {CATEGORIES.map(c => (
          <div key={c.title} className="feature-card card-hover" style={{ border:`1.5px solid ${T.gray100}`, borderRadius:14, padding:"26px 22px", background:T.white, cursor:"pointer" }}>
            <div style={{ width:50, height:50, background:c.color+"18", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:14 }}>{c.icon}</div>
            <h3 style={{ fontWeight:700, fontSize:15, color:T.primary, marginBottom:8 }}>{c.title}</h3>
            <p style={{ fontSize:13, color:T.gray500, lineHeight:1.7 }}>{c.desc}</p>
            <div style={{ marginTop:14, fontSize:13, fontWeight:700, color:T.accent }}>Learn More →</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center", marginTop:44 }}>
        <p style={{ color:T.gray500, marginBottom:14, fontSize:14 }}>Don't see your category? Call us on <strong style={{ color:T.primary }}>+1 (800) 555-0199</strong></p>
        <Btn variant="primary" onClick={onSignup} style={{ marginRight:12 }}>Get Started Now</Btn>
        <Btn variant="outline" style={{ fontSize:14 }}>View Fee Calculator</Btn>
      </div>
    </div>
  </section>
);

/* ─── FEE CALCULATOR ─────────────────────────────────────── */
const FeeCalculator = () => {
  const [amount, setAmount] = useState(5000);
  const [currency, setCur]  = useState("USD");
  const [type, setType]     = useState("wire");
  const [role, setRole]     = useState("buyer");

  const calcFee = (a) => {
    if (a <= 5000)  return Math.max(a * 0.0325, 10);
    if (a <= 25000) return a * 0.0260;
    if (a <= 100000)return a * 0.0175;
    return a * 0.0125;
  };
  const fee     = calcFee(amount);
  const xFee    = type==="card" ? amount*0.0299 : type==="crypto" ? amount*0.01 : 0;
  const total   = fee + xFee;
  const pct     = ((total/amount)*100).toFixed(2);
  const fmt     = n => n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});

  return (
    <section style={{ background:`linear-gradient(135deg,${T.primaryDk} 0%,${T.primary} 100%)`, padding:"90px 1.5rem" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <Badge color={T.gold}>Transparent Pricing</Badge>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:"clamp(26px,3vw,40px)", fontWeight:700, color:T.white, marginTop:14, letterSpacing:"-0.5px" }}>Fee Calculator</h2>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:16, marginTop:10 }}>No hidden charges. No surprises. Ever.</p>
        </div>
        <div style={{ background:"rgba(255,255,255,0.06)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:20, padding:"clamp(24px,4vw,40px)" }}>
          <div className="fee-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
            {/* Inputs */}
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.6)", marginBottom:8 }}>Transaction Amount</label>
                <div style={{ display:"flex" }}>
                  <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value)||0)} style={{ flex:1, padding:"12px 14px", background:"rgba(0,0,0,0.3)", border:"1.5px solid rgba(255,255,255,0.15)", borderRight:"none", borderRadius:"8px 0 0 8px", color:T.white, fontSize:16, fontWeight:700, outline:"none" }} />
                  <select value={currency} onChange={e=>setCur(e.target.value)} style={{ padding:"12px 10px", background:"rgba(0,0,0,0.4)", border:"1.5px solid rgba(255,255,255,0.15)", borderRadius:"0 8px 8px 0", color:T.white, fontSize:14, outline:"none", cursor:"pointer" }}>
                    {CURRENCIES.map(c => <option key={c} style={{ background:"#0f3d7a" }}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.6)", marginBottom:8 }}>Payment Method</label>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[{id:"wire",label:"Wire / Bank Transfer",extra:"No extra fee"},{id:"ach",label:"ACH / Direct Debit",extra:"No extra fee"},{id:"card",label:"Credit / Debit Card",extra:"+2.99%"},{id:"crypto",label:"Cryptocurrency",extra:"+1.00%"}].map(pm => (
                    <label key={pm.id} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"10px 14px", borderRadius:8, border:`1.5px solid ${type===pm.id?T.accent:"rgba(255,255,255,0.12)"}`, background:type===pm.id?"rgba(240,130,15,0.12)":"rgba(0,0,0,0.15)", transition:"all 0.15s" }}>
                      <input type="radio" name="pm" value={pm.id} checked={type===pm.id} onChange={() => setType(pm.id)} style={{ accentColor:T.accent }} />
                      <span style={{ fontSize:14, color:T.white, flex:1 }}>{pm.label}</span>
                      <span style={{ fontSize:12, color: pm.extra.startsWith("+") ? T.gold : "#4ade80" }}>{pm.extra}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.6)", marginBottom:8 }}>Who pays the fee?</label>
                <div style={{ display:"flex", gap:8 }}>
                  {[["buyer","Buyer"],["seller","Seller"],["split","Split 50/50"]].map(([v,l]) => (
                    <button key={v} onClick={() => setRole(v)} style={{ flex:1, padding:"10px 0", border:`1.5px solid ${role===v?T.accent:"rgba(255,255,255,0.15)"}`, borderRadius:8, background:role===v?"rgba(240,130,15,0.15)":"transparent", color:role===v?T.accent:"rgba(255,255,255,0.55)", fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            {/* Result */}
            <div style={{ background:"rgba(0,0,0,0.25)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:"26px 22px", display:"flex", flexDirection:"column" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.45)", marginBottom:22, textTransform:"uppercase", letterSpacing:"0.08em" }}>Fee Breakdown</div>
              {[["Escrow fee ("+pct+"%)", fmt(fee)], ...(xFee>0?[["Processing fee", fmt(xFee)]]:[])].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"11px 0", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                  <span style={{ fontSize:14, color:"rgba(255,255,255,0.6)" }}>{k}</span>
                  <span style={{ fontSize:14, fontWeight:600, color:T.white }}>{currency} {v}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                <span style={{ fontSize:14, color:"rgba(255,255,255,0.6)" }}>Total fees</span>
                <span style={{ fontSize:16, fontWeight:700, color:T.gold }}>{currency} {fmt(total)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 0" }}>
                <span style={{ fontSize:14, color:"rgba(255,255,255,0.6)" }}>{role==="buyer"?"You pay total":role==="seller"?"You receive":"Each party pays"}</span>
                <span style={{ fontSize:22, fontWeight:800, color:T.accent }}>{currency} {role==="buyer"?fmt(amount+total):role==="seller"?fmt(amount-total):fmt(total/2)}</span>
              </div>
              <div style={{ background:"rgba(240,130,15,0.1)", border:"1px solid rgba(240,130,15,0.22)", borderRadius:9, padding:"13px 15px", marginTop:16 }}>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}>Fees vary by transaction amount. Minimum escrow fee is $10. Wire transfers have no payment processing surcharge.</p>
              </div>
              <div style={{ marginTop:18 }}>
                <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:6, display:"block" }}>Adjust: {currency} {amount.toLocaleString()}</label>
                <input type="range" min={100} max={500000} step={500} value={amount} onChange={e=>setAmount(Number(e.target.value))} style={{ width:"100%", accentColor:T.accent, cursor:"pointer" }} />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,0.28)", marginTop:3 }}><span>$100</span><span>$500,000</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── DOMAIN HIGHLIGHT ───────────────────────────────────── */
const DomainHighlight = ({ onSignup }) => (
  <section style={{ padding:"90px 1.5rem", background:T.white }}>
    <div style={{ maxWidth:1280, margin:"0 auto" }}>
      <div className="domain-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, alignItems:"center" }}>
        <div>
          <Badge color="#3b82f6">Domain & Website Escrow</Badge>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:"clamp(24px,3vw,40px)", fontWeight:700, color:T.primary, marginTop:14, marginBottom:18, letterSpacing:"-0.5px", lineHeight:1.25 }}>The preferred payment method for domain sales</h2>
          <p style={{ fontSize:15, color:T.gray500, lineHeight:1.8, marginBottom:24 }}>From single domain names to entire portfolios and full websites — every transaction follows our proven 5-step process with complete protection for buyer and seller.</p>
          <div style={{ background:T.offWhite, borderRadius:14, padding:"20px", marginBottom:26 }}>
            <div style={{ fontWeight:700, fontSize:13, color:T.primary, marginBottom:12 }}>Domains sold through VaultPay:</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {["uber.com","twitter.com","snapchat.com","gmail.com","slack.com","spacex.com","chrome.com","wordpress.com"].map(d => (
                <span key={d} style={{ background:T.white, border:`1px solid ${T.gray100}`, borderRadius:6, padding:"4px 12px", fontSize:13, fontWeight:500, color:"#3b82f6" }}>{d}</span>
              ))}
            </div>
          </div>
          <Btn variant="primary" onClick={onSignup} style={{ marginRight:12 }}>Buy or Sell a Domain →</Btn>
        </div>
        <div style={{ background:`linear-gradient(135deg,${T.primary},${T.primaryDk})`, borderRadius:20, padding:"clamp(24px,4vw,36px)" }}>
          <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"rgba(255,255,255,0.45)", marginBottom:22 }}>Domain Transfer — Step by Step</div>
          {["Buyer and seller agree on price and terms","Buyer pays into VaultPay escrow account","Seller initiates domain name transfer at registrar","Buyer verifies transfer and approves domain","VaultPay releases payment to seller instantly"].map((s,i,a) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:i<a.length-1?20:0 }}>
              <div style={{ flexShrink:0 }}>
                <div style={{ width:30, height:30, background:T.accent, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:T.white }}>{i+1}</div>
                {i<a.length-1 && <div style={{ width:2, height:18, background:"rgba(255,255,255,0.1)", margin:"4px auto 0" }} />}
              </div>
              <div style={{ paddingTop:5, fontSize:15, color:"rgba(255,255,255,0.82)", lineHeight:1.5 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ─── ESCROW PAY / API ───────────────────────────────────── */
const EscrowPay = ({ onSignup }) => (
  <section style={{ padding:"90px 1.5rem", background:T.offWhite }}>
    <div style={{ maxWidth:1280, margin:"0 auto" }}>
      <div className="pay-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:24 }}>
        <div style={{ background:`linear-gradient(135deg,#eff6ff,#dbeafe)`, borderRadius:20, padding:"clamp(24px,4vw,40px)", border:"1px solid #bfdbfe" }}>
          <div style={{ fontSize:34, marginBottom:14 }}>⚡</div>
          <h3 style={{ fontFamily:"'Lora',serif", fontSize:"clamp(22px,2.5vw,28px)", fontWeight:700, color:T.primary, marginBottom:12 }}>VaultPay Checkout</h3>
          <p style={{ fontSize:15, color:T.gray600, lineHeight:1.8, marginBottom:24 }}>Add secure escrow payments to any website or app in a single line of code. No chargebacks, ever.</p>
          <div style={{ background:T.white, borderRadius:10, padding:"14px 16px", fontFamily:"monospace", fontSize:13, color:"#1e3a5f", marginBottom:22, border:"1px solid #bfdbfe", lineHeight:2 }}>
            <span style={{ color:"#6b21a8" }}>{"<VaultPay"}</span><br/>
            &nbsp;&nbsp;<span style={{ color:"#0369a1" }}>amount</span>=<span style={{ color:"#059669" }}>{'"5000"'}</span><br/>
            &nbsp;&nbsp;<span style={{ color:"#0369a1" }}>type</span>=<span style={{ color:"#059669" }}>{'"domain"'}</span><br/>
            <span style={{ color:"#6b21a8" }}>{"/>"}</span>
          </div>
          <Btn variant="primary" onClick={onSignup}>Learn More →</Btn>
        </div>
        <div style={{ background:`linear-gradient(135deg,#fdf4ff,#fae8ff)`, borderRadius:20, padding:"clamp(24px,4vw,40px)", border:"1px solid #e9d5ff" }}>
          <div style={{ fontSize:34, marginBottom:14 }}>🔌</div>
          <h3 style={{ fontFamily:"'Lora',serif", fontSize:"clamp(22px,2.5vw,28px)", fontWeight:700, color:T.primary, marginBottom:12 }}>VaultPay API</h3>
          <p style={{ fontSize:15, color:T.gray600, lineHeight:1.8, marginBottom:24 }}>Full REST API — integrate escrow payments as simply as Stripe. Built by developers, for developers.</p>
          {["No chargebacks, ever","Webhooks & real-time events","Full sandbox testing environment","SDKs for all major languages"].map(f => (
            <div key={f} style={{ display:"flex", alignItems:"center", gap:10, fontSize:14, color:T.gray700, marginBottom:10 }}>
              <span style={{ color:T.green, fontWeight:700 }}>✓</span>{f}
            </div>
          ))}
          <Btn variant="primary" onClick={onSignup} style={{ background:"#7c3aed", marginTop:14 }}>Integrate Now →</Btn>
        </div>
      </div>
      <div style={{ background:`linear-gradient(135deg,${T.primary},${T.primaryDk})`, borderRadius:20, padding:"clamp(28px,4vw,48px)", color:T.white, display:"flex", alignItems:"center", justifyContent:"space-between", gap:32, flexWrap:"wrap" }}>
        <div style={{ maxWidth:560 }}>
          <Badge color={T.gold}>New</Badge>
          <h3 style={{ fontFamily:"'Lora',serif", fontSize:"clamp(22px,2.5vw,28px)", fontWeight:700, marginTop:12, marginBottom:10 }}>VaultPay Offer</h3>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.68)", lineHeight:1.8 }}>Let buyers and sellers negotiate prices directly — via a Make Offer button or API call — with the full protection of VaultPay escrow behind every deal.</p>
        </div>
        <Btn variant="accent" onClick={onSignup} style={{ fontSize:15, padding:"13px 28px", flexShrink:0 }}>Learn About Offers →</Btn>
      </div>
    </div>
  </section>
);

/* ─── SECURITY ───────────────────────────────────────────── */
const Security = () => (
  <section style={{ background:T.white, padding:"90px 1.5rem" }}>
    <div style={{ maxWidth:1280, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:60 }}>
        <Badge color={T.green}>Security & Licensing</Badge>
        <h2 style={{ fontFamily:"'Lora',serif", fontSize:"clamp(26px,3vw,40px)", fontWeight:700, color:T.primary, marginTop:14, letterSpacing:"-0.5px" }}>Licensed, audited, and trusted</h2>
        <p style={{ color:T.gray500, fontSize:16, maxWidth:520, margin:"14px auto 0" }}>VaultPay is fully licensed, bonded, and regularly audited by government regulators to protect public funds.</p>
      </div>
      <div className="grid-4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
        {[
          { icon:"🏛️", title:"Fully Licensed",         desc:"Licensed and bonded under state financial regulations. Regular government audits ensure compliance." },
          { icon:"🏆", title:"BBB A+ Rated",             desc:"Highest possible rating from the Better Business Bureau. Award-winning ethical standards." },
          { icon:"🔐", title:"256-bit SSL Encryption",   desc:"All data and transactions protected with bank-grade encryption from end to end." },
          { icon:"🛡️", title:"Government Audited",      desc:"Independent audits verify safety, soundness, and full regulatory compliance." },
          { icon:"💵", title:"Funds Held in Trust",      desc:"All escrow funds in regulated, segregated trust accounts — never mixed with company funds." },
          { icon:"🚫", title:"Zero Chargebacks",         desc:"Once payment enters escrow, it cannot be reversed. Sellers are completely protected." },
          { icon:"🌍", title:"30+ Countries Supported",  desc:"Multi-currency support for global deals. Wire, ACH, card, and crypto accepted." },
          { icon:"📞", title:"24/7 Live Support",        desc:"Real humans via phone, email, and chat. Our specialists personally handle complex deals." },
        ].map(f => (
          <div key={f.title} className="feature-card card-hover" style={{ background:T.white, border:`1.5px solid ${T.gray100}`, borderRadius:14, padding:"26px 20px" }}>
            <div style={{ fontSize:26, marginBottom:12 }}>{f.icon}</div>
            <h3 style={{ fontWeight:700, fontSize:14, color:T.primary, marginBottom:8 }}>{f.title}</h3>
            <p style={{ fontSize:13, color:T.gray500, lineHeight:1.7 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── TESTIMONIALS ───────────────────────────────────────── */
const TESTIMONIALS = [
  { name:"Michael R.", role:"Domain Investor",       text:"Sold a $45,000 domain to a buyer in Germany without a single worry. VaultPay handled everything perfectly. I'll never do a large domain deal any other way.", stars:5 },
  { name:"Sarah K.",   role:"Classic Car Dealer",    text:"We've processed over 60 vehicle transactions through VaultPay. Their team helped with shipping docs and titles every time. Absolutely indispensable.", stars:5 },
  { name:"David L.",   role:"Freelance Developer",   text:"Using milestone payments for a $12,000 project — both parties had total peace of mind. Perfect solution for large freelance contracts.", stars:5 },
  { name:"Aisha M.",   role:"Jewelry Reseller",      text:"Bought a $8,500 Rolex from a private seller across the country. Had it authenticated during inspection, then approved. Smooth from start to finish.", stars:5 },
  { name:"James T.",   role:"Marketplace Founder",   text:"Integrated VaultPay Checkout in less than a day. Zero chargebacks since launch. My customers absolutely love the security it provides.", stars:5 },
  { name:"Priya N.",   role:"Startup Founder",       text:"Used VaultPay for a $28,000 domain acquisition. Completely transparent — both parties tracked every step in real time. Outstanding service.", stars:5 },
];

const Testimonials = () => (
  <section style={{ padding:"90px 1.5rem", background:T.offWhite }}>
    <div style={{ maxWidth:1280, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:48 }}>
        <Badge color={T.accent}>Customer Stories</Badge>
        <h2 style={{ fontFamily:"'Lora',serif", fontSize:"clamp(24px,3vw,40px)", fontWeight:700, color:T.primary, marginTop:14, letterSpacing:"-0.5px" }}>1.8M+ customers trust VaultPay</h2>
      </div>
      <div className="grid-3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:22 }}>
        {TESTIMONIALS.map(t => (
          <div key={t.name} className="card-hover" style={{ border:`1.5px solid ${T.gray100}`, borderRadius:14, padding:"26px 22px", background:T.white }}>
            <div style={{ display:"flex", gap:2, marginBottom:12 }}>
              {Array(t.stars).fill(0).map((_,i)=><span key={i} style={{ color:T.gold, fontSize:17 }}>★</span>)}
            </div>
            <p style={{ fontSize:14, color:T.gray700, lineHeight:1.8, fontStyle:"italic", marginBottom:18 }}>"{t.text}"</p>
            <div style={{ display:"flex", alignItems:"center", gap:11 }}>
              <div style={{ width:38, height:38, background:`linear-gradient(135deg,${T.primary},${T.primaryDk})`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:T.white, fontWeight:700, fontSize:14 }}>{t.name[0]}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:T.primary }}>{t.name}</div>
                <div style={{ fontSize:12, color:T.gray500 }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── FAQ ────────────────────────────────────────────────── */
const FAQS = [
  { q:"What is escrow?", a:"Escrow is a financial arrangement where a neutral third party holds funds until both parties have fulfilled their obligations. VaultPay acts as that trusted neutral party, ensuring neither buyer nor seller can be defrauded." },
  { q:"How long does a transaction take?", a:"Wire transfers are confirmed within 1-2 business days. ACH takes 3-5 days. Once funds are confirmed and goods delivered, the inspection and approval can happen immediately." },
  { q:"Who pays the escrow fee?", a:"By default the buyer pays, but this is negotiable. Parties can agree that the seller pays, or that they split the fee 50/50 — this is set when starting the transaction." },
  { q:"What if I'm not happy with what I receive?", a:"You have an agreed inspection period (typically 2-5 days). If unsatisfied, raise a dispute. Our team reviews all evidence and makes a fair, binding decision." },
  { q:"Is VaultPay licensed and regulated?", a:"Yes. VaultPay is fully licensed, bonded, and regularly audited. All funds are held in regulated, segregated trust accounts separate from company funds." },
  { q:"What payment methods are accepted?", a:"Wire transfer, ACH/bank transfer, debit and credit cards (Visa/Mastercard/Amex), and cryptocurrency. Cards carry a 2.99% surcharge; wire and ACH have no extra fee." },
  { q:"Can I use VaultPay internationally?", a:"Yes. We support USD, AUD, EUR, GBP, and CAD, and serve customers in 30+ countries. International wire transfers are fully supported." },
];

const FAQ = () => {
  const [open, setOpen] = useState(null);
  return (
    <section style={{ background:T.white, padding:"90px 1.5rem" }}>
      <div style={{ maxWidth:840, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <Badge color={T.primary}>FAQ</Badge>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:"clamp(24px,3vw,40px)", fontWeight:700, color:T.primary, marginTop:14, letterSpacing:"-0.5px" }}>Common Questions</h2>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {FAQS.map((f,i) => (
            <div key={i} style={{ background:T.white, border:`1.5px solid ${open===i?T.accent:T.gray100}`, borderRadius:12, overflow:"hidden", transition:"border-color 0.18s" }}>
              <div onClick={() => setOpen(open===i?null:i)} style={{ padding:"18px 22px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", userSelect:"none" }}>
                <span style={{ fontWeight:600, fontSize:15, color:T.primary, paddingRight:14 }}>{f.q}</span>
                <span style={{ fontSize:22, color:T.accent, flexShrink:0, transform:open===i?"rotate(45deg)":"none", transition:"transform 0.2s" }}>+</span>
              </div>
              {open===i && <div style={{ padding:"0 22px 18px", fontSize:14, color:T.gray600, lineHeight:1.8, animation:"fadeIn 0.2s ease" }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── CTA BANNER ─────────────────────────────────────────── */
const CTABanner = ({ onSignup }) => (
  <section style={{ padding:"0 1.5rem 90px" }}>
    <div className="cta-banner" style={{ maxWidth:1240, margin:"0 auto", background:`linear-gradient(135deg,${T.accent},#c96a00)`, borderRadius:20, padding:"clamp(36px,5vw,64px) clamp(28px,5vw,60px)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:36 }}>
      <div>
        <h2 style={{ fontFamily:"'Lora',serif", fontSize:"clamp(26px,3.5vw,40px)", color:T.white, fontWeight:700, letterSpacing:"-0.5px", lineHeight:1.2, marginBottom:10 }}>Ready to transact safely?</h2>
        <p style={{ fontSize:16, color:"rgba(255,255,255,0.75)" }}>Free to join. Fee only charged on successful transactions.</p>
      </div>
      <Btn onClick={onSignup} style={{ background:T.white, color:T.accent, fontSize:16, padding:"14px 32px", flexShrink:0, fontWeight:800, borderRadius:10 }}>Create Free Account →</Btn>
    </div>
  </section>
);

/* ─── AUTH MODAL ─────────────────────────────────────────── */
const AuthModal = ({ mode, onClose, onSuccess, switchMode }) => {
  const [form, setForm]   = useState({ name:"", email:"", password:"", confirm:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]   = useState(false);
  const isLogin = mode==="login";
  const h = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const submit = e => {
    e.preventDefault(); setError("");
    if (!form.email||!form.password) return setError("Please fill in all required fields.");
    if (!isLogin) {
      if (!form.name) return setError("Full name is required.");
      if (form.password.length<8) return setError("Password must be at least 8 characters.");
      if (form.password!==form.confirm) return setError("Passwords do not match.");
    }
    setLoading(true);
    setTimeout(()=>{ setLoading(false); setDone(true); setTimeout(onSuccess,800); }, 1200);
  };

  const inp = { width:"100%", padding:"12px 14px", border:`1.5px solid ${T.gray100}`, borderRadius:8, fontSize:15, color:T.gray900, outline:"none", background:T.white };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(4px)" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:T.white, borderRadius:20, width:"100%", maxWidth:440, boxShadow:"0 32px 80px rgba(0,0,0,0.22)", animation:"fadeUp 0.3s ease", overflow:"hidden" }}>
        <div style={{ background:`linear-gradient(135deg,${T.primary},${T.primaryDk})`, padding:"26px 28px", color:T.white, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:800, fontSize:19 }}>{isLogin?"Welcome back":"Create your account"}</div>
            <div style={{ fontSize:13, opacity:0.65, marginTop:3 }}>{isLogin?"Sign in to your escrow account":"Free to join — start transacting safely"}</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.12)", border:"none", color:T.white, borderRadius:"50%", width:32, height:32, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"28px" }}>
          {done ? (
            <div style={{ textAlign:"center", padding:"20px 0" }}>
              <div style={{ fontSize:48, marginBottom:14 }}>✅</div>
              <div style={{ fontWeight:700, fontSize:18, color:T.primary, marginBottom:6 }}>{isLogin?"Signed in!":"Account created!"}</div>
              <div style={{ fontSize:14, color:T.gray500 }}>Redirecting you now…</div>
            </div>
          ) : (
            <form onSubmit={submit}>
              {error && <div style={{ background:"#fff5f5", border:`1px solid #fed7d7`, borderRadius:8, padding:"10px 14px", fontSize:14, color:T.red, marginBottom:16 }}>{error}</div>}
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {!isLogin && <div><label style={{ display:"block", fontSize:13, fontWeight:600, color:T.gray700, marginBottom:5 }}>Full Name *</label><input style={inp} type="text" placeholder="Your full name" value={form.name} onChange={h("name")} /></div>}
                <div><label style={{ display:"block", fontSize:13, fontWeight:600, color:T.gray700, marginBottom:5 }}>Email Address *</label><input style={inp} type="email" placeholder="you@example.com" value={form.email} onChange={h("email")} /></div>
                <div><label style={{ display:"block", fontSize:13, fontWeight:600, color:T.gray700, marginBottom:5 }}>Password *</label><input style={inp} type="password" placeholder={isLogin?"Your password":"Min. 8 characters"} value={form.password} onChange={h("password")} /></div>
                {!isLogin && <div><label style={{ display:"block", fontSize:13, fontWeight:600, color:T.gray700, marginBottom:5 }}>Confirm Password *</label><input style={inp} type="password" placeholder="Repeat password" value={form.confirm} onChange={h("confirm")} /></div>}
              </div>
              {isLogin && <div style={{ textAlign:"right", marginTop:6 }}><span style={{ fontSize:13, color:T.accent, cursor:"pointer", fontWeight:600 }}>Forgot password?</span></div>}
              <button type="submit" disabled={loading} className="btn-accent" style={{ width:"100%", marginTop:20, padding:"14px", background:T.accent, color:T.white, border:"none", borderRadius:9, fontSize:16, fontWeight:700, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, transition:"all 0.18s" }}>
                {loading ? <><Spinner />{isLogin?"Signing in…":"Creating account…"}</> : isLogin?"Sign In →":"Create Free Account →"}
              </button>
              {!isLogin && <p style={{ fontSize:12, color:T.gray400, textAlign:"center", marginTop:12, lineHeight:1.6 }}>By signing up you agree to our Terms of Service and Privacy Policy.</p>}
              <div style={{ textAlign:"center", marginTop:20, fontSize:14, color:T.gray500, borderTop:`1px solid ${T.gray100}`, paddingTop:18 }}>
                {isLogin?"No account? ":"Already have an account? "}
                <span style={{ color:T.primary, fontWeight:700, cursor:"pointer" }} onClick={switchMode}>{isLogin?"Sign up free →":"Sign in →"}</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── DASHBOARD ──────────────────────────────────────────── */
const STATUS_CFG = {
  funded:    { label:"Funded",           dot:"#3b82f6", bg:"#eff6ff" },
  inspection:{ label:"In Inspection",    dot:"#f59e0b", bg:"#fffbeb" },
  approved:  { label:"Approved",         dot:"#10b981", bg:"#f0fdf4" },
  completed: { label:"Completed",        dot:"#6b7280", bg:"#f9fafb" },
  disputed:  { label:"Disputed",         dot:"#ef4444", bg:"#fef2f2" },
  pending:   { label:"Awaiting Payment", dot:"#8b5cf6", bg:"#f5f3ff" },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status]||STATUS_CFG.pending;
  return <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:c.bg, borderRadius:20, padding:"4px 11px", fontSize:12, fontWeight:700, color:c.dot }}><span style={{ width:7,height:7,borderRadius:"50%",background:c.dot,display:"inline-block" }} />{c.label}</span>;
};

const MOCK_TX = [
  { id:"TXN-88401", title:"twitter.com domain transfer",   type:"Domain",      amount:280000, currency:"USD", role:"Buyer",  other:"DomainGiant LLC",   status:"completed",  date:"Apr 18, 2024" },
  { id:"TXN-88256", title:"2019 Porsche 911 GT3",          type:"Vehicle",     amount:94500,  currency:"USD", role:"Buyer",  other:"SportsCars Direct", status:"inspection", date:"May 02, 2024" },
  { id:"TXN-88103", title:"MacBook Pro server rack setup", type:"Electronics", amount:12400,  currency:"USD", role:"Seller", other:"Infra Corp",         status:"funded",     date:"May 10, 2024" },
  { id:"TXN-87940", title:"Brand identity design package", type:"Milestone",   amount:4800,   currency:"USD", role:"Buyer",  other:"Studio Vela",        status:"approved",   date:"May 14, 2024" },
  { id:"TXN-87801", title:"Rolex Submariner watch",        type:"Merchandise", amount:9200,   currency:"USD", role:"Buyer",  other:"Prestige Watches",   status:"disputed",   date:"May 16, 2024" },
];

const Dashboard = ({ user, onLogout, navigate }) => {
  const [tab, setTab]         = useState("transactions");
  const [detail, setDetail]   = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [txs, setTxs]         = useState(MOCK_TX);
  const [msgInput, setMsg]    = useState("");
  const [messages, setMsgs]   = useState([
    { from:"System",          text:"Transaction created and funds confirmed in escrow.", time:"May 02, 9:00 AM" },
    { from:"SportsCars Direct",text:"Vehicle shipped via enclosed transport. Tracking: SC-4829301", time:"May 04, 2:30 PM" },
    { from:"You",             text:"Thanks! I'll confirm once it arrives.", time:"May 04, 3:00 PM" },
  ]);
  const [nf, setNF] = useState({ title:"", type:"domain", amount:"", currency:"USD", counterparty:"", role:"buyer", days:"3" });
  const [step, setStep] = useState(1);

  const totalActive = txs.filter(t=>!["completed","disputed"].includes(t.status)).reduce((a,b)=>a+b.amount,0);
  const activeCount = txs.filter(t=>!["completed","disputed"].includes(t.status)).length;
  const hn = k => e => setNF(p=>({...p,[k]:e.target.value}));

  const createTx = () => {
    setTxs(p=>[{ id:`TXN-${Math.floor(80000+Math.random()*9000)}`, title:nf.title, type:TX_TYPES.find(t=>t.id===nf.type)?.label||"General", amount:parseFloat(nf.amount)||0, currency:nf.currency, role:nf.role==="buyer"?"Buyer":"Seller", other:nf.counterparty||"Counterparty", status:"pending", date:new Date().toLocaleDateString("en",{month:"short",day:"numeric",year:"numeric"}) },...p]);
    setShowNew(false); setStep(1); setNF({title:"",type:"domain",amount:"",currency:"USD",counterparty:"",role:"buyer",days:"3"});
  };

  const inp = { width:"100%", padding:"11px 14px", border:`1.5px solid ${T.gray100}`, borderRadius:8, fontSize:14, color:T.gray900, outline:"none", background:T.white };
  const activeDetail = detail ? txs.find(t=>t.id===detail.id)||detail : null;

  return (
    <div style={{ background:T.offWhite, minHeight:"100vh" }}>
      {/* Dash header */}
      <div style={{ background:`linear-gradient(135deg,${T.primary},${T.primaryDk})`, color:T.white, padding:"0 1.5rem" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", display:"flex", alignItems:"center", height:60, gap:20, flexWrap:"wrap" }}>
          <div style={{ fontWeight:800, fontSize:18, cursor:"pointer" }} onClick={()=>navigate("home")}>Vault<span style={{ color:T.gold }}>Pay</span></div>
          <div style={{ display:"flex", gap:0, marginLeft:20, overflowX:"auto" }}>
            {[["transactions","Transactions"],["settings","Account"],["history","History"]].map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)} style={{ background:"none", border:"none", cursor:"pointer", padding:"8px 14px", fontSize:13, fontWeight:600, color:tab===k?T.gold:"rgba(255,255,255,0.55)", borderBottom:tab===k?`2px solid ${T.gold}`:"2px solid transparent", transition:"all 0.15s", whiteSpace:"nowrap" }}>{l}</button>
            ))}
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:10, alignItems:"center" }}>
            <Btn variant="accent" onClick={()=>setShowNew(true)} style={{ fontSize:13, padding:"8px 18px" }}>+ New Transaction</Btn>
            <button onClick={onLogout} style={{ background:"none", border:"1px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.6)", padding:"7px 14px", borderRadius:6, cursor:"pointer", fontSize:13, whiteSpace:"nowrap" }}>Log out</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"28px 1.5rem" }}>
        {/* Summary */}
        <div className="grid-4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
          {[{label:"Active",val:activeCount,icon:"⚡",col:"#3b82f6"},{label:"In Escrow",val:`$${totalActive.toLocaleString()}`,icon:"🔒",col:T.green},{label:"Completed",val:txs.filter(t=>t.status==="completed").length,icon:"✅",col:T.teal},{label:"Disputed",val:txs.filter(t=>t.status==="disputed").length,icon:"⚠️",col:T.accent}].map(c=>(
            <div key={c.label} style={{ background:T.white, border:`1px solid ${T.gray100}`, borderRadius:14, padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:T.gray400, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>{c.label}</div>
                <div style={{ fontSize:24, fontWeight:800, color:T.primary, fontFamily:"'Lora',serif" }}>{c.val}</div>
              </div>
              <div style={{ width:42, height:42, background:c.col+"18", borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{c.icon}</div>
            </div>
          ))}
        </div>

        {/* Transaction table */}
        {tab==="transactions" && !activeDetail && (
          <div style={{ background:T.white, border:`1px solid ${T.gray100}`, borderRadius:16, overflow:"hidden" }}>
            <div style={{ padding:"18px 22px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${T.gray100}`, flexWrap:"wrap", gap:10 }}>
              <div style={{ fontWeight:700, fontSize:16, color:T.primary }}>All Transactions</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {["All","Active","Completed","Disputed"].map(f=>(
                  <button key={f} style={{ fontSize:13, padding:"6px 14px", borderRadius:7, border:`1px solid ${T.gray100}`, background:f==="All"?T.primary:T.white, color:f==="All"?T.white:T.gray600, cursor:"pointer", fontWeight:500 }}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:640 }}>
                <thead>
                  <tr style={{ background:T.offWhite }}>
                    {["Transaction","Type","Amount","Role","Counterparty","Status","Date",""].map(h=>(
                      <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:T.gray500, textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:`1px solid ${T.gray100}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txs.map((tx,i)=>(
                    <tr key={tx.id} className="table-row" style={{ borderBottom:i<txs.length-1?`1px solid ${T.gray100}`:"none", cursor:"pointer" }} onClick={()=>setDetail(tx)}>
                      <td style={{ padding:"14px 16px" }}><div style={{ fontWeight:600, fontSize:14, color:T.primary }}>{tx.title}</div><div style={{ fontSize:11, color:T.gray400, marginTop:2 }}>{tx.id}</div></td>
                      <td style={{ padding:"14px 16px" }}><span style={{ fontSize:11, fontWeight:700, color:T.teal, background:T.tealLt, padding:"3px 9px", borderRadius:5 }}>{tx.type}</span></td>
                      <td style={{ padding:"14px 16px", fontWeight:700, color:T.primary, fontFamily:"'Lora',serif" }}>${tx.amount.toLocaleString()}</td>
                      <td style={{ padding:"14px 16px" }}><span style={{ fontSize:11, fontWeight:700, color:tx.role==="Buyer"?"#3b82f6":"#10b981", background:tx.role==="Buyer"?"#eff6ff":"#f0fdf4", padding:"3px 9px", borderRadius:5 }}>{tx.role}</span></td>
                      <td style={{ padding:"14px 16px", fontSize:13, color:T.gray700 }}>{tx.other}</td>
                      <td style={{ padding:"14px 16px" }}><StatusBadge status={tx.status} /></td>
                      <td style={{ padding:"14px 16px", fontSize:12, color:T.gray500 }}>{tx.date}</td>
                      <td style={{ padding:"14px 16px" }}><span style={{ color:T.accent, fontSize:13, fontWeight:700 }}>View →</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transaction detail */}
        {tab==="transactions" && activeDetail && (
          <div>
            <button onClick={()=>setDetail(null)} style={{ background:"none", border:"none", color:T.gray500, cursor:"pointer", fontSize:14, marginBottom:20, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>← Back to transactions</button>
            <div className="domain-grid" style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20 }}>
              <div style={{ background:T.white, border:`1px solid ${T.gray100}`, borderRadius:16, overflow:"hidden" }}>
                <div style={{ background:`linear-gradient(135deg,${T.primary},${T.primaryDk})`, padding:"22px 26px", color:T.white }}>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:5 }}>{activeDetail.id} · {activeDetail.type}</div>
                  <div style={{ fontFamily:"'Lora',serif", fontSize:20, fontWeight:700 }}>{activeDetail.title}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginTop:10, flexWrap:"wrap" }}>
                    <span style={{ fontSize:26, fontWeight:800 }}>${activeDetail.amount.toLocaleString()}</span>
                    <StatusBadge status={activeDetail.status} />
                  </div>
                </div>
                <div style={{ padding:"24px" }}>
                  <div style={{ fontWeight:700, fontSize:14, color:T.primary, marginBottom:18 }}>Timeline</div>
                  {["Transaction created","Funds confirmed in escrow","Seller ships / delivers","Buyer inspection period","Buyer approves","Payment released to seller"].map((s,i,a)=>(
                    <div key={i} style={{ display:"flex", gap:12, marginBottom:i<a.length-1?16:0 }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                        <div style={{ width:26,height:26,borderRadius:"50%",background:i<2?T.primary:i===2&&activeDetail.status==="inspection"?"#fef3c7":i<2?"#f3f4f6":T.gray100,border:`2px solid ${i<2?T.primary:i===2&&activeDetail.status==="inspection"?"#fbbf24":T.gray200}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:i<2?T.white:T.gray400 }}>{i<2?"✓":i+1}</div>
                        {i<a.length-1 && <div style={{ width:2,flex:1,minHeight:16,background:i<1?T.primary+"30":T.gray100,marginTop:3 }} />}
                      </div>
                      <div style={{ paddingTop:3,fontSize:14,color:i<2?T.primary:T.gray400,fontWeight:i<2?600:400 }}>{s}</div>
                    </div>
                  ))}
                  <hr style={{ border:"none", borderTop:`1px solid ${T.gray100}`, margin:"22px 0" }} />
                  <div style={{ fontWeight:700, fontSize:14, color:T.primary, marginBottom:14 }}>Messages</div>
                  <div style={{ maxHeight:260, overflowY:"auto", display:"flex", flexDirection:"column", gap:12, marginBottom:14 }}>
                    {messages.map((m,i)=>(
                      <div key={i} style={{ display:"flex", gap:8, flexDirection:m.from==="You"?"row-reverse":"row" }}>
                        <div style={{ width:30,height:30,borderRadius:"50%",background:m.from==="You"?T.accent:T.primary,display:"flex",alignItems:"center",justifyContent:"center",color:T.white,fontSize:11,fontWeight:700,flexShrink:0 }}>{m.from[0]}</div>
                        <div style={{ maxWidth:"70%" }}>
                          <div style={{ fontSize:11,color:T.gray400,marginBottom:3,textAlign:m.from==="You"?"right":"left" }}>{m.from} · {m.time}</div>
                          <div style={{ background:m.from==="You"?T.primary:T.offWhite,color:m.from==="You"?T.white:T.gray900,borderRadius:10,padding:"9px 13px",fontSize:13,lineHeight:1.5 }}>{m.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <input style={{ flex:1,padding:"10px 13px",border:`1.5px solid ${T.gray100}`,borderRadius:9,fontSize:14,outline:"none" }} placeholder="Type a message…" value={msgInput} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&msgInput.trim()){ setMsgs(p=>[...p,{from:"You",text:msgInput,time:new Date().toLocaleTimeString("en",{hour:"numeric",minute:"2-digit"})}]); setMsg(""); }}} />
                    <Btn variant="primary" style={{ padding:"10px 18px" }} onClick={()=>{ if(msgInput.trim()){ setMsgs(p=>[...p,{from:"You",text:msgInput,time:new Date().toLocaleTimeString("en",{hour:"numeric",minute:"2-digit"})}]); setMsg(""); }}}>Send</Btn>
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div style={{ background:T.white, border:`1px solid ${T.gray100}`, borderRadius:14, padding:"20px" }}>
                  <div style={{ fontWeight:700, fontSize:14, color:T.primary, marginBottom:14 }}>Actions</div>
                  {activeDetail.status==="inspection"&&activeDetail.role==="Buyer"&&<><Btn variant="green" style={{ width:"100%", marginBottom:10 }} onClick={()=>setTxs(p=>p.map(t=>t.id===activeDetail.id?{...t,status:"approved"}:t))}>✅ Approve & Release Funds</Btn><Btn style={{ width:"100%", background:T.red, color:T.white, border:"none", borderRadius:8, padding:"12px", fontSize:14, fontWeight:700, cursor:"pointer" }} onClick={()=>setTxs(p=>p.map(t=>t.id===activeDetail.id?{...t,status:"disputed"}:t))}>⚠️ Raise a Dispute</Btn></>}
                  {activeDetail.status==="approved"&&<div style={{ background:T.greenLt, border:`1px solid #a7f3d0`, borderRadius:8, padding:"12px 14px", fontSize:13, color:"#065f46" }}>✅ Approved. Payment releases within 1 business day.</div>}
                  {activeDetail.status==="completed"&&<div style={{ background:T.offWhite, borderRadius:8, padding:"12px 14px", fontSize:13, color:T.gray500 }}>Transaction complete. Funds released.</div>}
                  {activeDetail.status==="disputed"&&<div style={{ background:"#fef2f2", border:`1px solid #fecaca`, borderRadius:8, padding:"12px 14px", fontSize:13, color:T.red }}>⚠️ Dispute filed. Our team will contact both parties within 24h.</div>}
                  {activeDetail.status==="funded"&&activeDetail.role==="Seller"&&<div style={{ background:T.tealLt, border:`1px solid #99f6e4`, borderRadius:8, padding:"12px 14px", fontSize:13, color:"#0f766e" }}>Funds confirmed. Please proceed with delivery.</div>}
                  {activeDetail.status==="pending"&&<div style={{ background:"#f5f3ff", border:`1px solid #ddd6fe`, borderRadius:8, padding:"12px 14px", fontSize:13, color:"#5b21b6" }}>Awaiting buyer payment into escrow.</div>}
                </div>
                <div style={{ background:T.white, border:`1px solid ${T.gray100}`, borderRadius:14, padding:"20px" }}>
                  <div style={{ fontWeight:700, fontSize:14, color:T.primary, marginBottom:14 }}>Financial Summary</div>
                  {[["Value",`$${activeDetail.amount.toLocaleString()}`],["Est. fee",`$${Math.round(activeDetail.amount*0.0265).toLocaleString()}`],["Fee payer",activeDetail.role]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${T.gray100}`, fontSize:14 }}>
                      <span style={{ color:T.gray500 }}>{k}</span><span style={{ fontWeight:600, color:T.primary }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12, fontSize:15, fontWeight:800, color:T.primary }}>
                    <span>{activeDetail.role==="Buyer"?"You pay":"You receive"}</span>
                    <span style={{ color:T.accent }}>${(activeDetail.role==="Buyer"?activeDetail.amount+activeDetail.amount*0.0265:activeDetail.amount-activeDetail.amount*0.0265).toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                  </div>
                </div>
                <div style={{ background:`linear-gradient(135deg,${T.tealLt},#f0fdf4)`, border:`1px solid #99f6e4`, borderRadius:14, padding:"20px" }}>
                  <div style={{ fontSize:22, marginBottom:8 }}>🔒</div>
                  <div style={{ fontWeight:700, fontSize:13, color:T.primary, marginBottom:5 }}>Protected by VaultPay</div>
                  <div style={{ fontSize:12, color:"#0f766e", lineHeight:1.7 }}>Licensed trust accounts. 256-bit SSL. Zero chargebacks. Government audited.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="settings"&&(
          <div style={{ background:T.white, border:`1px solid ${T.gray100}`, borderRadius:16, padding:"clamp(20px,4vw,32px)" }}>
            <h2 style={{ fontFamily:"'Lora',serif", fontSize:22, color:T.primary, marginBottom:24 }}>Account Settings</h2>
            <div className="grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, maxWidth:640 }}>
              {[["Full Name",user?.name||""],["Email","user@example.com"],["Phone",""],["Country","Nigeria"]].map(([l,v])=>(
                <div key={l}><label style={{ display:"block", fontSize:13, fontWeight:600, color:T.gray700, marginBottom:5 }}>{l}</label><input defaultValue={v} style={inp} /></div>
              ))}
            </div>
            <div style={{ marginTop:24, display:"flex", gap:12, flexWrap:"wrap" }}>
              <Btn variant="primary">Save Changes</Btn>
              <Btn variant="outline">Change Password</Btn>
            </div>
          </div>
        )}
        {tab==="history"&&(
          <div style={{ background:T.white, border:`1px solid ${T.gray100}`, borderRadius:16, padding:"clamp(20px,4vw,32px)" }}>
            <h2 style={{ fontFamily:"'Lora',serif", fontSize:22, color:T.primary, marginBottom:14 }}>Transaction History</h2>
            <p style={{ color:T.gray500, fontSize:15 }}>Your complete transaction archive. Download statements for any period.</p>
            <div style={{ marginTop:18 }}><Btn variant="outline">Download Statement (PDF)</Btn></div>
          </div>
        )}
      </div>

      {/* New Transaction modal */}
      {showNew && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={e=>e.target===e.currentTarget&&setShowNew(false)}>
          <div style={{ background:T.white, borderRadius:20, width:"100%", maxWidth:520, boxShadow:"0 32px 80px rgba(0,0,0,0.22)", animation:"fadeUp 0.25s ease", overflow:"hidden" }}>
            <div style={{ background:`linear-gradient(135deg,${T.primary},${T.primaryDk})`, padding:"22px 26px", color:T.white }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div><div style={{ fontWeight:700, fontSize:17 }}>New Escrow Transaction</div><div style={{ fontSize:12, opacity:0.6, marginTop:3 }}>Step {step} of 3 — {["Details","Parties","Review"][step-1]}</div></div>
                <button onClick={()=>{setShowNew(false);setStep(1);}} style={{ background:"rgba(255,255,255,0.12)", border:"none", color:T.white, borderRadius:"50%", width:30, height:30, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
              </div>
              <div style={{ display:"flex", gap:5, marginTop:16 }}>
                {[1,2,3].map(n=><div key={n} style={{ flex:1, height:3, borderRadius:2, background:step>=n?T.accent:"rgba(255,255,255,0.15)", transition:"background 0.2s" }} />)}
              </div>
            </div>
            <div style={{ padding:"24px" }}>
              {step===1&&(
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div><label style={{ display:"block", fontSize:13, fontWeight:600, color:T.gray700, marginBottom:5 }}>Transaction Title *</label><input style={inp} placeholder="e.g. twitter.com domain sale" value={nf.title} onChange={hn("title")} /></div>
                  <div>
                    <label style={{ display:"block", fontSize:13, fontWeight:600, color:T.gray700, marginBottom:8 }}>Type *</label>
                    <div className="tx-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                      {TX_TYPES.map(t=>(
                        <button key={t.id} onClick={()=>setNF(p=>({...p,type:t.id}))} style={{ border:`1.5px solid ${nf.type===t.id?t.color:T.gray100}`, borderRadius:10, padding:"10px 6px", cursor:"pointer", textAlign:"center", background:nf.type===t.id?t.color+"12":T.white, transition:"all 0.15s" }}>
                          <div style={{ fontSize:20 }}>{t.icon}</div>
                          <div style={{ fontSize:11, fontWeight:600, color:nf.type===t.id?t.color:T.gray600, marginTop:3, lineHeight:1.3 }}>{t.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 90px", gap:10 }}>
                    <div><label style={{ display:"block", fontSize:13, fontWeight:600, color:T.gray700, marginBottom:5 }}>Amount *</label><input style={inp} type="number" placeholder="0.00" value={nf.amount} onChange={hn("amount")} /></div>
                    <div><label style={{ display:"block", fontSize:13, fontWeight:600, color:T.gray700, marginBottom:5 }}>Currency</label><select style={{ ...inp }} value={nf.currency} onChange={hn("currency")}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select></div>
                  </div>
                </div>
              )}
              {step===2&&(
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div>
                    <label style={{ display:"block", fontSize:13, fontWeight:600, color:T.gray700, marginBottom:6 }}>Your Role *</label>
                    <div style={{ display:"flex", gap:8 }}>
                      {[["buyer","🛒 Buyer"],["seller","📤 Seller"],["broker","🤝 Broker"]].map(([v,l])=>(
                        <button key={v} onClick={()=>setNF(p=>({...p,role:v}))} style={{ flex:1, padding:"11px 0", border:`1.5px solid ${nf.role===v?T.primary:T.gray100}`, borderRadius:9, background:nf.role===v?"rgba(26,86,160,0.07)":T.white, cursor:"pointer", fontSize:13, fontWeight:700, color:nf.role===v?T.primary:T.gray600, transition:"all 0.15s" }}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div><label style={{ display:"block", fontSize:13, fontWeight:600, color:T.gray700, marginBottom:5 }}>Counterparty Name / Email *</label><input style={inp} placeholder="Their name or email" value={nf.counterparty} onChange={hn("counterparty")} /></div>
                  <div><label style={{ display:"block", fontSize:13, fontWeight:600, color:T.gray700, marginBottom:5 }}>Inspection Period</label><select style={{ ...inp }} value={nf.days} onChange={hn("days")}>{[1,2,3,5,7,10,14].map(d=><option key={d} value={d}>{d} {d===1?"day":"days"}</option>)}</select></div>
                  <div style={{ background:T.tealLt, border:`1px solid #99f6e4`, borderRadius:8, padding:"11px 14px", fontSize:13, color:"#0f766e" }}>📧 We'll email the counterparty an invitation to join this transaction.</div>
                </div>
              )}
              {step===3&&(
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:T.primary, marginBottom:16 }}>Review Transaction</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                    {[["Title",nf.title],["Type",TX_TYPES.find(t=>t.id===nf.type)?.label],["Amount",`${nf.currency} ${parseFloat(nf.amount||0).toLocaleString()}`],["Role",nf.role],["Counterparty",nf.counterparty||"—"],["Inspection",`${nf.days} days`]].map(([k,v])=>(
                      <div key={k} style={{ background:T.offWhite, borderRadius:8, padding:"11px 13px" }}>
                        <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:T.gray400, marginBottom:3 }}>{k}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:T.primary }}>{v||"—"}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:T.offWhite, borderRadius:9, padding:"13px 15px", fontSize:13, color:T.gray600, lineHeight:1.7 }}>By creating this transaction you agree to VaultPay's Terms of Service and Escrow Agreement.</div>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:22, gap:10 }}>
                <Btn variant="outline" onClick={()=>step>1?setStep(p=>p-1):setShowNew(false)}>{step===1?"Cancel":"← Back"}</Btn>
                <Btn variant="accent" onClick={()=>step<3?setStep(p=>p+1):createTx()} disabled={step===1&&(!nf.title||!nf.amount)}>{step<3?"Continue →":"Create Transaction →"}</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── FOOTER ─────────────────────────────────────────────── */
const Footer = () => (
  <footer style={{ background:`linear-gradient(135deg,${T.primaryDk},#0a2d5a)`, color:T.white, padding:"56px 1.5rem 28px" }}>
    <div style={{ maxWidth:1280, margin:"0 auto" }}>
      <div className="footer-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:48 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:20, marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, background:T.accent, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:T.white, fontWeight:800, fontSize:16 }}>V</div>
            Vault<span style={{ color:T.gold }}>Pay</span>
          </div>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", lineHeight:1.8, maxWidth:280, marginBottom:20 }}>The trusted escrow service for online transactions — protecting buyers and sellers worldwide since 2005.</p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {["🏆 BBB A+","🏛️ Licensed","🔒 SSL Secure","🛡️ $5B+ Protected"].map(b=>(
              <span key={b} style={{ fontSize:11, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, padding:"4px 10px", color:"rgba(255,255,255,0.45)", whiteSpace:"nowrap" }}>{b}</span>
            ))}
          </div>
        </div>
        {[
          { title:"Services",  links:["Domain Escrow","Vehicle Escrow","General Merchandise","Milestone Payments","Jewelry & Watches","Real Estate","Art & Collectibles","Electronics"] },
          { title:"Support",   links:["Fee Calculator","Payment Options","Approved Carriers","Security","Fraud Prevention","Help Center","Contact Us","Report a Bug"] },
          { title:"Company",   links:["About VaultPay","Careers","Blog","Press","Partners","API Docs","Terms of Service","Privacy Policy"] },
        ].map(col=>(
          <div key={col.title}>
            <div style={{ fontWeight:700, fontSize:12, textTransform:"uppercase", letterSpacing:"0.08em", color:"rgba(255,255,255,0.38)", marginBottom:14 }}>{col.title}</div>
            {col.links.map(l=><div key={l} className="nav-link" style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:9, cursor:"pointer" }}>{l}</div>)}
          </div>
        ))}
      </div>
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>© 2005–2024 VaultPay Inc. All rights reserved. Licensed financial services provider.</span>
        <div style={{ display:"flex", gap:18, flexWrap:"wrap" }}>
          {["Privacy","Terms","Licenses","Legal","Cookies"].map(l=><span key={l} style={{ fontSize:12, color:"rgba(255,255,255,0.3)", cursor:"pointer" }}>{l}</span>)}
        </div>
      </div>
    </div>
  </footer>
);

/* ─── ROOT ───────────────────────────────────────────────── */
export default function App() {
  const [page, setPage]       = useState("home");
  const [authOpen, setAuth]   = useState(false);
  const [authMode, setMode]   = useState("login");
  const [user, setUser]       = useState(null);

  const navigate  = (p) => setPage(p);
  const openLogin  = () => { setMode("login");    setAuth(true); };
  const openSignup = () => { setMode("register"); setAuth(true); };
  const onSuccess  = () => { setUser({ name:"John Adeyemi" }); setAuth(false); setPage("dashboard"); };

  if (page==="dashboard" && user) {
    return (
      <>
        <style>{globalCSS}</style>
        <Dashboard user={user} onLogout={()=>{ setUser(null); setPage("home"); }} navigate={navigate} />
      </>
    );
  }

  return (
    <>
      <style>{globalCSS}</style>
      <Navbar onLogin={openLogin} onSignup={openSignup} navigate={navigate} />
      <Hero onSignup={openSignup} />
      <StatsBanner />
      <HowItWorks onSignup={openSignup} />
      <Categories onSignup={openSignup} />
      <FeeCalculator />
      <DomainHighlight onSignup={openSignup} />
      <EscrowPay onSignup={openSignup} />
      <Security />
      <Testimonials />
      <FAQ />
      <CTABanner onSignup={openSignup} />
      <Footer />
      {authOpen && <AuthModal mode={authMode} onClose={()=>setAuth(false)} onSuccess={onSuccess} switchMode={()=>setMode(m=>m==="login"?"register":"login")} />}
    </>
  );
}
