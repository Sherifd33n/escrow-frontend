import React from "react";

export default function HowEscrowWorks() {
  return (
    <section
      id="how-escrow-works"
      style={{ background: "#ffffff", padding: "90px 1.5rem 70px" }}
    >
      <div style={{ maxWidth: 1140, margin: "0 auto", textAlign: "center" }}>
        {/* Section Header */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#046D22",
            letterSpacing: "6%",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          HOW ESCROW WORKS
        </div>
        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "clamp(24px, 3vw, 54px)",
            fontWeight: 600,
            color: "#000000",
            letterSpacing: "0px",
            marginBottom: 16,
            marginInline: "clamp(20px, 8vw, 200px)",
            lineHeight: 1.2,
          }}
        >
          Your payment stays <span style={{ color: "#00B852" }}>protected</span>{" "}
          until the work is resolved.
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "#797982",
            marginTop: 10,
            maxWidth: 640,
            margin: "0 auto 45px",
            lineHeight: 1.6,
          }}
        >
          Funds are secured in escrow while the project is completed. Payment is
          released when the agreed work is approved or held while a dispute is
          reviewed.
        </p>

        <hr
          style={{
            backgroundColor: "#D7D7D7",
            height: 1,
            border: "none",
            marginBottom: 45,
          }}
        />
        {/* 3 Main Steps Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: 32,
            alignItems: "center",
            position: "relative",
            marginBottom: 28,
          }}
        >
          {[
            {
              n: 1,
              title: "CLIENT FUNDS",
              desc: "Payment is made and held securely in escrow.",
              icon: "person",
            },
            {
              n: 2,
              title: "WORK IS VERIFIED",
              desc: "Deliverables are reviewed against the agreed scope and terms.",
              icon: "verified_user",
            },
            {
              n: 3,
              title: "PAYMENT IS RELEASED",
              desc: "Once the work is approved, payment is released to the provider.",
              icon: "account_balance",
            },
          ].map((s, i) => (
            <div key={s.n} style={{ position: "relative" }}>
              {/* Connector Arrow for step 1 & 2 on desktop */}
              {i < 2 && (
                <div
                  className="ndsk"
                  style={{
                    position: "absolute",
                    right: "-20%",
                    top: "35%",
                    transform: "translateY(-50%)",
                    width: "35%",
                    borderTop: "2px dashed #cbd5e1",
                    zIndex: 1,
                  }}
                />
              )}

              <div style={{ position: "relative", zIndex: 2 }}>
                {/* Large Green Circle Icon */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      background: "#BDFFC666",
                      margin: "0 auto 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="msym"
                      style={{ fontSize: 58, color: "#374957" }}
                    >
                      {s.icon}
                    </span>
                  </div>
                  {/* Step Number Circle Badge */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#09A836",
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {s.n}
                  </div>
                </div>

                <h3
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#000000",
                    marginBottom: 8,
                    marginTop: 15,
                    letterSpacing: ".2px",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "#374957",
                    lineHeight: 1.6,
                    maxWidth: 260,
                    margin: "0 auto",
                  }}
                >
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Divider Pill Badge: IF A DISPUTE ARISES */}
        <div style={{ position: "relative", marginBottom: 28 }}>
          <div
            style={{
              height: 1,
              background: "#e2e8f0",
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
            }}
          />
          <div
            style={{
              position: "relative",
              display: "inline-block",
              background: "#F5F5F5",
              borderRadius: 8,
              padding: "16px 28px",
              fontSize: 16,
              fontWeight: 600,
              color: "#3C3A3A",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            IF A DISPUTE ARISES
          </div>
        </div>

        {/* Dispute Resolution 3 Cards Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "32px 64px",
            textAlign: "left",
          }}
        >
          {[
            {
              title: "DISPUTE RAISED",
              desc: "Either party raises a dispute with supporting evidence.",
              icon: "chat_bubble_outline",
            },
            {
              title: "AI ASSESSMENT",
              desc: "Our AI reviews the terms, work, and evidence with 95% accuracy.",
              icon: "auto_awesome",
            },
            {
              title: "MANUAL REVIEW",
              desc: "For complex cases, our escrow specialists provide a final resolution.",
              icon: "person_search",
            },
          ].map((d, i) => (
            <div
              key={d.title}
              style={{
                position: "relative",
              }}
            >
              {/* Connector Arrow */}
              {i < 2 && (
                <div
                  className="ndsk"
                  style={{
                    position: "absolute",
                    right: "-14%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "10%",
                    borderTop: "3px dashed #880FD9",
                    zIndex: 3,
                  }}
                />
              )}

              {/* Card */}
              <div
                style={{
                  background: "#880FD90F",
                  borderRadius: 16,
                  padding: "24px 20px",
                  position: "relative",
                  zIndex: 2,
                  display: "flex",
                  gap: 20,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      className="msym"
                      style={{
                        fontSize: 30,
                        color: "#7e22ce",
                      }}
                    >
                      {d.icon}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#880FD9",
                      letterSpacing: "0.5px",
                      margin: 0,
                    }}
                  >
                    {d.title}
                  </h4>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#888B8E",
                      opacity: 0.8,
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {d.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
