import { useState, useEffect, useCallback } from "react";
import { T, fs } from "../../tokens";
import {
  Btn,
  Badge,
  StatusBadge as SB,
  EvidenceViewer,
} from "../../components/ui";
import { CATS } from "../../data/constants";
import { users, admin } from "../../utils/api";
import { sseEmitter } from "../../utils/useSSE";
import AIDisputeAnalysisCard from "./AIDisputeAnalysisCard";
import DisputeResolveModal from "./DisputeResolveModal";
import KYCEditModal from "./KYCEditModal";
import AdminSubscriptionModal from "./AdminSubscriptionModal";

const AdminPanel = ({ onBack, onLogout }) => {
  const handleExit = onBack || onLogout;
  const [tab, setTab] = useState("overview");
  const [kycQueue, setKycQueue] = useState([]);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycFilter, setKycFilter] = useState({
    status: "",
    type: "",
    search: "",
  });
  const [editingKyc, setEditingKyc] = useState(null);

  const [portfolioQueue, setPortfolioQueue] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  const [disputesList, setDisputesList] = useState([]);
  const [disputesLoading, setDisputesLoading] = useState(false);

  const [selectedDispute, setSelectedDispute] = useState(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [resolveModalData, setResolveModalData] = useState(null);

  const [platformTxs, setPlatformTxs] = useState([]);
  const [txsLoading, setTxsLoading] = useState(false);

  const [dashboardStats, setDashboardStats] = useState(null);

  const [usersList, setUsersList] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFilters, setUserFilters] = useState({
    search: "",
    role: "",
    plan: "",
  });
  const [subscribingUser, setSubscribingUser] = useState(null);

  // Admin Reviews state
  const [adminReviewsList, setAdminReviewsList] = useState([]);
  const [adminReviewsLoading, setAdminReviewsLoading] = useState(false);
  const [adminReviewFilters, setAdminReviewFilters] = useState({
    rating: "",
    user: "",
    transaction: "",
    date: "",
  });

  // ─── DATA LOADING ──────────────────────────────────────────────────────────

  const getSecureFileUrl = (filePath) => {
    if (!filePath) return "#";
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    const token =
      sessionStorage.getItem("vp_token") ||
      localStorage.getItem("vp_token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("token") ||
      "";
    const backendBase = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
      : "http://localhost:4000";

    const cleanPath = `${backendBase}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
    const separator = cleanPath.includes("?") ? "&" : "?";
    return token ? `${cleanPath}${separator}token=${encodeURIComponent(token)}` : cleanPath;
  };

  const loadKYCQueue = useCallback(
    (filters = kycFilter) => {
      setKycLoading(true);
      const activeFilters = {};
      if (filters.status) activeFilters.status = filters.status;
      if (filters.type) activeFilters.type = filters.type;
      if (filters.search) activeFilters.search = filters.search.trim();

      users.getKYCQueue(activeFilters).then(({ data, error }) => {
        setKycLoading(false);
        if (!error) {
          setKycQueue(data || []);
        }
      });
    },
    [kycFilter]
  );

  const loadPortfolioQueue = useCallback(() => {
    users.getPortfolioQueue().then(({ data, error }) => {
      setPortfolioLoading(false);
      if (!error && data) {
        setPortfolioQueue(data || []);
      }
    });
  }, []);

  const handleApprovePortfolio = (userId) => {
    users.approvePortfolio(userId).then(({ error }) => {
      if (error) {
        alert(error);
      } else {
        alert("Portfolio approved successfully!");
        loadPortfolioQueue();
      }
    });
  };

  const handleRejectPortfolio = (userId) => {
    const reason = prompt("Enter rejection reason for this portfolio link:");
    if (reason === null) return;
    users.rejectPortfolio(userId, reason.trim()).then(({ error }) => {
      if (error) {
        alert(error);
      } else {
        alert("Portfolio rejected.");
        loadPortfolioQueue();
      }
    });
  };

  const loadDisputes = useCallback(() => {
    admin.getDisputes().then(({ data, error }) => {
      setDisputesLoading(false);
      if (!error && data) {
        setDisputesList(data.data || []);
      }
    });
  }, []);

  const loadDashboard = useCallback(() => {
    admin.getDashboard().then(({ data, error }) => {
      if (!error && data) {
        setDashboardStats(data);
      }
    });
  }, []);

  const loadPlatformTransactions = useCallback(() => {
    admin.getTransactions({ limit: 50 }).then(({ data, error }) => {
      setTxsLoading(false);
      if (!error && data) {
        setPlatformTxs(data.data || []);
      }
    });
  }, []);

  const loadUsers = useCallback(
    (filters = userFilters) => {
      setUsersLoading(true);
      const params = { limit: 100 };
      if (filters.search) params.search = filters.search.trim();
      if (filters.role) params.role = filters.role;
      if (filters.plan) params.plan = filters.plan;

      admin.getUsers(params).then(({ data, error }) => {
        setUsersLoading(false);
        if (!error && data) {
          setUsersList(data.data || []);
          setUserStats(data.stats || null);
        }
      });
    },
    [userFilters]
  );

  /*
  const handleImpersonate = async (targetUser) => {
    if (
      !window.confirm(
        `Log in as ${targetUser.name} (${targetUser.email})?\n\nYou will be able to view and interact with their dashboard, and you can return to the Admin Panel anytime.`
      )
    ) {
      return;
    }

    const { data, error } = await admin.impersonateUser(targetUser.id);
    if (error) {
      alert(error);
      return;
    }

    sessionStorage.setItem("vp_admin_token", sessionStorage.getItem("vp_token"));
    sessionStorage.setItem("vp_admin_user", sessionStorage.getItem("vp_user") || "");
    sessionStorage.setItem("vp_token", data.token);
    sessionStorage.setItem("vp_user", JSON.stringify(data.user));
    sessionStorage.setItem("vp_role", (data.user.role || "client").toLowerCase());
    sessionStorage.removeItem("vp_admin_view");

    window.location.replace("/");
  };
  */

  const loadAdminReviews = useCallback((filters = adminReviewFilters) => {
    const activeFilters = {};
    Object.keys(filters).forEach((k) => {
      if (filters[k]) activeFilters[k] = filters[k];
    });
    admin.getReviews(activeFilters).then(({ data, error }) => {
      setAdminReviewsLoading(false);
      if (!error && data) {
        setAdminReviewsList(data || []);
      }
    });
  }, [adminReviewFilters]);

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
    admin.getDispute(id).then(({ data, error }) => {
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
    loadPortfolioQueue();
  }, [
    loadDashboard,
    loadPlatformTransactions,
    loadDisputes,
    loadKYCQueue,
    loadUsers,
    loadAdminReviews,
    loadPortfolioQueue,
  ]);

  useEffect(() => {
    if (tab === "kyc") {
      loadKYCQueue();
    } else if (tab === "portfolios") {
      loadPortfolioQueue();
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
  }, [
    tab,
    loadKYCQueue,
    loadPortfolioQueue,
    loadDisputes,
    loadDashboard,
    loadPlatformTransactions,
    loadUsers,
    loadAdminReviews,
  ]);

  // ── SSE: auto-refresh admin data on relevant events ───────────────────────
  useEffect(() => {
    const offKyc = sseEmitter.on("kyc_update", loadKYCQueue);
    const offDisp = sseEmitter.on("dispute_update", () => {
      loadDisputes();
      loadDashboard();
    });
    const offTx = sseEmitter.on("transaction_update", () => {
      loadPlatformTransactions();
      loadDashboard();
    });
    const offRev = sseEmitter.on("review_update", loadAdminReviews);
    return () => {
      offKyc();
      offDisp();
      offTx();
      offRev();
    };
  }, [loadKYCQueue, loadDisputes, loadDashboard, loadPlatformTransactions, loadAdminReviews]);

  // ─── ACTION HANDLERS ────────────────────────────────────────────────────────

  const handleApprove = (id) => {
    if (
      !window.confirm("Are you sure you want to approve this KYC submission?")
    )
      return;
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
    const reason = window.prompt(
      "Enter rejection reason:",
      "Documents were unclear or expired.",
    );
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

  const handleResetKyc = (id) => {
    if (
      !window.confirm(
        "Reset this KYC submission back to Pending status? The user's tier will be adjusted accordingly."
      )
    )
      return;
    setKycLoading(true);
    users.updateKYCSubmission(id, { status: "pending" }).then(({ error }) => {
      setKycLoading(false);
      if (error) {
        alert(error);
      } else {
        loadKYCQueue();
      }
    });
  };

  const handleDeleteKyc = (id) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this KYC submission? This will also recalculate the user's tier."
      )
    )
      return;
    setKycLoading(true);
    users.deleteKYCSubmission(id).then(({ error }) => {
      setKycLoading(false);
      if (error) {
        alert(error);
      } else {
        loadKYCQueue();
      }
    });
  };

  const handleDeleteUser = async (user) => {
    const confirmMsg = `Are you sure you want to permanently delete user "${user.name || "User"}" (${user.email || "ID: " + user.id})?\n\nThis will completely delete all their transactions, escrow funds, KYC records, and associated data. This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    const { error } = await admin.deleteUser(user.id);
    if (error) {
      alert(error);
    } else {
      alert(`User "${user.name || user.email}" was deleted successfully.`);
      loadUsers();
      loadDashboard();
      loadPlatformTransactions();
    }
  };

  const handleDeleteTransaction = async (tx) => {
    const confirmMsg = `Are you sure you want to permanently delete transaction #${tx.txn_code || tx.id} ("${tx.title || tx.category || "Untitled"}")?\n\nThis will permanently delete this escrow transaction, milestones, submissions, disputes, and related events. This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    const { error } = await admin.deleteTransaction(tx.id);
    if (error) {
      alert(error);
    } else {
      alert(`Transaction #${tx.txn_code || tx.id} deleted successfully.`);
      loadPlatformTransactions();
      loadDashboard();
    }
  };

  const handleMoveToReview = (disputeId) => {
    admin.reviewDispute(disputeId).then(({ error }) => {
      if (error) {
        alert(error);
      } else {
        alert("Dispute moved to under review.");
        loadSingleDispute(disputeId);
        loadDisputes();
      }
    });
  };

  const handleRunAiAnalysis = (disputeId) => {
    setAiAnalysisLoading(true);
    admin.triggerDisputeAiAnalysis(disputeId).then(({ error }) => {
      setAiAnalysisLoading(false);
      if (error) {
        alert(error);
      } else {
        loadSingleDispute(disputeId);
      }
    });
  };

  const handleExecuteResolve = async (params) => {
    if (!selectedDispute) return;
    const { error } = await admin.resolveDispute(selectedDispute.dispute.id, params);
    if (error) {
      throw new Error(error);
    } else {
      alert("Dispute resolved successfully!");
      setResolveModalData(null);
      setSelectedDispute(null);
      loadDisputes();
      loadPlatformTransactions();
      loadDashboard();
    }
  };

  const handleResolveDispute = () => {
    setResolveModalData({
      winner: "buyer",
      reasoning: "",
    });
  };

  // ─── STATS CALCULATIONS ──────────────────────────────────────────────────

  // Prefer live dashboard data; fall back to computed values while loading
  const totalEscrow = dashboardStats
    ? dashboardStats.totalEscrow
    : platformTxs.reduce(
        (sum, tx) => sum + parseFloat(tx.escrow_balance || 0),
        0,
      );
  const activeCount = dashboardStats
    ? dashboardStats.activeTransactions
    : platformTxs.filter(
        (tx) => !["completed", "cancelled"].includes(tx.status),
      ).length;
  const openDisputesCount = dashboardStats
    ? dashboardStats.openDisputes
    : disputesList.filter((d) => d.dispute_status !== "resolved").length;
  const pendingKycCount = dashboardStats
    ? dashboardStats.pendingKYC
    : kycQueue.length;

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
        <div
          style={{
            background: "linear-gradient(135deg,#1e1b4b,#3730a3)",
            color: T.white,
            padding: "0 1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              height: 60,
              gap: 16,
            }}
          >
            <div
              style={{ fontWeight: 800, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
              onClick={() => setSelectedDispute(null)}
            >
              <img
                src="/logo.jpeg"
                alt="Lumbrr"
                style={{
                  height: 34,
                  width: "auto",
                  objectFit: "contain",
                  mixBlendMode: "screen",
                  display: "block",
                }}
              />
              <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 500, background: "rgba(255,255,255,0.12)", padding: "2px 8px", borderRadius: 4 }}>
                Admin / Dispute #{d.id}
              </span>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <button
                onClick={() => setSelectedDispute(null)}
                style={{
                  background: "none",
                  border: "1px solid rgba(255,255,255,.2)",
                  color: "rgba(255,255,255,.6)",
                  padding: "7px 13px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                ← Back to List
              </button>
            </div>
          </div>
        </div>

        <div
          style={{ maxWidth: 1280, margin: "0 auto", padding: "26px 1.5rem" }}
        >
          <button
            onClick={() => setSelectedDispute(null)}
            style={{
              background: "none",
              border: "none",
              color: T.gray500,
              cursor: "pointer",
              fontSize: 14,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: 0,
            }}
          >
            <span className="msym" style={{ fontSize: 18 }}>
              arrow_back
            </span>
            Back to disputes
          </button>

          <div
            className="dg"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: 16,
              alignItems: "start",
            }}
          >
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Dispute Details Card */}
              <div
                style={{
                  background: T.white,
                  border: `1px solid ${T.gray100}`,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: T.primary,
                      margin: 0,
                    }}
                  >
                    Dispute #{d.id} Details
                  </h3>
                  <Badge
                    color={
                      d.status === "resolved"
                        ? T.green
                        : d.status === "under_review"
                          ? "#d97706"
                          : T.red
                    }
                  >
                    {d.status.toUpperCase()}
                  </Badge>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: T.gray400,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        marginBottom: 4,
                      }}
                    >
                      Reason
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: T.primary,
                        fontWeight: 600,
                      }}
                    >
                      {d.reason}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: T.gray400,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        marginBottom: 6,
                      }}
                    >
                      Evidence / Description
                    </div>
                    <EvidenceViewer evidence={d.evidence} />
                  </div>

                  {d.status === "resolved" && (
                    <div
                      style={{
                        background: T.greenLt,
                        border: `1px solid ${T.green}`,
                        borderRadius: 12,
                        padding: "16px",
                        marginTop: 10,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: T.green,
                          marginBottom: 6,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span className="msym" style={{ fontSize: 15 }}>
                          gavel
                        </span>
                        Resolution Decision
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#1b1b1e",
                          lineHeight: 1.7,
                          margin: 0,
                        }}
                      >
                        {d.resolution}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Dispute Resolution Arbitrator Card */}
              <AIDisputeAnalysisCard
                analysis={selectedDispute.ai_analysis}
                history={selectedDispute.ai_history || []}
                loading={aiAnalysisLoading}
                isResolved={d.status === "resolved"}
                onReanalyze={() => handleRunAiAnalysis(d.id)}
                onAdoptRecommendation={(recData) => {
                  setResolveModalData({
                    winner: recData.winner,
                    buyerPercentage: recData.buyerPercentage,
                    sellerPercentage: recData.sellerPercentage,
                    reasoning: recData.reasoning,
                    analysisId: recData.analysisId,
                  });
                }}
              />

              {/* Milestones Card */}
              <div
                style={{
                  background: T.white,
                  border: `1px solid ${T.gray100}`,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: T.primary,
                    marginBottom: 16,
                  }}
                >
                  Escrow Milestones
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {milestones.length === 0 ? (
                    <p style={{ fontSize: 13, color: T.gray500, margin: 0 }}>
                      No milestones generated.
                    </p>
                  ) : (
                    milestones.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          border: `1px solid ${T.gray100}`,
                          borderRadius: 8,
                          padding: "10px 14px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13.5,
                              color: T.primary,
                            }}
                          >
                            {m.title}
                          </div>
                          <div style={{ fontSize: 11.5, color: T.gray400 }}>
                            ID: {m.id}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 13.5,
                              color: T.primary,
                            }}
                          >
                            ${parseFloat(m.amount).toLocaleString()}
                          </span>
                          <SB status={m.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Transaction History Card */}
              <div
                style={{
                  background: T.white,
                  border: `1px solid ${T.gray100}`,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: T.primary,
                    marginBottom: 16,
                  }}
                >
                  Transaction History
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {history.length === 0 ? (
                    <p style={{ fontSize: 13, color: T.gray500, margin: 0 }}>
                      No events logged yet.
                    </p>
                  ) : (
                    history.map((h, i, arr) => (
                      <div key={h.id || i} style={{ display: "flex", gap: 10 }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: T.primary,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9,
                              fontWeight: 700,
                              color: T.white,
                            }}
                          >
                            {arr.length - i}
                          </div>
                          {i < arr.length - 1 && (
                            <div
                              style={{
                                width: 2,
                                flex: 1,
                                minHeight: 12,
                                background: T.gray100,
                                marginTop: 2,
                              }}
                            />
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: T.primary }}>
                          <span style={{ fontWeight: 600 }}>
                            {h.action.replace(/_/g, " ").toUpperCase()}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: T.gray400,
                              marginLeft: 8,
                            }}
                          >
                            {new Date(h.created_at).toLocaleString()}
                          </span>
                          {h.note && (
                            <div
                              style={{
                                fontSize: 12,
                                color: T.gray500,
                                marginTop: 3,
                              }}
                            >
                              {h.note}
                            </div>
                          )}
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
              <div
                style={{
                  background: T.white,
                  border: `1px solid ${T.gray100}`,
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: T.primary,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: 12,
                  }}
                >
                  Financials
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: T.gray500 }}>Transaction Code</span>
                    <span style={{ fontWeight: 600, color: T.primary }}>
                      {t.txn_code}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: T.gray500 }}>Total Value</span>
                    <span style={{ fontWeight: 700, color: T.primary }}>
                      ${parseFloat(t.amount).toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: T.gray500 }}>Escrow Balance</span>
                    <span style={{ fontWeight: 700, color: T.green }}>
                      ${parseFloat(t.escrow_balance).toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: T.gray500 }}>Current Status</span>
                    <SB status={t.status} />
                  </div>
                </div>
              </div>

              {/* Buyer / Seller details */}
              <div
                style={{
                  background: T.white,
                  border: `1px solid ${T.gray100}`,
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: T.primary,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: 12,
                  }}
                >
                  Buyer / Client
                </h3>
                <div
                  style={{
                    fontSize: 13,
                    color: T.primary,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div>
                    <strong>Name:</strong> {buyer.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {buyer.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {buyer.phone || "—"}
                  </div>
                  <div>
                    <strong>Wallet Balance:</strong>{" "}
                    {buyer.wallet
                      ? `$${parseFloat(buyer.wallet.balance).toLocaleString()}`
                      : "No Wallet"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: T.white,
                  border: `1px solid ${T.gray100}`,
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: T.primary,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: 12,
                  }}
                >
                  Seller / Provider
                </h3>
                <div
                  style={{
                    fontSize: 13,
                    color: T.primary,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div>
                    <strong>Name:</strong> {seller.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {seller.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {seller.phone || "—"}
                  </div>
                  <div>
                    <strong>Wallet Balance:</strong>{" "}
                    {seller.wallet
                      ? `$${parseFloat(seller.wallet.balance).toLocaleString()}`
                      : "No Wallet"}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {d.status !== "resolved" && (
                <div
                  style={{
                    background: T.white,
                    border: `1px solid ${T.gray100}`,
                    borderRadius: 16,
                    padding: 20,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: T.primary,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 12,
                    }}
                  >
                    Officer Actions
                  </h3>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {d.status === "filed" && (
                      <Btn
                        variant="purple"
                        style={{ width: "100%", fontSize: 13 }}
                        onClick={() => handleMoveToReview(d.id)}
                      >
                        Move to Under Review
                      </Btn>
                    )}
                    <Btn
                      variant="green"
                      style={{ width: "100%", fontSize: 13 }}
                      onClick={handleResolveDispute}
                    >
                      Resolve Dispute →
                    </Btn>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Final Dispute Resolution Settlement Modal */}
        <DisputeResolveModal
          dispute={d}
          transaction={t}
          aiAnalysis={selectedDispute.ai_analysis}
          initialData={resolveModalData}
          isOpen={!!resolveModalData}
          onClose={() => setResolveModalData(null)}
          onConfirm={handleExecuteResolve}
        />
      </div>
    );
  }

  // ─── MAIN ADMIN PANEL RENDER ──────────────────────────────────────────────

  return (
    <div style={{ background: T.offWhite, minHeight: "100vh" }}>
      <div
        style={{
          background: "linear-gradient(135deg,#1e1b4b,#3730a3)",
          color: T.white,
          padding: "0 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            height: 60,
            gap: 16,
          }}
        >
          <div
            style={{ fontWeight: 800, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
            onClick={handleExit}
          >
            <img
              src="/logo.jpeg"
              alt="Lumbrr"
              style={{
                height: 36,
                width: "auto",
                objectFit: "contain",
                mixBlendMode: "screen",
                display: "block",
              }}
            />
            <span style={{ fontSize: 11, background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 6, padding: "3px 8px", fontWeight: 700 }}>
              Admin
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 0,
              marginLeft: 12,
              overflowX: "auto",
            }}
          >
            {[
              ["overview", "Overview"],
              ["transactions", "All Transactions"],
              ["disputes", "Disputes"],
              ["users", "Users"],
              ["kyc", `KYC Queue (${kycQueue.length})`],
              ["portfolios", `Portfolios (${portfolioQueue.length})`],
              ["reviews", "Reviews"],
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 13px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: tab === k ? T.gold : "rgba(255,255,255,.55)",
                  borderBottom:
                    tab === k ? `2px solid ${T.gold}` : "2px solid transparent",
                  transition: "all .15s",
                  whiteSpace: "nowrap",
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={handleExit}
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,.2)",
                color: "rgba(255,255,255,.6)",
                padding: "7px 13px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              ← Exit Admin
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "26px 1.5rem" }}>
        <div
          className="g4"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
            marginBottom: 26,
          }}
        >
          {[
            {
              l: "Total in Escrow",
              v: `$${totalEscrow.toLocaleString()}`,
              i: "lock",
              c: T.green,
            },
            {
              l: "Active Transactions",
              v: `${activeCount}`,
              i: "bolt",
              c: "#3b82f6",
            },
            {
              l: "Open Disputes",
              v: `${openDisputesCount}`,
              i: "gavel",
              c: T.red,
            },
            {
              l: "Pending KYC",
              v: `${pendingKycCount}`,
              i: "badge",
              c: T.accent,
            },
          ].map((c) => (
            <div
              key={c.l}
              style={{
                background: T.white,
                border: `1px solid ${T.gray100}`,
                borderRadius: 14,
                padding: "17px 19px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.gray400,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: 5,
                  }}
                >
                  {c.l}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: T.primary,
                    fontFamily: "'Inter',sans-serif",
                  }}
                >
                  {c.v}
                </div>
              </div>
              <div
                style={{
                  width: 42,
                  height: 42,
                  background: c.c + "18",
                  borderRadius: 11,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="msym" style={{ fontSize: 20, color: c.c }}>
                  {c.i}
                </span>
              </div>
            </div>
          ))}
        </div>

        {(tab === "overview" || tab === "transactions") && (
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.gray100}`,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 22px",
                borderBottom: `1px solid ${T.gray100}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: T.primary }}>
                All Platform Transactions
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              {txsLoading ? (
                <p style={{ padding: 20, fontSize: 14, color: T.gray500 }}>
                  Loading transactions...
                </p>
              ) : platformTxs.length === 0 ? (
                <p style={{ padding: 20, fontSize: 14, color: T.gray500 }}>
                  No transactions on the platform.
                </p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 600,
                  }}
                >
                  <thead>
                    <tr style={{ background: T.offWhite }}>
                      {[
                        "Transaction",
                        "Parties",
                        "Category",
                        "Value",
                        "Status",
                        "Flagged",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 14px",
                            textAlign: "left",
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: T.gray500,
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                            borderBottom: `1px solid ${T.gray100}`,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {platformTxs.map((r, i) => (
                      <tr
                        key={r.id}
                        className="tr"
                        style={{
                          borderBottom:
                            i < platformTxs.length - 1
                              ? `1px solid ${T.gray100}`
                              : "none",
                        }}
                      >
                        <td
                          style={{
                            padding: "12px 14px",
                            fontWeight: 600,
                            fontSize: 13.5,
                            color: T.primary,
                          }}
                        >
                          {r.txn_code}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: 13,
                            color: T.gray700,
                          }}
                        >
                          {r.buyer_name || r.buyer_email} vs{" "}
                          {r.seller_name || r.seller_email}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: T.teal,
                              background: T.tealLt,
                              padding: "3px 8px",
                              borderRadius: 5,
                            }}
                          >
                            {CATS.find((c) => c.id === r.category)?.label ||
                              r.category}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontWeight: 700,
                            color: T.primary,
                            fontFamily: "'Inter',sans-serif",
                          }}
                        >
                          ${parseFloat(r.amount).toLocaleString()}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <SB status={r.status} />
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {r.status === "disputed" ? (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: T.red,
                                background: "#fff5f5",
                                padding: "3px 8px",
                                borderRadius: 5,
                              }}
                            >
                              warning Disputed
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: T.gray400 }}>
                              —
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <button
                            onClick={() => handleDeleteTransaction(r)}
                            title="Delete Transaction"
                            style={{
                              background: "#fee2e2",
                              border: "1px solid #fca5a5",
                              color: T.red,
                              borderRadius: 6,
                              padding: "5px 10px",
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              transition: "all .15s",
                              whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#fecaca";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#fee2e2";
                            }}
                          >
                            <span className="msym" style={{ fontSize: 14 }}>
                              delete
                            </span>
                            Delete
                          </button>
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
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.gray100}`,
              borderRadius: 16,
              padding: "26px",
            }}
          >
            <h2
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: 20,
                color: T.primary,
                marginBottom: 16,
              }}
            >
              Dispute Resolution Queue
            </h2>

            {disputesLoading ? (
              <p style={{ fontSize: 14, color: T.gray500 }}>
                Loading disputes...
              </p>
            ) : disputesList.length === 0 ? (
              <p style={{ fontSize: 14, color: T.gray500 }}>
                No active disputes in the queue.
              </p>
            ) : (
              disputesList.map((d) => (
                <div
                  key={d.dispute_id}
                  style={{
                    border: `1.5px solid #fecaca`,
                    borderRadius: 12,
                    padding: "18px 20px",
                    background: "#fff5f5",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: T.red,
                        marginBottom: 4,
                      }}
                    >
                      {d.txn_code} — {d.transaction_title}
                    </div>
                    <div style={{ fontSize: 13, color: T.gray500 }}>
                      {d.buyer_name} vs {d.seller_name} · $
                      {parseFloat(d.transaction_amount).toLocaleString()} ·
                      Filed{" "}
                      {new Date(d.dispute_created_at).toLocaleDateString()}
                    </div>
                    <div
                      style={{ fontSize: 12.5, color: T.gray400, marginTop: 6 }}
                    >
                      Reason: {d.reason} | Status:{" "}
                      <span style={{ fontWeight: 700 }}>
                        {d.dispute_status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn
                      variant="outline"
                      style={{ fontSize: 13 }}
                      onClick={() => loadSingleDispute(d.dispute_id)}
                    >
                      Review →
                    </Btn>
                  </div>
                </div>
              ))
            )}

            <div
              style={{
                marginTop: 20,
                background: T.offWhite,
                borderRadius: 12,
                padding: "18px",
                fontSize: 13.5,
                color: T.gray600,
                lineHeight: 1.75,
              }}
            >
              <strong>Dispute Workflow:</strong> AI case summary generated →
              Both parties notified → Evidence window (48h) → Officer review →
              Binding decision within 5 days → Refund or payment release
              executed.
            </div>
          </div>
        )}

        {tab === "users" && (
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.gray100}`,
              borderRadius: 16,
              padding: "26px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: 20,
                    fontWeight: 800,
                    color: T.primary,
                    marginBottom: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span className="msym" style={{ color: T.accent, fontSize: 24 }}>
                    manage_accounts
                  </span>
                  User Management & Subscriptions
                </h2>
                <p style={{ color: T.gray500, fontSize: 13.5, margin: 0 }}>
                  View all registered accounts, manage KYC levels, and grant or modify member subscription plans.
                </p>
              </div>

              <Btn
                variant="outline"
                style={{
                  fontSize: 12.5,
                  padding: "7px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onClick={() => loadUsers()}
              >
                <span className="msym" style={{ fontSize: 16 }}>
                  refresh
                </span>
                Refresh
              </Btn>
            </div>

            {/* Summary Stat Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {[
                {
                  l: "Total Users",
                  v: userStats ? userStats.totalUsers.toLocaleString() : "—",
                  i: "group",
                  color: T.primary,
                  bg: T.offWhite,
                },
                {
                  l: "Clients",
                  v: userStats ? userStats.totalClients.toLocaleString() : "—",
                  i: "person",
                  color: "#2563eb",
                  bg: "#eff6ff",
                },
                {
                  l: "Providers",
                  v: userStats ? userStats.totalProviders.toLocaleString() : "—",
                  i: "handyman",
                  color: "#4f46e5",
                  bg: "#eef2ff",
                },
                {
                  l: "Subscribed (Paid)",
                  v: userStats ? (userStats.totalSubscribed || 0).toLocaleString() : "—",
                  sub: userStats
                    ? `${userStats.totalSilver || 0} Silver · ${userStats.totalGold || 0} Gold · ${userStats.totalDiamond || 0} Diamond`
                    : null,
                  i: "workspace_premium",
                  color: "#d97706",
                  bg: "#fffbeb",
                },
                {
                  l: "KYC Verified",
                  v: userStats ? userStats.verifiedUsers.toLocaleString() : "—",
                  i: "verified_user",
                  color: "#16a34a",
                  bg: "#f0fdf4",
                },
              ].map((u) => (
                <div
                  key={u.l}
                  style={{
                    background: u.bg,
                    border: `1px solid ${T.gray200}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: u.color, textTransform: "uppercase", letterSpacing: ".04em" }}>
                      {u.l}
                    </span>
                    <span className="msym" style={{ fontSize: 18, color: u.color, opacity: 0.85 }}>
                      {u.i}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontWeight: 800,
                      fontSize: 22,
                      color: u.color,
                    }}
                  >
                    {u.v}
                  </div>
                  {u.sub && (
                    <div style={{ fontSize: 10.5, color: T.gray500, marginTop: 4, fontWeight: 500 }}>
                      {u.sub}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Filter & Search Bar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
                background: T.offWhite,
                padding: "12px 16px",
                borderRadius: 12,
                border: `1px solid ${T.gray200}`,
                marginBottom: 20,
              }}
            >
              {/* Search Box */}
              <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
                <span
                  className="msym"
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16,
                    color: T.gray400,
                  }}
                >
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={userFilters.search}
                  onChange={(e) => {
                    const next = { ...userFilters, search: e.target.value };
                    setUserFilters(next);
                    loadUsers(next);
                  }}
                  style={{
                    ...fs,
                    paddingLeft: 32,
                    paddingTop: 7,
                    paddingBottom: 7,
                    fontSize: 13,
                    width: "100%",
                    borderRadius: 8,
                    background: T.white,
                  }}
                />
              </div>

              {/* Role Select */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.gray500 }}>Role:</span>
                <select
                  value={userFilters.role}
                  onChange={(e) => {
                    const next = { ...userFilters, role: e.target.value };
                    setUserFilters(next);
                    loadUsers(next);
                  }}
                  style={{
                    ...fs,
                    fontSize: 12.5,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: T.white,
                    width: "auto",
                  }}
                >
                  <option value="">All Roles</option>
                  <option value="client">Client</option>
                  <option value="provider">Provider</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Subscription Plan Select */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.gray500 }}>Plan:</span>
                <select
                  value={userFilters.plan}
                  onChange={(e) => {
                    const next = { ...userFilters, plan: e.target.value };
                    setUserFilters(next);
                    loadUsers(next);
                  }}
                  style={{
                    ...fs,
                    fontSize: 12.5,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: T.white,
                    width: "auto",
                  }}
                >
                  <option value="">All Plans</option>
                  <option value="diamond">Diamond (Tier 4)</option>
                  <option value="gold">Gold (Tier 3)</option>
                  <option value="silver">Silver (Tier 2)</option>
                  <option value="free">Free / None</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(userFilters.search || userFilters.role || userFilters.plan) && (
                <button
                  onClick={() => {
                    const reset = { search: "", role: "", plan: "" };
                    setUserFilters(reset);
                    loadUsers(reset);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: T.red,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 8px",
                  }}
                >
                  <span className="msym" style={{ fontSize: 15 }}>
                    close
                  </span>
                  Clear Filters
                </button>
              )}
            </div>

            {/* Loading / Users Table */}
            {usersLoading && usersList.length === 0 && (
              <p style={{ fontSize: 14, color: T.gray500, margin: "20px 0", textAlign: "center" }}>
                Loading users...
              </p>
            )}

            {!usersLoading && usersList.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  background: T.offWhite,
                  borderRadius: 12,
                  border: `1px dashed ${T.gray200}`,
                }}
              >
                <span className="msym" style={{ fontSize: 32, color: T.gray400, marginBottom: 6, display: "block" }}>
                  person_search
                </span>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.primary }}>
                  No users found matching your filters.
                </div>
              </div>
            )}

            {usersList.length > 0 && (
              <div style={{ marginTop: 10, overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 800,
                  }}
                >
                  <thead>
                    <tr style={{ background: T.offWhite }}>
                      {[
                        "User",
                        "Role",
                        "KYC Status",
                        "Subscription Plan",
                        "Wallet Balance",
                        "Joined",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "11px 14px",
                            textAlign: "left",
                            fontSize: 11,
                            fontWeight: 700,
                            color: T.gray500,
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                            borderBottom: `1px solid ${T.gray200}`,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u, i) => {
                      const planMeta = {
                        diamond: {
                          name: "Diamond",
                          bg: "#faf5ff",
                          border: "#d8b4fe",
                          color: "#7c3aed",
                          icon: "diamond",
                        },
                        gold: {
                          name: "Gold",
                          bg: "#fffbeb",
                          border: "#fde68a",
                          color: "#d97706",
                          icon: "workspace_premium",
                        },
                        silver: {
                          name: "Silver",
                          bg: "#f1f5f9",
                          border: "#cbd5e1",
                          color: "#475569",
                          icon: "stars",
                        },
                      }[u.subscription_plan?.toLowerCase()] || null;

                      const isSubActive = u.subscription_status === "active";

                      return (
                        <tr
                          key={u.id}
                          style={{
                            borderBottom:
                              i < usersList.length - 1
                                ? `1px solid ${T.gray100}`
                                : "none",
                            transition: "background .15s",
                          }}
                        >
                          {/* User info */}
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: T.primary }}>
                              {u.name}
                            </div>
                            <div style={{ fontSize: 12, color: T.gray500 }}>
                              {u.email}
                            </div>
                          </td>

                          {/* Role */}
                          <td style={{ padding: "12px 14px" }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                background:
                                  u.role === "admin"
                                    ? T.accent + "18"
                                    : T.primary + "12",
                                color: u.role === "admin" ? T.accent : T.primary,
                                padding: "3px 8px",
                                borderRadius: 5,
                                textTransform: "capitalize",
                              }}
                            >
                              {u.role}
                            </span>
                          </td>

                          {/* KYC Status */}
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color:
                                    u.kyc_status === "approved"
                                      ? T.green
                                      : u.kyc_status === "rejected"
                                        ? T.red
                                        : T.gray500,
                                }}
                              >
                                {u.kyc_status ? u.kyc_status.toUpperCase() : "NONE"}
                              </span>
                              {u.kyc_tier !== undefined && (
                                <span style={{ fontSize: 10.5, color: T.gray400 }}>
                                  Tier {u.kyc_tier || 1}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Subscription Plan Column */}
                          <td style={{ padding: "12px 14px" }}>
                            {planMeta && isSubActive ? (
                              <div style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    fontSize: 11.5,
                                    fontWeight: 800,
                                    padding: "3px 9px",
                                    borderRadius: 14,
                                    background: planMeta.bg,
                                    color: planMeta.color,
                                    border: `1px solid ${planMeta.border}`,
                                    width: "fit-content",
                                  }}
                                >
                                  <span className="msym" style={{ fontSize: 13 }}>
                                    {planMeta.icon}
                                  </span>
                                  {planMeta.name}
                                </span>
                                <span style={{ fontSize: 10.5, color: T.gray500, paddingLeft: 4 }}>
                                  Active · {u.subscription_billing_cycle || "monthly"}
                                </span>
                              </div>
                            ) : u.subscription_plan && !isSubActive ? (
                              <div style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: "2px 7px",
                                    borderRadius: 6,
                                    background: T.gray100,
                                    color: T.gray600,
                                    width: "fit-content",
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {u.subscription_plan} ({u.subscription_status || "inactive"})
                                </span>
                              </div>
                            ) : (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: "2px 8px",
                                  borderRadius: 6,
                                  background: T.offWhite,
                                  color: T.gray500,
                                  border: `1px solid ${T.gray200}`,
                                }}
                              >
                                Free
                              </span>
                            )}
                          </td>

                          {/* Wallet Balance */}
                          <td
                            style={{
                              padding: "12px 14px",
                              fontWeight: 700,
                              color: T.primary,
                              fontFamily: "'Inter',sans-serif",
                              fontSize: 13,
                            }}
                          >
                            ${parseFloat(u.wallet_balance).toLocaleString()}
                          </td>

                          {/* Joined Date */}
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: 12,
                              color: T.gray500,
                            }}
                          >
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>

                          {/* Actions Column */}
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
                              <Btn
                                variant="outline"
                                style={{
                                  fontSize: 11.5,
                                  padding: "6px 12px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  whiteSpace: "nowrap",
                                }}
                                onClick={() => setSubscribingUser(u)}
                              >
                                <span className="msym" style={{ fontSize: 15, color: isSubActive ? "#d97706" : T.accent }}>
                                  card_membership
                                </span>
                                {isSubActive ? "Manage Plan" : "Subscribe"}
                              </Btn>
                              {u.role !== "admin" && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  title="Delete User"
                                  style={{
                                    background: "#fee2e2",
                                    border: "1px solid #fca5a5",
                                    color: T.red,
                                    borderRadius: 8,
                                    padding: "6px 10px",
                                    fontSize: 11.5,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    transition: "all .15s",
                                    whiteSpace: "nowrap",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#fecaca";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#fee2e2";
                                  }}
                                >
                                  <span className="msym" style={{ fontSize: 14 }}>
                                    delete
                                  </span>
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "kyc" && (
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.gray100}`,
              borderRadius: 16,
              padding: "26px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: 20,
                    fontWeight: 800,
                    color: T.primary,
                    marginBottom: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    className="msym"
                    style={{ color: T.accent, fontSize: 24 }}
                  >
                    verified_user
                  </span>
                  KYC Verification & Submissions
                </h2>
                <p style={{ color: T.gray500, fontSize: 13.5, margin: 0 }}>
                  Manage, review, edit, and audit all identity and business KYC submissions across all statuses.
                </p>
              </div>

              <Btn
                variant="outline"
                style={{
                  fontSize: 12.5,
                  padding: "7px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onClick={() => loadKYCQueue()}
              >
                <span className="msym" style={{ fontSize: 16 }}>
                  refresh
                </span>
                Refresh
              </Btn>
            </div>

            {/* Summary Stat Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                marginBottom: 22,
              }}
            >
              {[
                {
                  key: "",
                  label: "All Submissions",
                  count: kycQueue.length,
                  icon: "folder_shared",
                  bg: T.offWhite,
                  border: T.gray200,
                  color: T.primary,
                  active: kycFilter.status === "",
                },
                {
                  key: "pending",
                  label: "Pending Review",
                  count: kycQueue.filter((k) => k.status === "pending").length,
                  icon: "hourglass_top",
                  bg: "#fffbeb",
                  border: "#fde68a",
                  color: "#b45309",
                  active: kycFilter.status === "pending",
                },
                {
                  key: "approved",
                  label: "Approved",
                  count: kycQueue.filter((k) => k.status === "approved").length,
                  icon: "verified",
                  bg: "#f0fdf4",
                  border: "#bbf7d0",
                  color: "#15803d",
                  active: kycFilter.status === "approved",
                },
                {
                  key: "rejected",
                  label: "Rejected",
                  count: kycQueue.filter((k) => k.status === "rejected").length,
                  icon: "cancel",
                  bg: "#fef2f2",
                  border: "#fecaca",
                  color: "#b91c1c",
                  active: kycFilter.status === "rejected",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  onClick={() => {
                    const next = { ...kycFilter, status: stat.key };
                    setKycFilter(next);
                    loadKYCQueue(next);
                  }}
                  style={{
                    background: stat.bg,
                    border: `1.5px solid ${stat.active ? stat.color : stat.border}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    cursor: "pointer",
                    transition: "all .15s ease",
                    boxShadow: stat.active ? `0 0 0 2px ${stat.border}` : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: stat.color,
                        textTransform: "uppercase",
                        letterSpacing: ".04em",
                      }}
                    >
                      {stat.label}
                    </span>
                    <span
                      className="msym"
                      style={{ fontSize: 18, color: stat.color, opacity: 0.85 }}
                    >
                      {stat.icon}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: stat.color,
                    }}
                  >
                    {stat.count}
                  </div>
                </div>
              ))}
            </div>

            {/* Filter & Search Bar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
                background: T.offWhite,
                padding: "12px 16px",
                borderRadius: 12,
                border: `1px solid ${T.gray200}`,
                marginBottom: 20,
              }}
            >
              {/* Search Box */}
              <div
                style={{
                  position: "relative",
                  flex: "1 1 240px",
                  minWidth: 200,
                }}
              >
                <span
                  className="msym"
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16,
                    color: T.gray400,
                  }}
                >
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search name, email, phone, biz..."
                  value={kycFilter.search}
                  onChange={(e) => {
                    const next = { ...kycFilter, search: e.target.value };
                    setKycFilter(next);
                    loadKYCQueue(next);
                  }}
                  style={{
                    ...fs,
                    paddingLeft: 32,
                    paddingTop: 7,
                    paddingBottom: 7,
                    fontSize: 13,
                    width: "100%",
                    borderRadius: 8,
                    background: T.white,
                  }}
                />
              </div>

              {/* Status Select */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: T.gray500,
                  }}
                >
                  Status:
                </span>
                <select
                  value={kycFilter.status}
                  onChange={(e) => {
                    const next = { ...kycFilter, status: e.target.value };
                    setKycFilter(next);
                    loadKYCQueue(next);
                  }}
                  style={{
                    ...fs,
                    fontSize: 12.5,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: T.white,
                    width: "auto",
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Type Select */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: T.gray500,
                  }}
                >
                  Type:
                </span>
                <select
                  value={kycFilter.type}
                  onChange={(e) => {
                    const next = { ...kycFilter, type: e.target.value };
                    setKycFilter(next);
                    loadKYCQueue(next);
                  }}
                  style={{
                    ...fs,
                    fontSize: 12.5,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: T.white,
                    width: "auto",
                  }}
                >
                  <option value="">All Types</option>
                  <option value="govt_id">Govt ID (Tier 2)</option>
                  <option value="business">Business / CAC (Tier 3)</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(kycFilter.status || kycFilter.type || kycFilter.search) && (
                <button
                  onClick={() => {
                    const reset = { status: "", type: "", search: "" };
                    setKycFilter(reset);
                    loadKYCQueue(reset);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: T.red,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 8px",
                  }}
                >
                  <span className="msym" style={{ fontSize: 15 }}>
                    close
                  </span>
                  Clear Filters
                </button>
              )}
            </div>

            {/* Loading State */}
            {kycLoading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: T.gray500,
                  fontSize: 14,
                }}
              >
                <span
                  className="msym"
                  style={{
                    fontSize: 24,
                    animation: "spin 1s linear infinite",
                    display: "inline-block",
                    marginBottom: 8,
                  }}
                >
                  progress_activity
                </span>
                <div>Loading KYC submissions...</div>
              </div>
            )}

            {/* Empty State */}
            {!kycLoading && kycQueue.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 20px",
                  background: T.offWhite,
                  borderRadius: 12,
                  border: `1px dashed ${T.gray200}`,
                }}
              >
                <span
                  className="msym"
                  style={{
                    fontSize: 36,
                    color: T.gray400,
                    marginBottom: 8,
                    display: "block",
                  }}
                >
                  assignment_late
                </span>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: T.primary,
                    marginBottom: 4,
                  }}
                >
                  No KYC submissions found
                </div>
                <div style={{ fontSize: 13, color: T.gray500 }}>
                  {kycFilter.status || kycFilter.type || kycFilter.search
                    ? "Try adjusting or clearing your filters above."
                    : "There are currently no KYC submissions in the system."}
                </div>
              </div>
            )}

            {/* KYC List */}
            {!kycLoading &&
              kycQueue.map((u, i) => {
                const statusMeta =
                  {
                    pending: {
                      label: "Pending Review",
                      bg: "#fef3c7",
                      color: "#92400e",
                      border: "#fcd34d",
                      icon: "hourglass_top",
                      cardBorder: "#f59e0b",
                    },
                    approved: {
                      label: "Approved",
                      bg: "#d1fae5",
                      color: "#065f46",
                      border: "#6ee7b7",
                      icon: "check_circle",
                      cardBorder: "#10b981",
                    },
                    rejected: {
                      label: "Rejected",
                      bg: "#fee2e2",
                      color: "#991b1b",
                      border: "#fca5a5",
                      icon: "cancel",
                      cardBorder: "#ef4444",
                    },
                  }[u.status || "pending"] || {
                    label: u.status,
                    bg: T.gray100,
                    color: T.gray600,
                    border: T.gray200,
                    icon: "help_outline",
                    cardBorder: T.gray300,
                  };

                const isBiz =
                  u.submission_type === "business" ||
                  !!u.biz_name ||
                  !!u.biz_file;

                return (
                  <div
                    key={u.id || i}
                    style={{
                      border: `1px solid ${T.gray200}`,
                      borderLeft: `5px solid ${statusMeta.cardBorder}`,
                      borderRadius: 12,
                      padding: "16px 20px",
                      marginBottom: 14,
                      background: T.white,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                      transition: "box-shadow .15s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      {/* Left: User & Submission Details */}
                      <div style={{ flex: "1 1 400px" }}>
                        {/* Top user row */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: 15,
                              color: T.primary,
                            }}
                          >
                            {u.user_name || "Unknown User"}
                          </span>
                          <span style={{ fontSize: 13, color: T.gray500 }}>
                            ({u.user_email || "no-email"})
                          </span>

                          {/* Status Badge */}
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 11.5,
                              fontWeight: 700,
                              padding: "2px 9px",
                              borderRadius: 20,
                              background: statusMeta.bg,
                              color: statusMeta.color,
                              border: `1px solid ${statusMeta.border}`,
                            }}
                          >
                            <span className="msym" style={{ fontSize: 13 }}>
                              {statusMeta.icon}
                            </span>
                            {statusMeta.label}
                          </span>

                          {/* Type Badge */}
                          <Badge color={isBiz ? T.accent : T.primary}>
                            {isBiz ? "Business (Tier 3)" : "Govt ID (Tier 2)"}
                          </Badge>

                          {/* Current Tier */}
                          {u.current_tier !== undefined && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                background: T.offWhite,
                                color: T.gray600,
                                padding: "2px 7px",
                                borderRadius: 6,
                                border: `1px solid ${T.gray200}`,
                              }}
                            >
                              User Tier {u.current_tier}
                            </span>
                          )}
                        </div>

                        {/* Metadata line */}
                        <div
                          style={{
                            fontSize: 12.5,
                            color: T.gray500,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 12,
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <span>
                            <strong>Phone:</strong> {u.phone || "—"}
                          </span>
                          <span>•</span>
                          <span>
                            <strong>Submitted:</strong>{" "}
                            {u.created_at
                              ? new Date(u.created_at).toLocaleString()
                              : "—"}
                          </span>
                          {u.reviewed_at && (
                            <>
                              <span>•</span>
                              <span>
                                <strong>Reviewed:</strong>{" "}
                                {new Date(u.reviewed_at).toLocaleDateString()}
                                {u.reviewer_name ? ` by ${u.reviewer_name}` : ""}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Identity or Business Details */}
                        <div
                          style={{
                            fontSize: 12.5,
                            color: T.gray700,
                            background: T.offWhite,
                            padding: "8px 12px",
                            borderRadius: 8,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 14,
                            marginBottom: 8,
                          }}
                        >
                          {isBiz ? (
                            <>
                              <div>
                                <span style={{ color: T.gray500 }}>Biz Name: </span>
                                <strong>{u.biz_name || "—"}</strong>
                              </div>
                              <div>
                                <span style={{ color: T.gray500 }}>
                                  CAC / Reg No:{" "}
                                </span>
                                <strong>{u.biz_reg || "—"}</strong>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <span style={{ color: T.gray500 }}>ID Type: </span>
                                <strong>
                                  {u.id_type
                                    ? u.id_type.replace(/_/g, " ").toUpperCase()
                                    : "National ID"}
                                </strong>
                              </div>
                              <div>
                                <span style={{ color: T.gray500 }}>
                                  ID Number:{" "}
                                </span>
                                <strong>{u.id_number || "—"}</strong>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Rejection Reason Banner */}
                        {u.status === "rejected" && u.rejection_reason && (
                          <div
                            style={{
                              background: "#fef2f2",
                              border: "1px solid #fecaca",
                              borderRadius: 8,
                              padding: "8px 12px",
                              fontSize: 12.5,
                              color: "#991b1b",
                              marginBottom: 8,
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 6,
                            }}
                          >
                            <span
                              className="msym"
                              style={{ fontSize: 16, marginTop: 1 }}
                            >
                              error
                            </span>
                            <div>
                              <strong>Rejection Reason:</strong>{" "}
                              {u.rejection_reason}
                            </div>
                          </div>
                        )}

                        {/* Document Links */}
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 12,
                            fontSize: 12,
                          }}
                        >
                          {u.id_file && (
                            <a
                              href={getSecureFileUrl(u.id_file)}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: T.accent,
                                fontWeight: 600,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                textDecoration: "none",
                              }}
                            >
                              <span className="msym" style={{ fontSize: 14 }}>
                                badge
                              </span>
                              View ID Doc ↗
                            </a>
                          )}
                          {u.selfie_file && (
                            <a
                              href={getSecureFileUrl(u.selfie_file)}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: T.accent,
                                fontWeight: 600,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                textDecoration: "none",
                              }}
                            >
                              <span className="msym" style={{ fontSize: 14 }}>
                                face
                              </span>
                              View Selfie ↗
                            </a>
                          )}
                          {u.biz_file && (
                            <a
                              href={getSecureFileUrl(u.biz_file)}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: T.accent,
                                fontWeight: 600,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                textDecoration: "none",
                              }}
                            >
                              <span className="msym" style={{ fontSize: 14 }}>
                                business
                              </span>
                              View Business Doc ↗
                            </a>
                          )}
                          {u.incorp_file && (
                            <a
                              href={getSecureFileUrl(u.incorp_file)}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: T.accent,
                                fontWeight: 600,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                textDecoration: "none",
                              }}
                            >
                              <span className="msym" style={{ fontSize: 14 }}>
                                description
                              </span>
                              View Incorp Cert ↗
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions Toolbar */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          minWidth: 140,
                          alignItems: "stretch",
                        }}
                      >
                        {/* Edit Button - Always visible for any KYC */}
                        <Btn
                          variant="outline"
                          style={{
                            fontSize: 12,
                            padding: "7px 12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 5,
                          }}
                          onClick={() => setEditingKyc(u)}
                        >
                          <span className="msym" style={{ fontSize: 14 }}>
                            edit
                          </span>
                          Edit Details
                        </Btn>

                        {/* Quick Approve Button */}
                        {u.status !== "approved" && (
                          <Btn
                            variant="green"
                            style={{
                              fontSize: 12,
                              padding: "7px 12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 5,
                            }}
                            onClick={() => handleApprove(u.id)}
                          >
                            <span className="msym" style={{ fontSize: 14 }}>
                              check
                            </span>
                            {u.status === "rejected" ? "Re-Approve" : "Approve"}
                          </Btn>
                        )}

                        {/* Quick Reject Button */}
                        {u.status !== "rejected" && (
                          <Btn
                            variant="red"
                            style={{
                              fontSize: 12,
                              padding: "7px 12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 5,
                            }}
                            onClick={() => handleReject(u.id)}
                          >
                            <span className="msym" style={{ fontSize: 14 }}>
                              close
                            </span>
                            Reject
                          </Btn>
                        )}

                        {/* Reset to Pending Button */}
                        {u.status !== "pending" && (
                          <button
                            onClick={() => handleResetKyc(u.id)}
                            style={{
                              background: "none",
                              border: `1px solid ${T.gray300}`,
                              borderRadius: 8,
                              color: T.gray600,
                              fontSize: 11.5,
                              fontWeight: 600,
                              padding: "6px 10px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 4,
                            }}
                            title="Reset status back to Pending"
                          >
                            <span className="msym" style={{ fontSize: 14 }}>
                              restart_alt
                            </span>
                            Reset to Pending
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteKyc(u.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: T.red,
                            fontSize: 11.5,
                            fontWeight: 600,
                            padding: "4px 8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                            opacity: 0.8,
                          }}
                          title="Permanently delete this submission"
                        >
                          <span className="msym" style={{ fontSize: 14 }}>
                            delete
                          </span>
                          Delete Submission
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {tab === "portfolios" && (
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.gray100}`,
              borderRadius: 16,
              padding: "26px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: 20,
                    color: T.primary,
                    margin: "0 0 4px",
                  }}
                >
                  Portfolio Reviews Queue ({portfolioQueue.length})
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: T.gray500 }}>
                  Review vendor portfolio websites, GitHub links, and work samples before verifying ownership.
                </p>
              </div>
              <Btn
                variant="outline"
                style={{ fontSize: 12 }}
                onClick={loadPortfolioQueue}
              >
                Refresh Queue
              </Btn>
            </div>

            {portfolioLoading && (
              <p style={{ color: T.gray400, fontSize: 13 }}>
                Loading pending portfolio submissions...
              </p>
            )}

            {!portfolioLoading && portfolioQueue.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  background: "#f9f9fb",
                  borderRadius: 12,
                  border: `1px solid ${T.gray100}`,
                }}
              >
                <span
                  className="msym"
                  style={{ fontSize: 36, color: "#16a34a", display: "block", marginBottom: 8 }}
                >
                  check_circle
                </span>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: T.primary }}>
                  All portfolio reviews are complete!
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12.5, color: T.gray500 }}>
                  There are no pending vendor portfolio submissions awaiting review.
                </p>
              </div>
            )}

            {!portfolioLoading &&
              portfolioQueue.map((u) => (
                <div
                  key={u.id}
                  style={{
                    border: `1px solid ${T.gray100}`,
                    borderRadius: 10,
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    flexWrap: "wrap",
                    gap: 12,
                    background: "#fbfcfe",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14.5,
                        color: T.primary,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {u.name}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: T.gray500,
                          background: "#f1f5f9",
                          padding: "2px 8px",
                          borderRadius: 12,
                        }}
                      >
                        {u.role || "Vendor"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: T.gray500, marginTop: 3 }}>
                      {u.email} {u.phone ? `· Phone: ${u.phone}` : ""}
                      {u.submitted_at && ` · Submitted ${new Date(u.submitted_at).toLocaleString()}`}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <a
                        href={u.portfolio_url?.startsWith("http") ? u.portfolio_url : `https://${u.portfolio_url}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#2563eb",
                          textDecoration: "underline",
                          background: "#eff6ff",
                          padding: "4px 10px",
                          borderRadius: 6,
                          border: "1px solid #dbeafe",
                        }}
                      >
                        <span className="msym" style={{ fontSize: 15 }}>
                          open_in_new
                        </span>
                        {u.portfolio_url}
                      </a>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Btn
                      variant="green"
                      style={{ fontSize: 12, padding: "8px 16px" }}
                      onClick={() => handleApprovePortfolio(u.id)}
                    >
                      ✓ Approve Portfolio
                    </Btn>
                    <Btn
                      variant="red"
                      style={{ fontSize: 12, padding: "8px 16px" }}
                      onClick={() => handleRejectPortfolio(u.id)}
                    >
                      ✕ Reject
                    </Btn>
                  </div>
                </div>
              ))}
          </div>
        )}

        {tab === "reviews" && (
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.gray100}`,
              borderRadius: 16,
              padding: "26px",
            }}
          >
            <h2
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: 20,
                color: T.primary,
                marginBottom: 16,
              }}
            >
              Reviews & Ratings
            </h2>

            {/* Filter Bar */}
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 20,
                alignItems: "flex-end",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label
                  style={{ fontSize: 11, fontWeight: 700, color: T.gray400 }}
                >
                  RATING
                </label>
                <select
                  value={adminReviewFilters.rating}
                  onChange={(e) =>
                    setAdminReviewFilters((p) => ({
                      ...p,
                      rating: e.target.value,
                    }))
                  }
                  style={{
                    ...fs,
                    width: 120,
                    height: 38,
                    padding: "0 10px",
                    fontSize: 13,
                    border: `1px solid ${T.gray100}`,
                    borderRadius: 6,
                  }}
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
                <label
                  style={{ fontSize: 11, fontWeight: 700, color: T.gray400 }}
                >
                  USER
                </label>
                <input
                  type="text"
                  placeholder="ID, Name, or Email..."
                  value={adminReviewFilters.user}
                  onChange={(e) =>
                    setAdminReviewFilters((p) => ({
                      ...p,
                      user: e.target.value,
                    }))
                  }
                  style={{
                    ...fs,
                    width: 180,
                    height: 38,
                    padding: "0 10px",
                    fontSize: 13,
                    border: `1px solid ${T.gray100}`,
                    borderRadius: 6,
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label
                  style={{ fontSize: 11, fontWeight: 700, color: T.gray400 }}
                >
                  TRANSACTION
                </label>
                <input
                  type="text"
                  placeholder="ID or Code..."
                  value={adminReviewFilters.transaction}
                  onChange={(e) =>
                    setAdminReviewFilters((p) => ({
                      ...p,
                      transaction: e.target.value,
                    }))
                  }
                  style={{
                    ...fs,
                    width: 140,
                    height: 38,
                    padding: "0 10px",
                    fontSize: 13,
                    border: `1px solid ${T.gray100}`,
                    borderRadius: 6,
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label
                  style={{ fontSize: 11, fontWeight: 700, color: T.gray400 }}
                >
                  DATE
                </label>
                <input
                  type="date"
                  value={adminReviewFilters.date}
                  onChange={(e) =>
                    setAdminReviewFilters((p) => ({
                      ...p,
                      date: e.target.value,
                    }))
                  }
                  style={{
                    ...fs,
                    width: 140,
                    height: 38,
                    padding: "0 10px",
                    fontSize: 13,
                    border: `1px solid ${T.gray100}`,
                    borderRadius: 6,
                  }}
                />
              </div>

              <Btn
                variant="primary"
                style={{ height: 38, padding: "0 18px", fontSize: 13 }}
                onClick={() => loadAdminReviews()}
              >
                Apply Filters
              </Btn>

              <Btn
                variant="outline"
                style={{ height: 38, padding: "0 18px", fontSize: 13 }}
                onClick={() => {
                  const reset = {
                    rating: "",
                    user: "",
                    transaction: "",
                    date: "",
                  };
                  setAdminReviewFilters(reset);
                  loadAdminReviews(reset);
                }}
              >
                Reset
              </Btn>
            </div>

            {/* Reviews list */}
            {adminReviewsLoading ? (
              <p style={{ fontSize: 14, color: T.gray500 }}>
                Loading reviews...
              </p>
            ) : adminReviewsList.length === 0 ? (
              <p style={{ fontSize: 14, color: T.gray500 }}>
                No reviews found matching the filters.
              </p>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {adminReviewsList.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      border: `1px solid ${T.gray100}`,
                      borderRadius: 12,
                      padding: "18px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: T.primary,
                          }}
                        >
                          {r.txn_code} — {r.transaction_title}
                        </span>
                        <span style={{ display: "flex", gap: 1 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className="msym"
                              style={{
                                fontSize: 13,
                                color: star <= r.rating ? "#d97706" : T.gray100,
                              }}
                            >
                              star
                            </span>
                          ))}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: T.gray500 }}>
                        Reviewer:{" "}
                        <strong style={{ color: T.primary }}>
                          {r.reviewer_name}
                        </strong>{" "}
                        vs Reviewee:{" "}
                        <strong style={{ color: T.primary }}>
                          {r.reviewee_name}
                        </strong>{" "}
                        · Submitted{" "}
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: T.gray600,
                          marginTop: 6,
                          background: T.offWhite,
                          padding: 10,
                          borderRadius: 8,
                        }}
                      >
                        {r.comment || (
                          <span
                            style={{ fontStyle: "italic", color: T.gray400 }}
                          >
                            No comment left.
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <Btn
                        variant="red"
                        style={{ fontSize: 12, padding: "6px 12px" }}
                        onClick={() => handleDeleteReview(r.id)}
                      >
                        Delete Review
                      </Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* KYC Edit Modal */}
        <KYCEditModal
          submission={editingKyc}
          isOpen={!!editingKyc}
          onClose={() => setEditingKyc(null)}
          onSaved={loadKYCQueue}
          getSecureFileUrl={getSecureFileUrl}
        />
        {/* Admin Subscription Management Modal */}
        <AdminSubscriptionModal
          user={subscribingUser}
          isOpen={!!subscribingUser}
          onClose={() => setSubscribingUser(null)}
          onSaved={loadUsers}
        />
      </div>
    </div>
  );
};

export default AdminPanel;
