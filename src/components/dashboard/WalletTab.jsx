import { useState, useEffect } from "react";
import { T, fs } from "../../tokens";
import { Btn, Spin } from "../../components/ui";
import { wallet, exchangeRate, bankAccounts, withdrawals, payments } from "../../utils/api";
import { sseEmitter } from "../../utils/useSSE";


const InputField = ({ label, children, req }) => (
  <div>
    <label
      style={{
        display: "block",
        fontSize: 13,
        fontWeight: 600,
        color: T.gray700,
        marginBottom: 5,
      }}
    >
      {label}
      {req && " *"}
    </label>
    {children}
  </div>
);

const SectionBtn = ({
  id,
  icon,
  label,
  color = "#001637",
  section,
  setSection,
}) => (
  <button
    onClick={() => setSection(id)}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      padding: "16px 12px",
      background: section === id ? T.primary : T.white,
      borderRadius: 12,
      border: `1.5px solid ${section === id ? T.primary : T.gray100}`,
      cursor: "pointer",
      flex: 1,
      transition: "all .18s",
      minWidth: 0,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: section === id ? T.white + "22" : color + "14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        className="msym"
        style={{ fontSize: 22, color: section === id ? T.white : color }}
      >
        {icon}
      </span>
    </div>
    <span
      style={{
        fontSize: 11.5,
        fontWeight: 700,
        color: section === id ? T.white : T.gray700,
        textAlign: "center",
        lineHeight: 1.2,
      }}
    >
      {label}
    </span>
  </button>
);

const WalletTab = ({ user, balance, onBalanceChange, activeTxs = [] }) => {
  const [section, setSection] = useState("overview"); // overview | fund | transfer | withdraw | pay
  const [ld, setLd] = useState(false);
  const [toast, setToast] = useState(null);
  const [history, setHistory] = useState([]);
  const [usdToNgn, setUsdToNgn] = useState(1548.62);

  /* Fund form */
  const [fundAmt, setFundAmt] = useState("");

  /* Transfer form */
  const [txAmt, setTxAmt] = useState("");
  const [txTo, setTxTo] = useState("");
  const [txNote, setTxNote] = useState("");

  /* Bank Accounts & Withdrawals state */
  const [availableBanks, setAvailableBanks] = useState([]);
  const [userAccounts, setUserAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [wdAmt, setWdAmt] = useState("");

  /* Add Bank Account form modal/inline */
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBankCode, setNewBankCode] = useState("");
  const [newAcctNum, setNewAcctNum] = useState("");
  const [resolvingAcct, setResolvingAcct] = useState(false);
  const [resolvedName, setResolvedName] = useState("");
  const [savingBank, setSavingBank] = useState(false);

  /* Pay services form */
  const [svcProvider, setSvcProvider] = useState("aws");
  const [svcAmt, setSvcAmt] = useState("");
  const [svcRef, setSvcRef] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [payStep, setPayStep] = useState("form");
  const [payError, setPayError] = useState("");

  const SVCS = [
    { id: "aws", label: "Amazon Web Services", icon: "cloud", color: "#FF9900" },
    { id: "gcp", label: "Google Cloud", icon: "cloud_sync", color: "#4285F4" },
    { id: "azure", label: "Microsoft Azure", icon: "cloud_done", color: "#0078D4" },
    { id: "netlify", label: "Netlify", icon: "deployed_code", color: "#00C7B7" },
    { id: "vercel", label: "Vercel", icon: "rocket_launch", color: "#000000" },
    { id: "gsuite", label: "Google Workspace", icon: "workspace_premium", color: "#34A853" },
    { id: "github", label: "GitHub", icon: "code", color: "#24292F" },
    { id: "do", label: "DigitalOcean", icon: "water_drop", color: "#0080FF" },
  ];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // Load wallet data and bank accounts on mount
  const loadWalletData = async () => {
    const [balRes, histRes, rateRes, userAcctsRes, banksRes] = await Promise.all([
      wallet.get(),
      wallet.history(),
      exchangeRate.get(),
      bankAccounts.list(),
      bankAccounts.getBanks(),
    ]);

    if (rateRes.data?.success) {
      setUsdToNgn(rateRes.data.usdToNgn);
    }
    if (balRes.data && onBalanceChange) {
      const currentBal = balRes.data.available_balance !== undefined
        ? parseFloat(balRes.data.available_balance)
        : parseFloat(balRes.data.balance) || 0;
      onBalanceChange(currentBal);
    }
    if (histRes.data?.history) {
      setHistory(histRes.data.history);
    }

    if (userAcctsRes.data?.accounts) {
      setUserAccounts(userAcctsRes.data.accounts);
      const defaultAcct = userAcctsRes.data.accounts.find((a) => a.is_default);
      if (defaultAcct) {
        setSelectedAccountId(defaultAcct.id);
      } else if (userAcctsRes.data.accounts.length > 0) {
        setSelectedAccountId(userAcctsRes.data.accounts[0].id);
      }
    }
    if (banksRes.data?.banks) {
      setAvailableBanks(banksRes.data.banks);
    }
  };

  useEffect(() => {
    loadWalletData();
    const unsub = sseEmitter.on("wallet_update", () => {
      loadWalletData();
    });
    return unsub;
  }, []);


  // Handle Paystack Wallet Deposit
  const handleDeposit = async () => {
    const amt = parseFloat(fundAmt);
    if (!amt || amt <= 0) return showToast("Please enter a valid amount in NGN.", "error");
    if (amt < 100) return showToast("Minimum funding amount is ₦100.", "error");

    setLd(true);
    const { data, error } = await payments.initialize(amt);
    setLd(false);

    if (error) {
      showToast(error, "error");
      return;
    }

    if (data?.authorization_url) {
      showToast("Redirecting to Paystack checkout...", "success");
      window.location.href = data.authorization_url;
    } else {
      showToast("Failed to generate Paystack checkout link.", "error");
    }
  };

  // Resolve Bank Account Number
  const handleResolveAccount = async () => {
    if (!newBankCode) return showToast("Please select a bank first.", "error");
    if (!newAcctNum || newAcctNum.length !== 10) return showToast("Enter a valid 10-digit account number.", "error");

    setResolvingAcct(true);
    setResolvedName("");
    const { data, error } = await bankAccounts.resolve(newAcctNum, newBankCode);
    setResolvingAcct(false);

    if (error) {
      showToast(error, "error");
      return;
    }

    if (data?.account_name) {
      setResolvedName(data.account_name);
      showToast(`Account resolved: ${data.account_name}`, "success");
    }
  };

  // Save Verified Bank Account
  const handleSaveAccount = async () => {
    if (!newBankCode || !newAcctNum || !resolvedName) {
      return showToast("Please resolve your account number before saving.", "error");
    }

    const bankObj = availableBanks.find((b) => b.code === newBankCode);
    const bankName = bankObj ? bankObj.name : newBankCode;

    setSavingBank(true);
    const { data, error } = await bankAccounts.save(bankName, newBankCode, newAcctNum);
    setSavingBank(false);

    if (error) {
      showToast(error, "error");
      return;
    }

    showToast("Bank account added successfully!");
    setShowAddBank(false);
    setNewAcctNum("");
    setResolvedName("");

    // Reload bank accounts
    const acctsRes = await bankAccounts.list();
    if (acctsRes.data?.accounts) {
      setUserAccounts(acctsRes.data.accounts);
      if (data.account?.id) {
        setSelectedAccountId(data.account.id);
      }
    }
  };

  // Handle Bank Withdrawal Payout
  const handleWithdraw = async () => {
    const amt = parseFloat(wdAmt);
    if (!amt || amt <= 0) return showToast("Please enter a valid withdrawal amount.", "error");
    if (!selectedAccountId) return showToast("Please select or add a bank account first.", "error");

    setLd(true);
    const { data, error, unverified } = await withdrawals.request(amt, selectedAccountId);
    setLd(false);

    if (error) {
      showToast(error, "error");
      return;
    }

    showToast(`Withdrawal of $${amt.toFixed(2)} initiated successfully!`);
    loadWalletData();
    setSection("overview");
    setWdAmt("");
  };


  const handleTransfer = async () => {
    const amt = parseFloat(txAmt);
    if (!amt || amt <= 0)
      return showToast("Please enter a valid amount.", "error");
    if (!txTo) return showToast("Recipient email is required.", "error");
    setLd(true);
    const { data, error } = await wallet.transfer(amt, txTo, txNote);
    setLd(false);
    if (error) {
      showToast(error, "error");
      return;
    }
    showToast(`$${amt.toLocaleString()} sent to ${txTo}.`);
    loadWalletData();
    setSection("overview");
    setTxAmt("");
    setTxTo("");
    setTxNote("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        position: "relative",
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 76,
            right: 18,
            zIndex: 9999,
            background: toast.type === "error" ? T.red : T.green,
            color: T.white,
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 600,
            boxShadow: "0 6px 28px rgba(0,0,0,.2)",
            animation: "slideDown .2s ease",
            display: "flex",
            alignItems: "center",
            gap: 8,
            maxWidth: 340,
          }}
        >
          <span className="msym" style={{ fontSize: 18 }}>
            {toast.type === "error" ? "error" : "check_circle"}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      {(() => {
        const isVendor =
          user?.role === "seller" ||
          user?.role === "vendor" ||
          user?.role === "provider";
        return (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "clamp(18px,3vw,22px)",
                  fontWeight: 700,
                  color: T.primary,
                  marginBottom: 4,
                }}
              >
                Wallet
              </h2>
              <p style={{ color: T.gray500, fontSize: 13.5 }}>
                {isVendor
                  ? "Fund your wallet, receive client payments, withdraw to your bank, and pay for tech services."
                  : "Fund your wallet from your bank, transfer to vendors, and pay for tech services with your card."}
              </p>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 20,
                background: isVendor ? T.greenLt : "#eff6ff",
                border: `1px solid ${isVendor ? T.green + "40" : "#bfdbfe"}`,
                fontSize: 12,
                fontWeight: 700,
                color: isVendor ? T.green : "#2563eb",
                flexShrink: 0,
              }}
            >
              <span className="msym" style={{ fontSize: 14 }}>
                {isVendor ? "storefront" : "person"}
              </span>
              {isVendor ? "Vendor Account" : "Client Account"}
            </span>
          </div>
        );
      })()}

      {/* Balance Card */}
      <div
        style={{
          background: `linear-gradient(135deg,${T.primary} 0%,#0a2d5a 100%)`,
          borderRadius: 16,
          padding: "28px 24px",
          color: T.white,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -30,
            top: -30,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(130,249,190,.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: -40,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,.04)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "rgba(255,255,255,.45)",
                textTransform: "uppercase",
                letterSpacing: ".1em",
                marginBottom: 8,
              }}
            >
              Available Balance
            </div>
            <div
              style={{
                fontSize: "clamp(28px,5vw,42px)",
                fontWeight: 800,
                letterSpacing: "-.5px",
                lineHeight: 1,
              }}
            >
              ${balance.toLocaleString("en", { minimumFractionDigits: 2 })}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,.4)",
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span className="msym" style={{ fontSize: 14 }}>
                account_balance_wallet
              </span>
              Escrow Wallet &bull; {user?.name || "User"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "rgba(255,255,255,.4)",
                marginBottom: 4,
              }}
            >
              Escrow Protected
            </div>
            {(() => {
              const trulyActive = (activeTxs || []).filter(
                (t) => !["completed", "cancelled"].includes(t.status),
              );
              const protectedAmount = trulyActive.reduce(
                (sum, t) => sum + (parseFloat(t.escrow_balance) || 0),
                0,
              );
              return (
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.gold }}>
                    ${protectedAmount.toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,.3)",
                      marginTop: 2,
                    }}
                  >
                    {trulyActive.length} active transaction
                    {trulyActive.length === 1 ? "" : "s"}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        <div
          style={{ display: "flex", gap: 8, marginTop: 22, flexWrap: "wrap" }}
        >
          {(() => {
            const isVendor =
              user?.role === "seller" ||
              user?.role === "vendor" ||
              user?.role === "provider";
            const actions = isVendor
              ? [
                  { icon: "add_circle", label: "Fund Wallet", id: "fund" },
                  {
                    icon: "account_balance",
                    label: "Withdraw",
                    id: "withdraw",
                  },
                  { icon: "payments", label: "Pay Services", id: "pay" },
                ]
              : [
                  { icon: "add_circle", label: "Fund", id: "fund" },
                  { icon: "send", label: "Transfer", id: "transfer" },
                  { icon: "payments", label: "Pay Services", id: "pay" },
                ];
            return actions.map((a) => (
              <button
                key={a.id}
                onClick={() => setSection(a.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,.1)",
                  border: "1px solid rgba(255,255,255,.15)",
                  color: T.white,
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: 700,
                  transition: "background .15s",
                  backdropFilter: "blur(4px)",
                }}
              >
                <span className="msym" style={{ fontSize: 16 }}>
                  {a.icon}
                </span>
                {a.label}
              </button>
            ));
          })()}
        </div>
      </div>

      {/* Action Quick Nav */}
      {(() => {
        const isVendor =
          user?.role === "seller" ||
          user?.role === "vendor" ||
          user?.role === "provider";
        const btns = isVendor
          ? [
              {
                id: "overview",
                icon: "bar_chart",
                label: "Overview",
                color: "#3b82f6",
              },
              {
                id: "fund",
                icon: "add_circle",
                label: "Fund Wallet",
                color: T.green,
              },
              {
                id: "withdraw",
                icon: "account_balance",
                label: "Withdraw",
                color: "#f59e0b",
              },
              {
                id: "pay",
                icon: "payments",
                label: "Pay Services",
                color: "#ef4444",
              },
            ]
          : [
              {
                id: "overview",
                icon: "bar_chart",
                label: "Overview",
                color: "#3b82f6",
              },
              {
                id: "fund",
                icon: "add_circle",
                label: "Fund Wallet",
                color: T.green,
              },
              {
                id: "transfer",
                icon: "send",
                label: "Transfer",
                color: "#8b5cf6",
              },
              {
                id: "pay",
                icon: "payments",
                label: "Pay Services",
                color: "#ef4444",
              },
            ];
        return (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {btns.map((b) => (
              <SectionBtn
                key={b.id}
                id={b.id}
                icon={b.icon}
                label={b.label}
                color={b.color}
                section={section}
                setSection={setSection}
              />
            ))}
          </div>
        );
      })()}

      {/* ── OVERVIEW ── */}
      {section === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Quick stats */}
          {(() => {
            const moneyIn = history
              .filter(
                (t) =>
                  t.type === "deposit" ||
                  t.type === "escrow_release" ||
                  t.type === "escrow_refund" ||
                  t.type === "transfer_in",
              )
              .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
            const moneyOut = history
              .filter(
                (t) =>
                  t.type === "withdrawal" ||
                  t.type === "escrow_hold" ||
                  t.type === "transfer_out",
              )
              .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
            const techSpend = history
              .filter(
                (t) =>
                  t.type === "withdrawal" &&
                  (t.description.toLowerCase().includes("aws") ||
                    t.description.toLowerCase().includes("cloud") ||
                    t.description.toLowerCase().includes("workspace") ||
                    t.description.toLowerCase().includes("github") ||
                    t.description.toLowerCase().includes("vercel") ||
                    t.description.toLowerCase().includes("netlify")),
              )
              .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
            return (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 12,
                }}
                className="g3-dash"
              >
                {[
                  {
                    label: "Money In",
                    icon: "arrow_downward",
                    val:
                      "$" +
                      moneyIn.toLocaleString("en", {
                        minimumFractionDigits: 2,
                      }),
                    color: "#10b981",
                    bg: "#f0fdf4",
                  },
                  {
                    label: "Money Out",
                    icon: "arrow_upward",
                    val:
                      "$" +
                      moneyOut.toLocaleString("en", {
                        minimumFractionDigits: 2,
                      }),
                    color: T.red,
                    bg: "#fef2f2",
                  },
                  {
                    label: "Tech Spend",
                    icon: "cloud",
                    val:
                      "$" +
                      techSpend.toLocaleString("en", {
                        minimumFractionDigits: 2,
                      }),
                    color: "#8b5cf6",
                    bg: "#f5f3ff",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: T.white,
                      border: `1px solid ${T.gray100}`,
                      borderRadius: 12,
                      padding: "14px 16px",
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: s.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        className="msym"
                        style={{ fontSize: 20, color: s.color }}
                      >
                        {s.icon}
                      </span>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: T.gray400,
                          textTransform: "uppercase",
                          letterSpacing: ".06em",
                          marginBottom: 3,
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 800,
                          color: T.primary,
                        }}
                      >
                        {s.val}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Recent transactions */}
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.gray100}`,
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: `1px solid ${T.gray100}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: T.primary }}>
                Recent Wallet Activity
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: T.accent,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                View all
              </span>
            </div>
            {history.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: T.gray400,
                  fontSize: 13,
                }}
              >
                No recent transactions
              </div>
            ) : (
              history.map((t, i) => {
                const isCredit =
                  t.type === "deposit" ||
                  t.type === "escrow_release" ||
                  t.type === "escrow_refund" ||
                  t.type === "transfer_in";
                const amtStr = parseFloat(t.amount || 0).toLocaleString("en", {
                  minimumFractionDigits: 2,
                });
                const dateStr = new Date(t.created_at).toLocaleDateString(
                  "en",
                  { month: "short", day: "numeric", year: "numeric" },
                );
                return (
                  <div
                    key={t.id}
                    style={{
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom:
                        i < history.length - 1
                          ? `1px solid ${T.gray100}`
                          : "none",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: isCredit ? "#f0fdf4" : "#fef2f2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          className="msym"
                          style={{
                            fontSize: 18,
                            color: isCredit ? "#10b981" : T.red,
                          }}
                        >
                          {isCredit ? "arrow_downward" : "arrow_upward"}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: T.primary,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t.description}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: T.gray400,
                            marginTop: 2,
                          }}
                        >
                          {t.reference} &bull; {dateStr}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: isCredit ? "#10b981" : T.red,
                        flexShrink: 0,
                      }}
                    >
                      {isCredit ? "+" : "-"}${amtStr}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── FUND WALLET ── */}
      {section === "fund" && (
        <div
          style={{
            background: T.white,
            border: `1px solid ${T.gray100}`,
            borderRadius: 14,
            padding: "clamp(16px,4vw,28px)",
            maxWidth: 560,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: T.greenLt,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="msym" style={{ fontSize: 22, color: T.green }}>
                add_circle
              </span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: T.primary }}>
                Fund Wallet via Paystack
              </div>
              <div style={{ fontSize: 12.5, color: T.gray500 }}>
                Instant deposit using Cards, Bank Transfer, USSD, or Apple Pay
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <InputField label="Amount (NGN)" req>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 15,
                    fontWeight: 700,
                    color: T.gray600,
                  }}
                >
                  ₦
                </span>
                <input
                  style={{ ...fs, paddingLeft: 32 }}
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={fundAmt}
                  onChange={(e) => {
                    const val = e.target.value.replace(/-/g, "");
                    setFundAmt(val);
                  }}
                />

              </div>
              {fundAmt && parseFloat(fundAmt) > 0 && (
                <div
                  style={{
                    fontSize: 12,
                    color: T.gray500,
                    marginTop: 4,
                    paddingLeft: 2,
                  }}
                >
                  Estimated Wallet Credit:{" "}
                  <strong>
                    $
                    {(parseFloat(fundAmt) / usdToNgn).toLocaleString("en", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    USD
                  </strong>{" "}
                  (@ ₦{usdToNgn.toLocaleString()}/$)
                </div>
              )}
            </InputField>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[5000, 10000, 25000, 50000].map((a) => (
                <button
                  key={a}
                  onClick={() => setFundAmt(String(a))}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    border: `1.5px solid ${fundAmt === String(a) ? T.green : T.gray100}`,
                    borderRadius: 8,
                    background: fundAmt === String(a) ? T.greenLt : T.white,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                    color: fundAmt === String(a) ? T.green : T.gray700,
                    minWidth: 70,
                    transition: "all .15s",
                  }}
                >
                  ₦{a.toLocaleString()}
                </button>
              ))}
            </div>

            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 12.5,
                color: "#166534",
                lineHeight: 1.6,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span className="msym" style={{ fontSize: 18, color: T.green }}>
                verified_user
              </span>
              <div>
                Secured by <strong>Paystack</strong>. You will be redirected to complete payment securely.
              </div>
            </div>

            <Btn
              variant="green"
              onClick={handleDeposit}
              disabled={ld || !fundAmt || parseFloat(fundAmt) < 100}
              style={{ width: "100%", fontSize: 15 }}
            >
              {ld ? (
                <>
                  <Spin />
                  Initializing Checkout…
                </>
              ) : (
                <>
                  <span className="msym" style={{ fontSize: 18 }}>
                    lock
                  </span>
                  Pay with Paystack
                </>
              )}
            </Btn>
          </div>
        </div>
      )}

      {/* ── TRANSFER (Clients only) ── */}
      {section === "transfer" && (
        <div
          style={{
            background: T.white,
            border: `1px solid ${T.gray100}`,
            borderRadius: 14,
            padding: "clamp(16px,4vw,28px)",
            maxWidth: 560,
          }}
        >
          {user?.role === "seller" ||
          user?.role === "vendor" ||
          user?.role === "provider" ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#fffbeb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <span
                  className="msym"
                  style={{ fontSize: 30, color: "#f59e0b" }}
                >
                  info
                </span>
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: T.primary,
                  marginBottom: 8,
                }}
              >
                Not available for vendors
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: T.gray500,
                  lineHeight: 1.75,
                  maxWidth: 340,
                  margin: "0 auto 20px",
                }}
              >
                As a vendor, you receive payments from clients via escrow. To
                move funds out, use <strong>Withdraw to Bank</strong> instead.
              </p>
              <Btn variant="accent" onClick={() => setSection("withdraw")}>
                <span className="msym" style={{ fontSize: 16 }}>
                  account_balance
                </span>
                Go to Withdraw
              </Btn>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#f5f3ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    className="msym"
                    style={{ fontSize: 22, color: "#8b5cf6" }}
                  >
                    send
                  </span>
                </div>
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: 16, color: T.primary }}
                  >
                    Transfer to Vendor
                  </div>
                  <div style={{ fontSize: 12.5, color: T.gray500 }}>
                    Send funds from your wallet directly to a vendor on Escrow
                  </div>
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <InputField label="Recipient Email / Escrow ID" req>
                  <input
                    style={fs}
                    placeholder="vendor@email.com"
                    value={txTo}
                    onChange={(e) => setTxTo(e.target.value)}
                  />
                </InputField>
                <InputField label="Amount (USD)" req>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 14,
                        fontWeight: 700,
                        color: T.gray600,
                      }}
                    >
                      $
                    </span>
                    <input
                      style={{ ...fs, paddingLeft: 28 }}
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={txAmt}
                      onChange={(e) => {
                        const val = e.target.value.replace(/-/g, "");
                        setTxAmt(val);
                      }}
                    />

                  </div>
                </InputField>
                <InputField label="Note (optional)">
                  <input
                    style={fs}
                    placeholder="e.g. Milestone 2 payment"
                    value={txNote}
                    onChange={(e) => setTxNote(e.target.value)}
                  />
                </InputField>
                <div
                  style={{
                    background: T.offWhite,
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontSize: 13,
                    color: T.gray600,
                    lineHeight: 1.75,
                  }}
                >
                  <span style={{ fontWeight: 700, color: T.primary }}>
                    Balance after transfer:
                  </span>{" "}
                  <span style={{ fontWeight: 800, color: T.green }}>
                    $
                    {Math.max(
                      0,
                      balance - (parseFloat(txAmt) || 0),
                    ).toLocaleString("en", { minimumFractionDigits: 2 })}
                  </span>
                  <div style={{ fontSize: 12, marginTop: 3, color: T.gray400 }}>
                    No transfer fee for wallet-to-wallet payments.
                  </div>
                </div>
                <Btn
                  variant="purple"
                  onClick={handleTransfer}
                  disabled={ld || !txAmt || !txTo}
                  style={{ width: "100%", fontSize: 15, background: "#8b5cf6" }}
                >
                  {ld ? (
                    <>
                      <Spin />
                      Sending…
                    </>
                  ) : (
                    <>
                      <span className="msym" style={{ fontSize: 18 }}>
                        send
                      </span>
                      Send Transfer
                    </>
                  )}
                </Btn>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── WITHDRAW TO BANK (Paystack Transfers) ── */}
      {section === "withdraw" && (
        <div
          style={{
            background: T.white,
            border: `1px solid ${T.gray100}`,
            borderRadius: 14,
            padding: "clamp(16px,4vw,28px)",
            maxWidth: 620,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "#fffbeb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="msym" style={{ fontSize: 22, color: "#f59e0b" }}>
                  account_balance
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: T.primary }}>
                  Withdraw to Bank Account
                </div>
                <div style={{ fontSize: 12.5, color: T.gray500 }}>
                  Direct Paystack payout to your verified Nigerian bank account
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddBank(!showAddBank)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 12px",
                borderRadius: 8,
                background: showAddBank ? T.gray100 : T.primary + "12",
                color: T.primary,
                border: "none",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <span className="msym" style={{ fontSize: 16 }}>
                {showAddBank ? "close" : "add"}
              </span>
              {showAddBank ? "Cancel" : "Add Bank Account"}
            </button>
          </div>

          {/* Inline Add Bank Form */}
          {showAddBank && (
            <div
              style={{
                background: T.gray50,
                border: `1px solid ${T.gray200}`,
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13.5, color: T.primary }}>
                Add & Verify New Bank Account
              </div>
              <InputField label="Select Bank" req>
                <select
                  style={fs}
                  value={newBankCode}
                  onChange={(e) => {
                    setNewBankCode(e.target.value);
                    setResolvedName("");
                  }}
                >
                  <option value="">-- Choose Bank --</option>
                  {availableBanks.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </InputField>
              <InputField label="Account Number (10 digits)" req>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    style={{ ...fs, flex: 1 }}
                    placeholder="e.g. 0123456789"
                    maxLength={10}
                    value={newAcctNum}
                    onChange={(e) => {
                      setNewAcctNum(e.target.value.replace(/\D/g, ""));
                      setResolvedName("");
                    }}
                  />
                  <Btn
                    onClick={handleResolveAccount}
                    disabled={resolvingAcct || !newBankCode || newAcctNum.length !== 10}
                    style={{ fontSize: 12.5, padding: "0 14px", flexShrink: 0 }}
                  >
                    {resolvingAcct ? <Spin /> : "Verify"}
                  </Btn>
                </div>
              </InputField>

              {resolvedName && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 13,
                    color: "#166534",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span className="msym" style={{ fontSize: 16, color: T.green }}>
                    check_circle
                  </span>
                  Account Holder: <strong>{resolvedName}</strong>
                </div>
              )}

              <Btn
                variant="green"
                onClick={handleSaveAccount}
                disabled={savingBank || !resolvedName}
                style={{ width: "100%", marginTop: 4 }}
              >
                {savingBank ? <Spin /> : "Save Bank Account"}
              </Btn>
            </div>
          )}

          {/* Main Withdrawal Request Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <InputField label="Destination Bank Account" req>
              {userAccounts.length === 0 ? (
                <div
                  style={{
                    padding: "14px",
                    background: T.gray50,
                    borderRadius: 8,
                    border: `1px dashed ${T.gray300}`,
                    fontSize: 13,
                    color: T.gray600,
                    textAlign: "center",
                  }}
                >
                  No saved bank accounts found. Click <strong>Add Bank Account</strong> above to add one.
                </div>
              ) : (
                <select
                  style={fs}
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                >
                  {userAccounts.map((acct) => (
                    <option key={acct.id} value={acct.id}>
                      {acct.bank_name} — {acct.masked_account_number} ({acct.account_holder_name})
                    </option>
                  ))}
                </select>
              )}
            </InputField>

            <InputField label="Amount to Withdraw (USD)" req>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 14,
                    fontWeight: 700,
                    color: T.gray600,
                  }}
                >
                  $
                </span>
                <input
                  style={{ ...fs, paddingLeft: 28 }}
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={wdAmt}
                  onChange={(e) => {
                    const val = e.target.value.replace(/-/g, "");
                    setWdAmt(val);
                  }}
                />

              </div>
              {wdAmt && parseFloat(wdAmt) > 0 && (
                <div style={{ fontSize: 12, color: T.gray500, marginTop: 4 }}>
                  Estimated Bank Credit:{" "}
                  <strong>₦{(parseFloat(wdAmt) * usdToNgn).toLocaleString("en", { maximumFractionDigits: 2 })} NGN</strong>{" "}
                  (@ ₦{usdToNgn.toLocaleString()}/$)
                </div>
              )}
            </InputField>

            <div
              style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 12.5,
                color: "#92400e",
                lineHeight: 1.6,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span className="msym" style={{ fontSize: 18, color: "#d97706", flexShrink: 0 }}>
                info
              </span>
              <div>
                Payouts are transferred directly into your verified bank account via Paystack.
              </div>
            </div>

            <Btn
              variant="accent"
              onClick={handleWithdraw}
              disabled={ld || !wdAmt || !selectedAccountId || parseFloat(wdAmt) <= 0}
              style={{ width: "100%", fontSize: 15 }}
            >
              {ld ? (
                <>
                  <Spin />
                  Initiating Payout…
                </>
              ) : (
                <>
                  <span className="msym" style={{ fontSize: 18 }}>
                    account_balance
                  </span>
                  Submit Withdrawal Request
                </>
              )}
            </Btn>
          </div>
        </div>
      )}


      {/* ── PAY TECH SERVICES (Paystack) ── */}
      {section === "pay" && (
        <div
          style={{
            background: T.white,
            border: `1px solid ${T.gray100}`,
            borderRadius: 14,
            padding: "clamp(16px,4vw,28px)",
            maxWidth: 620,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="msym" style={{ fontSize: 22, color: "#ef4444" }}>
                payments
              </span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: T.primary }}>
                Pay for Tech Services
              </div>
              <div style={{ fontSize: 12.5, color: T.gray500 }}>
                Powered by Paystack — Fund wallet for AWS, GCP, Azure, GitHub &amp; more
              </div>
            </div>
          </div>

          {/* ── SUCCESS STATE ── */}
          {payStep === "success" && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: T.greenLt,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <span className="msym" style={{ fontSize: 34, color: T.green }}>
                  check_circle
                </span>
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  color: T.primary,
                  marginBottom: 6,
                }}
              >
                Payment Successful
              </div>
              <div
                style={{ fontSize: 13.5, color: T.gray500, marginBottom: 20 }}
              >
                ${parseFloat(svcAmt || 0).toLocaleString()} paid to{" "}
                <strong>{SVCS.find((s) => s.id === svcProvider)?.label}</strong>{" "}
                via Flutterwave.
              </div>
              <div
                style={{
                  background: T.offWhite,
                  borderRadius: 10,
                  padding: "12px",
                  fontSize: 12.5,
                  color: T.gray500,
                  marginBottom: 22,
                }}
              >
                Your service account should reflect within a few minutes. Keep
                your Flutterwave transaction reference for disputes.
              </div>
              <Btn
                variant="outline"
                onClick={() => {
                  setPayStep("form");
                  setSvcAmt("");
                  setSvcRef("");
                  setCardNum("");
                  setCardExp("");
                  setCardCvv("");
                }}
              >
                Make Another Payment
              </Btn>
            </div>
          )}

          {/* ── ERROR STATE ── */}
          {payStep === "error" && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "#fef2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <span className="msym" style={{ fontSize: 32, color: T.red }}>
                  error
                </span>
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: T.red,
                  marginBottom: 8,
                }}
              >
                Payment Failed
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  color: T.gray600,
                  marginBottom: 20,
                  lineHeight: 1.7,
                }}
              >
                {payError}
              </div>
              <Btn variant="outline" onClick={() => setPayStep("form")}>
                Try Again
              </Btn>
            </div>
          )}

          {/* ── FORM STATE ── */}
          {(payStep === "form" || payStep === "processing") && (
            <>
              {/* Service picker */}
              <div style={{ marginBottom: 18 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: T.gray700,
                    marginBottom: 10,
                  }}
                >
                  Select Service Provider *
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 8,
                  }}
                >
                  {SVCS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSvcProvider(s.id)}
                      disabled={payStep === "processing"}
                      style={{
                        border: `1.5px solid ${svcProvider === s.id ? s.color : T.gray100}`,
                        borderRadius: 10,
                        padding: "10px 6px",
                        cursor: "pointer",
                        background:
                          svcProvider === s.id ? s.color + "10" : T.white,
                        transition: "all .15s",
                        textAlign: "center",
                        opacity: payStep === "processing" ? 0.5 : 1,
                      }}
                    >
                      <span
                        className="msym"
                        style={{
                          fontSize: 22,
                          color: svcProvider === s.id ? s.color : T.gray400,
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        {s.icon}
                      </span>
                      <div
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: svcProvider === s.id ? s.color : T.gray600,
                          lineHeight: 1.2,
                        }}
                      >
                        {s.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 90px",
                    gap: 10,
                  }}
                >
                  <InputField label="Amount (NGN)" req>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 14,
                          fontWeight: 700,
                          color: T.gray600,
                        }}
                      >
                        ₦
                      </span>
                      <input
                        style={{ ...fs, paddingLeft: 28 }}
                        type="number"
                        min="0"
                        placeholder="5000"
                        value={svcAmt}
                        onChange={(e) => {
                          const val = e.target.value.replace(/-/g, "");
                          setSvcAmt(val);
                        }}
                        disabled={payStep === "processing"}
                      />
                    </div>
                  </InputField>
                  <InputField label="Currency">
                    <select style={fs} disabled>
                      <option>NGN</option>
                    </select>
                  </InputField>
                </div>

                <InputField label="Service Reference / Account ID">
                  <input
                    style={fs}
                    placeholder="e.g. AWS account ID or project name"
                    value={svcRef}
                    onChange={(e) => setSvcRef(e.target.value)}
                    disabled={payStep === "processing"}
                  />
                </InputField>

                {/* Info banner */}
                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontSize: 12.5,
                    color: "#1e40af",
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    lineHeight: 1.6,
                  }}
                >
                  <span className="msym" style={{ fontSize: 18, flexShrink: 0, color: "#3b82f6" }}>
                    info
                  </span>
                  <div>
                    <strong>How it works:</strong> Enter how much NGN you want to fund, then you'll be redirected to Paystack checkout. Once paid, the equivalent USD is credited to your wallet and you can use it for {SVCS.find((s) => s.id === svcProvider)?.label || "your selected service"} payments.
                  </div>
                </div>

                {/* Amount preview */}
                {svcAmt && parseFloat(svcAmt) >= 100 && (
                  <div
                    style={{
                      background: T.offWhite,
                      borderRadius: 10,
                      padding: "11px 14px",
                      fontSize: 13,
                      color: T.gray700,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span>NGN amount</span>
                      <span style={{ fontWeight: 700 }}>₦{parseFloat(svcAmt || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: T.gray500 }}>
                      <span>Approx. USD at ₦{usdToNgn.toLocaleString()}/$</span>
                      <span>~${(parseFloat(svcAmt || 0) / usdToNgn).toFixed(2)}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: 800,
                        color: T.green,
                        borderTop: `1px solid ${T.gray100}`,
                        paddingTop: 7,
                        marginTop: 4,
                      }}
                    >
                      <span>Wallet balance after funding</span>
                      <span>+${(parseFloat(svcAmt || 0) / usdToNgn).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Paystack security badge */}
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 10,
                    padding: "11px 14px",
                    fontSize: 12.5,
                    color: "#166534",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <span className="msym" style={{ fontSize: 16, flexShrink: 0 }}>
                    verified_user
                  </span>
                  <div>
                    Secured by <strong>Paystack</strong>. PCI-DSS compliant. You will be redirected to complete payment.
                  </div>
                </div>

                <Btn
                  variant="red"
                  style={{ width: "100%", fontSize: 15, background: "#ef4444" }}
                  disabled={payStep === "processing" || !svcAmt || parseFloat(svcAmt) < 100}
                  onClick={async () => {
                    const amt = parseFloat(svcAmt);
                    if (!amt || amt < 100) return showToast("Minimum amount is ₦100.", "error");
                    setPayStep("processing");
                    setPayError("");
                    const { data, error } = await payments.initialize(amt);
                    if (error) {
                      setPayError(error);
                      setPayStep("error");
                      return;
                    }
                    if (data?.authorization_url) {
                      showToast("Redirecting to Paystack checkout...", "success");
                      window.location.href = data.authorization_url;
                    } else {
                      setPayError("Failed to generate Paystack checkout link. Please try again.");
                      setPayStep("error");
                    }
                  }}
                >
                  {payStep === "processing" ? (
                    <>
                      <Spin />
                      Initializing Paystack…
                    </>
                  ) : (
                    <>
                      <span className="msym" style={{ fontSize: 18 }}>lock</span>
                      Fund Wallet via Paystack
                    </>
                  )}
                </Btn>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default WalletTab;
