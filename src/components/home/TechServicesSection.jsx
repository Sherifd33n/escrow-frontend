import React from "react";
import { LuCode } from "react-icons/lu";
import { BsShieldCheck } from "react-icons/bs";
import { BiRightArrowAlt } from "react-icons/bi";

export default function TechServicesSection({ onSignup }) {
  const services = [
    {
      title: "Software Development",
      desc: "Protect software projects with scope-based checks across code, features, testing, and deployment.",
      color: "#3F5DE0",
      bg: "#050E3640",
    },
    {
      title: "Mobile App Development",
      desc: "Secure app projects with checks across builds, functionality, screens, and agreed requirements.",
      color: "#880FD9",
      bg: "#DC18EE40",
    },
    {
      title: "Website Development",
      desc: "Verify websites against the agreed scope, design requirements, functionality, and live deployment.",
      color: "#47E05C",
      bg: "#0E884F40",
    },
    {
      title: "Cybersecurity Services",
      desc: "Protect security engagements with structured checks across audits, findings, reports, and compliance requirements.",
      color: "#D61A62",
      bg: "#D61A6240",
    },
    {
      title: "Cloud & DevOps",
      desc: "Secure cloud and DevOps projects with validation of infrastructure, CI/CD, and deployment.",
      color: "#FB0D11",
      bg: "#FB0D113D",
    },
    {
      title: "UI/UX & Product Design",
      desc: "Verify design deliverables including wireframes, UI kits, prototypes, and design systems.",
      color: "#3FE0DD",
      bg: "#3FE0DD40",
    },
    {
      title: "AI Development",
      desc: "Protect AI/ML projects with checks across models, data, performance, and expected outcomes.",
      color: "#816AE5",
      bg: "#816AE540",
    },
    {
      title: "IT Consulting",
      desc: "Secure consulting projects with clear deliverables for strategy, documentation, and implementation plans.",
      color: "#FFFFFF",
      bg: "#FFFFFF3D",
    },
    {
      title: "Data Analytics",
      desc: "Protect analytics projects with verification for dashboards, pipelines, reports, accuracy, and business logic.",
      color: "#9C9FAB",
      bg: "#54565C40",
    },
    {
      title: "Technical Documentation",
      desc: "Verify technical docs including APIs, SOPs, architecture diagrams, manuals, and supporting content.",
      color: "#D2C021",
      bg: "#796E0D40",
    },
  ];

  return (
    <section
      id="tech-services"
      style={{
        background: "linear-gradient(180deg, #155727 -30%, #111e6e 100%)",
        padding: "50px 1.5rem 60px",
        color: "#ffffff",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        {/* Tag Pill */}
        <div
          style={{
            display: "inline-block",
            padding: "14px 28px",
            borderRadius: 30,
            background: "#151A5740",
            border: "1px solid #151A57",
            color: "#00E676",
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: 15,
          }}
        >
          TECHNOLOGY SERVICES
        </div>

        {/* Heading */}
        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "clamp(28px, 4.2vw, 45px)",
            fontWeight: 500,
            color: "#ffffff",
            letterSpacing: "-.5px",
            marginBottom: 10,
            lineHeight: 1.18,
            maxWidth: 780,
            margin: "0 auto 12px",
          }}
        >
          Escrow protection across{" "}
          <span
            style={{ color: "#47E05C", fontFamily: "'Pattaya', sans-serif" }}
          >
            every
          </span>{" "}
          technology service.
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(14px, 1.8vw, 16px)",
            color: "#A1A1AA",
            maxWidth: 680,
            margin: "0 auto 60px",
            lineHeight: 1.6,
          }}
        >
          Every technology project gets protected payments, clearly defined
          deliverables, and AI-powered oversight from start to resolution.
        </p>

        {/* Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: 20,
            textAlign: "left",
          }}
        >
          {services.map((s) => (
            <div
              key={s.title}
              style={{
                background: "linear-gradient(90deg, #1e4e5e 50%, #1b497a 100%)",
                backdropFilter: "blur(12px)",
                border: "1px solid #5457EA6E",
                borderRadius: 16,
                padding: "18px 14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform .2s, border-color .2s, background .2s",
                boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "rgba(0, 230, 118, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(0, 200, 83, 0.2)";
              }}
            >
              <div>
                {/* Icon & Title */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 55,
                      height: 50,
                      borderRadius: 10,
                      background: s.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: s.color,
                      fontWeight: 800,
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    <LuCode size={30} />
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 500,
                      color: "#ffffff",
                      lineHeight: 1.3,
                    }}
                  >
                    {s.title}
                  </h3>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: 13,
                    color: "#AFB4B8",
                    lineHeight: 1.5,
                    marginBottom: 20,
                  }}
                >
                  {s.desc}
                </p>
              </div>

              {/* Card Footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingTop: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "#00E676",
                  }}
                >
                  <span className="msym" style={{ fontSize: 14 }}>
                    <BsShieldCheck size={14} />
                  </span>
                  <span>AI audited</span>
                </div>
                <button
                  onClick={onSignup}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#00E676",
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Start a Project <BiRightArrowAlt size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
