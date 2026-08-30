import React, { useState } from "react";

export default function FAQSection() {
  const [activeTab, setActiveTab] = useState("General");
  const [openIdx, setOpenIdx] = useState(0);

  const faqData = {
    General: [
      {
        q: "What makes LUMBRR different from regular escrow?",
        a: "LUMBRR combines secure escrow with AI-powered dispute resolution, with manual review available when needed.",
      },
      {
        q: "Can projects have multiple milestones?",
        a: "Yes. Projects can be split into up to 10 milestones, each with its own scope, deliverable, and escrowed payment. AI audits each milestone independently before that milestone's funds release.",
      },
      {
        q: "Is there a subscription required?",
        a: "No. The Starter plan is free — you only pay escrow fees (1.25%–3.25%) on successful transactions. Pro ($29/mo) and Enterprise plans unlock unlimited transactions, all 7 AI features, reduced fees, and priority support.",
      },
      {
        q: "How are escrow funds protected?",
        a: "Funds are held securely in regulated, insured escrow accounts with bank-grade security and chargeback protection until the work is approved or the dispute is resolved.",
      },
      {
        q: "What are the 9 steps of the escrow workflow?",
        a: "Project Creation → Contract Generation → Escrow Funding → Project Execution → Deliverable Submission → AI Audit → Approval / Revision Request → Payment Release → Dispute Resolution (if needed). Every step is tracked and timestamped.",
      },
    ],
    Features: [
      {
        q: "How does the AI Deliverable Auditor work?",
        a: "When a provider submits work, the Auditor checks it against the agreed scope. For code it analyses repository structure, tests, and features; for designs and documents it verifies brief completeness.",
      },
      {
        q: "What dispute resolution options exist?",
        a: "You can use automated AI evaluation based on submitted evidence or request human escrow specialist review for complex edge cases.",
      },
      {
        q: "Can I invite external clients or providers?",
        a: "Yes, you can generate secure invite links or email invites for any counterparty to join and sign the escrow agreement.",
      },
    ],
    Resources: [
      {
        q: "Where can I read user guides and documentation?",
        a: "Check out our comprehensive Help Center and Developer Docs for step-by-step guides, API references, and escrow best practices.",
      },
      {
        q: "Which payment methods and currencies are supported?",
        a: "We support USD, NGN, EUR, GBP, CAD, and major stablecoins via bank transfer, cards, and wire payments.",
      },
    ],
  };

  const currentQuestions = faqData[activeTab] || faqData.General;

  return (
    <section
      id="faq"
      style={{
        background: "#ffffff",
        padding: "90px 1.5rem 100px",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
        {/* Main Heading */}
        <h2
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(30px, 4vw, 44px)",
            fontWeight: 600,
            color: "rgba(0, 0, 0, 1)",
            marginBottom: 12,
            lineHeight: 1.2,
          }}
        >
          Frequently asked questions
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 16,
            color: "rgba(0, 0, 0, 1)",
            marginBottom: 32,
          }}
        >
          Can't find the answer here? Check out our{" "}
          <a
            href="#help"
            style={{
              color: "#000000",
              textDecoration: "underline",
              fontWeight: 600,
            }}
          >
            Help Center.
          </a>
        </p>

        {/* Filter Pills / Tabs */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "#EBE9F5",
            padding: "10px",
            borderRadius: 10,
            marginBottom: 36,
            gap: 4,
            border: "1px solid rgba(190, 205, 192, 1)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["General", "Features", "Resources"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setOpenIdx(0);
                }}
                style={{
                  background: isActive
                    ? "linear-gradient(165deg, #47E05C 0%, #075C1F 70%, #031c14 100%)"
                    : "transparent",
                  color: isActive ? "#ffffff" : "#475569",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 22px",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                  transition: "all .18s ease",
                  boxShadow: isActive
                    ? "0 2px 8px rgba(15, 165, 57, 0.3)"
                    : "none",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Accordion Box */}
        <div
          style={{
            background: "#F5F3FB",
            border: "1px solid #ECE7F7",
            borderRadius: 24,
            padding: "36px 36px",
            textAlign: "left",
            boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
          }}
        >
          {currentQuestions.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  borderBottom:
                    idx === currentQuestions.length - 1
                      ? "none"
                      : "1px solid #E5E0F2",
                  padding: "20px 0",
                }}
              >
                <div
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    userSelect: "none",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 15.5,
                      fontWeight: 600,
                      color: isOpen ? "#0FA539" : "#1E293B",
                      transition: "color .15s ease",
                    }}
                  >
                    {item.q}
                  </span>

                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 500,
                      color: isOpen ? "#0FA539" : "#94A3B8",
                      flexShrink: 0,
                      lineHeight: 1,
                    }}
                  >
                    {isOpen ? "—" : "+"}
                  </span>
                </div>

                {isOpen && (
                  <div
                    style={{
                      fontSize: 14,
                      color: "#64748B",
                      lineHeight: 1.6,
                      marginTop: 10,
                      paddingRight: 24,
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
