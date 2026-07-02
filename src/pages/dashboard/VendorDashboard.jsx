import { useState } from "react";
import { T, fs } from "../../tokens";
import { Btn, StatusBadge as SB, FormField as F } from "../../components/ui";
import { CATS, CURR, SCFG, MTX } from "../../data/constants";
import AuditModal from "../../components/dashboard/AuditModal";
import DisputeModal from "../../components/dashboard/DisputeModal";
import ContractModal from "../../components/dashboard/ContractModal";
import SettingsTab from "../../components/dashboard/SettingsTab";
import WalletTab from "../../components/dashboard/WalletTab";
import KYC from "../../components/dashboard/KYCModal";

const VENDOR_TABS = [
  ["overview",     "home",                   "Overview"],
  ["jobs",         "work",                   "Active Jobs"],
  ["earnings",     "payments",               "Earnings"],
  ["wallet",       "account_balance_wallet", "Wallet"],
  ["disputes",     "gavel",                  "Disputes"],
  ["kyc",          "badge",                  "KYC"],
  ["settings",     "manage_accounts",        "Account"],
];

// Vendor-specific mock data (as provider/seller)
const VENDOR_JOBS = MTX.map(tx => ({ ...tx, role:"Seller", other: tx.other }));

export default function VendorDashboard({ user, onLogout, navigate }) {
  const [tab, setTab]         = useState("overview");
  const [drawer, setDrawer]   = useState(false);
  const [detail, setDetail]   = useState(null);
  const [jobs, setJobs]       = useState(VENDOR_JOBS);
  const [showAudit, setShowAudit]   = useState(null);
  const [showDispute, setShowDispute] = useState(null);
  const [showContract, setShowContract] = useState(null);
  const [showKYC, setShowKYC] = useState(false);
  const [kycDone, setKycDone] = useState(false);
  const [walletBalance, setWalletBalance] = useState(8340.00);
  const [milestoneNote, setMilestoneNote] = useState("");

  const switchTab = k => { setTab(k); setDetail(null); setDrawer(false); };

  const totalEarned   = jobs.filter(j => j.status === "completed").reduce((s,j) => s+j.amount, 0);
  const pendingPayout = jobs.filter(j => j.status === "approved").reduce((s,j) => s+j.amount, 0);
  const activeJobs    = jobs.filter(j => !["completed","disputed","cancelled"].includes(j.status)).length;

  const submitMilestone = (jobId) => {
    setJobs(p => p.map(j => j.id === jobId ? { ...j, status:"inspection" } : j));
    setMilestoneNote("");
    setDetail(null);
  };

  return (
    <div style={{ background:"#f5f3f6", minHeight:"100dvh", paddingBottom:80 }}>

      {/* Overlay */}
      <div className={"dash-overlay"+(drawer?" show":"")} onClick={() => setDrawer(false)} />

      {/* Side Drawer */}
      <aside className={"dash-drawer"+(drawer?" open":"")}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", height:64, borderBottom:"1px solid #c5c6cf", flexShrink:0 }}>
          <span style={{ fontWeight:800, fontSize:20, color:"#001637" }}>
            <span style={{ color:"#006c47" }}>Escrow</span>{" "}
            <span style={{ fontSize:11, background:"#fff8e1", color:"#C9A84C", borderRadius:6, padding:"2px 8px", fontWeight:700 }}>Vendor</span>
          </span>
          <button onClick={() => setDrawer(false)} style={{ background:"none", border:"none", cursor:"pointer" }}>
            <span className="msym" style={{ fontSize:24, color:"#44474e" }}>close</span>
          </button>
        </div>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid #e9e7eb", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#C9A84C,#A07B2A)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:16, color:"#fff", flexShrink:0 }}>
            {user?.name ? user.name[0].toUpperCase() : "V"}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:"#001637" }}>{user?.name || "Vendor"}</div>
            <div style={{ fontSize:11, color:"#C9A84C", fontWeight:600 }}>Service Provider</div>
          </div>
        </div>
        <nav style={{ flex:1, overflowY:"auto", padding:"10px 8px" }}>
          {VENDOR_TABS.map(([k, icon, label]) => (
            <button key={k} onClick={() => switchTab(k)} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10, border:"none", cursor:"pointer", background:tab===k?"#001637":"transparent", color:tab===k?"#fff":"#44474e", fontWeight:tab===k?700:500, fontSize:14, marginBottom:2, transition:"all .15s", textAlign:"left" }}>
              <span className="msym" style={{ fontSize:20, color:tab===k?"#fff":"#75777f" }}>{icon}</span>{label}
            </button>
          ))}
        </nav>
        <div style={{ padding:"12px 8px", borderTop:"1px solid #e9e7eb" }}>
          <button onClick={onLogout} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:10, border:"1px solid #fecaca", background:"transparent", cursor:"pointer", fontSize:13, fontWeight:600, color:"#ba1a1a" }}>
            <span className="msym" style={{ fontSize:18 }}>logout</span>Sign Out
          </button>
        </div>
      </aside>

      {/* Top Bar */}
      <header style={{ background:"#fbf9fc", borderBottom:"1px solid #c5c6cf", position:"sticky", top:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", height:64, gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0 }}>
          <button className="mob-menu-btn" onClick={() => setDrawer(v => !v)} style={{ display:"flex", alignItems:"center", justifyContent:"center", width:38, height:38, borderRadius:10, background:"none", border:"none", cursor:"pointer", flexShrink:0 }}>
            <span className="msym" style={{ fontSize:24, color:"#001637" }}>menu</span>
          </button>
          <span style={{ fontWeight:800, fontSize:20, color:"#001637", cursor:"pointer", flexShrink:0 }} onClick={() => navigate("home")}>
            <span style={{ color:"#006c47" }}>Escrow</span>
          </span>
          <span style={{ fontSize:11, background:"#fff8e1", color:"#C9A84C", borderRadius:6, padding:"2px 8px", fontWeight:700, flexShrink:0 }}>Vendor</span>
          <div className="dash-tabs" style={{ display:"flex", gap:0, marginLeft:6, overflow:"hidden" }}>
            {VENDOR_TABS.map(([k, _, l]) => (
              <button key={k} onClick={() => switchTab(k)} style={{ background:"none", border:"none", cursor:"pointer", padding:"8px 12px", fontSize:13, fontWeight:600, color:tab===k?"#001637":"#44474e", borderBottom:tab===k?"2px solid #C9A84C":"2px solid transparent", transition:"all .15s", whiteSpace:"nowrap" }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:9, padding:"6px 12px", fontSize:13, fontWeight:700, color:"#006c47" }}>
            Balance: ${walletBalance.toLocaleString()}
            </div>
          <button onClick={onLogout} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"transparent", color:"#dc2626", border:"1px solid #fecaca", borderRadius:9, cursor:"pointer", fontWeight:600, fontSize:13, padding:"8px 12px", whiteSpace:"nowrap" }}>
            <span className="msym" style={{ fontSize:16 }}>logout</span>
          </button>
        </div>
      </header>

      <main style={{ maxWidth:1100, margin:"0 auto", padding:"clamp(12px,3vw,24px) clamp(12px,3vw,20px)" }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <h1 style={{ fontSize:"clamp(20px,3vw,26px)", fontWeight:800, color:"#001637", marginBottom:4 }}>Vendor Dashboard</h1>
              <p style={{ color:"#75777f", fontSize:14 }}>Manage your jobs, track earnings, and submit deliverables.</p>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:24 }}>
              {[
                { icon:"work",     label:"Active Jobs",     value:activeJobs,                          color:"#001637", bg:"#e8f0fe" },
                { icon:"payments", label:"Total Earned",    value:"$"+totalEarned.toLocaleString(),    color:"#006c47", bg:"#f0fdf4" },
                { icon:"schedule", label:"Pending Payout",  value:"$"+pendingPayout.toLocaleString(),  color:"#C9A84C", bg:"#fff8e1" },
                { icon:"account_balance_wallet", label:"Wallet", value:"$"+walletBalance.toLocaleString(), color:"#1a56a0", bg:"#e8f4fd" },
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

            {/* Active jobs quick view */}
            <div style={{ background:"#fff", border:"1px solid #e9e7eb", borderRadius:14, padding:"20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <h2 style={{ fontSize:16, fontWeight:700, color:"#001637" }}>Active Jobs</h2>
                <Btn variant="ghost" style={{ fontSize:13, color:"#006c47" }} onClick={() => switchTab("jobs")}>View all →</Btn>
              </div>
              {jobs.filter(j => !["completed","disputed"].includes(j.status)).slice(0,4).map(job => (
                <div key={job.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f0f0f0", cursor:"pointer" }} onClick={() => switchTab("jobs")}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, color:"#001637" }}>{job.title}</div>
                    <div style={{ fontSize:12, color:"#75777f" }}>{job.other} · {job.date}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"#001637" }}>${job.amount.toLocaleString()}</div>
                    <SB status={job.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ACTIVE JOBS ── */}
        {tab === "jobs" && (
          <div>
            <div style={{ marginBottom:16 }}>
              <h1 style={{ fontSize:"clamp(18px,3vw,22px)", fontWeight:700, color:"#001637" }}>Active Jobs</h1>
              <p style={{ color:"#75777f", fontSize:13.5, marginTop:4 }}>Click a job to submit a milestone or request payment release.</p>
            </div>
            {jobs.map(job => (
              <div key={job.id} style={{ background:"#fff", border:`1.5px solid ${detail?.id===job.id?"#006c47":"#e9e7eb"}`, borderRadius:14, padding:"16px 18px", marginBottom:12, cursor:"pointer", transition:"border .2s" }} onClick={() => setDetail(detail?.id===job.id?null:job)}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, flexWrap:"wrap" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:"#001637", marginBottom:4 }}>{job.title}</div>
                    <div style={{ fontSize:12.5, color:"#75777f" }}>{job.id} · Client: {job.other} · {job.date}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight:800, fontSize:16, color:"#001637" }}>${job.amount.toLocaleString()} {job.currency}</div>
                    <SB status={job.status} />
                  </div>
                </div>

                {detail?.id === job.id && (
                  <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid #f0f0f0" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10, marginBottom:16 }}>
                      {[["Milestones",""+job.milestones],["Category",job.type],["Your Role","Service Provider"],["Status",SCFG[job.status]?.label||job.status]].map(([k,v]) => (
                        <div key={k} style={{ background:"#f9f9fb", borderRadius:10, padding:"10px 12px" }}>
                          <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:"#75777f", marginBottom:2 }}>{k}</div>
                          <div style={{ fontSize:13, fontWeight:700, color:"#001637" }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Actions based on status */}
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {job.status === "inprogress" && (
                        <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:10 }}>
                          <textarea
                            placeholder="Describe what you're submitting (deliverable notes, links, etc.)"
                            value={milestoneNote}
                            onChange={e => setMilestoneNote(e.target.value)}
                            style={{ width:"100%", borderRadius:10, border:"1px solid #c5c6cf", padding:"10px 12px", fontSize:13, resize:"vertical", minHeight:80, fontFamily:"inherit", boxSizing:"border-box" }}
                            onClick={e => e.stopPropagation()}
                          />
                          <div style={{ display:"flex", gap:8 }}>
                            <Btn variant="accent" style={{ fontSize:13 }} onClick={e => { e.stopPropagation(); submitMilestone(job.id); }}>
                              <span className="msym" style={{ fontSize:16 }}>upload</span> Submit for Review
                            </Btn>
                            <Btn variant="outline" style={{ fontSize:13 }} onClick={e => { e.stopPropagation(); setShowContract(job); }}>📄 View Contract</Btn>
                          </div>
                        </div>
                      )}
                      {job.status === "funded" && (
                        <Btn variant="teal" style={{ fontSize:13 }} onClick={e => { e.stopPropagation(); setJobs(p => p.map(j => j.id===job.id?{...j,status:"inprogress"}:j)); }}>
                          <span className="msym" style={{ fontSize:16 }}>play_circle</span> Start Work
                        </Btn>
                      )}
                      {job.status === "approved" && (
                        <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#006c47", fontWeight:600, width:"100%" }}>
                          ✓ Approved! Funds will be released to your wallet within 24 hours.
                        </div>
                      )}
                      {job.status === "inspection" && (
                        <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#1d4ed8", fontWeight:600, width:"100%" }}>
                          ⏳ Client is reviewing your submission. You'll be notified when done.
                        </div>
                      )}
                      {["inprogress","funded"].includes(job.status) && (
                        <Btn variant="outline" style={{ fontSize:13 }} onClick={e => { e.stopPropagation(); setShowAudit(job); }}>🤖 AI Audit</Btn>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── EARNINGS ── */}
        {tab === "earnings" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <h1 style={{ fontSize:"clamp(18px,3vw,22px)", fontWeight:700, color:"#001637" }}>Earnings</h1>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:24 }}>
              {[
                { label:"Total Earned",   value:"$"+totalEarned.toLocaleString(),                               color:"#006c47" },
                { label:"Pending Payout", value:"$"+pendingPayout.toLocaleString(),                             color:"#C9A84C" },
                { label:"In Escrow",      value:"$"+jobs.filter(j=>j.status==="funded"||j.status==="inprogress").reduce((s,j)=>s+j.amount,0).toLocaleString(), color:"#1a56a0" },
              ].map(s => (
                <div key={s.label} style={{ background:"#fff", border:"1px solid #e9e7eb", borderRadius:14, padding:"22px 20px", textAlign:"center" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#75777f", textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>{s.label}</div>
                  <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background:"#fff", border:"1px solid #e9e7eb", borderRadius:14, padding:"20px" }}>
              <h2 style={{ fontSize:16, fontWeight:700, color:"#001637", marginBottom:16 }}>Job Earnings History</h2>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:350 }}>
                <thead>
                  <tr style={{ background:"#f9f9fb" }}>
                    {["Project","Amount","Status","Date"].map(h => (
                      <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:10.5, fontWeight:700, color:"#75777f", textTransform:"uppercase", letterSpacing:".06em", borderBottom:"1px solid #e9e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, i) => (
                    <tr key={job.id} style={{ borderBottom:i<jobs.length-1?"1px solid #f0f0f0":"none" }}>
                      <td style={{ padding:"12px" }}>
                        <div style={{ fontWeight:600, fontSize:13, color:"#001637" }}>{job.title}</div>
                        <div style={{ fontSize:11, color:"#75777f" }}>{job.id}</div>
                      </td>
                      <td style={{ padding:"12px", fontWeight:700, fontSize:13, color:"#001637" }}>${job.amount.toLocaleString()}</td>
                      <td style={{ padding:"12px" }}><SB status={job.status} /></td>
                      <td style={{ padding:"12px", fontSize:12, color:"#75777f" }}>{job.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── WALLET ── */}
        {tab === "wallet" && <WalletTab balance={walletBalance} onBalanceChange={setWalletBalance} />}

        {/* ── DISPUTES ── */}
        {tab === "disputes" && (
          <div style={{ background:"#fff", border:"1px solid #e9e7eb", borderRadius:14, padding:"clamp(16px,4vw,28px)" }}>
            <h2 style={{ fontSize:"clamp(18px,3vw,22px)", fontWeight:700, color:"#001637", marginBottom:6 }}>Disputes</h2>
            {jobs.filter(j => j.status === "disputed").length === 0
              ? <div style={{ textAlign:"center", padding:"32px", color:"#75777f", fontSize:14, background:"#f9f9fb", borderRadius:12 }}><span className="msym" style={{ fontSize:36, display:"block", marginBottom:10 }}>check_circle</span>No active disputes.</div>
              : jobs.filter(j => j.status === "disputed").map(job => (
                <div key={job.id} style={{ border:"1.5px solid #fecaca", borderRadius:12, padding:"14px 16px", background:"#fff5f5", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:10 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:"#dc2626", marginBottom:3 }}>{job.title}</div>
                    <div style={{ fontSize:12.5, color:"#75777f" }}>{job.id} · ${job.amount.toLocaleString()}</div>
                  </div>
                  <Btn variant="red" style={{ fontSize:13 }} onClick={() => setShowDispute(job)}>View Details</Btn>
                </div>
              ))
            }
          </div>
        )}

        {/* ── KYC ── */}
        {tab === "kyc" && (
          <div style={{ background:"#fff", border:"1px solid #e9e7eb", borderRadius:14, padding:"clamp(16px,4vw,28px)" }}>
            <h2 style={{ fontSize:"clamp(18px,3vw,22px)", fontWeight:700, color:"#001637", marginBottom:6 }}>Vendor Verification</h2>
            <p style={{ color:"#75777f", fontSize:13.5, marginBottom:20 }}>Verified vendors get priority placement and higher payout limits.</p>
            {[
              { label:"Email Verified",  icon:"mail",  done:true },
              { label:"Business Profile",icon:"business", done:false, action:() => setShowKYC(true) },
              { label:"Government ID",   icon:"badge", done:kycDone, action:() => setShowKYC(true) },
              { label:"Portfolio Link",  icon:"link",  done:false, action:() => {} },
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

        {/* ── SETTINGS ── */}
        {tab === "settings" && <SettingsTab user={user} />}
      </main>

      {/* Modals */}
      {showKYC && <KYC onClose={() => setShowKYC(false)} onComplete={() => { setKycDone(true); setShowKYC(false); }} />}
      {showAudit && <AuditModal tx={showAudit} onClose={() => setShowAudit(null)} onApprove={() => setJobs(p => p.map(j => j.id===showAudit.id?{...j,status:"approved"}:j))} onRevision={() => setJobs(p => p.map(j => j.id===showAudit.id?{...j,status:"revision"}:j))} />}
      {showDispute && <DisputeModal tx={showDispute} onClose={() => setShowDispute(null)} onSubmit={() => setJobs(p => p.map(j => j.id===showDispute.id?{...j,status:"disputed"}:j))} />}
      {showContract && <ContractModal tx={showContract} scope={null} onClose={() => setShowContract(null)} />}

      {/* Mobile Bottom Nav */}
      <nav className="mbb" style={{ display:"none", position:"fixed", bottom:0, left:0, right:0, zIndex:50, background:"#fbf9fc", borderTop:"1px solid #c5c6cf", justifyContent:"space-around", alignItems:"center", height:66 }}>
        {VENDOR_TABS.slice(0,5).map(([k, icon, label]) => (
          <button key={k} onClick={() => switchTab(k)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"5px 6px", color:tab===k?"#001637":"#44474e", flex:1, borderTop:tab===k?"2px solid #C9A84C":"2px solid transparent" }}>
            <span className="msym" style={{ fontSize:22, color:tab===k?"#001637":"#75777f" }}>{icon}</span>
            <span style={{ fontSize:9.5, fontWeight:tab===k?700:500, whiteSpace:"nowrap" }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
