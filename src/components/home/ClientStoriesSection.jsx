import React from "react";

export default function ClientStoriesSection() {
  const stories = [
    {
      quote:
        "“We used Escrow for a $40k backend build. The AI audit caught a missing API endpoint before we released payment. Worth every cent.”",
      author: "Tunde A.",
      role: "Startup CTO",
      initial: "T",
    },
    {
      quote:
        "“As a provider I love that clients can't withhold payment arbitrarily. The AI audit proves the work is complete. Total peace of mind.”",
      author: "David L.",
      role: "Freelance Dev",
      initial: "D",
    },
    {
      quote:
        "“We ran three simultaneous projects. The health monitor flagged one going off-track early. Dispute avoided entirely.”",
      author: "Aisha M.",
      role: "Agency Director",
      initial: "A",
    },
  ];

  return (
    <section
      id="client-stories"
      style={{
        background: "#f4f5f8",
        padding: "60px 1.5rem 80px",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", textAlign: "center" }}>
        {/* Badge */}
        <div
          style={{
            display: "inline-block",
            padding: "12px 18px",
            borderRadius: 20,
            border: "1px solid grey",
            background: "#E2E8F0",
            color: "#475569",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          Client Stories
        </div>

        {/* Heading */}
        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "clamp(28px, 3.5vw, 42px)",
            fontWeight: 600,
            color: "#0F172A",
            marginBottom: 44,
            lineHeight: 1.2,
            letterSpacing: 1.2,
          }}
        >
          1.8M+ customers trust Escrow
        </h2>

        {/* Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: 24,
            textAlign: "left",
          }}
        >
          {stories.map((s) => (
            <div
              key={s.author}
              style={{
                background: "#ffffff",
                border: "1px solid #E2E8F0",
                borderRadius: 16,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
                transition: "transform .2s, box-shadow .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 28px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.02)";
              }}
            >
              <div>
                {/* 5 Green Stars */}
                <div
                  style={{
                    display: "flex",
                    gap: 3,
                    color: "#00E676",
                    fontSize: 17,
                    marginBottom: 16,
                  }}
                >
                  {"★★★★★"}
                </div>

                {/* Quote */}
                <p
                  style={{
                    fontSize: 13.5,
                    color: "#334155",
                    lineHeight: 1.7,
                    fontStyle: "italic",
                    marginBottom: 24,
                  }}
                >
                  {s.quote}
                </p>
              </div>

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "#0F172A",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {s.initial}
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#0F172A",
                    }}
                  >
                    {s.author}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#64748B" }}>
                    {s.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
