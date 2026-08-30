import { useState, useEffect, useRef } from "react";
import { Btn } from "./ui";
import { NAV_ITEMS } from "../data/constants";

export default function Navbar({
  onLogin,
  onSignup,
  navigate,
  user,
  onLogout,
}) {
  const [open, setOpen] = useState(null);
  const [sc, setSc] = useState(false);
  const [mob, setMob] = useState(false);
  const [me, setMe] = useState(null);
  const t = useRef(null);

  useEffect(() => {
    const handleScroll = () => setSc(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        style={{
          background: `
  linear-gradient(
    to bottom,
    #1d3513 0%,
    #1d3513 100%
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
          position: "sticky",
          top: 0,
          zIndex: 500,
          boxShadow: sc ? "0 6px 24px rgba(0,0,0,.45)" : "none",
          transition: "box-shadow 0.25s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 68,
          }}
        >
          {/* Section 1: Logo (Left) */}
          <div
            style={{ display: "flex", alignItems: "center", flex: "1 1 0%" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => {
                if (navigate) navigate(user ? "dashboard" : "home");
                window.scrollTo({ top: 0, behavior: "smooth" });
                setMob(false);
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 22,
                  backgroundImage:
                    "linear-gradient(90deg, #E0519B 20%, #51B56D 80%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                  letterSpacing: "-.4px",
                  fontFamily: "'Poppins', sans-serif",
                  display: "inline-block",
                }}
              >
                LUMBRR
              </span>
            </div>
          </div>

          {/* Section 2: Dropdown Links (Center) */}
          <div
            className="ndsk"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {NAV_ITEMS.map((item) => {
              const isOpen = open === item.label;
              return (
                <div
                  key={item.label}
                  style={{ position: "relative" }}
                  onMouseEnter={() => {
                    clearTimeout(t.current);
                    setOpen(item.label);
                  }}
                  onMouseLeave={() => {
                    t.current = setTimeout(() => setOpen(null), 140);
                  }}
                >
                  <button
                    className="nl"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px 14px",
                      fontWeight: 600,
                      fontSize: 13,
                      letterSpacing: ".4px",
                      textTransform: "uppercase",
                      backgroundImage: isOpen
                        ? "linear-gradient(90deg, #E0519B 20%, #51B56D 80%)"
                        : "none",
                      backgroundClip: isOpen ? "text" : "initial",
                      WebkitBackgroundClip: isOpen ? "text" : "initial",
                      WebkitTextFillColor: isOpen ? "transparent" : "initial",
                      color: isOpen ? "transparent" : "#BCBCBC",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontFamily: "'Inter', sans-serif",
                      transition: "all .18s ease",
                      position: "relative",
                    }}
                  >
                    {item.label}

                    <svg
                      width="9"
                      height="5"
                      viewBox="0 0 10 6"
                      fill="none"
                      style={{
                        transition: "transform .2s",
                        transform: isOpen ? "rotate(180deg)" : "none",
                        stroke: isOpen ? "#51B56D" : "currentColor",
                      }}
                    >
                      <path
                        d="M1 1l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* Gradient Underline on Hover / Open */}
                    {isOpen && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "-2px",
                          left: "14px",
                          right: "14px",
                          height: 2.5,
                          background:
                            "linear-gradient(90deg, #E0519B 20%, #51B56D 80%)",
                          borderRadius: 2,
                          boxShadow: "0 0 10px rgba(81, 181, 109, 0.6)",
                          transition: "all 0.25s ease",
                        }}
                      />
                    )}
                  </button>

                  {/* Dropdown Menu Card */}
                  {isOpen && (
                    <div
                      className="dm"
                      style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#0B281B",
                        border: "1px solid rgba(255,255,255,.15)",
                        borderRadius: 12,
                        boxShadow: "0 14px 40px rgba(0,0,0,.5)",
                        minWidth: 250,
                        zIndex: 600,
                        overflow: "hidden",
                        backdropFilter: "blur(16px)",
                      }}
                    >
                      <div style={{ padding: "8px 0" }}>
                        {item.ch.map((ch) => (
                          <button
                            key={ch.l}
                            className="nl"
                            style={{
                              width: "100%",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "10px 18px",
                              textAlign: "left",
                              transition: "background .15s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(255,255,255,0.06)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "none")
                            }
                            onClick={() => {
                              setOpen(null);
                              if (
                                ch.l === "Subscription Plans" ||
                                ch.l === "Pricing"
                              ) {
                                if (navigate) navigate("subscription");
                              } else if (
                                ch.l === "10 service types" ||
                                ch.l === "Tech Categories"
                              ) {
                                if (navigate) navigate("services");
                              } else if (onSignup) {
                                onSignup();
                              }
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 13.5,
                                color: "#ffffff",
                              }}
                            >
                              {ch.l}
                            </div>
                            <div
                              style={{
                                fontSize: 11.5,
                                color: "rgba(255, 255, 255, 0.6)",
                                marginTop: 2,
                              }}
                            >
                              {ch.d}
                            </div>
                          </button>
                        ))}
                      </div>
                      <div
                        style={{
                          background: "#051A12",
                          borderTop: "1px solid rgba(255,255,255,.08)",
                          padding: "12px 18px",
                        }}
                      >
                        <Btn
                          variant="accent"
                          style={{
                            fontSize: 12,
                            padding: "7px 16px",
                            background: "#00C853",
                            width: "100%",
                          }}
                          onClick={() => {
                            setOpen(null);
                            if (onSignup) onSignup();
                          }}
                        >
                          Get Started Free
                        </Btn>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Section 3: Auth Buttons with Toggle Reaction (Right) */}
          <div
            className="ndsk"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
              flex: "1 1 0%",
            }}
          >
            {user ? (
              <>
                <button
                  onClick={() => navigate && navigate("dashboard")}
                  style={{
                    background: "none",
                    border: "1px solid rgba(255,255,255,.3)",
                    borderRadius: 8,
                    padding: "8px 18px",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Dashboard
                </button>
                <button
                  onClick={onLogout}
                  style={{
                    background: "#00C853",
                    border: "none",
                    borderRadius: 8,
                    padding: "9px 20px",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0,200,83,.3)",
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  style={{
                    background: "none",
                    border: "1px solid #D7D7D7",
                    borderRadius: 10,
                    padding: "11px 27px",
                    color: "#BCBCBC",
                    fontWeight: 500,
                    fontSize: 12,
                    cursor: "pointer",
                    letterSpacing: 1.5,
                    transition: "all .18s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.borderColor = "#ffffff";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#BCBCBC";
                    e.currentTarget.style.borderColor = "#D7D7D7";
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  LOGIN
                </button>
                <button
                  onClick={onSignup}
                  style={{
                    background: "#0C862F",
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 27px",
                    color: "#BCBCBC",
                    fontWeight: 500,
                    fontSize: 12,
                    cursor: "pointer",
                    letterSpacing: 1.5,
                    transition: "all .18s ease",
                    boxShadow: "0 4px 12px rgba(12, 134, 47, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#0FA539";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 18px rgba(12, 134, 47, 0.45)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#0C862F";
                    e.currentTarget.style.color = "#BCBCBC";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(12, 134, 47, 0.3)";
                  }}
                >
                  SIGN UP
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="mbb"
            onClick={() => {
              setMob((o) => !o);
              setMe(null);
            }}
            style={{
              display: "none",
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              flexDirection: "column",
              gap: 5,
              padding: 8,
            }}
            aria-label="Menu"
          >
            {mob ? (
              <span
                className="msym"
                style={{
                  fontSize: 24,
                  color: "#ffffff",
                }}
              >
                close
              </span>
            ) : (
              [0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: "block",
                    width: 24,
                    height: 2,
                    background: "#ffffff",
                    borderRadius: 2,
                  }}
                />
              ))
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mob && (
        <div
          style={{
            background: `
  linear-gradient(
    to bottom,
    #1d3513 0%,
    #162510 100%
  )
`,
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,.12)",
            boxShadow: "0 10px 30px rgba(0,0,0,.5)",
            zIndex: 499,
            position: "fixed",
            top: 68,
            left: 0,
            right: 0,
            maxHeight: "calc(100vh - 68px)",
            overflowY: "auto",
            padding: "16px 0",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              style={{
                borderBottom: "1px solid rgba(255,255,255,.08)",
              }}
            >
              <button
                onClick={() =>
                  setMe((p) => (p === item.label ? null : item.label))
                }
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 1.5rem",
                  fontWeight: 700,
                  fontSize: 15,
                  color: me === item.label ? "#51B56D" : "#ffffff",
                  letterSpacing: ".5px",
                  textTransform: "uppercase",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <span>{item.label}</span>
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  style={{
                    transition: "transform .2s",
                    transform: me === item.label ? "rotate(180deg)" : "none",
                    stroke: me === item.label ? "#51B56D" : "#ffffff",
                  }}
                >
                  <path
                    d="M1 1l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {me === item.label && (
                <div
                  style={{
                    background: "rgba(5, 26, 18, 0.7)",
                    paddingBottom: 8,
                  }}
                >
                  {item.ch.map((ch) => (
                    <button
                      key={ch.l}
                      onClick={() => {
                        setMob(false);
                        if (
                          ch.l === "Subscription Plans" ||
                          ch.l === "Pricing"
                        ) {
                          if (navigate) navigate("subscription");
                        } else if (
                          ch.l === "10 service types" ||
                          ch.l === "Tech Categories"
                        ) {
                          if (navigate) navigate("services");
                        } else if (onSignup) {
                          onSignup();
                        }
                      }}
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        padding: "10px 1.5rem 10px 2rem",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#fff",
                        }}
                      >
                        {ch.l}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,.6)",
                          marginTop: 2,
                        }}
                      >
                        {ch.d}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Mobile Auth Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: "20px 1.5rem 12px",
            }}
          >
            {user ? (
              <>
                <Btn
                  variant="outline"
                  onClick={() => {
                    if (navigate) navigate("dashboard");
                    setMob(false);
                  }}
                  style={{
                    width: "100%",
                    color: "#fff",
                    borderColor: "rgba(255,255,255,.3)",
                  }}
                >
                  Dashboard
                </Btn>
                <Btn
                  variant="accent"
                  onClick={() => {
                    onLogout();
                    setMob(false);
                  }}
                  style={{ width: "100%", background: "#00C853" }}
                >
                  Sign Out
                </Btn>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onLogin();
                    setMob(false);
                  }}
                  style={{
                    width: "100%",
                    height: "46px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 10,
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  LOGIN
                </button>
                <button
                  onClick={() => {
                    onSignup();
                    setMob(false);
                  }}
                  style={{
                    width: "100%",
                    height: "46px",
                    background: "#0C862F",
                    border: "none",
                    borderRadius: 10,
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(12, 134, 47, 0.4)",
                  }}
                >
                  SIGN UP →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
