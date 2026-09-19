import { useState, useEffect } from "react";
import { wallet as walletApi } from "../../utils/api";

export default function AccountStatementModal({ onClose }) {
  const [rangePreset, setRangePreset] = useState("30");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [loading, setLoading] = useState(true);
  const [statementData, setStatementData] = useState(null);
  const [error, setError] = useState(null);

  const handlePresetChange = (preset) => {
    setRangePreset(preset);
    const end = new Date();
    const start = new Date();

    if (preset === "30") {
      start.setDate(end.getDate() - 30);
    } else if (preset === "90") {
      start.setDate(end.getDate() - 90);
    } else if (preset === "year") {
      start.setFullYear(end.getFullYear(), 0, 1);
    } else if (preset === "all") {
      start.setFullYear(2020, 0, 1);
    }

    setLoading(true);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  useEffect(() => {
    let cancelled = false;
    walletApi.getStatement({ startDate, endDate })
      .then((res) => {
        if (cancelled) return;
        if (res.data) {
          setStatementData(res.data);
          setError(null);
        } else {
          setError("Failed to load statement data.");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Error fetching statement");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const token = sessionStorage.getItem("vp_token") || localStorage.getItem("token");
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
      const cleanBase = apiBase.replace(/\/+$/, "");
      const qs = new URLSearchParams({
        startDate: startDate || "",
        endDate: endDate || "",
      }).toString();

      const res = await fetch(`${cleanBase}/wallet/export?${qs}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to generate PDF statement (${res.status})`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `lumbrr-statement-${startDate}-to-${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
      alert(err.message || "Could not download PDF statement.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 22, 55, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        id="printable-statement"
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          overflow: "hidden",
          border: "1px solid #e9e7eb",
          animation: "scaleIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            background: "#001637",
            padding: "20px 24px",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src="/logo2.png"
              alt="Lumbrr"
              style={{ height: 32, width: "auto", filter: "brightness(0) invert(1)" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: 0.3 }}>
                Account Statement
              </div>
              <div style={{ fontSize: 12, color: "#a8c8ff", marginTop: 2 }}>
                Lumbrr Escrow Financial Statement
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="no-print"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <span className="msym" style={{ fontSize: 18 }}>
              close
            </span>
          </button>
        </div>

        {/* Filter Toolbar (hidden during print) */}
        <div
          className="no-print"
          style={{
            padding: "14px 24px",
            background: "#f8f9fa",
            borderBottom: "1px solid #e9e7eb",
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              ["30", "Last 30 Days"],
              ["90", "Last 90 Days"],
              ["year", "This Year"],
              ["all", "All Time"],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => handlePresetChange(val)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  border: `1.5px solid ${rangePreset === val ? "#006c47" : "#e9e7eb"}`,
                  background: rangePreset === val ? "#e8f5e9" : "#fff",
                  color: rangePreset === val ? "#006c47" : "#44474e",
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setRangePreset("custom");
              }}
              style={{
                padding: "5px 8px",
                borderRadius: 6,
                border: "1px solid #c5c6cf",
                fontSize: 12,
                color: "#001637",
              }}
            />
            <span style={{ fontSize: 12, color: "#75777f" }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setRangePreset("custom");
              }}
              style={{
                padding: "5px 8px",
                borderRadius: 6,
                border: "1px solid #c5c6cf",
                fontSize: 12,
                color: "#001637",
              }}
            />
          </div>
        </div>

        {/* Scrollable Statement Body */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
            fontSize: 13,
          }}
        >
          {loading ? (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "#75777f",
                fontWeight: 600,
              }}
            >
              Generating Statement…
            </div>
          ) : error ? (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                color: "#ba1a1a",
                background: "#fef2f2",
                borderRadius: 10,
              }}
            >
              {error}
            </div>
          ) : statementData ? (
            <>
              {/* Account Holder & Summary Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                  paddingBottom: 20,
                  borderBottom: "1px solid #e9e7eb",
                  marginBottom: 20,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "#75777f", textTransform: "uppercase", fontWeight: 700 }}>
                    Account Holder
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#001637", marginTop: 2 }}>
                    {statementData.user.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#75777f" }}>
                    {statementData.user.email}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: "#75777f", textTransform: "uppercase", fontWeight: 700 }}>
                    Statement Period
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#001637", marginTop: 2 }}>
                    {new Date(statementData.period.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{" "}
                    –{" "}
                    {new Date(statementData.period.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div style={{ fontSize: 12, color: "#75777f" }}>
                    {statementData.summary.transactionCount} Transactions
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: "#75777f", textTransform: "uppercase", fontWeight: 700 }}>
                    Closing Balance
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#006c47", marginTop: 2 }}>
                    ${statementData.summary.closingBalance.toFixed(2)}{" "}
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#75777f" }}>
                      {statementData.wallet.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balances Quick Stats Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                <div style={{ background: "#f8f9fa", padding: "10px 12px", borderRadius: 8, border: "1px solid #e9e7eb" }}>
                  <div style={{ fontSize: 11, color: "#75777f", fontWeight: 600 }}>Opening Balance</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#001637", marginTop: 2 }}>
                    ${statementData.summary.openingBalance.toFixed(2)}
                  </div>
                </div>

                <div style={{ background: "#f8f9fa", padding: "10px 12px", borderRadius: 8, border: "1px solid #e9e7eb" }}>
                  <div style={{ fontSize: 11, color: "#75777f", fontWeight: 600 }}>Total Inflows</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#006c47", marginTop: 2 }}>
                    +${statementData.summary.totalCredits.toFixed(2)}
                  </div>
                </div>

                <div style={{ background: "#f8f9fa", padding: "10px 12px", borderRadius: 8, border: "1px solid #e9e7eb" }}>
                  <div style={{ fontSize: 11, color: "#75777f", fontWeight: 600 }}>Total Outflows</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#ba1a1a", marginTop: 2 }}>
                    -${statementData.summary.totalDebits.toFixed(2)}
                  </div>
                </div>

                <div style={{ background: "#f8f9fa", padding: "10px 12px", borderRadius: 8, border: "1px solid #e9e7eb" }}>
                  <div style={{ fontSize: 11, color: "#75777f", fontWeight: 600 }}>Closing Balance</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#001637", marginTop: 2 }}>
                    ${statementData.summary.closingBalance.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12.5,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f0f2f5", borderBottom: "1.5px solid #d0d3dc", textAlign: "left" }}>
                      <th style={{ padding: "8px 10px", color: "#44474e" }}>Date</th>
                      <th style={{ padding: "8px 10px", color: "#44474e" }}>Reference</th>
                      <th style={{ padding: "8px 10px", color: "#44474e" }}>Description</th>
                      <th style={{ padding: "8px 10px", color: "#44474e", textAlign: "right" }}>Amount</th>
                      <th style={{ padding: "8px 10px", color: "#44474e", textAlign: "right" }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statementData.items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: 24,
                            textAlign: "center",
                            color: "#75777f",
                          }}
                        >
                          No transactions found in this period.
                        </td>
                      </tr>
                    ) : (
                      statementData.items.map((tx) => (
                        <tr
                          key={tx.id}
                          style={{
                            borderBottom: "1px solid #f0f2f5",
                          }}
                        >
                          <td style={{ padding: "10px", color: "#75777f", whiteSpace: "nowrap" }}>
                            {new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </td>
                          <td style={{ padding: "10px", fontFamily: "monospace", fontWeight: 600, color: "#001637", whiteSpace: "nowrap" }}>
                            {tx.reference}
                          </td>
                          <td style={{ padding: "10px", color: "#001637", maxWidth: 220 }}>
                            {tx.description}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              textAlign: "right",
                              fontWeight: 700,
                              color: tx.isCredit ? "#006c47" : "#ba1a1a",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {tx.isCredit ? "+" : "-"}${parseFloat(tx.amount).toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              textAlign: "right",
                              fontWeight: 600,
                              color: "#44474e",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {tx.balance_after !== null ? `$${parseFloat(tx.balance_after).toFixed(2)}` : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer Controls */}
        <div
          className="no-print"
          style={{
            padding: "14px 24px",
            background: "#fbfbfc",
            borderTop: "1px solid #e9e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            gap: 10,
          }}
        >
          <div style={{ fontSize: 12, color: "#75777f" }}>
            Export or print for your tax & accounting records.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf || loading}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: "#fff",
                color: "#001637",
                border: "1px solid #c5c6cf",
                fontWeight: 600,
                fontSize: 12.5,
                cursor: downloadingPdf ? "not-allowed" : "pointer",
                opacity: downloadingPdf ? 0.7 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span className="msym" style={{ fontSize: 16 }}>
                picture_as_pdf
              </span>
              {downloadingPdf ? "Generating PDF…" : "Download PDF"}
            </button>
            <button
              onClick={handlePrint}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "#001637",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span className="msym" style={{ fontSize: 16 }}>
                print
              </span>
              Print Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
