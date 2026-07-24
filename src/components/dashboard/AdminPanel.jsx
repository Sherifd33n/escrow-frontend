import { useState, useEffect } from "react";
import { T } from "../../tokens";
import { Btn, Badge, StatusBadge as SB } from "../../components/ui";
import { MTX, CATS } from "../../data/constants";
import { users, admin } from "../../utils/api";

const AdminPanel = ({ onBack, onLogout }) => {
  const handleExit = onBack || onLogout;
  const [tab, setTab] = useState("overview");
  const [kycQueue, setKycQueue] = useState([]);
  const [kycLoading, setKycLoading] = useState(false);

  const [disputesList, setDisputesList] = useState([]);
  const [disputesLoading, setDisputesLoading] = useState(false);

  const [selectedDispute, setSelectedDispute] = useState(null);
  const [loadingSingle, setLoadingSingle] = useState(false);

  const [platformTxs, setPlatformTxs] = useState([]);
  const [txsLoading, setTxsLoading] = useState(false);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const [usersList, setUsersList] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);

  // Admin Reviews state
  const [adminReviewsList, setAdminReviewsList] = useState([]);
  const [adminReviewsLoading, setAdminReviewsLoading] = useState(false);
  const [adminReviewFilters, setAdminReviewFilters] = useState({ rating: "", user: "", transaction: "", date: "" });

  // ─── DATA LOADING ──────────────────────────────────────────────────────────

  const loadKYCQueue = () => {
    setKycLoading(true);
    users.getKYCQueue().then(({ data, error }) => {
      setKycLoading(false);
      if (!error) {
        setKycQueue(data || []);
      }
    });
  };

  const loadDisputes = () => {
    setDisputesLoading(true);
    admin.getDisputes().then(({ data, error }) => {
      setDisputesLoading(false);
      if (!error && data) {
        setDisputesList(data.data || []);
      }
    });
  };

  const loadDashboard = () => {
    setDashboardLoading(true);
    admin.getDashboard().then(({ data, error }) => {
      setDashboardLoading(false);
      if (!error && data) {
        setDashboardStats(data);
      }
    });
  };

  const loadPlatformTransactions = () => {
    setTxsLoading(true);
    admin.getTransactions({ limit: 50 }).then(({ data, error }) => {
      setTxsLoading(false);
      if (!error && data) {
        setPlatformTxs(data.data || []);
      }
    });
  };

  const loadUsers = () => {
    setUsersLoading(true);
    admin.getUsers({ limit: 50 }).then(({ data, error }) => {
      setUsersLoading(false);
      if (!error && data) {
        setUsersList(data.data || []);
        setUserStats(data.stats || null);
      }
    });
  };

  const loadAdminReviews = (filters = adminReviewFilters) => {
    setAdminReviewsLoading(true);
    const activeFilters = {};
    Object.keys(filters).forEach(k => {
      if (filters[k]) activeFilters[k] = filters[k];
    });
    admin.getReviews(activeFilters).then(({ data, error }) => {
      setAdminReviewsLoading(false);
      if (!error && data) {
        setAdminReviewsList(data || []);
      }
    });
  };

  const handleDeleteReview = (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    admin.deleteReview(id).then(({ error }) => {
      if (error) {
        alert(error);
      } else {
        alert("Review deleted successfully!");
        loadAdminReviews();
      }
    });
  };

  const loadSingleDispute = (id) => {
    setLoadingSingle(true);
    admin.getDispute(id).then(({ data, error }) => {
      setLoadingSingle(false);
      if (!error && data) {
        setSelectedDispute(data);
      } else {
        alert(error || "Failed to load dispute details.");
      }
    });
  };

  useEffect(() => {
    loadDashboard();
    loadPlatformTransactions();
    loadDisputes();
    loadKYCQueue();
    loadUsers();
    loadAdminReviews();
  }, []);

  useEffect(() => {
    if (tab === "kyc") {
      loadKYCQueue();
    } else if (tab === "disputes") {
      loadDisputes();
    } else if (tab === "overview") {
      loadDashboard();
      loadPlatformTransactions();
    } else if (tab === "transactions") {
      loadPlatformTransactions();
    } else if (tab === "users") {
      loadUsers();
    } else if (tab === "reviews") {
      loadAdminReviews();
    }
  }, [tab]);

  // ─── ACTION HANDLERS ────────────────────────────────────────────────────────

  const handleApprove = (id) => {
    if (!window.confirm("Are you sure you want to approve this KYC submission?")) return;
    setKycLoading(true);
    users.approveKYC(id).then(({ error }) => {
      if (error) {
        alert(error);
        setKycLoading(false);
      } else {
        loadKYCQueue();
      }
    });
  };

  const handleReject = (id) => {
    const reason = window.prompt("Enter rejection reason:", "Documents were unclear or expired.");
    if (reason === null) return;
    setKycLoading(true);
    users.rejectKYC(id, reason).then(({ error }) => {
      if (error) {
        alert(error);
        setKycLoading(false);
      } else {
        loadKYCQueue();
      }
    });
  };

  const handleMoveToReview = (disputeId) => {
    admin.reviewDispute(disputeId).then(({ data, error }) => {
      if (error) {
        alert(error);
      } else {
        alert("Dispute moved to under review.");
        loadSingleDispute(disputeId);
        loadDisputes();
      }
    });
  };

  const handleResolveDispute = (transactionId, disputeId) => {
    const winnerInput = window.prompt("Who is the winner? Enter 'buyer' or 'seller':");
    if (!winnerInput) return;
    const winner = winnerInput.trim().toLowerCase();
    if (winner !== "buyer" && winner !== "seller") {
      alert("Invalid winner. Must be 'buyer' or 'seller'.");
      return;
    }
    const resolution = window.prompt("Enter dispute resolution text:");
    if (!resolution || !resolution.trim()) {
      alert("Resolution text is required.");
      return;
    }

    transactions.resolveDispute(transactionId, {
      winner,
      resolution: resolution.trim()
    }).then(({ data, error }) => {
      if (error) {
        alert(error);
      } else {
        alert("Dispute resolved successfully!");
        setSelectedDispute(null);
        loadDisputes();
        loadPlatformTransactions();
      }
    });
  };

  // ─── STATS CALCULATIONS ──────────────────────────────────────────────────

  // Prefer live dashboard data; fall back to computed values while loading
  const totalEscrow      = dashboardStats ? dashboardStats.totalEscrow      : platformTxs.reduce((sum, tx) => sum + parseFloat(tx.escrow_balance || 0), 0);
  const activeCount      = dashboardStats ? dashboardStats.activeTransactions: platformTxs.filter(tx => !["completed", "cancelled"].includes(tx.status)).length;
  const openDisputesCount= dashboardStats ? dashboardStats.openDisputes      : disputesList.filter(d => d.dispute_status !== "resolved").length;
  const pendingKycCount  = dashboardStats ? dashboardStats.pendingKYC        : kycQueue.length;

  // ─── RENDER SINGLE DISPUTE VIEW ──────────────────────────────────────────

  if (selectedDispute) {
    const d = selectedDispute.dispute;
    const t = selectedDispute.transaction;
    const buyer = selectedDispute.buyer;
    const seller = selectedDispute.seller;
    const milestones = selectedDispute.milestones || [];
    const history = selectedDispute.history || [];

    return (
      <div style={{ background: T.offWhite, minHeight: "100vh" }}>
        <div style={{ background: "linear-gradient(135deg,#1e1b4b,#3730a3)", color: T.white, padding: "0 1.5rem" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", height: 60, gap: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 18, cursor: "pointer" }} onClick={() => setSelectedDispute(null)}>
              <span style={{ color: T.green }}>Escrow</span> <span style={{ fontSize: 12, opacity: .6, fontWeight: 400 }}>Admin / Dispute #{d.id}</span>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <button onClick={() => setSelectedDispute(null)} style={{ background: "none", border: "1px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.6)", padding: "7px 13px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
                ← Back to List
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "26px 1.5rem" }}>
          <button onClick={() => setSelectedDispute(null)} style={{ background: "none", border: "none", color: T.gray500, cursor: "pointer", fontSize: 14, marginBottom: 20, display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
            <span className="msym" style={{ fontSize: 18 }}>arrow_back</span>Back to disputes
          </button>

          <div className="dg" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, alignItems: "start" }}>
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Dispute Details Card */}
              <div style={{ background: T.white, border: `1px solid ${T.gray100}`, borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: T.primary, margin: 0 }}>Dispute #{d.id} Details</h3>
                  <Badge color={d.status === "resolved" ? T.green : d.status === "under_review" ? "#d97706" : T.red}>
                    {d.status.toUpperCase()}
                  </Badge>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.gray400, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Reason</div>
                    <div style={{ fontSize: 14, color: T.primary, fontWeight: 600 }}>{d.reason}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.gray400, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Evidence / Description</div>
                    <div style={{ fontSize: 13.5, color: T.gray700, background: T.offWhite, padding: 12, borderRadius: 8, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                      {d.evidence || "No evidence uploaded."}
                    </div>
                  </div>

                  {d.status === "resolved" && (
                    <div style={{ background: T.greenLt, border: `1px solid ${T.green}`, borderRadius: 12, padding: "16px", marginTop: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: T.green, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="msym" style={{ fontSize: 15 }}>gavel</span>Resolution Decision
                      </div>
                      <p style={{ fontSize: 13, color: "#1b1b1e", lineHeight: 1.7, margin: 0 }}>{d.resolution}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Milestones Card */}
              <div style={{ background: T.white, border: `1px solid ${T.gray100}`, borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.primary, marginBottom: 16 }}>Escrow Milestones</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {milestones.length === 0 ? (
                    <p style={{ fontSize: 13, color: T.gray500, margin: 0 }}>No milestones generated.</p>
                  ) : (
                    milestones.map((m) => (
                      <div key={m.id} style={{ border: `1px solid ${T.gray100}`, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: T.primary }}>{m.title}</div>
                          <div style={{ fontSize: 11.5, color: T.gray400 }}>ID: {m.id}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontWeight: 700, fontSize: 13.5, color: T.primary }}>${parseFloat(m.amount).toLocaleString()}</span>
                          <SB status={m.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Transaction History Card */}
              <div style={{ background: T.white, border: `1px solid ${T.gray100}`, borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.primary, marginBottom: 16 }}>Transaction History</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {history.length === 0 ? (
                    <p style={{ fontSize: 13, color: T.gray500, margin: 0 }}>No events logged yet.</p>
                  ) : (
                    history.map((h, i, arr) => (
                      <div key={h.id || i} style={{ display: "flex", gap: 10 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: T.white }}>
                            {arr.length - i}
                          </div>
                          {i < arr.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 12, background: T.gray100, marginTop: 2 }} />}
                        </div>
                        <div style={{ fontSize: 13, color: T.primary }}>
                          <span style={{ fontWeight: 600 }}>{h.action.replace(/_/g, " ").toUpperCase()}</span>
                          <span style={{ fontSize: 11, color: T.gray400, marginLeft: 8 }}>{new Date(h.created_at).toLocaleString()}</span>
                          {h.note && <div style={{ fontSize: 12, color: T.gray500, marginTop: 3 }}>{h.note}</div>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Financial Summary */}
              <div style={{ background: T.white, border: `1px solid ${T.gray100}`, borderRadius: 16, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: T.primary, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Financials</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: T.gray500 }}>Transaction Code</span>
                    <span style={{ fontWeight: 600, color: T.primary }}>{t.txn_code}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: T.gray500 }}>Total Value</span>
                    <span style={{ fontWeight: 700, color: T.primary }}>${parseFloat(t.amount).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: T.gray500 }}>Escrow Balance</span>
                    <span style={{ fontWeight: 700, color: T.green }}>${parseFloat(t.escrow_balance).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: T.gray500 }}>Current Status</span>
                    <SB status={t.status} />
                  </div>
                </div>
              </div>

              {/* Buyer / Seller details */}
              <div style={{ background: T.white, border: `1px solid ${T.gray100}`, borderRadius: 16, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: T.primary, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Buyer / Client</h3>
                <div style={{ fontSize: 13, color: T.primary, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div><strong>Name:</strong> {buyer.name}</div>
                  <div><strong>Email:</strong> {buyer.email}</div>
                  <div><strong>Phone:</strong> {buyer.phone || "—"}</div>
                  <div><strong>Wallet Balance:</strong> {buyer.wallet ? `$${parseFloat(buyer.wallet.balance).toLocaleString()}` : "No Wallet"}</div>
                </div>
              </div>

              <div style={{ background: T.white, border: `1px solid ${T.gray100}`, borderRadius: 16, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: T.primary, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Seller / Provider</h3>
                <div style={{ fontSize: 13, color: T.primary, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div><strong>Name:</strong> {seller.name}</div>
                  <div><strong>Email:</strong> {seller.email}</div>
                  <div><strong>Phone:</strong> {seller.phone || "—"}</div>
                  <div><strong>Wallet Balance:</strong> {seller.wallet ? `$${parseFloat(seller.wallet.balance).toLocaleString()}` : "No Wallet"}</div>
                </div>
              </div>

              {/* Actions */}
              {d.status !== "resolved" && (
                <div style={{ background: T.white, border: `1px solid ${T.gray100}`, borderRadius: 16, padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: T.primary, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Officer Actions</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {d.status === "filed" && (
                      <Btn variant="purple" style={{ width: "100%", fontSize: 13 }} onClick={() => handleMoveToReview(d.id)}>
                        Move to Under Review
                      </Btn>
                    )}
                    <Btn variant="green" style={{ width: "100%", fontSize: 13 }} onClick={() => handleResolveDispute(t.id, d.id)}>
                      Resolve Dispute →
                    </Btn>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN ADMIN PANEL RENDER ──────────────────────────────────────────────

  return (
    <div style={{ background: T.offWhite, minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg,#1e1b4b,#3730a3)", color: T.white, padding: "0 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", height: 60, gap: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 18, cursor: "pointer" }} onClick={handleExit}>
            <span style={{ color: T.green }}>Escrow</span> <span style={{ fontSize: 12, opacity: .6, fontWeight: 400 }}>Admin</span>
          </div>
          <div style={{ display: "flex", gap: 0, marginLeft: 12, overflowX: "auto" }}>
            {[["overview", "Overview"], ["transactions", "All Transactions"], ["disputes", "Disputes"], ["users", "Users"], ["kyc", "KYC Queue"], ["reviews", "Reviews"]].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 13px", fontSize: 13, fontWeight: 600, color: tab === k ? T.gold : "rgba(255,255,255,.55)", borderBottom: tab === k ? `2px solid ${T.gold}` : "2px solid transparent", transition: "all .15s", whiteSpace: "nowrap" }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={handleExit} style={{ background: "none", border: "1px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.6)", padding: "7px 13px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
              ← Exit Admin
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "26px 1.5rem" }}>
        <div className="g4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 26 }}>
          {[{ l: "Total in Escrow", v: `$${totalEscrow.toLocaleString()}`, i: "lock", c: T.green },
            { l: "Active Transactions", v: `${activeCount}`, i: "bolt", c: "#3b82f6" },
            { l: "Open Disputes", v: `${openDisputesCount}`, i: "gavel", c: T.red },
            { l: "Pending KYC", v: `${pendingKycCount}`, i: "badge", c: T.accent }].map(c => (
              <div key={c.l} style={{ background: T.white, border: `1px solid ${T.gray100}`, borderRadius: 14, padding: "17px 19px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.gray400, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>
                    {c.l}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: T.primary, fontFamily: "'Inter',sans-serif" }}>
                    {c.v}
                  </div>
                </div>
                <div style={{ width: 42, height: 42, background: c.c + "18", borderRadius: 11, display: "flex", alignItems: "center", justifyValue: "center", alignItems: "center", justifyContent: "center" }}>
                  <span className="msym" style={{ fontSize: 20, color: c.c }}>{c.i}</span>
                </div>
              </div>
            ))}
        </div>

        {(tab === "overview" || tab === "transactions") && (
          <div style={{ background: T.white, border: `1px solid ${T.gray100}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.gray100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.primary }}>All Platform Transactions</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              {txsLoading ? (
                <p style={{ padding: 20, fontSize: 14, color: T.gray500 }}>Loading transactions...</p>
              ) : platformTxs.length === 0 ? (
                <p style={{ padding: 20, fontSize: 14, color: T.gray500 }}>No transactions on the platform.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: T.offWhite }}>
                      {["Transaction", "Parties", "Category", "Value", "Status", "Flagged"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: T.gray500, textTransform: "uppercase", letterSpacing: ".06em", borderBottom: `1px solid ${T.gray100}` }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {platformTxs.map((r, i) => (
                      <tr key={r.id} className="tr" style={{ borderBottom: i < platformTxs.length - 1 ? `1px solid ${T.gray100}` : "none" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 600, fontSize: 13.5, color: T.primary }}>{r.txn_code}</td>
                        <td style={{ padding: "12px 14px", fontSize: 13, color: T.gray700 }}>
                          {r.buyer_name || r.buyer_email} vs {r.seller_name || r.seller_email}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: T.teal, background: T.tealLt, padding: "3px 8px", borderRadius: 5 }}>
                            {CATS.find(c => c.id === r.category)?.label || r.category}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: T.primary, fontFamily: "'Inter',sans-serif" }}>
                          ${parseFloat(r.amount).toLocaleString()}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <SB status={r.status} />
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {r.status === "disputed" ? (
                            <span style={{ fontSize: 11, fontWeight: 700, color: T.red, background: "#fff5f5", padding: "3px 8px", borderRadius: 5 }}>
                              warning Disputed
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: T.gray400 }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === "disputes" && (
          <div style={{ background: T.white, border: `1px solid ${T.gray100}`, borderRadius: 16, padding: "26px" }}>
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, color: T.primary, marginBottom: 16 }}>Dispute Resolution Queue</h2>
            
            {disputesLoading ? (
              <p style={{ fontSize: 14, color: T.gray500 }}>Loading disputes...</p>
            ) : disputesList.length === 0 ? (
              <p style={{ fontSize: 14, color: T.gray500 }}>No active disputes in the queue.</p>
            ) : (
              disputesList.map(d => (
                <div key={d.dispute_id} style={{ border: `1.5px solid #fecaca`, borderRadius: 12, padding: "18px 20px", background: "#fff5f5", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.red, marginBottom: 4 }}>
                      {d.txn_code} — {d.transaction_title}
                    </div>
                    <div style={{ fontSize: 13, color: T.gray500 }}>
                      {d.buyer_name} vs {d.seller_name} · ${parseFloat(d.transaction_amount).toLocaleString()} · Filed {new Date(d.dispute_created_at).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: 12.5, color: T.gray400, marginTop: 6 }}>
                      Reason: {d.reason} | Status: <span style={{ fontWeight: 700 }}>{d.dispute_status.toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="outline" style={{ fontSize: 13 }} onClick={() => loadSingleDispute(d.dispute_id)}>
                      Review →
                    </Btn>
                  </div>
                </div>
              ))
            )}

            <div style={{ marginTop: 20, background: T.offWhite, borderRadius: 12, padding: "18px", fontSize: 13.5, color: T.gray600, lineHeight: 1.75 }}>
              <strong>Dispute Workflow:</strong> AI case summary generated → Both parties notified → Evidence window (48h) → Officer review → Binding decision within 5 days → Refund or payment release executed.
            </div>
          </div>
        )}

        {tab === "users" && (
          <div style={{ background: T.white, border: `1px solid ${T.gray100}`, borderRadius: 16, padding: "26px" }}>
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, color: T.primary, marginBottom: 16 }}>User Management</h2>
            {usersLoading && !userStats && (
              <p style={{ fontSize: 14, color: T.gray500, margin: "0 0 16px" }}>Loading user stats...</p>
            )}
            <div className="g4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              {[
                { l: "Total Users",   v: userStats ? userStats.totalUsers.toLocaleString()    : "—", i: "group" },
                { l: "Clients",        v: userStats ? userStats.totalClients.toLocaleString()   : "—", i: "person" },
                { l: "Providers",      v: userStats ? userStats.totalProviders.toLocaleString() : "—", i: "build" },
                { l: "Verified",       v: userStats ? userStats.verifiedUsers.toLocaleString()  : "—", i: "verified_user" },
              ].map(u => (
                <div key={u.l} style={{ background: T.offWhite, borderRadius: 12, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>
                    <span className="msym" style={{ fontSize: 20, color: T.primary }}>{u.i}</span>
                  </div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 20, color: T.primary }}>
                    {u.v}
                  </div>
                  <div style={{ fontSize: 12, color: T.gray500, marginTop: 2 }}>{u.l}</div>
                </div>
              ))}
            </div>
            {!usersLoading && usersList.length > 0 && (
              <div style={{ marginTop: 20, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: T.offWhite }}>
                      {["Name", "Email", "Role", "KYC Status", "Wallet Balance", "Joined"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: T.gray500, textTransform: "uppercase", letterSpacing: ".06em", borderBottom: `1px solid ${T.gray100}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u, i) => (
                      <tr key={u.id} style={{ borderBottom: i < usersList.length - 1 ? `1px solid ${T.gray100}` : "none" }}>
                        <td style={{ padding: "11px 14px", fontWeight: 600, fontSize: 13.5, color: T.primary }}>{u.name}</td>
                        <td style={{ padding: "11px 14px", fontSize: 13, color: T.gray700 }}>{u.email}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, background: u.role === "admin" ? T.accent + "18" : T.primary + "12", color: u.role === "admin" ? T.accent : T.primary, padding: "3px 8px", borderRadius: 5, textTransform: "capitalize" }}>{u.role}</span>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: u.kyc_status === "approved" ? T.green : u.kyc_status === "rejected" ? T.red : T.gray500 }}>
                            {u.kyc_status ? u.kyc_status.toUpperCase() : "NONE"}
                          </span>
                        </td>
                        <td style={{ padding: "11px 14px", fontWeight: 700, color: T.primary, fontFamily: "'Inter',sans-serif" }}>
                          ${parseFloat(u.wallet_balance).toLocaleString()}
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: T.gray400 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "kyc" && (
          <div style={{ background: T.white, border: `1px solid ${T.gray100}`, borderRadius: 16, padding: "26px" }}>
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, color: T.primary, marginBottom: 6 }}>KYC Verification Queue</h2>
            <p style={{ color: T.gray500, fontSize: 14, marginBottom: 20 }}>{kycQueue.length} pending manual verifications.</p>
            {kycLoading && <p style={{ fontSize: 13.5, color: T.gray500 }}>Loading queue...</p>}
            {!kycLoading && kycQueue.length === 0 && <p style={{ fontSize: 13.5, color: T.gray500 }}>No pending verification requests.</p>}
            {!kycLoading && kycQueue.map((u, i) => (
              <div key={u.id || i} style={{ border: `1px solid ${T.gray100}`, borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.primary }}>{u.user_name} ({u.user_email})</div>
                  <div style={{ fontSize: 12.5, color: T.gray500 }}>{u.biz_name ? "Business Verification" : "Identity Verification"} · Phone: {u.phone} · Submitted {new Date(u.created_at).toLocaleString()}</div>
                  <div style={{ fontSize: 11.5, color: T.gray400, marginTop: 4, display: "flex", gap: 10 }}>
                    <a href={`http://localhost:4000${u.id_file}`} target="_blank" rel="noreferrer" style={{ color: T.accent, textDecoration: "underline" }}>View ID</a>
                    {u.selfie_file && <a href={`http://localhost:4000${u.selfie_file}`} target="_blank" rel="noreferrer" style={{ color: T.accent, textDecoration: "underline" }}>View Selfie</a>}
                    {u.biz_file && <a href={`http://localhost:4000${u.biz_file}`} target="_blank" rel="noreferrer" style={{ color: T.accent, textDecoration: "underline" }}>View Biz Doc</a>}
                    {u.incorp_file && <a href={`http://localhost:4000${u.incorp_file}`} target="_blank" rel="noreferrer" style={{ color: T.accent, textDecoration: "underline" }}>View Incorp Cert</a>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Badge color={u.biz_name ? T.accent : T.primary}>{u.biz_name ? "Premium" : "Standard"}</Badge>
                  <Btn variant="green" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => handleApprove(u.id)}>Approve</Btn>
                  <Btn variant="red" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => handleReject(u.id)}>Reject</Btn>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "reviews" && (
          <div style={{ background: T.white, border: `1px solid ${T.gray100}`, borderRadius: 16, padding: "26px" }}>
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, color: T.primary, marginBottom: 16 }}>Reviews & Ratings</h2>
            
            {/* Filter Bar */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, alignItems: "flex-end" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.gray400 }}>RATING</label>
                <select
                  value={adminReviewFilters.rating}
                  onChange={e => setAdminReviewFilters(p => ({ ...p, rating: e.target.value }))}
                  style={{ ...fs, width: 120, height: 38, padding: "0 10px", fontSize: 13, border: `1px solid ${T.gray100}`, borderRadius: 6 }}
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.gray400 }}>USER</label>
                <input
                  type="text"
                  placeholder="ID, Name, or Email..."
                  value={adminReviewFilters.user}
                  onChange={e => setAdminReviewFilters(p => ({ ...p, user: e.target.value }))}
                  style={{ ...fs, width: 180, height: 38, padding: "0 10px", fontSize: 13, border: `1px solid ${T.gray100}`, borderRadius: 6 }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.gray400 }}>TRANSACTION</label>
                <input
                  type="text"
                  placeholder="ID or Code..."
                  value={adminReviewFilters.transaction}
                  onChange={e => setAdminReviewFilters(p => ({ ...p, transaction: e.target.value }))}
                  style={{ ...fs, width: 140, height: 38, padding: "0 10px", fontSize: 13, border: `1px solid ${T.gray100}`, borderRadius: 6 }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.gray400 }}>DATE</label>
                <input
                  type="date"
                  value={adminReviewFilters.date}
                  onChange={e => setAdminReviewFilters(p => ({ ...p, date: e.target.value }))}
                  style={{ ...fs, width: 140, height: 38, padding: "0 10px", fontSize: 13, border: `1px solid ${T.gray100}`, borderRadius: 6 }}
                />
              </div>

              <Btn variant="primary" style={{ height: 38, padding: "0 18px", fontSize: 13 }} onClick={() => loadAdminReviews()}>
                Apply Filters
              </Btn>

              <Btn
                variant="outline"
                style={{ height: 38, padding: "0 18px", fontSize: 13 }}
                onClick={() => {
                  const reset = { rating: "", user: "", transaction: "", date: "" };
                  setAdminReviewFilters(reset);
                  loadAdminReviews(reset);
                }}
              >
                Reset
              </Btn>
            </div>

            {/* Reviews list */}
            {adminReviewsLoading ? (
              <p style={{ fontSize: 14, color: T.gray500 }}>Loading reviews...</p>
            ) : adminReviewsList.length === 0 ? (
              <p style={{ fontSize: 14, color: T.gray500 }}>No reviews found matching the filters.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {adminReviewsList.map(r => (
                  <div key={r.id} style={{ border: `1px solid ${T.gray100}`, borderRadius: 12, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: T.primary }}>
                          {r.txn_code} — {r.transaction_title}
                        </span>
                        <span style={{ display: "flex", gap: 1 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className="msym"
                              style={{
                                fontSize: 13,
                                color: star <= r.rating ? "#d97706" : T.gray100
                              }}
                            >
                              star
                            </span>
                          ))}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: T.gray500 }}>
                        Reviewer: <strong style={{ color: T.primary }}>{r.reviewer_name}</strong> vs Reviewee: <strong style={{ color: T.primary }}>{r.reviewee_name}</strong> · Submitted {new Date(r.created_at).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: 12.5, color: T.gray600, marginTop: 6, background: T.offWhite, padding: 10, borderRadius: 8 }}>
                        {r.comment || <span style={{ fontStyle: "italic", color: T.gray400 }}>No comment left.</span>}
                      </div>
                    </div>
                    <div>
                      <Btn variant="red" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => handleDeleteReview(r.id)}>
                        Delete Review
                      </Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
