import React from "react";
import { LuCrosshair } from "react-icons/lu";
import { BsArrowRight } from "react-icons/bs";

export default function StatsAndWorkflow({ onSignup }) {
  const steps = [
    {
      n: "01",
      title: "Project Creation",
      desc: "Client creates the project, selects service type, describes requirements, and invites the service provider.",
      badge: "Initiation",
      color: "#1A55D6",
      bg: "#1A55D624",
      who: "Client",
      why: "Sets a clear starting point for the project.",
    },
    {
      n: "02",
      title: "Contract Generation",
      desc: "AI automatically drafts a binding escrow contract covering deliverables, timelines, revision rounds, and dispute terms.",
      badge: "AI Contract",
      color: "#880FD9",
      bg: "#880FD924",
      who: "AI System",
      why: "Everyone agrees on the rules before work begins.",
    },
    {
      n: "03",
      title: "Escrow Funding",
      desc: "Client deposits the agreed amount into escrow. Funds are held in a regulated trust account and the provider is notified to begin work.",
      badge: "Protected",
      color: "#47E05C",
      bg: "#47E05C24",
      who: "Client",
      why: "Payment is secured before any work starts.",
    },
    {
      n: "04",
      title: "Project Execution",
      desc: "Provider works on the project. AI Project Health Monitor tracks progress, milestones, and flags risks in real time.",
      badge: "AI Monitor",
      color: "#0EB524",
      bg: "#0EB52424",
      who: "Provider + AI",
      why: "Keeps the project on track and transparent.",
    },
    {
      n: "05",
      title: "Deliverable Submission",
      desc: "Provider submits the completed work and supporting materials-code repo, designs, documents, live URL, or deployment link.",
      badge: "Submission",
      color: "#545DC6",
      bg: "#545DC624",
      who: "Provider",
      why: "Work is submitted for official review.",
    },
    {
      n: "06",
      title: "AI Audit",
      desc: "AI Deliverable Auditor checks completeness, quality, and scope compliance across all file types and requirements.",
      badge: "AI Audit",
      color: "#22BB6F",
      bg: "#22BB6F24",
      who: "AI System",
      why: "Objective, consistent, and fast verification.",
    },
    {
      n: "07",
      title: "Approval / Revision",
      desc: "Client reviews the work and AI audit report. They approve the deliverables or request revisions with specific feedback.",
      badge: "Review",
      color: "#1ACFD6",
      bg: "#1ACFD624",
      who: "Client",
      why: "Ensures the work meets expectations.",
    },
    {
      n: "08",
      title: "Payment Release",
      desc: "On approval, funds are released instantly from escrow to the provider's account. Transaction is marked complete.",
      badge: "Paid",
      color: "#D61A62",
      bg: "#D61A6224",
      who: "Escrow System",
      why: "Fast, secure, and final payment.",
    },
    {
      n: "09",
      title: "Dispute Resolution",
      desc: "AI reviews the agreement, deliverables, and evidence to recommend a resolution. Complex cases can go to manual review.",
      badge: "AI Dispute",
      color: "#FB0D11",
      bg: "#FB0D1124",
      who: "AI System / Escrow Specialists",
      why: "Fair, evidence-based outcomes for both parties.",
    },
  ];

  return (
    <section
      id="workflow"
      style={{
        padding: "60px 1.5rem 90px",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
        }}
      >
        {/* Stats Row (4 Cards) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: 20,
            marginBottom: 80,
            borderBlock: "1px solid #e2e8f0",
            paddingBlock: 30,
          }}
        >
          {[
            ["5B+", "Total value protected"],
            ["1.8M+", "Customers worldwide"],
            ["10", "Tech service categories"],
            ["98.7%", "Dispute-free rate"],
          ].map(([val, lbl]) => (
            <div
              key={lbl}
              style={{
                background: "#F5F5F5",
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                padding: "24px 20px",
                textAlign: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(26px, 3vw, 30px)",
                  fontWeight: 600,
                  color: "#0f172a",
                  letterSpacing: "-.5px",
                }}
              >
                {val}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 12 }}>
                {lbl}
              </div>
            </div>
          ))}
        </div>

        {/* 9-Step Section Header */}
        <div style={{ textAlign: "center", marginBottom: 54 }}>
          <div
            style={{
              display: "inline-block",
              background: "#DFE0E4",
              border: "1px solid #6B6666",
              borderRadius: 30,
              padding: "16px 25px",
              fontSize: 16,
              fontWeight: 600,
              color: "#000000",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: 25,
            }}
          >
            COMPLETE ESCROW WORKFLOW
          </div>
          <h2
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 600,
              color: "#000000",
              letterSpacing: "0px",
            }}
          >
            <span style={{ color: "#046D22" }}>9-Step</span> AI-Powered Process
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              color: "#797982",
              maxWidth: 680,
              margin: "14px auto 0",
              lineHeight: 1.6,
            }}
          >
            From project creation to payment release, every transaction is
            structured, protected, and supported by intelligent oversight.
          </p>
        </div>

        {/* 9 Step Cards Grid (3 Columns) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: 24,
            marginBottom: 52,
          }}
        >
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 18,
                padding: "24px 22px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                {/* Header of Step Card */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 600,
                        color: s.color,
                        background: s.bg,
                        padding: "3px 7px",
                        borderRadius: 8,
                      }}
                    >
                      {s.n}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        color: "#797982",
                        fontWeight: 500,
                      }}
                    >
                      Step {parseInt(s.n)} of 9
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      padding: "3px 14px",
                      borderRadius: 12,
                      background: s.bg,
                      color: s.color,
                    }}
                  >
                    {s.badge}
                  </span>
                </div>

                {/* Icon & Title */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
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
                      style={{ fontSize: 35, color: s.color }}
                    >
                      description
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#000000",
                      }}
                    >
                      {s.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#797982",
                        lineHeight: 1.6,
                      }}
                    >
                      {s.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Who & Why Footer Meta */}
              <div
                style={{
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  fontSize: 12,
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    color: "#000000",
                  }}
                >
                  <span
                    className="msym"
                    style={{ fontSize: 24, color: s.color }}
                  >
                    person
                  </span>
                  <span>
                    <strong>Who:</strong>{" "}
                    <span style={{ color: "#888B8E" }}>{s.who}</span>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    color: "#000000",
                  }}
                >
                  <span
                    className="msym"
                    style={{ fontSize: 24, color: s.color }}
                  >
                    <LuCrosshair />
                  </span>
                  <span>
                    <strong>Why it matters:</strong>{" "}
                    <span style={{ color: "#888B8E" }}>{s.why}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Centered Bottom CTA Button */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={onSignup}
            style={{
              background: "#001637",
              color: "#ffffff",
              border: "none",
              borderRadius: 12,
              padding: "18px 50px",
              fontSize: 18,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 5px 10px rgba(3,24,43,0.3)",
              transition: "transform .18s, background .18s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            Start a Project <BsArrowRight style={{ marginTop: 2 }} />
          </button>
        </div>
      </div>
    </section>
  );
}
