import { useState } from "react";
import { PLANS } from "../data/constants";

function PlanCard({ plan, billing, onSubscribe, currentPlan }) {
  const [hovered, setHovered] = useState(false);
  const price    = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
  const saving   = Math.round(((plan.monthlyPrice - plan.annualPrice) / plan.monthlyPrice) * 100);
  const isOwned  = currentPlan === plan.id;
  const gradStr  = `linear-gradient(135deg, ${plan.gradient.join(",")})`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:"relative", borderRadius:24, overflow:"hidden",
        boxShadow: plan.popular
          ? "0 20px 60px rgba(201,168,76,.35), 0 4px 16px rgba(0,0,0,.12)"
          : hovered
            ? "0 16px 48px rgba(0,0,0,.14)"
            : "0 4px 20px rgba(0,0,0,.08)",
        transform: plan.popular ? "scale(1.03)" : hovered ? "scale(1.01)" : "scale(1)",
        transition:"all .25s ease",
        flex:"1 1 280px", minWidth:260, maxWidth:370,
        border: isOwned ? "2px solid #006c47" : plan.popular ? "2px solid transparent" : "1px solid #e9e7eb",
      }}
    >
      {plan.popular && (
        <div style={{ position:"absolute", top:18, right:18, background:"#fff", color:"#C9A84C", borderRadius:20, padding:"4px 14px", fontSize:11, fontWeight:800, letterSpacing:".06em", zIndex:3, boxShadow:"0 2px 8px rgba(0,0,0,.12)" }}>
          MOST POPULAR
        </div>
      )}
      {isOwned && (
        <div style={{ position:"absolute", top:18, left:18, background:"#006c47", color:"#fff", borderRadius:20, padding:"4px 14px", fontSize:11, fontWeight:800, zIndex:3 }}>
          ✓ ACTIVE
        </div>
      )}

      {/* Card gradient header */}
      <div style={{ background:gradStr, padding:"28px 26px 24px", position:"relative", overflow:"hidden" }}>
        {/* Decorative circles */}
        <div style={{ position:"absolute", right:-30, top:-30, width:140, height:140, borderRadius:"50%", background:"rgba(255,255,255,.08)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", right:20, bottom:-50, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,.06)", pointerEvents:"none" }} />

        {/* Plan name */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ width:50, height:50, borderRadius:14, background:"rgba(255,255,255,.22)", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}>
            <span className="msym" style={{ fontSize:28, color:"#fff" }}>{plan.icon}</span>
          </div>
          <div>
            <div style={{ fontSize:24, fontWeight:800, color:"#fff", letterSpacing:"-.3px" }}>{plan.name}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.8)", fontWeight:500 }}>{plan.tagline}</div>
          </div>
        </div>

        {/* Price */}
        <div style={{ display:"flex", alignItems:"flex-end", gap:4 }}>
          <span style={{ fontSize:48, fontWeight:800, color:"#fff", lineHeight:1, letterSpacing:"-2px" }}>${price}</span>
          <span style={{ fontSize:14, color:"rgba(255,255,255,.75)", marginBottom:8, fontWeight:500 }}>/mo</span>
          {billing === "annual" && (
            <div style={{ marginLeft:8, marginBottom:8, background:"rgba(255,255,255,.22)", borderRadius:10, padding:"2px 10px", fontSize:11, fontWeight:700, color:"#fff" }}>
              Save {saving}%
            </div>
          )}
        </div>
        {billing === "annual" && (
          <div style={{ fontSize:12, color:"rgba(255,255,255,.65)", marginTop:4 }}>
            Billed ${plan.annualPrice * 12}/year
          </div>
        )}

        {/* Quick stats chips */}
        <div style={{ display:"flex", gap:6, marginTop:18, flexWrap:"wrap" }}>
          {[
            { icon:"lock",      label: plan.maxEscrow >= 999999 ? "Unlimited escrow" : `$${(plan.maxEscrow/1000).toFixed(0)}k max` },
            { icon:"handshake", label: plan.maxActiveDeals >= 999 ? "∞ deals" : `${plan.maxActiveDeals} deals` },
            { icon:"percent",   label: plan.escrowFee + " fee" },
          ].map(s => (
            <div key={s.label} style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,.18)", borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:600, color:"#fff", backdropFilter:"blur(4px)" }}>
              <span className="msym" style={{ fontSize:13 }}>{s.icon}</span>{s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Card body */}
      <div style={{ background:"#fff", padding:"22px 24px 24px" }}>
        {/* Features list */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#75777f", letterSpacing:".08em", textTransform:"uppercase", marginBottom:12 }}>What's included</div>
          {plan.features.map((f, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:9 }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                <span className="msym" style={{ fontSize:13, color:"#006c47" }}>check</span>
              </div>
              <span style={{ fontSize:13, color:"#44474e", lineHeight:1.5 }}>{f.label}</span>
            </div>
          ))}
          {plan.locked.length > 0 && (
            <>
              <div style={{ fontSize:11, fontWeight:700, color:"#c5c6cf", letterSpacing:".08em", textTransform:"uppercase", marginBottom:10, marginTop:14 }}>Not included</div>
              {plan.locked.slice(0,3).map((f, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:"#f5f3f6", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span className="msym" style={{ fontSize:13, color:"#c5c6cf" }}>close</span>
                  </div>
                  <span style={{ fontSize:13, color:"#c5c6cf", lineHeight:1.5 }}>{f}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onSubscribe(plan)}
          style={{
            width:"100%", padding:"14px 0", borderRadius:12, border:"none", cursor:"pointer",
            background: isOwned ? "#f0fdf4" : `linear-gradient(135deg, ${plan.gradient.join(",")})`,
            color: isOwned ? "#006c47" : "#fff",
            fontSize:15, fontWeight:700, letterSpacing:"-.2px",
            transition:"opacity .2s",
            boxShadow: isOwned ? "none" : "0 4px 14px rgba(0,0,0,.15)",
          }}
        >
          {isOwned ? "✓ Current Plan" : `Subscribe to ${plan.name}`}
        </button>
        {!isOwned && (
          <div style={{ textAlign:"center", fontSize:11.5, color:"#75777f", marginTop:10 }}>
            Cancel anytime · No hidden fees
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionPage({ navigate, user }) {
  const [billing, setBilling]     = useState("monthly");
  const [currentPlan, setCurrent] = useState(null);
  const [success, setSuccess]     = useState(null);

  const handleSubscribe = (plan) => {
    setCurrent(plan.id);
    setSuccess(plan);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div style={{ background:"#f5f3f6", minHeight:"100vh" }}>

      {/* Nav */}
      <header style={{ background:"#001637", padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <span style={{ fontWeight:800, fontSize:20, color:"#fff", cursor:"pointer" }} onClick={() => navigate(user ? "dashboard" : "home")}>
          <span style={{ color:"#0ea5e9" }}>Escrow</span>
        </span>
        <div style={{ display:"flex", gap:12 }}>
          {user && (
            <button onClick={() => navigate("dashboard")} style={{ background:"rgba(255,255,255,.12)", color:"#fff", border:"none", borderRadius:8, padding:"7px 14px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              ← Dashboard
            </button>
          )}
          {!user && (
            <button onClick={() => navigate("signup")} style={{ background:"#0ea5e9", color:"#fff", border:"none", borderRadius:8, padding:"7px 14px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Get Started
            </button>
          )}
        </div>
      </header>

      {/* Success toast */}
      {success && (
        <div style={{ position:"fixed", top:72, right:20, background:"#006c47", color:"#fff", borderRadius:12, padding:"14px 20px", fontSize:14, fontWeight:600, zIndex:999, boxShadow:"0 8px 24px rgba(0,0,0,.2)", display:"flex", alignItems:"center", gap:10 }}>
          <span className="msym" style={{ fontSize:20 }}>check_circle</span>
          Subscribed to {success.name}!
        </div>
      )}

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 20px" }}>

        {/* Hero */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fff8e1", borderRadius:20, padding:"6px 16px", fontSize:12, fontWeight:700, color:"#C9A84C", marginBottom:16 }}>
            <span className="msym" style={{ fontSize:16 }}>diamond</span>
            Choose your plan
          </div>
          <h1 style={{ fontSize:"clamp(28px,5vw,46px)", fontWeight:800, color:"#001637", letterSpacing:"-1px", marginBottom:14, lineHeight:1.2 }}>
            Escrow Plans Built for<br />
            <span style={{ background:"linear-gradient(135deg,#C9A84C,#F5C842)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Every Tech Business</span>
          </h1>
          <p style={{ fontSize:16, color:"#75777f", maxWidth:520, margin:"0 auto 28px" }}>
            One plan unlocks the entire platform — transactions, AI audits, wallet, and more.
          </p>

          {/* Billing toggle */}
          <div style={{ display:"inline-flex", background:"#fff", borderRadius:12, padding:4, border:"1px solid #e9e7eb", gap:4 }}>
            {["monthly","annual"].map(b => (
              <button key={b} onClick={() => setBilling(b)} style={{ padding:"8px 20px", borderRadius:9, border:"none", cursor:"pointer", fontSize:14, fontWeight:700, background:billing===b?"#001637":"transparent", color:billing===b?"#fff":"#75777f", transition:"all .2s" }}>
                {b === "monthly" ? "Monthly" : "Annual"}{b === "annual" && <span style={{ fontSize:11, marginLeft:6, background:"#f0fdf4", color:"#006c47", borderRadius:8, padding:"1px 8px" }}>Save up to 20%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ display:"flex", gap:20, justifyContent:"center", flexWrap:"wrap", alignItems:"stretch" }}>
          {PLANS.map(plan => (
            <PlanCard key={plan.id} plan={plan} billing={billing} onSubscribe={handleSubscribe} currentPlan={currentPlan} />
          ))}
        </div>

        {/* Feature comparison table */}
        <div style={{ background:"#fff", borderRadius:20, border:"1px solid #e9e7eb", padding:"32px", marginTop:48 }}>
          <h2 style={{ fontSize:22, fontWeight:700, color:"#001637", marginBottom:6, textAlign:"center" }}>Full Feature Comparison</h2>
          <p style={{ fontSize:14, color:"#75777f", textAlign:"center", marginBottom:28 }}>Everything you need to know before choosing your plan.</p>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
              <thead>
                <tr>
                  <th style={{ padding:"12px 16px", textAlign:"left", fontSize:12, fontWeight:700, color:"#75777f", textTransform:"uppercase", letterSpacing:".06em", borderBottom:"2px solid #f0f0f0" }}>Feature</th>
                  {PLANS.map(p => (
                    <th key={p.id} style={{ padding:"12px 16px", textAlign:"center", fontSize:14, fontWeight:800, color:p.color, borderBottom:"2px solid #f0f0f0" }}>
                      <span className="msym" style={{ fontSize:16, display:"block", marginBottom:4 }}>{p.icon}</span>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Max Escrow",       "$5,000",  "$50,000",   "Unlimited"],
                  ["Active Deals",     "3",       "15",        "Unlimited"],
                  ["Escrow Fee",       "3.5%",    "2.5%",      "1.5%"],
                  ["AI Audits/mo",     "2",       "15",        "Unlimited"],
                  ["KYC Level",        "Level 2", "Level 3",   "Level 4"],
                  ["Support SLA",      "48 hours","12 hours",  "Dedicated"],
                  ["API Access",       "✗",       "5k/mo",     "Unlimited"],
                  ["Multi-currency",   "✗",       "✓",         "✓ + Crypto"],
                  ["White-label",      "✗",       "✗",         "✓"],
                  ["AI Contracts",     "✗",       "✗",         "Unlimited"],
                ].map(([feat, silver, gold, diamond], i) => (
                  <tr key={feat} style={{ background:i%2===0?"#fafafa":"#fff" }}>
                    <td style={{ padding:"12px 16px", fontSize:13, fontWeight:600, color:"#44474e" }}>{feat}</td>
                    {[silver, gold, diamond].map((v, j) => (
                      <td key={j} style={{ padding:"12px 16px", textAlign:"center", fontSize:13, fontWeight:v==="✗"?400:600, color:v==="✗"?"#c5c6cf":v==="✓"?"#006c47":"#001637" }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ strip */}
        <div style={{ marginTop:40, textAlign:"center" }}>
          <p style={{ fontSize:14, color:"#75777f" }}>
            Questions? <span style={{ color:"#1a56a0", fontWeight:700, cursor:"pointer" }}>Contact our team →</span>
          </p>
        </div>
      </div>
    </div>
  );
}
