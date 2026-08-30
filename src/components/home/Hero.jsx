import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  LuShieldCheck,
  LuUsersRound,
  LuLockKeyhole,
  LuLandmark,
  LuSparkle,
  LuCode,
  LuImage,
  LuMessageSquare,
} from "react-icons/lu";
import { GiSparkles } from "react-icons/gi";
import { SlEarphonesAlt } from "react-icons/sl";
import { CiCircleCheck } from "react-icons/ci";
import { FaMoneyBill } from "react-icons/fa6";
import { FaRegFileAlt } from "react-icons/fa";
import Gauge from "../ui/Gauge";

export default function Hero({ onSignup }) {
  return (
    <div
      id="hero"
      style={{
        background: `
  linear-gradient(
    to bottom,
    #1d3513 0%,
    #1d3513 30%,
    rgba(29, 53, 19, 0.85) 30%,
    rgba(29, 53, 19, 0) 60%
  ),
  repeating-linear-gradient(
    90deg,
    #162510 0px,
    #162510 74px,
    #1d3513 120px,
    #1d3513 186px,
    #162510 235px,
    #162510 298px,
    #1d3513 345px,
    #1d3513 410px
  )
`,
        position: "relative",
        overflow: "hidden",
        color: "#ffffff",
        paddingBottom: "100px",
      }}
    >
      {/* Main Hero Container */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "48px 1.5rem 80px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
            gap: 48,
            alignItems: "center",
          }}
        >
          {/* Left Column */}
          <div>
            {/* Top Pill Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "15px 25px",
                borderRadius: 30,
                background: "#19401d",
                border: "1px solid #155727",
                color: "#51B56D",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 24,
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              <span>
                <Sparkles size={16} strokeWidth={2} />
              </span>{" "}
              AI DISPUTE RESOLUTION | ESCROW FOR TECHNOLOGY
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "clamp(34px, 4.5vw, 58px)",
                fontWeight: 500,
                lineHeight: 1.22,
                letterSpacing: "-1px",
                marginBottom: 15,
              }}
            >
              The escrow infrastructure for technology services.
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "18px",
                color: "#CECACA",
                lineHeight: 1.5,
                marginBottom: 30,
                maxWidth: 540,
                letterSpacing: 0.5,
              }}
            >
              Secure every technology transaction with protected payments and
              AI-powered dispute resolution, giving clients and providers
              confidence from project start to final delivery.
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginBottom: 44,
              }}
            >
              <button
                onClick={onSignup}
                style={{
                  background: "#0FA539",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 10,
                  padding: "18px 30px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 10px rgba(0,200,83,0.35)",
                  transition: "transform .18s, background .18s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                Start a Project{" "}
                <span className="msym" style={{ fontSize: 18 }}>
                  <ArrowRight size={16} strokeWidth={2} />
                </span>{" "}
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("how-escrow-works");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 10,
                  padding: "14px 24px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "background .18s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                }
              >
                <span className="msym" style={{ fontSize: 18 }}>
                  play_circle
                </span>{" "}
                See How It Works
              </button>
            </div>

            {/* 6 Feature Badges Grid (2 Columns x 3 Rows) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                gap: 18,
                border: "1px solid #081A5042",
                background: "rgba(255,255,255,0.05)",
                borderRadius: 10,
                padding: "22px 18px",
              }}
            >
              {[
                {
                  icon: LuShieldCheck,
                  title: "Funds held securely",
                  desc: "Payments remain protected in escrow until the agreed resolution.",
                },
                {
                  icon: LuUsersRound,
                  title: "KYC verified parties",
                  desc: "Every client and provider is verified for your protection.",
                },
                {
                  icon: LuLockKeyhole,
                  title: "Chargeback protection",
                  desc: "Added protection against payment disputes and reversals.",
                },
                {
                  icon: GiSparkles,
                  title: "AI dispute assessment",
                  desc: "Key evidence is reviewed when disputes arise.",
                },
                {
                  icon: SlEarphonesAlt,
                  title: "24/7 human support",
                  desc: "Real humans ready to help any time, any day.",
                },
                {
                  icon: LuLandmark,
                  title: "Fully Licensed",
                  desc: "Licensed and bonded under financial regulations, with regular independent audits.",
                },
              ].map((f) => {
                const Icon = f.icon;

                return (
                  <div
                    key={f.title}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 39,
                        height: 39,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={33} color="#47E05C" />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#ffffff",
                          marginBottom: 5,
                        }}
                      >
                        {f.title}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: "#e4e1e1ff",
                          lineHeight: 1.6,
                          fontFamily: "'Nunito', sans-serif",
                        }}
                      >
                        {f.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: AI Dispute Audit Card */}
          <div>
            <div
              style={{
                background: "rgba(17, 36, 29, 0.3)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(0, 200, 83, 0.28)",
                borderRadius: 24,
                padding: "26px 24px",
                boxShadow: "0 28px 70px rgba(0,0,0,0.55)",
                color: "#ffffff",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    color: "#47E05C",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 500,
                    fontStyle: "normal",
                    fontSize: 18,
                    lineHeight: "36px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  <LuSparkle size={27} color="#47E05C" />
                  AI DISPUTE AUDIT
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "8px 15px",
                    borderRadius: 20,
                    background: "#04102736 21%",
                    border: "1px solid #EDECEB2E",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <CiCircleCheck color="#0FA539" size={20} /> Audit complete
                </div>
              </div>

              {/* Dispute Details Banner */}
              <div
                style={{
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    borderRadius: 100,
                    background: "rgba(0,200,83,0.15)",
                    border: "1px solid rgba(0,200,83,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    height: "90px",
                    width: "90px",
                  }}
                >
                  <span
                    className="msym"
                    style={{ fontSize: 48, color: "#00E676" }}
                  >
                    description
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 500,
                      color: "#ffffff",
                      fontFamily: "Poppins, sans-serif",
                      letterSpacing: "1.5px",
                    }}
                  >
                    Dispute #2841
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      color: "#C3C3CB",
                      marginTop: 6,
                      marginBottom: 6,
                      fontWeight: 500,
                    }}
                  >
                    Website Development Project
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 12,
                      fontSize: 22,
                      fontWeight: 600,
                      color: "#ffffff",
                      fontFamily: "'inter', 'sans-serif'",
                    }}
                  >
                    <FaMoneyBill color="#47E05C" /> ₦850,000
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 15,
                  marginBottom: 22,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  padding: "16px 0",
                }}
              >
                {[
                  {
                    icon: FaRegFileAlt,
                    label: "Agreement reviewed",
                    badge: "Verified",
                    color: "#00E676",
                  },
                  {
                    icon: LuCode,
                    label: "Deliverables checked",
                    badge: "Matched",
                    color: "#00E676",
                  },
                  {
                    icon: LuImage,
                    label: "Evidence analyzed",
                    badge: "Analyzed",
                    color: "#00E676",
                  },
                  {
                    icon: LuMessageSquare,
                    label: "Agreement reviewed",
                    badge: "Reviewed",
                    color: "#00E676",
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 16,
                        color: "#ffffff",
                        fontFamily: " 'Inter', 'sans-serif'",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                        }}
                      >
                        <CiCircleCheck color="#5651E0" size={27} />
                        <Icon size={25} color={item.color} strokeWidth={2} />

                        <span>{item.label}</span>
                      </div>

                      <span
                        style={{
                          fontSize: 13,
                          width: "90px",
                          fontWeight: 500,
                          padding: "4px 0",
                          borderRadius: 45,
                          background: "#10251d",
                          border: "1px solid rgba(0,200,83,0.25)",
                          color: "#47E05C",
                          textAlign: "center",
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* AI Recommendation Section */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: "#47E05C",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: 14,
                    fontFamily: "'inter', 'sans-serif'",
                  }}
                >
                  AI RECOMMENDATION
                </div>
                <div
                  style={{
                    background: "rgba(4, 16, 39, 0.3)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16,
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 57,
                        height: 57,
                        borderRadius: 50,
                        background: "#47E05C42",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        className="msym"
                        style={{ fontSize: 30, color: "#00E676" }}
                      >
                        balance
                      </span>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "#ffffff",
                        }}
                      >
                        Release payment to provider
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#D2D2D2",
                          lineHeight: 1.4,
                          marginTop: 2,
                          fontWeight: 400,
                        }}
                      >
                        The evidence supports that all agreed deliverables have
                        been completed.
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Gauge />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <button
                  onClick={onSignup}
                  style={{
                    width: "100%",
                    height: "55px",
                    background: "#0FA539",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 10,
                    padding: "12px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(0,200,83,0.3)",
                  }}
                >
                  Accept Recommendation
                </button>
                <button
                  style={{
                    width: "100%",
                    height: "55px",
                    background: "transparent",
                    color: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 10,
                    padding: "11px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Request Manual Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
