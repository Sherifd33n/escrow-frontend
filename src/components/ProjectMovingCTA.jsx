import { BsShieldCheck } from "react-icons/bs";
import { LuLock, LuMoveRight } from "react-icons/lu";
import shieldPedestalImg from "../assets/shield-pedestal.png";
import { Rocket } from "lucide-react";

export default function ProjectMovingCTA({ onSignup }) {
  return (
    <section
      style={{
        padding: "0 1.5rem 80px",
        background: "#ffffff",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          background: "linear-gradient(180deg, #05152b 0%, #031023 100%)",
          borderRadius: 24,
          padding: "18px 28px 18px",
          boxShadow: "0 24px 60px rgba(3, 16, 35, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Ambient Background Glow */}
        <div
          style={{
            position: "absolute",
            top: "-40%",
            right: "-10%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(0, 230, 118, 0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30%",
            left: "-10%",
            width: "350px",
            height: "350px",
            background:
              "radial-gradient(circle, rgba(34, 197, 94, 0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Main Content Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 32,
            position: "relative",
            zIndex: 2,
          }}
          className="cta-grid"
        >
          {/* Left: Rocket Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "#1c304d",
                boxShadow:
                  "0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Green Rocket SVG */}
              <span>
                <Rocket size={58} color="#47E05C" />
              </span>
            </div>
          </div>

          {/* Center: Title, Subtitle, CTA Button */}
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(26px, 3.5vw, 40px)",
                fontWeight: 600,
                color: "#ffffff",
                lineHeight: 1.2,
                marginBottom: 10,
                letterSpacing: "-0.5px",
              }}
            >
              Let’s get your project moving.
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(14px, 1.8vw, 16.5px)",
                color: "#D0D0D2",
                marginBottom: 24,
                fontWeight: 400,
              }}
            >
              Set up your agreement and get started in minutes.
            </p>

            <button
              onClick={onSignup}
              style={{
                background: "#47E05C",
                color: "#041c0f",
                border: "none",
                borderRadius: 8,
                padding: "17px 32px",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 6px 20px rgba(46, 224, 104, 0.35)",
                transition: "all .18s ease",
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(46, 224, 104, 0.45)";
                e.currentTarget.style.background = "#3bf077";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(46, 224, 104, 0.35)";
                e.currentTarget.style.background = "#2ee068";
              }}
            >
              <span>Start an Escrow</span>
              <LuMoveRight size={20} style={{ paddingTop: "2px" }} />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 170,
            }}
          >
            <img
              src={shieldPedestalImg}
              alt="Security Shield"
              style={{
                width: "200px",
                height: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 12px 28px rgba(0, 0, 0, 0.45))",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          </div>
        </div>

        {/* Bottom Trust Indicators Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "20px 28px",
            marginTop: 36,
            paddingTop: 24,
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            color: "rgba(255, 255, 255, 0.65)",
            fontSize: 13.5,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Item 1 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <BsShieldCheck size={18} color="rgba(255, 255, 255, 0.7)" />
            <span>No subscription required</span>
          </div>

          {/* Divider */}
          <span
            style={{ color: "rgba(255, 255, 255, 0.15)", userSelect: "none" }}
            className="cta-divider"
          >
            |
          </span>

          {/* Item 2 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <LuLock size={16} color="rgba(255, 255, 255, 0.7)" />
            <span>Secure &amp; Transparent</span>
          </div>

          {/* Divider */}
          <span
            style={{ color: "rgba(255, 255, 255, 0.15)", userSelect: "none" }}
            className="cta-divider"
          >
            |
          </span>

          {/* Item 3 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <LuLock size={16} color="rgba(255, 255, 255, 0.7)" />
            <span>Pay only on success</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cta-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .cta-divider {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
