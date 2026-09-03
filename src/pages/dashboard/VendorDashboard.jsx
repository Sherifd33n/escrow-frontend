import { useState, useEffect, useCallback } from "react";
import { Btn, StatusBadge as SB } from "../../components/ui";
import { CATS, SCFG } from "../../data/constants";
import AuditModal from "../../components/dashboard/AuditModal";
import DisputeModal from "../../components/dashboard/DisputeModal";
import ContractModal from "../../components/dashboard/ContractModal";
import SettingsTab from "../../components/dashboard/SettingsTab";
import WalletTab from "../../components/dashboard/WalletTab";
import KYC from "../../components/dashboard/KYCModal";
import PhoneVerifyModal from "../../components/dashboard/PhoneVerifyModal";
import ReviewModal from "../../components/dashboard/ReviewModal";
import SubmitDeliverableModal from "../../components/dashboard/SubmitDeliverableModal";
import SubmittedDeliverablesViewer from "../../components/dashboard/SubmittedDeliverablesViewer";
import { users, transactions, wallet } from "../../utils/api";
import { sseEmitter } from "../../utils/useSSE";

const VENDOR_TABS = [
  ["overview",     "home",                   "Overview"],
  ["jobs",         "work",                   "Active Jobs"],
  ["earnings",     "payments",               "Earnings"],
  ["wallet",       "account_balance_wallet", "Wallet"],
  ["disputes",     "gavel",                  "Disputes"],
  ["kyc",          "badge",                  "KYC"],
  ["settings",     "manage_accounts",        "Account"],
];

export default function VendorDashboard({ user, onLogout, onUserUpdate }) {
  const [tab, setTab]         = useState("overview");
  const [drawer, setDrawer]   = useState(false);
  const [detail, setDetail]   = useState(null);
  const [jobs, setJobs]       = useState([]);
  const [showAudit, setShowAudit]   = useState(null);
  const [showDispute, setShowDispute] = useState(null);
  const [showContract, setShowContract] = useState(null);
  const [showKYC, setShowKYC] = useState(false);
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showReview, setShowReview] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(null);

  const phoneDone = !!user?.phone && !!user?.phone_verified;

  const fetchDashboardData = useCallback(async () => {
    const [txsRes, walletRes] = await Promise.all([
      transactions.list(),
      wallet.get()
    ]);
    if (txsRes.data) {
      setJobs(txsRes.data.map(t => ({
        ...t,
        id: t.txn_code || `TXN-${t.id}`,
        realId: t.id,
        type: CATS.find(c => c.id === t.category)?.label || "Software Dev",
        other: user.id === t.buyer_id ? t.seller_name : t.buyer_name,
        date: new Date(t.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }),
        amount: parseFloat(t.amount) || 0
      })));
    }
    if (walletRes.data) {
      const bal = walletRes.data.available_balance !== undefined
        ? parseFloat(walletRes.data.available_balance)
        : parseFloat(walletRes.data.balance) || 0;
      setWalletBalance(bal);
    }
  }, [user]);


  const [kycStatus, setKycStatus] = useState(
    user?.kyc_tier > 1 || user?.is_verified ? "approved" : "none"
  );
  const [kycTier, setKycTier] = useState(user?.kyc_tier || 1);

  const checkKYC = useCallback(async () => {
    try {
      const { data } = await users.getKYCStatus();
      if (data) {
        if (data.tier) setKycTier(data.tier);
        if (data.status === "approved" || data.tier > 1) {
          setKycStatus("approved");
        } else if (data.status === "pending") {
          setKycStatus("pending");
        } else if (data.status === "rejected") {
          setKycStatus("rejected");
        } else {
          setKycStatus("none");
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchDashboardData();
    };
    load();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (user) {
      const loadKyc = async () => {
        await checkKYC();
      };
      loadKyc();
    }
  }, [user, showKYC, checkKYC]);

  // ── SSE: auto-refresh on server-side events ──────────────────────────────
  useEffect(() => {
    const offTx     = sseEmitter.on("transaction_update", fetchDashboardData);
    const offWallet = sseEmitter.on("wallet_update",      () => wallet.get().then(r => { if (r.data) setWalletBalance(parseFloat(r.data.balance) || 0); }));
    const offKyc    = sseEmitter.on("kyc_update",         checkKYC);
    const offDisp   = sseEmitter.on("dispute_update",     fetchDashboardData);
    return () => { offTx(); offWallet(); offKyc(); offDisp(); };
  }, [fetchDashboardData, checkKYC]);

  const switchTab = k => { 
    setTab(k); 
    setDetail(null); 
    setDrawer(false); 
    fetchDashboardData();
  };

  const totalEarned = jobs.reduce((sum, j) => {
    const released = parseFloat(j.released_amount) || 0;
    if (released > 0) return sum + released;
    if (j.status === "completed") return sum + (parseFloat(j.amount) || 0);
    const approvedM = (j.milestones || []).filter(m => m.status === "approved");
    return sum + approvedM.reduce((mSum, m) => mSum + (parseFloat(m.amount) || 0), 0);
  }, 0);

  const pendingPayout = jobs.reduce((sum, j) => {
    if (["completed", "cancelled"].includes(j.status)) return sum;
    const isSubmitted = ["inspection", "audit"].includes(j.status) ||
      (j.milestones || []).some(m => m.status === "submitted");
    if (isSubmitted) {
      const eb = parseFloat(j.escrow_balance);
      if (!isNaN(eb) && eb > 0) return sum + eb;
      const fundedM = (j.milestones || []).filter(m => ["paid", "submitted"].includes(m.status));
      return sum + fundedM.reduce((mSum, m) => mSum + (parseFloat(m.amount) || 0), 0);
    }
    return sum;
  }, 0);

  const inEscrowValue = jobs.filter(j => !["completed", "cancelled"].includes(j.status)).reduce((sum, j) => {
    const eb = parseFloat(j.escrow_balance);
    if (!isNaN(eb) && eb > 0) return sum + eb;
    const fundedM = (j.milestones || []).filter(m => ["paid", "submitted", "approved", "rejected"].includes(m.status));
    const fundedAmt = fundedM.reduce((mSum, m) => mSum + (parseFloat(m.amount) || 0), 0);
    const rel = parseFloat(j.released_amount) || 0;
    return sum + Math.max(0, fundedAmt - rel);
  }, 0);

  const activeJobs = jobs.filter(j => !["completed","cancelled"].includes(j.status)).length;

  return (
    <div style={{ background:"#f5f3f6", minHeight:"100dvh", paddingBottom:80 }}>

      {/* Overlay */}
      <div className={"dash-overlay"+(drawer?" show":"")} onClick={() => setDrawer(false)} />

      {/* Side Drawer */}
      <aside className={"dash-drawer"+(drawer?" open":"")}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", height:64, borderBottom:"1px solid #c5c6cf", flexShrink:0 }}>
          <span style={{ fontWeight:800, fontSize:20, color:"#001637" }}>
            <span style={{ color:"#006c47" }}>Escrow</span>{" "}
            <span style={{ fontSize:11, background:"#f0fdf4", color:"#006c47", borderRadius:6, padding:"2px 8px", fontWeight:700 }}>Provider</span>
          </span>
          <button onClick={() => setDrawer(false)} style={{ background:"none", border:"none", cursor:"pointer" }}>
            <span className="msym" style={{ fontSize:24, color:"#44474e" }}>close</span>
          </button>
        </div>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid #e9e7eb", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#006c47,#005235)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:16, color:"#fff", flexShrink:0 }}>
            {user?.name ? user.name[0].toUpperCase() : "S"}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:"#001637" }}>{user?.name || "Service Provider"}</div>
            <div style={{ fontSize:11, color:"#006c47", fontWeight:600 }}>Service Provider</div>
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
      <style>{`
        @media(max-width:520px){ .vp-role-badge{display:none!important;} }
        @media(max-width:400px){ .vp-balance-label{display:none!important;} }
      `}</style>
      <header style={{ background:"#fbf9fc", borderBottom:"1px solid #c5c6cf", position:"sticky", top:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", height:64, gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0, overflow:"hidden" }}>
          <button className="mob-menu-btn" onClick={() => setDrawer(v => !v)} style={{ display:"flex", alignItems:"center", justifyContent:"center", width:38, height:38, borderRadius:10, background:"none", border:"none", cursor:"pointer", flexShrink:0 }}>
            <span className="msym" style={{ fontSize:24, color:"#001637" }}>menu</span>
          </button>
          <span style={{ fontWeight:800, fontSize:20, color:"#001637", cursor:"pointer", flexShrink:0 }} onClick={() => switchTab("overview")}>
            <span style={{ color:"#006c47" }}>Escrow</span>
          </span>
          <span className="vp-role-badge" style={{ fontSize:11, background:"#f0fdf4", color:"#006c47", borderRadius:6, padding:"2px 8px", fontWeight:700, flexShrink:0, whiteSpace:"nowrap" }}>Provider</span>
          <div className="dash-tabs" style={{ display:"flex", gap:0, marginLeft:6, overflow:"hidden" }}>
            {VENDOR_TABS.map(([k, , l]) => (
              <button key={k} onClick={() => switchTab(k)} style={{ background:"none", border:"none", cursor:"pointer", padding:"8px 12px", fontSize:13, fontWeight:600, color:tab===k?"#001637":"#44474e", borderBottom:tab===k?"2px solid #006c47":"2px solid transparent", transition:"all .15s", whiteSpace:"nowrap" }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:9, padding:"6px 10px", fontSize:13, fontWeight:700, color:"#006c47", whiteSpace:"nowrap" }}>
            <span className="vp-balance-label">Balance: </span>${walletBalance.toLocaleString()}
        </div>
          <button onClick={onLogout} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"transparent", color:"#dc2626", border:"1px solid #fecaca", borderRadius:9, cursor:"pointer", fontWeight:600, fontSize:13, padding:"8px 12px", whiteSpace:"nowrap", flexShrink:0 }}>
            <span className="msym" style={{ fontSize:16 }}>logout</span>
          </button>
        </div>
      </header>

      <main style={{ maxWidth:1100, margin:"0 auto", padding:"clamp(12px,3vw,24px) clamp(12px,3vw,20px)" }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <h1 style={{ fontSize:"clamp(20px,3vw,26px)", fontWeight:800, color:"#001637", marginBottom:4 }}>Service Provider Dashboard</h1>
              <p style={{ color:"#75777f", fontSize:14 }}>Manage your jobs, track earnings, and submit deliverables.</p>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:24 }}>
              {[
                { icon:"work",     label:"Active Jobs",     value:activeJobs,                          color:"#001637", bg:"#e8f0fe" },
                { icon:"payments", label:"Total Earned",    value:"$"+totalEarned.toLocaleString(),    color:"#006c47", bg:"#f0fdf4" },
                { icon:"schedule", label:"Pending Payout",  value:"$"+pendingPayout.toLocaleString(),  color:"#001637", bg:"#e8edf5" },
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
                      {[["Milestones", Array.isArray(job.milestones) ? job.milestones.length : (job.milestones || 0)],["Category",job.type],["Your Role","Service Provider"],["Status",SCFG[job.status]?.label||job.status]].map(([k,v]) => (
                        <div key={k} style={{ background:"#f9f9fb", borderRadius:10, padding:"10px 12px" }}>
                          <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:"#75777f", marginBottom:2 }}>{k}</div>
                          <div style={{ fontSize:13, fontWeight:700, color:"#001637" }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Actions based on status */}
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>

                      {/* View Contract — always visible so provider can review the agreed scope at any stage */}
                      <Btn variant="outline" style={{ fontSize:13 }} onClick={e => { e.stopPropagation(); setShowContract(job); }}>📄 View Contract</Btn>

                      {["inprogress", "revision"].includes(job.status) && (
                        <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:10 }}>
                          {/* Client Revision Request Banner */}
                          {(job.status === "revision" || (job.milestones || []).some(m => (m.revision_requests || []).length > 0)) && (
                            <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:10, padding:"12px 14px", fontSize:13, color:"#c2410c", width:"100%" }}>
                              <div style={{ fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                                <span className="msym" style={{ fontSize: 18 }}>refresh</span>
                                Revision Requested by Client
                              </div>
                              {(job.milestones || []).flatMap(m => m.revision_requests || []).slice(-1).map((rr, idx) => (
                                <div key={idx} style={{ fontSize: 12.5, marginTop: 4, color: "#9a3412", lineHeight: 1.5 }}>
                                  {rr.reason && <div><strong>Reason:</strong> {rr.reason}</div>}
                                  {rr.details && <div><strong>Details:</strong> {rr.details}</div>}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Submitted Deliverables Viewer */}
                          <SubmittedDeliverablesViewer tx={job} />

                          {/* Submission History */}
                          {(job.milestones || []).some(m => (m.submissions || []).length > 0) && (
                            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#334155" }}>
                              <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em", color: "#64748b", marginBottom: 6 }}>Submission History</div>
                              {(job.milestones || []).flatMap(m => m.submissions || []).map((sub, sIdx) => (
                                <div key={sIdx} style={{ padding: "4px 0", borderBottom: sIdx < (job.milestones?.flatMap(m=>m.submissions||[]).length||0) - 1 ? "1px dashed #cbd5e1" : "none" }}>
                                  <span style={{ fontWeight: 700, color: "#0f172a" }}>Version {sub.version || sIdx + 1}:</span> {sub.deliverable_note}
                                  {sub.created_at && <span style={{ fontSize: 11, color: "#64748b", marginLeft: 8 }}>({new Date(sub.created_at).toLocaleDateString()})</span>}
                                </div>
                              ))}
                            </div>
                          )}

                          {(() => {
                            const catLabel = job.cat || job.category || job.type || "Project";
                            return (
                              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#166534" }}>
                                  <strong>{catLabel} Submission:</strong> Click below to enter your scope claims, evidence links, and technical artifacts for AI deliverable audit verification.
                                </div>
                                <div style={{ display:"flex", gap:8 }}>
                                  <Btn variant="accent" style={{ fontSize:13 }} onClick={e => {
                                    e.stopPropagation();
                                    const activeM = (job.milestones || []).find(m => ["inprogress", "due", "paid", "pending", "upcoming", "rejected"].includes(m.status)) || job.milestones?.[0];
                                    setShowSubmitModal({ job, milestone: activeM });
                                  }}>
                                    <span className="msym" style={{ fontSize:16 }}>assignment_turned_in</span> {job.status === "revision" ? "Resubmit Revised Deliverable" : "Submit Milestone Deliverable"}
                                  </Btn>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      {job.status === "funded" && (
                        <Btn variant="teal" style={{ fontSize:13 }} onClick={async (e) => {
                          e.stopPropagation();
                          const { error } = await transactions.updateStatus(job.realId, "inprogress");
                          if (error) {
                            alert(error);
                          } else {
                            fetchDashboardData();
                          }
                        }}>
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
                      {job.status === "completed" && (
                        <Btn variant="green" style={{ fontSize:13 }} onClick={e => { e.stopPropagation(); setShowReview(job); }}>⭐ Reviews & Ratings</Btn>
                      )}
                      {!["completed","cancelled","disputed"].includes(job.status) && (
                        <Btn variant="red" style={{ fontSize:13 }} onClick={e => { e.stopPropagation(); setShowDispute(job); }}>⚠️ Dispute</Btn>
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
                { label:"Pending Payout", value:"$"+pendingPayout.toLocaleString(),                             color:"#001637" },
                { label:"In Escrow",      value:"$"+inEscrowValue.toLocaleString(),                             color:"#1a56a0" },
              ].map(s => (
                <div key={s.label} style={{ background:"#fff", border:"1px solid #e9e7eb", borderRadius:14, padding:"22px 20px", textAlign:"center" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#75777f", textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>{s.label}</div>
                  <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background:"#fff", border:"1px solid #e9e7eb", borderRadius:14, padding:"20px", overflow:"hidden" }}>
              <h2 style={{ fontSize:16, fontWeight:700, color:"#001637", marginBottom:16 }}>Job Earnings History</h2>
              {/* Desktop table */}
              <div className="tx-tbl" style={{ overflowX:"auto" }}>
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
              {/* Mobile cards */}
              <div className="tx-mob" style={{ display:"none", flexDirection:"column" }}>
                {jobs.map((job, i) => (
                  <div key={job.id} style={{ padding:"12px 2px", borderBottom:i<jobs.length-1?"1px solid #f0f0f0":"none" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", gap:10, marginBottom:4 }}>
                      <div style={{ fontWeight:600, fontSize:13, color:"#001637", minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{job.title}</div>
                      <div style={{ fontWeight:700, fontSize:13, color:"#001637", flexShrink:0 }}>${job.amount.toLocaleString()}</div>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
                      <div style={{ fontSize:11, color:"#75777f" }}>{job.id} &bull; {job.date}</div>
                      <SB status={job.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── WALLET ── */}
        {tab === "wallet" && <WalletTab user={user} balance={walletBalance} onBalanceChange={setWalletBalance} activeTxs={jobs.filter(j => !["completed","cancelled"].includes(j.status))} />}

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
            <h2 style={{ fontSize:"clamp(18px,3vw,22px)", fontWeight:700, color:"#001637", marginBottom:6 }}>Service Provider Verification</h2>
            <p style={{ color:"#75777f", fontSize:13.5, marginBottom:20 }}>Verified vendors get priority placement and higher payout limits.</p>
            {[
              { label:"Email Verified",  icon:"mail",     status:"approved", action:null },
              { label:"Phone Number",    icon:"phone",    status:phoneDone ? "approved" : "none", action:() => setShowPhoneVerify(true) },
              { label:"Business Profile",icon:"business", status:Math.max(kycTier, user?.kyc_tier || 1) >= 3 ? "approved" : kycStatus === "pending" ? "pending" : kycStatus === "rejected" ? "rejected" : "none", action:() => setShowKYC(true) },
              { label:"Government ID",   icon:"badge",    status:kycStatus, action:() => setShowKYC(true) },
              { label:"Portfolio Link",  icon:"link",     status:"none", action:() => {} },
            ].map(v => (
              <div key={v.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 18px", background:"#f9f9fb", borderRadius:12, border:"1px solid #e9e7eb", marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:v.status==="approved"?"#f0fdf4":v.status==="pending"?"#fffbe6":v.status==="rejected"?"#fff5f5":"#f5f3f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span className="msym" style={{ fontSize:20, color:v.status==="approved"?"#006c47":v.status==="pending"?"#d97706":v.status==="rejected"?"#dc2626":"#75777f" }}>{v.icon}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight:600, fontSize:14, color:"#001637" }}>{v.label}</span>
                    {v.status === "pending" && <div style={{ fontSize:11.5, color:"#d97706" }}>Submitted — awaiting admin review</div>}
                    {v.status === "rejected" && <div style={{ fontSize:11.5, color:"#dc2626" }}>Verification rejected — please try again</div>}
                  </div>
                </div>
                {v.status === "approved" ? (
                  <span style={{ fontSize:11.5, fontWeight:700, color:"#006c47", background:"#f0fdf4", padding:"3px 10px", borderRadius:20 }}>✓ Verified</span>
                ) : v.status === "pending" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize:11.5, fontWeight:700, color:"#d97706", background:"#fffbe6", border:"1px solid #fef08a", padding:"3px 10px", borderRadius:20 }}>⏳ Pending</span>
                    <Btn variant="outline" style={{ fontSize:12, padding:"5px 10px" }} onClick={v.action}>View Status</Btn>
                  </div>
                ) : v.status === "rejected" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize:11.5, fontWeight:700, color:"#dc2626", background:"#fff5f5", border:"1px solid #fecaca", padding:"3px 10px", borderRadius:20 }}>✕ Rejected</span>
                    <Btn variant="outline" style={{ fontSize:12, padding:"5px 10px" }} onClick={v.action}>Try Again</Btn>
                  </div>
                ) : (
                  <Btn variant="outline" style={{ fontSize:12, padding:"6px 12px" }} onClick={v.action}>Verify Now</Btn>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === "settings" && <SettingsTab user={user} onUserUpdate={onUserUpdate} onLogout={onLogout} />}
      </main>

      {/* Modals */}
      {showKYC && (
        <KYC
          user={user}
          onClose={() => setShowKYC(false)}
          onComplete={(tier) => {
            setShowKYC(false);
            if (onUserUpdate) onUserUpdate({ ...user, kyc_tier: tier });
          }}
        />
      )}
      {showPhoneVerify && (
        <PhoneVerifyModal
          onClose={() => setShowPhoneVerify(false)}
          onVerified={async () => {
            setShowPhoneVerify(false);
            const { data } = await users.getProfile();
            if (data && onUserUpdate) onUserUpdate(data);
          }}
        />
      )}
      {showAudit && (
        <AuditModal
          tx={showAudit}
          onClose={() => setShowAudit(null)}
          onApprove={async () => {
            await transactions.updateStatus(showAudit.realId, "approved");
            fetchDashboardData();
          }}
          onRevision={async () => {
            await transactions.updateStatus(showAudit.realId, "revision");
            fetchDashboardData();
          }}
        />
      )}
      {showDispute && (
        <DisputeModal
          tx={showDispute}
          onClose={() => setShowDispute(null)}
          onSubmit={() => {
            fetchDashboardData();
          }}
        />
      )}
      {showContract && <ContractModal tx={showContract} scope={showContract?.scope_json} user={user} onClose={() => setShowContract(null)} onScopeUpdated={(updatedTx) => { if (updatedTx) setShowContract(updatedTx); fetchDashboardData(); }} />}
      {showReview && <ReviewModal tx={showReview} onClose={() => setShowReview(null)} onSubmit={fetchDashboardData} />}
      {showSubmitModal && (
        <SubmitDeliverableModal
          job={showSubmitModal.job}
          activeMilestone={showSubmitModal.milestone}
          onClose={() => setShowSubmitModal(null)}
          onSubmitSuccess={() => {
            fetchDashboardData();
            setShowSubmitModal(null);
          }}
        />
      )}

      {/* Mobile Bottom Nav */}
      <nav className="mbb" style={{ display:"none", position:"fixed", bottom:0, left:0, right:0, zIndex:50, background:"#fbf9fc", borderTop:"1px solid #c5c6cf", justifyContent:"space-around", alignItems:"center", height:66 }}>
        {VENDOR_TABS.slice(0,5).map(([k, icon, label]) => (
          <button key={k} onClick={() => switchTab(k)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"5px 6px", color:tab===k?"#001637":"#44474e", flex:1, borderTop:tab===k?"2px solid #006c47":"2px solid transparent" }}>
            <span className="msym" style={{ fontSize:22, color:tab===k?"#001637":"#75777f" }}>{icon}</span>
            <span style={{ fontSize:9.5, fontWeight:tab===k?700:500, whiteSpace:"nowrap" }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
