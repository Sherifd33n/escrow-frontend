import React from "react";
import {
  LuFileText,
  LuFolder,
  LuCrosshair,
  LuSparkle,
} from "react-icons/lu";
import { CiCircleCheck } from "react-icons/ci";

export default function AIDisputeResolutionSection() {
  const steps = [
    {
      num: 1,
      title: "Dispute Opened",
      desc: "A dispute is raised by either party with reasons and supporting evidence.",
      icon: LuFileText,
      iconColor: "#1ACFD6",
    },
    {
      num: 2,
      title: "Evidence Reviewed",
      desc: "AI collects and analyzes all submitted evidence, files, messages, and activity logs.",
      icon: LuFolder,
      iconColor: "#B24AF8",
    },
    {
      num: 3,
      title: "Scope Matched",
      desc: "AI compares the delivered work against the agreed scope and deliverables.",
      icon: LuCrosshair,
      iconColor: "#1AD6A7",
    },
    {
      num: 4,
      title: "AI Assessment",
      desc: "AI evaluates the evidence and determines which party met the agreed terms.",
      icon: LuSparkle,
      iconColor: "#47E05C",
    },
    {
      num: 5,
      title: "Resolution",
      desc: "A resolution is recommended by AI or the case is escalated for manual review.",
      icon: CiCircleCheck,
      iconColor: "#A0E047",
    },
  ];

  return (
    <section
      id="ai-dispute"
      style={{
        background: "#08046d",
        padding: "50px 1.5rem 100px",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "350px",
          background:
            "radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Top Pill Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 24px",
            borderRadius: 30,
            background: "#181782",
            border: "1px solid #1e3a8a",
            color: "#2EC85A",
            fontSize: 12.5,
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: 20,
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          AI DISPUTE RESOLUTION
        </div>

        {/* Main Headline */}
        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "clamp(28px, 4.2vw, 45px)",
            fontWeight: 500,
            color: "#ffffff",
            letterSpacing: "-.5px",
            marginBottom: 10,
            lineHeight: 1.18,
            maxWidth: 820,
            margin: "0 auto 12px",
          }}
        >
          When work is disputed, the
          <span style={{ color: "#47E05C", fontFamily: "'Pattaya', cursive" }}>
            {" "}
            evidence
          </span>{" "}
          speaks.
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(14px, 1.8vw, 17px)",
            color: "#A1A1AA",
            maxWidth: 680,
            margin: "0 auto 60px",
            lineHeight: 1.6,
          }}
        >
          Our AI reviews the agreed scope, contract, deliverables,
          communications, and supporting evidence to assess what was delivered
          against what was promised. If the case requires human judgment, it can
          be escalated for manual review.
        </p>

        {/* Outer Card: How AI Dispute Resolution Works */}
        <div
          style={{
            background: "linear-gradient(180deg, #070e52 0%, #070e52 100%)",
            border: "1px solid #03400B",
            borderRadius: 20,
            padding: "32px 28px 40px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: "#ffffff",
              textAlign: "left",
              marginBottom: 32,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            How AI Dispute Resolution Works
          </div>

          {/* 5 Steps Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
              gap: 16,
              alignItems: "stretch",
              position: "relative",
            }}
          >
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  {/* Step Number Badge + Connector Line */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      position: "relative",
                      marginBottom: 20,
                    }}
                  >
                    {/* Horizontal connector line on left/right on desktop */}
                    {idx < steps.length - 1 && (
                      <div
                        className="ndsk"
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          width: "100%",
                          height: "0px",
                          borderTop: "2px dashed #38BB80",
                          zIndex: 1,
                        }}
                      />
                    )}

                    {/* Circle Node */}
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "#080f2d",
                        border: "2px solid #2563eb",
                        color: "#93c5fd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 16,
                        position: "relative",
                        zIndex: 2,
                        boxShadow: "0 0 14px rgba(37, 99, 235, 0.4)",
                      }}
                    >
                      {step.num}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div
                    style={{
                      background: "#09056e",
                      border: "1px solid #00C3D000",
                      borderRadius: 14,
                      padding: "20px 16px",
                      width: "100%",
                      flex: 1,
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                      boxSizing: "border-box",
                      transition: "transform .2s, border-color .2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={20} color={step.iconColor} />
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#ffffff",
                        }}
                      >
                        {step.title}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#FFFFFF",
                        lineHeight: 1.7,
                      }}
                    >
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tree Branching Line System */}
        <div style={{ position: "relative", width: "100%", height: "48px" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "2px",
              height: "24px",
              background: "rgba(59, 130, 246, 0.4)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "25%",
              right: "25%",
              height: "24px",
              borderTop: "2px solid rgba(59, 130, 246, 0.4)",
              borderLeft: "2px solid rgba(59, 130, 246, 0.4)",
              borderRight: "2px solid rgba(59, 130, 246, 0.4)",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
          />
        </div>

        {/* Branch Outcome Cards + OR Pill */}
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: 24,
            alignItems: "stretch",
          }}
        >
          {/* Left Branch Card: AI Resolution */}
          <div
            style={{
              background: "#092259",
              border: ".5px solid rgba(71, 224, 92, 1)",
              borderRadius: 16,
              padding: "26px 24px",
              textAlign: "left",
              boxShadow: "0 12px 30px rgba(0, 230, 118, 0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#47E05C",
                    margin: 0,
                  }}
                >
                  AI Resolution
                </h3>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#47E05C",
                    background: "#1c5b5a",
                    padding: "3px 12px",
                    border: "1px solid rgba(71, 224, 92, 0.26)",
                    borderRadius: 20,
                  }}
                >
                  Most cases
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: 15,
                  color: "#D6DADE",
                  lineHeight: 1.5,
                  margin: "0 0 20px 0",
                }}
              >
                AI confidently resolves the dispute based on evidence and agreed
                terms.
              </p>
            </div>

            {/* Check items */}
            <div
              style={{
                borderTop: "1px solid rgba(0, 230, 118, 0.15)",
                paddingTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              {["Fast decision", "Evidence-based", "Fair and unbiased"].map(
                (item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#ffffff",
                    }}
                  >
                    <CiCircleCheck size={20} color="#47E05C" />
                    <span>{item}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Central OR Pill Badge */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#080e2b",
              border: "1px solid #334155",
              color: "#94A3B8",
              fontSize: 11.5,
              fontWeight: 700,
              padding: "10px 10px",
              borderRadius: 20,
              zIndex: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              pointerEvents: "none",
            }}
            className="ndsk"
          >
            OR
          </div>

          {/* Right Branch Card: Manual Review */}
          <div
            style={{
              background: "rgba(45, 17, 139, 0.7)",
              border: "1px solid #A239E9",
              borderRadius: 16,
              padding: "26px 24px",
              textAlign: "left",
              boxShadow: "0 12px 30px rgba(168, 85, 247, 0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#A239E9",
                    margin: 0,
                  }}
                >
                  Manual Review
                </h3>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#c084fc",
                    background: "rgba(168, 85, 247, 0.15)",
                    border: "1px solid rgba(71, 224, 92, 0.26)",
                    padding: "3px 12px",
                    borderRadius: 20,
                  }}
                >
                  Complex cases
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: 14,
                  color: "#cbd5e1",
                  lineHeight: 1.5,
                  margin: "0 0 20px 0",
                }}
              >
                Disputes that require human judgment are reviewed by an escrow
                specialist.
              </p>
            </div>

            {/* Check items */}
            <div
              style={{
                borderTop: "1px solid rgba(168, 85, 247, 0.15)",
                paddingTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              {["Expert review", "Thorough evaluation", "Human judgment"].map(
                (item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#ffffff",
                    }}
                  >
                    <CiCircleCheck size={20} color="#A239E9" />
                    <span>{item}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
