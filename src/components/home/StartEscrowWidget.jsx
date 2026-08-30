import React, { useState } from "react";
import { CATS, CURR } from "../../data/constants";
import { LuShieldCheck } from "react-icons/lu";
import { PiCurrencyDollarBold } from "react-icons/pi";
import { RiArrowRightLongLine } from "react-icons/ri";
import { GoShieldCheck } from "react-icons/go";
import { TbSparkles2 } from "react-icons/tb";

export default function StartEscrowWidget({ onSignup }) {
  const [role, setRole] = useState("client");
  const [cat, setCat] = useState("software");
  const [amt, setAmt] = useState("");
  const [cur, setCur] = useState("USD");

  return (
    <section
      id="start-escrow"
      style={{
        padding: "0 1.5rem",
        marginTop: -100,
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
          border: "1px solid #e2e8f0",
          padding: "36px 32px",
        }}
      >
        {/* Header Block */}
        <div
          style={{
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#046D22",
              letterSpacing: ".8px",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            START AN ESCROW
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: 44,
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "clamp(24px, 3vw, 38px)",
                  fontWeight: 600,
                  color: "#000000",
                  lineHeight: 1.2,
                  letterSpacing: ".8px",
                }}
              >
                Protect your next{" "}
                <span style={{ color: "#046D22" }}>technology</span> project
              </h2>
              <p style={{ fontSize: 15, color: "#797982", marginTop: 10 }}>
                Set up the terms, secure the payment, and start work with
                confidence.
              </p>
            </div>

            {/* Protected Payment Info Badge Box */}
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <div>
                <LuShieldCheck size={50} color="#046D22" />
              </div>

              <div>
                <div
                  style={{ fontSize: 16, fontWeight: 700, color: "#046D22" }}
                >
                  Your payment stays protected
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#797982",
                    lineHeight: 1.4,
                    marginTop: 2,
                  }}
                >
                  Funds are held securely in escrow and released only when the
                  work is approved or the dispute is resolved.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "#f1f5f9", marginBottom: 28 }} />

        {/* Form Controls */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: 24,
            marginBottom: 24,
          }}
        >
          {/* Who are you */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 16,
                fontWeight: 600,
                color: "#475569",
                letterSpacing: "1.7px",
                textTransform: "uppercase",
                marginBottom: 12,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              WHO ARE YOU?
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setRole("client")}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 0px",
                  borderRadius: 10,
                  border: `2px solid ${role === "client" ? "#00B852" : "#e2e8f0"}`,
                  background: role === "client" ? "#f0fdf4" : "#ffffff",
                  color: role === "client" ? "#00B852" : "#475569",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                <span className="msym" style={{ fontSize: 28 }}>
                  person
                </span>{" "}
                Client
              </button>
              <button
                onClick={() => setRole("provider")}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 0px",
                  borderRadius: 10,
                  border: `2px solid ${role === "provider" ? "#00B852" : "#e2e8f0"}`,
                  background: role === "provider" ? "#f0fdf4" : "#ffffff",
                  color: role === "provider" ? "#00B852" : "#475569",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                <span className="msym" style={{ fontSize: 23 }}>
                  work
                </span>{" "}
                Provider
              </button>
            </div>
          </div>

          {/* Project Type */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 16,
                fontWeight: 600,
                color: "#475569",
                letterSpacing: "1.7px",
                textTransform: "uppercase",
                marginBottom: 12,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              PROJECT TYPE
            </label>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              style={{
                width: "100%",
                height: 54,
                padding: "0px 14px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                background: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                color: "#1e293b",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {CATS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Project Value */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 18,
              fontWeight: 600,
              color: "#475569",
              letterSpacing: "1.7px",
              textTransform: "uppercase",
              marginBottom: 12,
              paddingTop: 15,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            PROJECT VALUE
          </label>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 58,
              alignItems: "center",
              justifyContent: "space-between",
              gap: 18,
            }}
          >
            <div
              style={{
                height: 54,
                border: "1.5px solid #e2e8f0",
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                color: "#00B852",
                width: "100%",
              }}
            >
              {/* Dollar Icon */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  width: 50,
                  flexShrink: 0,
                  borderRadius: "10px 0 0 10px",
                  background: "#f0fdf4",
                  borderRight: "1.5px solid #e2e8f0",
                }}
              >
                <PiCurrencyDollarBold size={22} />
              </div>

              {/* Input wrapper */}
              <div
                style={{
                  flex: 1,
                  height: "100%",
                }}
              >
                <input
                  type="number"
                  placeholder=""
                  value={amt}
                  disabled
                  onChange={(e) => setAmt(e.target.value)}
                  style={{
                    width: "100%",
                    height: "100%",
                    padding: "0 14px",
                    border: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                />
              </div>
            </div>

            <select
              value={cur}
              onChange={(e) => setCur(e.target.value)}
              style={{
                width: "150px",
                height: 54,
                padding: "0 10px",
                borderRadius: "7px",
                border: "1.5px solid #e2e8f0",
                background: "#ffffff",
                fontSize: 13,
                fontWeight: 700,
                color: "#334155",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {CURR.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onSignup}
          style={{
            width: "100%",
            height: 56,
            background: "#046D22",
            color: "#ffffff",
            border: "none",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 17,
            gap: 8,
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 8px 20px rgba(0,108,71,0.25)",
            transition: "transform .15s, background .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#006c47")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#046D22")}
        >
          <>
            {role === "client" ? "Protect My Payment" : "Get Paid on Delivery"}

            <div style={{ marginTop: 5 }}>
              <RiArrowRightLongLine size={22} />
            </div>
          </>
        </button>

        {/* Footer Subtext */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 24,
            marginTop: 27,
            fontSize: 13,
            color: "#888B8E",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <GoShieldCheck color="#888B8E" size={20} /> Free to register
          </span>
          <span>•</span>
          <span
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <TbSparkles2 color="#888B8E" size={24} />
            AI dispute assessment included
          </span>
        </div>
      </div>
    </section>
  );
}
