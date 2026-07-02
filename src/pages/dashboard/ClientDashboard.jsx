import { useState } from "react";
import { T, fs } from "../../tokens";
import { Btn, Badge, Spin, StatusBadge as SB, FormField as F } from "../../components/ui";
import { CATS, CURR, SCFG, MTX, PLANS, SUBSCRIBED_PAYMENTS } from "../../data/constants";
import KYC from "../../components/dashboard/KYCModal";
import PhoneVerifyModal from "../../components/dashboard/PhoneVerifyModal";
import ScopeModal from "../../components/dashboard/ScopeModal";
import ContractModal from "../../components/dashboard/ContractModal";
import AuditModal from "../../components/dashboard/AuditModal";
import DisputeModal from "../../components/dashboard/DisputeModal";
import SettingsTab from "../../components/dashboard/SettingsTab";
import WalletTab from "../../components/dashboard/WalletTab";
import SubscriptionsTab from "../../components/dashboard/SubscriptionsTab";

const TABS = [
  ["overview",   "home",                   "Overview"],
  ["services",   "storefront",             "Services"],
  ["transactions","dashboard",             "Transactions"],
  ["wallet",     "account_balance_wallet", "Wallet"],
  ["payments",   "receipt_long",           "Payments"],
  ["kyc",        "badge",                  "KYC"],
  ["disputes",   "gavel",                  "Disputes"],
  ["settings",   "manage_accounts",        "Account"],
];

export default function ClientDashboard({ user, onLogout, navigate }) {
  const [tab, setTab]           = useState("overview");
  const [drawer, setDrawer]     = useState(false);
  const [detail, setDetail]     = useState(null);
  const [txs, setTxs]           = useState(MTX);
  const [showNew, setShowNew]   = useState(false);
  const [ns, setNs]             = useState(1);
  const [nf, setNf]             = useState({ title:"", type:"software", amount:"", currency:"USD", counterparty:"", role:"buyer", days:"3", milestones:"2" });
  const [scope, setScope]       = useState(null);
  const [kycDone, setKycDone]   = useState(false);
  const [showKYC, setShowKYC]   = useState(false);
  const [phoneDone, setPhoneDone]   = useState(false);
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [showAudit, setShowAudit]   = useState(null);
  const [showDispute, setShowDispute] = useState(null);
  const [showContract, setShowContract] = useState(null);
  const [showScope, setShowScope]   = useState(false);
  const [walletBalance, setWalletBalance] = useState(12480.50);
  const [payments] = useState(SUBSCRIBED_PAYMENTS);

  const hn = k => e => setNf(p => ({ ...p, [k]: e.target.value }));
  const switchTab = k => { setTab(k); setDetail(null); setDrawer(false); };

  const createTx = () => {
    const cat = CATS.find(c => c.id === nf.type);
    setTxs(p => [{ id:`TXN-${Math.floor(80000+Math.random()*9000)}`, title:nf.title||scope?.title||"New Project", type:cat?.label||"Software Dev", cat:nf.type, amount:parseFloat(nf.amount)||0, currency:nf.currency, role:"Buyer", other:nf.counterparty||"Counterparty", status:"pending", date:new Date().toLocaleDateString("en",{month:"short",day:"numeric",year:"numeric"}), milestones:parseInt(nf.milestones)||1 }, ...p]);
    setShowNew(false); setNs(1); setScope(null); setNf({ title:"", type:"software", amount:"", currency:"USD", counterparty:"", role:"buyer", days:"3", milestones:"2" });
  };

  const activeCount = txs.filter(t => !["completed","disputed"].includes(t.status)).length;
  const totalValue  = txs.reduce((s, t) => s + t.amount, 0);
  const duePayments = payments.filter(p => p.status === "due" || p.milestones?.some(m => m.status === "due")).length;

  return (
    <div style={{ background:"#f5f3f6", minHeight:"100dvh", paddingBottom:80 }}>

      {/* Overlay */}
      <div className={"dash-overlay"+(drawer?" show":"")} onClick={() => setDrawer(false)} />

      {/* Side Drawer */}
      <aside className={"dash-drawer"+(drawer?" open":"")}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", height:64, borderBottom:"1px solid #c5c6cf", flexShrink:0 }}>
          <span style={{ fontWeight:800, fontSize:20, color:"#001637" }}><span style={{ color:"#006c47" }}>Escrow</span> <span style={{ fontSize:11, background:"#e8f4fd", color:"#1a56a0", borderRadius:6, padding:"2px 8px", fontWeight:600 }}>Client</span></span>
          <button onClick={() => setDrawer(false)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:4 }}>
            <span className="msym" style={{ fontSize:24, color:"#44474e" }}>close</span>
          </button>
        </div>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid #e9e7eb", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <div style={{ width:42, height:42, borderRadius:"50%", background:"#001637", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:16, color:"#fff", flexShrink:0 }}>
            {user?.name ? user.name[0].toUpperCase() : "C"}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:"#001637" }}>{user?.name || "Client"}</div>
            <div style={{ fontSize:11, color:"#006c47", fontWeight:600 }}>Client Account</div>
          </div>
        </div>
        <nav style={{ flex:1, overflowY:"auto", padding:"10px 8px" }}>
          {TABS.map(([k, icon, label]) => (
            <button key={k} onClick={() => switchTab(k)} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10, border:"none", cursor:"pointer", background:tab===k?"#001637":"transparent", color:tab===k?"#fff":"#44474e", fontWeight:tab===k?700:500, fontSize:14, marginBottom:2, transition:"all .15s", textAlign:"left" }}>
              <span className="msym" style={{ fontSize:20, color:tab===k?"#fff":"#75777f" }}>{icon}</span>{label}
              {k === "payments" && duePayments > 0 && <span style={{ marginLeft:"auto", background:"#ef4444", color:"#fff", borderRadius:10, fontSize:10, fontWeight:700, padding:"2px 7px" }}>{duePayments}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding:"12px 8px", borderTop:"1px solid #e9e7eb", flexShrink:0 }}>
          <button onClick={onLogout} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:10, border:"1px solid #fecaca", background:"transparent", cursor:"pointer", fontSize:13, fontWeight:600, color:"#ba1a1a" }}>
            <span className="msym" style={{ fontSize:18 }}>logout</span>Sign Out
          </button>
        </div>
      </aside>

      {/* Top Bar */}
      <header style={{ background:"#fbf9fc", borderBottom:"1px solid #c5c6cf", position:"sticky", top:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", height:64, gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0 }}>
          <button className="mob-menu-btn" onClick={() => setDrawer(v => !v)} style={{ display:"flex", alignItems:"center", justifyContent:"center", width:38, height:38, borderRadius:10, background:"none", border:"none", cursor:"pointer", color:"#001637", flexShrink:0 }}>
            <span className="msym" style={{ fontSize:24 }}>{drawer?"close":"menu"}</span>
          </button>
          <span style={{ fontWeight:800, fontSize:20, color:"#001637", letterSpacing:"-.3px", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }} onClick={() => navigate("home")}>
            <span style={{ color:"#006c47" }}>Escrow</span>
          </span>
          <span style={{ fontSize:11, background:"#e8f4fd", color:"#1a56a0", borderRadius:6, padding:"2px 8px", fontWeight:600, flexShrink:0 }}>Client</span>
          <div className="dash-tabs" style={{ display:"flex", gap:0, marginLeft:6, overflow:"hidden" }}>
            {TABS.map(([k, _, l]) => (
              <button key={k} onClick={() => switchTab(k)} style={{ background:"none", border:"none", cursor:"pointer", padding:"8px 12px", fontSize:13, fontWeight:600, color:tab===k?"#001637":"#44474e", borderBottom:tab===k?"2px solid #001637":"2px solid transparent", transition:"all .15s", whiteSpace:"nowrap" }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <button onClick={() => navigate("services")} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"transparent", color:"#001637", border:"1px solid #c5c6cf", borderRadius:9, cursor:"pointer", fontWeight:600, fontSize:13, padding:"8px 12px", whiteSpace:"nowrap" }}>
            <span className="msym" style={{ fontSize:16 }}>storefront</span>
            <span style={{ display:"none" }} id="svc-lbl">Services</span>
          </button>
          <button onClick={onLogout} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"transparent", color:"#dc2626", border:"1px solid #fecaca", borderRadius:9, cursor:"pointer", fontWeight:600, fontSize:13, padding:"8px 12px", whiteSpace:"nowrap" }}><span className="msym" style={{ fontSize:16 }}>logout</span><span style={{ display:"none" }} className="desk-only">Sign Out</span></button>
          <button onClick={() => setShowNew(true)} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#006c47", color:"#fff", border:"none", borderRadius:9, cursor:"pointer", fontWeight:700, fontSize:13, padding:"9px 13px", whiteSpace:"nowrap" }}>
            <span className="msym" style={{ fontSize:18 }}>add</span>
            <span style={{ display:"none" }} id="new-lbl">New Transaction</span>
          </button>
        </div>
      </header>

      <main style={{ maxWidth:1200, margin:"0 auto", padding:"clamp(12px,3vw,24px) clamp(12px,3vw,20px)" }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <h1 style={{ fontSize:"clamp(20px,3vw,26px)", fontWeight:800, color:"#001637", marginBottom:4 }}>Welcome back, {user?.name?.split(" ")[0] || "Client"}</h1>
              <p style={{ color:"#75777f", fontSize:14 }}>Here's a summary of your escrow activity.</p>
            </div>
            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:24 }}>
              {[
                { icon:"dashboard", label:"Active Deals",    value:activeCount,                      color:"#001637", bg:"#e8f0fe" },
                { icon:"payments",  label:"Total In Escrow", value:"$"+totalValue.toLocaleString(),  color:"#006c47", bg:"#f0fdf4" },
                { icon:"account_balance_wallet", label:"Wallet Balance", value:"$"+walletBalance.toLocaleString(), color:"#1a56a0", bg:"#e8f4fd" },
                { icon:"receipt_long", label:"Due Payments", value:duePayments,                     color:"#dc2626", bg:"#fef2f2" },
              ].map(s => (
                <div key={s.label} style={{ background:"#fff", border:"1px solid #e9e7eb", borderRadius:14, padding:"18px 16px", display:"flex", alignItems:"center", gap:14, minWidth:0, overflow:"hidden" }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span className="msym" style={{ fontSize:22, color:s.color }}>{s.icon}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#75777f", marginBottom:3, textTransform:"uppercase", letterSpacing:".04em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.label}</div>
                    <div style={{ fontSize:"clamp(16px,4vw,22px)", fontWeight:800, color:s.color, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Recent Transactions */}
            <div style={{ background:"#fff", border:"1px solid #e9e7eb", borderRadius:14, padding:"20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <h2 style={{ fontSize:16, fontWeight:700, color:"#001637" }}>Recent Transactions</h2>
                <Btn variant="ghost" style={{ fontSize:13, color:"#006c47" }} onClick={() => switchTab("transactions")}>View all →</Btn>
              </div>
              {txs.slice(0, 4).map(tx => (
                <div key={tx.id} onClick={() => { setDetail(tx); switchTab("transactions"); }} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f0f0f0", cursor:"pointer" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:CATS.find(c=>c.id===tx.cat)?.color+"20", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span className="msym" style={{ fontSize:18, color:CATS.find(c=>c.id===tx.cat)?.color }}>{tx.cat === "software"?"code":tx.cat==="mobile"?"smartphone":tx.cat==="web"?"language":tx.cat==="uiux"?"palette":"cloud"}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, color:"#001637" }}>{tx.title}</div>
                      <div style={{ fontSize:12, color:"#75777f" }}>{tx.other} · {tx.date}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"#001637" }}>${tx.amount.toLocaleString()}</div>
                    <SB status={tx.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SERVICES (browse) ── */}
        {tab === "services" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <h1 style={{ fontSize:"clamp(20px,3vw,26px)", fontWeight:800, color:"#001637", marginBottom:6 }}>Digital Services</h1>
              <p style={{ color:"#75777f", fontSize:14 }}>Browse and hire verified tech vendors — all payments protected by escrow.</p>
            </div>
            <div style={{ display:"flex", gap:10, marginBottom:20 }}>
              <button onClick={() => navigate("services")} style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#006c47", color:"#fff", border:"none", borderRadius:9, padding:"10px 18px", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                <span className="msym" style={{ fontSize:18 }}>open_in_new</span> Browse Services
              </button>
              <button onClick={() => navigate("subscription")} style={{ display:"inline-flex", alignItems:"center", gap:8, background:"transparent", color:"#001637", border:"1px solid #c5c6cf", borderRadius:9, padding:"10px 18px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
                <span className="msym" style={{ fontSize:18 }}>diamond</span> Subscription Plans
              </button>
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS ── */}
        {tab === "transactions" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
              <h1 style={{ fontSize:"clamp(18px,3vw,22px)", fontWeight:700, color:"#001637" }}>My Transactions</h1>
              <Btn variant="accent" onClick={() => setShowNew(true)}><span className="msym" style={{ fontSize:16 }}>add</span> New Transaction</Btn>
            </div>
            {txs.length === 0
              ? <div style={{ textAlign:"center", padding:48, color:"#75777f", background:"#fff", borderRadius:14 }}>No transactions yet.</div>
              : txs.map(tx => (
                <div key={tx.id} onClick={() => setDetail(detail?.id === tx.id ? null : tx)} style={{ background:"#fff", border:"1px solid #e9e7eb", borderRadius:14, padding:"16px 18px", marginBottom:10, cursor:"pointer", transition:"box-shadow .2s" }} className="card-hover">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, flexWrap:"wrap" }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, color:"#001637", marginBottom:4 }}>{tx.title}</div>
                      <div style={{ fontSize:12.5, color:"#75777f" }}>{tx.id} · {tx.type} · {tx.other} · {tx.date}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontWeight:800, fontSize:16, color:"#001637" }}>{tx.currency} {tx.amount.toLocaleString()}</div>
                      <SB status={tx.status} />
                    </div>
                  </div>
                  {detail?.id === tx.id && (
                    <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid #f0f0f0", display:"flex", gap:8, flexWrap:"wrap" }}>
                      <Btn variant="outline" style={{ fontSize:13 }} onClick={e => { e.stopPropagation(); setShowContract(tx); }}>📄 Contract</Btn>
                      <Btn variant="teal" style={{ fontSize:13 }} onClick={e => { e.stopPropagation(); setShowAudit(tx); }}>🤖 AI Audit</Btn>
                      {tx.status === "inprogress" && <Btn variant="red" style={{ fontSize:13 }} onClick={e => { e.stopPropagation(); setShowDispute(tx); }}>⚠️ Dispute</Btn>}
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        )}

        {/* ── WALLET ── */}
        {tab === "wallet" && <WalletTab balance={walletBalance} onBalanceChange={setWalletBalance} />}

        {/* ── PAYMENTS (subscribed services) ── */}
        {tab === "payments" && <SubscriptionsTab />}

        {/* ── KYC ── */}
        {tab === "kyc" && (
          <div style={{ background:"#fff", border:"1px solid #e9e7eb", borderRadius:14, padding:"clamp(16px,4vw,28px)" }}>
            <h2 style={{ fontSize:"clamp(18px,3vw,22px)", fontWeight:700, color:"#001637", marginBottom:6 }}>Identity Verification (KYC)</h2>
            <p style={{ color:"#75777f", fontSize:13.5, marginBottom:20 }}>Verify your identity to unlock higher escrow limits and trust badges.</p>
            {[
              { label:"Email Verified", icon:"mail", done:true, action:null },
              { label:"Phone Number", icon:"phone", done:phoneDone, action:() => setShowPhoneVerify(true) },
              { label:"Government ID", icon:"badge", done:kycDone, action:() => setShowKYC(true) },
            ].map(v => (
              <div key={v.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 18px", background:"#f9f9fb", borderRadius:12, border:"1px solid #e9e7eb", marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:v.done?"#f0fdf4":"#f5f3f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span className="msym" style={{ fontSize:20, color:v.done?"#006c47":"#75777f" }}>{v.icon}</span>
                  </div>
                  <span style={{ fontWeight:600, fontSize:14, color:"#001637" }}>{v.label}</span>
                </div>
                {v.done
                  ? <span style={{ fontSize:11.5, fontWeight:700, color:"#006c47", background:"#f0fdf4", padding:"3px 10px", borderRadius:20 }}>✓ Verified</span>
                  : <Btn variant="outline" style={{ fontSize:12, padding:"6px 12px" }} onClick={v.action}>Verify Now</Btn>
                }
              </div>
            ))}
          </div>
        )}

        {/* ── DISPUTES ── */}
        {tab === "disputes" && (
          <div style={{ background:"#fff", border:"1px solid #e9e7eb", borderRadius:14, padding:"clamp(16px,4vw,28px)" }}>
            <h2 style={{ fontSize:"clamp(18px,3vw,22px)", fontWeight:700, color:"#001637", marginBottom:6 }}>Dispute Center</h2>
            <p style={{ color:"#75777f", fontSize:13.5, marginBottom:20 }}>AI-assisted resolution with binding arbitration.</p>
            {txs.filter(t => t.status === "disputed").length === 0
              ? <div style={{ textAlign:"center", padding:"32px", color:"#75777f", fontSize:14, background:"#f9f9fb", borderRadius:12 }}><span className="msym" style={{ fontSize:36, display:"block", marginBottom:10 }}>check_circle</span>No active disputes.</div>
              : txs.filter(t => t.status === "disputed").map(tx => (
                <div key={tx.id} style={{ border:"1.5px solid #fecaca", borderRadius:12, padding:"14px 16px", background:"#fff5f5", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:10 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:"#dc2626", marginBottom:3 }}>{tx.title}</div>
                    <div style={{ fontSize:12.5, color:"#75777f" }}>{tx.id} · ${tx.amount.toLocaleString()} · {tx.other}</div>
                  </div>
                  <Btn variant="red" style={{ fontSize:13 }} onClick={() => setShowDispute(tx)}>View / Update</Btn>
                </div>
              ))
            }
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === "settings" && <SettingsTab user={user} />}
      </main>

      {/* NEW TRANSACTION MODAL */}
      {showNew && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:500, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={e => e.target === e.currentTarget && setShowNew(false)}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", width:"100%", maxWidth:560, maxHeight:"92vh", overflowY:"auto" }}>
            <div style={{ background:"linear-gradient(135deg,#001637,#172b4d)", padding:"18px 20px", color:"#fff", position:"sticky", top:0, zIndex:1, borderRadius:"20px 20px 0 0" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:16 }}>New Escrow Transaction</div>
                  <div style={{ fontSize:12, opacity:.6, marginTop:2 }}>Step {ns} of 3 — {["Project Details","Parties & Terms","Review"][ns-1]}</div>
                </div>
                <button onClick={() => { setShowNew(false); setNs(1); }} style={{ background:"rgba(255,255,255,.12)", border:"none", color:"#fff", borderRadius:"50%", width:30, height:30, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span className="msym" style={{ fontSize:18 }}>close</span>
                </button>
              </div>
              <div style={{ display:"flex", gap:5, marginTop:12 }}>{[1,2,3].map(n => <div key={n} style={{ flex:1, height:3, borderRadius:2, background:ns>=n?"#0ea5e9":"rgba(255,255,255,.18)", transition:"background .2s" }} />)}</div>
            </div>
            <div style={{ padding:"18px 16px" }}>
              {ns === 1 && (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <Btn variant="teal" style={{ width:"100%", fontSize:13 }} onClick={() => setShowScope(true)}><span className="msym" style={{ fontSize:16 }}>smart_toy</span>Use AI Scope Generator</Btn>
                  {scope && <div style={{ background:"#f0fdf4", border:"1px solid #99f6e4", borderRadius:9, padding:"10px 12px", fontSize:13, color:"#005235" }}>✓ Scope applied: <strong>{scope.title}</strong></div>}
                  <F label="Project Title" req><input style={fs} placeholder="e.g. E-commerce Backend" value={nf.title||scope?.title||""} onChange={hn("title")} /></F>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#44474e", marginBottom:8 }}>Service Category *</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:5 }}>
                      {CATS.map(c => (
                        <button key={c.id} onClick={() => setNf(p => ({ ...p, type:c.id }))} style={{ border:`1.5px solid ${nf.type===c.id?c.color:"#e4e2e5"}`, borderRadius:8, padding:"7px 3px", cursor:"pointer", textAlign:"center", background:nf.type===c.id?c.color+"12":"#fff", transition:"all .15s" }}>
                          <div style={{ fontSize:8.5, fontWeight:600, color:nf.type===c.id?c.color:"#75777f" }}>{c.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 90px", gap:10 }}>
                    <F label="Project Value" req><input style={fs} type="number" placeholder="0.00" value={nf.amount} onChange={hn("amount")} /></F>
                    <F label="Currency"><select style={fs} value={nf.currency} onChange={hn("currency")}>{CURR.map(c => <option key={c}>{c}</option>)}</select></F>
                  </div>
                  <F label="Milestones"><select style={fs} value={nf.milestones} onChange={hn("milestones")}>{[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} milestone{n>1?"s":""}</option>)}</select></F>
                </div>
              )}
              {ns === 2 && (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <F label="Vendor/Provider Email" req><input style={fs} type="email" placeholder="vendor@company.com" value={nf.counterparty} onChange={hn("counterparty")} /></F>
                  <F label="Review Period"><select style={fs} value={nf.days} onChange={hn("days")}>{[1,2,3,5,7,10,14].map(d => <option key={d} value={d}>{d} {d===1?"day":"days"}</option>)}</select></F>
                  <div style={{ background:"#f0fdf4", border:"1px solid #99f6e4", borderRadius:8, padding:"10px 12px", fontSize:13, color:"#005235" }}>
                    The vendor will receive an email invitation to join this transaction.
                  </div>
                </div>
              )}
              {ns === 3 && (
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:"#001637", marginBottom:12 }}>Review & Confirm</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                    {[["Title",nf.title||scope?.title||""],["Category",CATS.find(c=>c.id===nf.type)?.label||""],["Value",nf.currency+" "+parseFloat(nf.amount||0).toLocaleString()],["Milestones",""+nf.milestones],["Review",nf.days+" days"],["Vendor",nf.counterparty||""]].map(([k,v]) => (
                      <div key={k} style={{ background:"#f5f3f6", borderRadius:8, padding:"9px 11px" }}>
                        <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:"#75777f", marginBottom:2 }}>{k}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:"#001637" }}>{v||"—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:18, gap:10 }}>
                <Btn variant="outline" onClick={() => ns > 1 ? setNs(p => p-1) : setShowNew(false)}>{ns===1?"Cancel":"Back"}</Btn>
                <Btn variant="accent" onClick={() => ns < 3 ? setNs(p => p+1) : createTx()} disabled={ns===1 && (!(nf.title||scope?.title)||!nf.amount)}>{ns<3?"Continue":"Create Transaction"}</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showKYC && <KYC onClose={() => setShowKYC(false)} onComplete={() => { setKycDone(true); setShowKYC(false); }} />}
      {showPhoneVerify && <PhoneVerifyModal onClose={() => setShowPhoneVerify(false)} onVerified={(num) => { setPhoneDone(true); setShowPhoneVerify(false); }} />}
      {showAudit && <AuditModal tx={showAudit} onClose={() => setShowAudit(null)} onApprove={() => setTxs(p => p.map(t => t.id===showAudit.id?{...t,status:"approved"}:t))} onRevision={() => setTxs(p => p.map(t => t.id===showAudit.id?{...t,status:"revision"}:t))} />}
      {showDispute && <DisputeModal tx={showDispute} onClose={() => setShowDispute(null)} onSubmit={() => setTxs(p => p.map(t => t.id===showDispute.id?{...t,status:"disputed"}:t))} />}
      {showContract && <ContractModal tx={showContract} scope={scope} onClose={() => setShowContract(null)} />}
      {showScope && <ScopeModal catLabel={CATS.find(c=>c.id===nf.type)?.label||"Software"} onClose={() => setShowScope(false)} onApply={s => { setScope(s); setNf(p => ({ ...p, title:s.title })); }} />}

      {/* Mobile Bottom Nav */}
      <nav className="mbb" style={{ display:"none", position:"fixed", bottom:0, left:0, right:0, zIndex:50, background:"#fbf9fc", borderTop:"1px solid #c5c6cf", justifyContent:"space-around", alignItems:"center", height:66, padding:"0 4px" }}>
        {TABS.slice(0,5).map(([k, icon, label]) => (
          <button key={k} onClick={() => switchTab(k)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"5px 6px", color:tab===k?"#001637":"#44474e", flex:1, borderTop:tab===k?"2px solid #001637":"2px solid transparent" }}>
            <span className="msym" style={{ fontSize:22, color:tab===k?"#001637":"#75777f" }}>{icon}</span>
            <span style={{ fontSize:9.5, fontWeight:tab===k?700:500, whiteSpace:"nowrap" }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
