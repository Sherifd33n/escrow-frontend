import React from "react";

export default function TransactionReceiptModal({ tx, onClose, user }) {
  if (!tx) return null;

  const isCredit = [
    "deposit",
    "escrow_release",
    "escrow_refund",
  ].includes(tx.type);

  const formattedDate = new Date(tx.created_at || tx.date).toLocaleString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    },
  );

  let meta = tx.metadata;
  if (meta && typeof meta === "string") {
    try {
      meta = JSON.parse(meta);
    } catch (e) {
      meta = null;
    }
  }

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
        id="printable-receipt"
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          overflow: "hidden",
          border: "1px solid #e9e7eb",
          animation: "scaleIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Receipt Top Banner */}
        <div
          style={{
            background: "#001637",
            padding: "24px 24px 20px",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img
                src="/logo2.png"
                alt="Lumbrr"
                style={{ height: 28, width: "auto", filter: "brightness(0) invert(1)" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.5 }}>
                Lumbrr
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#a8c8ff",
                marginTop: 4,
                fontWeight: 500,
              }}
            >
              Official Transaction Receipt
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

        {/* Amount & Status Badge */}
        <div
          style={{
            textAlign: "center",
            padding: "24px 20px 16px",
            borderBottom: "1px dashed #e0e0e0",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: 20,
              background: isCredit ? "#e8f5e9" : "#fbe9e7",
              color: isCredit ? "#006c47" : "#ba1a1a",
              fontWeight: 700,
              fontSize: 12,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {tx.status || "Completed"}
          </div>
          <div
            style={{
              fontSize: "clamp(24px, 5vw, 32px)",
              fontWeight: 800,
              color: isCredit ? "#006c47" : "#ba1a1a",
            }}
          >
            {isCredit ? "+" : "-"}${parseFloat(tx.amount || 0).toFixed(2)}{" "}
            <span style={{ fontSize: 15, fontWeight: 600, color: "#75777f" }}>
              {tx.currency || "USD"}
            </span>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#44474e",
              marginTop: 6,
              fontWeight: 500,
              maxWidth: 380,
              margin: "6px auto 0",
            }}
          >
            {tx.description}
          </div>
        </div>

        {/* Itemized Details Table */}
        <div style={{ padding: "18px 24px", fontSize: 13 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #f0f2f5",
            }}
          >
            <span style={{ color: "#75777f", fontWeight: 500 }}>Reference ID</span>
            <span
              style={{
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#001637",
              }}
            >
              {tx.reference || "N/A"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #f0f2f5",
            }}
          >
            <span style={{ color: "#75777f", fontWeight: 500 }}>Date & Time</span>
            <span style={{ color: "#001637", fontWeight: 600 }}>
              {formattedDate}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #f0f2f5",
            }}
          >
            <span style={{ color: "#75777f", fontWeight: 500 }}>Transaction Type</span>
            <span
              style={{
                textTransform: "capitalize",
                fontWeight: 600,
                color: "#001637",
              }}
            >
              {(tx.type || "").replace(/_/g, " ")}
            </span>
          </div>

          {tx.balance_before !== null && tx.balance_before !== undefined && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #f0f2f5",
              }}
            >
              <span style={{ color: "#75777f", fontWeight: 500 }}>
                Balance Before
              </span>
              <span style={{ color: "#44474e", fontWeight: 600 }}>
                ${parseFloat(tx.balance_before).toFixed(2)} USD
              </span>
            </div>
          )}

          {tx.balance_after !== null && tx.balance_after !== undefined && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #f0f2f5",
              }}
            >
              <span style={{ color: "#75777f", fontWeight: 500 }}>
                Balance After
              </span>
              <span style={{ color: "#001637", fontWeight: 700 }}>
                ${parseFloat(tx.balance_after).toFixed(2)} USD
              </span>
            </div>
          )}

          {meta?.amount_ngn && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #f0f2f5",
              }}
            >
              <span style={{ color: "#75777f", fontWeight: 500 }}>
                Local Amount (NGN)
              </span>
              <span style={{ color: "#001637", fontWeight: 600 }}>
                ₦{Number(meta.amount_ngn).toLocaleString()}
              </span>
            </div>
          )}

          {meta?.exchange_rate && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #f0f2f5",
              }}
            >
              <span style={{ color: "#75777f", fontWeight: 500 }}>
                FX Exchange Rate
              </span>
              <span style={{ color: "#001637", fontWeight: 600 }}>
                ₦{parseFloat(meta.exchange_rate).toLocaleString()}/$
              </span>
            </div>
          )}

          {meta?.bank_name && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #f0f2f5",
              }}
            >
              <span style={{ color: "#75777f", fontWeight: 500 }}>
                Destination Bank
              </span>
              <span style={{ color: "#001637", fontWeight: 600 }}>
                {meta.bank_name} ({meta.account_number_masked})
              </span>
            </div>
          )}

          {user && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
              }}
            >
              <span style={{ color: "#75777f", fontWeight: 500 }}>Account Holder</span>
              <span style={{ color: "#001637", fontWeight: 600 }}>
                {user.name} ({user.email})
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className="no-print"
          style={{
            padding: "16px 24px 20px",
            background: "#fbfbfc",
            borderTop: "1px solid #e9e7eb",
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 10,
              background: "#001637",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span className="msym" style={{ fontSize: 16 }}>
              print
            </span>
            Print / Save Receipt
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              background: "#fff",
              color: "#44474e",
              border: "1px solid #c5c6cf",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
