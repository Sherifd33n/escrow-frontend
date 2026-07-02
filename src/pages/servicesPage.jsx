import { useState } from "react";
import { T } from "../tokens";
import { PLANS, DIGITAL_SERVICES, CATS } from "../data/constants";

// ─── Subscription Card (Fintech style) ───────────────────────────────────────
function PlanCard({ plan, billing, onSubscribe, currentPlan }) {
  const price = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
  const saving = Math.round(((plan.monthlyPrice - plan.annualPrice) / plan.monthlyPrice) * 100);
  const isOwned = currentPlan === plan.id;

  const gradStr = `linear-gradient(135deg, ${plan.gradient.join(",")})`;

  return (
    <div style={{position:"relative",borderRadius:24,overflow:"hidden",cursor:"pointer",
      boxShadow: plan.popular
        ? "0 20px 60px rgba(201,168,76,.38), 0 4px 16px rgba(0,0,0,.12)"
        : "0 8px 32px rgba(0,0,0,.10)",
      transform: plan.popular ? "scale(1.03)" : "scale(1)",
      transition:"transform .2s,box-shadow .2s",
      flex:"1 1 300px", minWidth:280, maxWidth:380,
    }}
    className="plan-card-hover"
    >
      {plan.popular && (
        <div style={{position:"absolute",top:18,right:18,background:"#fff",
          color:"#C9A84C",borderRadius:20,padding:"4px 14px",fontSize:11,
          fontWeight:800,letterSpacing:".06em",zIndex:3,boxShadow:"0 2px 8px rgba(0,0,0,.12)"}}>
          MOST POPULAR
        </div>
      )}

      {/* Card face – gradient top */}
      <div style={{background:gradStr,padding:"28px 28px 24px",position:"relative",overflow:"hidden"}}>
        {/* Decorative circles */}
        <div style={{position:"absolute",right:-30,top:-30,width:140,height:140,
          borderRadius:"50%",background:"rgba(255,255,255,.08)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",right:20,bottom:-50,width:100,height:100,
          borderRadius:"50%",background:"rgba(255,255,255,.06)",pointerEvents:"none"}}/>

        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <div style={{width:48,height:48,borderRadius:14,background:"rgba(255,255,255,.2)",
            display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>
            <span className="msym" style={{fontSize:26,color:"#fff"}}>{plan.icon}</span>
          </div>
          <div>
            <div style={{fontSize:22,fontWeight:800,color:"#fff",letterSpacing:"-.3px"}}>{plan.name}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.8)",fontWeight:500}}>{plan.tagline}</div>
          </div>
        </div>

        {/* Price */}
        <div style={{display:"flex",alignItems:"flex-end",gap:4}}>
          <span style={{fontSize:42,fontWeight:800,color:"#fff",lineHeight:1,letterSpacing:"-1px"}}>${price}</span>
          <span style={{fontSize:14,color:"rgba(255,255,255,.75)",marginBottom:6,fontWeight:500}}>/mo</span>
          {billing === "annual" && (
            <div style={{marginLeft:8,marginBottom:6,background:"rgba(255,255,255,.2)",
              borderRadius:10,padding:"2px 10px",fontSize:11,fontWeight:700,color:"#fff"}}>
              Save {saving}%
            </div>
          )}
        </div>
        {billing === "annual" && (
          <div style={{fontSize:12,color:"rgba(255,255,255,.65)",marginTop:4}}>
            Billed ${plan.annualPrice * 12}/year · ${plan.monthlyPrice}/mo if monthly
          </div>
        )}

        {/* Quick stats strip */}
        <div style={{display:"flex",gap:6,marginTop:18,flexWrap:"wrap"}}>
          {[
            {icon:"lock",label: plan.maxEscrow >= 999999 ? "Unlimited escrow" : `$${(plan.maxEscrow/1000).toFixed(0)}k max`},
            {icon:"handshake",label: plan.maxActiveDeals >= 999 ? "∞ deals" : `${plan.maxActiveDeals} deals`},
            {icon:"percent",label: plan.escrowFee + " fee"},
          ].map(s => (
            <div key={s.label} style={{display:"flex",alignItems:"center",gap:5,
              background:"rgba(255,255,255,.18)",borderRadius:20,padding:"4px 12px",
              fontSize:11,fontWeight:600,color:"#fff",backdropFilter:"blur(4px)"}}>
              <span className="msym" style={{fontSize:14}}>{s.icon}</span>{s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom white panel */}
      <div style={{background:"#fff",padding:"20px 28px 28px"}}>
        {/* Features */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          {plan.features.slice(0,6).map(f => (
            <div key={f.label} style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:26,height:26,borderRadius:8,
                background:plan.colorLight,display:"flex",alignItems:"center",
                justifyContent:"center",flexShrink:0}}>
                <span className="msym" style={{fontSize:14,color:plan.colorDark}}>{f.icon}</span>
              </div>
              <span style={{fontSize:13,color:"#44474e",fontWeight:500}}>{f.label}</span>
            </div>
          ))}
          {plan.locked.length > 0 && plan.locked.slice(0,2).map(l => (
            <div key={l} style={{display:"flex",alignItems:"center",gap:10,opacity:.45}}>
              <div style={{width:26,height:26,borderRadius:8,background:"#f5f3f6",
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span className="msym" style={{fontSize:14,color:"#8E9BAE"}}>lock</span>
              </div>
              <span style={{fontSize:13,color:"#75777f",fontWeight:500,textDecoration:"line-through"}}>{l}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => onSubscribe(plan)}
          style={{width:"100%",height:48,borderRadius:12,border:"none",cursor:"pointer",
            fontWeight:700,fontSize:14,fontFamily:"'Inter',sans-serif",
            background: isOwned ? "#f0fdf4" : gradStr,
            color: isOwned ? "#006c47" : "#fff",
            border: isOwned ? "1.5px solid #006c47" : "none",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            transition:"opacity .15s,transform .12s"}}
          className="plan-cta-btn"
        >
          {isOwned
            ? <><span className="msym" style={{fontSize:18}}>check_circle</span>Current Plan</>
            : <><span className="msym" style={{fontSize:18}}>rocket_launch</span>Get {plan.name}</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({ svc, onBook, userPlan }) {
  const [open, setOpen] = useState(false);
  const cat = CATS.find(c => c.id === svc.category);
  const canBook = !userPlan || svc.plans.includes(userPlan);

  return (
    <div style={{background:"#fff",borderRadius:16,overflow:"hidden",
      border:"1px solid #e9e7eb",transition:"box-shadow .2s,transform .2s",
      display:"flex",flexDirection:"column"}}
      className="svc-card-hover"
    >
      {/* Header strip — unified brand color */}
      <div style={{background:"#001637",padding:"18px 20px 16px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-20,top:-20,width:100,height:100,
          borderRadius:"50%",background:"rgba(255,255,255,.1)",pointerEvents:"none"}}/>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:12,background:"rgba(255,255,255,.2)",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span className="msym" style={{fontSize:24,color:"#fff"}}>{svc.icon}</span>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,fontWeight:700,color:"#fff",
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{svc.title}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.8)",fontWeight:500}}>{cat?.label}</div>
          </div>
        </div>
        {/* Rating */}
        <div style={{display:"flex",alignItems:"center",gap:4,marginTop:10}}>
          {[1,2,3,4,5].map(i => (
            <span key={i} className="msym" style={{fontSize:14,color: i <= Math.round(svc.rating) ? "#FFC107" : "rgba(255,255,255,.4)"}}>star</span>
          ))}
          <span style={{fontSize:11,color:"rgba(255,255,255,.85)",fontWeight:600,marginLeft:4}}>{svc.rating} ({svc.reviews})</span>
        </div>
      </div>

      {/* Body */}
      <div style={{padding:"16px 20px",flex:1,display:"flex",flexDirection:"column",gap:12}}>
        <p style={{fontSize:13,color:"#44474e",lineHeight:1.6,margin:0}}>{svc.description}</p>

        {/* Tags */}
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {svc.tags.map(t => (
            <span key={t} style={{background:"#f5f3f6",borderRadius:6,padding:"3px 10px",
              fontSize:11,fontWeight:600,color:"#44474e"}}>{t}</span>
          ))}
        </div>

        {/* Meta */}
        <div style={{display:"flex",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#75777f"}}>
            <span className="msym" style={{fontSize:16}}>schedule</span>{svc.delivery}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#75777f"}}>
            <span className="msym" style={{fontSize:16}}>business</span>{svc.vendor}
          </div>
        </div>

        {/* Plan badges */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {svc.plans.map(p => {
            const pl = PLANS.find(pl=>pl.id===p);
            return (
              <div key={p} style={{display:"flex",alignItems:"center",gap:4,
                background:`linear-gradient(135deg,${pl.gradient.join(",")})`,
                borderRadius:6,padding:"3px 10px"}}>
                <span className="msym" style={{fontSize:12,color:"#fff"}}>{pl.icon}</span>
                <span style={{fontSize:10,fontWeight:700,color:"#fff",letterSpacing:".04em"}}>{pl.name.toUpperCase()}</span>
              </div>
            );
          })}
        </div>

        {/* Price + CTA */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          marginTop:"auto",paddingTop:12,borderTop:"1px solid #f0eef1"}}>
          <div>
            <div style={{fontSize:11,color:"#75777f",fontWeight:500}}>Starting from</div>
            <div style={{fontSize:22,fontWeight:800,color:"#001637"}}>
              ${svc.basePrice.toLocaleString()}
              <span style={{fontSize:12,fontWeight:500,color:"#75777f"}}> USD</span>
            </div>
          </div>
          <button
            onClick={() => onBook(svc)}
            disabled={!canBook}
            style={{height:40,padding:"0 20px",borderRadius:10,border:"none",
              background: canBook ? "#001637" : "#e9e7eb",
              color: canBook ? "#fff" : "#75777f",
              fontWeight:700,fontSize:13,cursor: canBook ? "pointer" : "not-allowed",
              fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",gap:6,
              transition:"background .15s"}}
          >
            <span className="msym" style={{fontSize:16}}>{canBook ? "add_circle" : "lock"}</span>
            {canBook ? "Book" : "Upgrade"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Subscribe Modal ──────────────────────────────────────────────────────────
function SubscribeModal({ plan, billing, onClose, onConfirm }) {
  if (!plan) return null;
  const price = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
  const gradStr = `linear-gradient(135deg,${plan.gradient.join(",")})`;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:200,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:24,width:"100%",maxWidth:420,
        boxShadow:"0 32px 80px rgba(0,0,0,.22)",overflow:"hidden",animation:"fadeUp .25s ease"}}>

        {/* Header */}
        <div style={{background:gradStr,padding:"28px 28px 24px",position:"relative"}}>
          <div style={{position:"absolute",right:-20,top:-20,width:120,height:120,
            borderRadius:"50%",background:"rgba(255,255,255,.08)"}}/>
          <button onClick={onClose} style={{position:"absolute",top:16,right:16,
            background:"rgba(255,255,255,.2)",border:"none",borderRadius:10,width:32,height:32,
            cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span className="msym" style={{fontSize:20,color:"#fff"}}>close</span>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:52,height:52,borderRadius:14,background:"rgba(255,255,255,.2)",
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span className="msym" style={{fontSize:28,color:"#fff"}}>{plan.icon}</span>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.7)",letterSpacing:".06em"}}>SUBSCRIBING TO</div>
              <div style={{fontSize:24,fontWeight:800,color:"#fff"}}>{plan.name} Plan</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{padding:"24px 28px"}}>
          <div style={{background:plan.colorLight,borderRadius:12,padding:"16px 20px",marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:plan.colorDark}}>
                  {billing === "annual" ? "Annual billing" : "Monthly billing"}
                </div>
                <div style={{fontSize:28,fontWeight:800,color:"#001637"}}>
                  ${price}<span style={{fontSize:13,fontWeight:500,color:"#75777f"}}>/mo</span>
                </div>
                {billing === "annual" && (
                  <div style={{fontSize:11,color:plan.colorDark,fontWeight:600,marginTop:2}}>
                    ${plan.annualPrice * 12} billed annually
                  </div>
                )}
              </div>
              <div style={{background:`linear-gradient(135deg,${plan.gradient.join(",")})`,
                width:60,height:60,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span className="msym" style={{fontSize:32,color:"#fff"}}>{plan.icon}</span>
              </div>
            </div>
          </div>

          {/* Key features */}
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
            {plan.features.slice(0,4).map(f => (
              <div key={f.label} style={{display:"flex",alignItems:"center",gap:10}}>
                <span className="msym" style={{fontSize:16,color:plan.colorDark}}>{f.icon}</span>
                <span style={{fontSize:13,color:"#44474e"}}>{f.label}</span>
              </div>
            ))}
          </div>

          <button onClick={() => onConfirm(plan)} style={{width:"100%",height:50,borderRadius:12,
            border:"none",cursor:"pointer",fontWeight:700,fontSize:15,
            fontFamily:"'Inter',sans-serif",background:`linear-gradient(135deg,${plan.gradient.join(",")})`,
            color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <span className="msym" style={{fontSize:20}}>check_circle</span>
            Confirm Subscription
          </button>
          <p style={{fontSize:11,color:"#75777f",textAlign:"center",marginTop:12,lineHeight:1.5}}>
            Cancel anytime · No hidden fees · Funds held securely in escrow
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ServicesPage({ navigate, user }) {
  const [billing, setBilling] = useState("monthly");
  const [tab, setTab] = useState("plans"); // "plans" | "services"
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscribedPlan, setSubscribedPlan] = useState(user?.plan || null);
  const [filterCat, setFilterCat] = useState("all");
  const [successPlan, setSuccessPlan] = useState(null);

  const filteredSvcs = filterCat === "all"
    ? DIGITAL_SERVICES
    : DIGITAL_SERVICES.filter(s => s.category === filterCat);

  const handleSubscribe = (plan) => {
    if (subscribedPlan === plan.id) return;
    setSelectedPlan(plan);
  };

  const handleConfirm = (plan) => {
    setSubscribedPlan(plan.id);
    setSelectedPlan(null);
    setSuccessPlan(plan);
    setTimeout(() => setSuccessPlan(null), 3500);
  };

  const handleBook = (svc) => {
    if (!user) { navigate("login"); return; }
    navigate("dashboard");
  };

  return (
    <div style={{minHeight:"100dvh",background:"#f5f3f6",fontFamily:"'Inter',sans-serif"}}>

      {/* ─── Top Nav ─── */}
      <header style={{background:"#001637",position:"sticky",top:0,zIndex:50,
        display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",rowGap:8,
        padding:"10px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",rowGap:8}}>
          <span style={{fontWeight:800,fontSize:20,color:"#fff",cursor:"pointer",letterSpacing:"-.3px"}}
            onClick={() => navigate("home")}>
            <span style={{color:"#82f9be"}}>Escrow</span>
          </span>
          <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
            {[["plans","Plans & Pricing"],["services","Digital Services"]].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k)}
                style={{background: tab===k ? "rgba(255,255,255,.1)" : "transparent",
                  border:"none",cursor:"pointer",padding:"6px 14px",borderRadius:8,
                  color: tab===k ? "#fff" : "rgba(255,255,255,.6)",
                  fontSize:13,fontWeight:600,fontFamily:"'Inter',sans-serif",transition:"all .15s",whiteSpace:"nowrap"}}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          {user ? (
            <button onClick={() => navigate("dashboard")}
              style={{background:"#006c47",color:"#fff",border:"none",borderRadius:8,
                padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer",
                fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",gap:6}}>
              <span className="msym" style={{fontSize:16}}>dashboard</span>Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate("login")}
                style={{background:"transparent",color:"rgba(255,255,255,.8)",border:"1px solid rgba(255,255,255,.25)",
                  borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
                Log in
              </button>
              <button onClick={() => navigate("signup")}
                style={{background:"#006c47",color:"#fff",border:"none",borderRadius:8,
                  padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      {/* ─── Success Toast ─── */}
      {successPlan && (
        <div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",
          background:"#001637",color:"#fff",borderRadius:14,padding:"14px 24px",
          display:"flex",alignItems:"center",gap:12,zIndex:300,
          boxShadow:"0 8px 32px rgba(0,0,0,.25)",animation:"fadeUp .3s ease",whiteSpace:"nowrap"}}>
          <div style={{width:36,height:36,borderRadius:10,
            background:`linear-gradient(135deg,${successPlan.gradient.join(",")})`,
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span className="msym" style={{fontSize:20,color:"#fff"}}>{successPlan.icon}</span>
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:14}}>🎉 {successPlan.name} Plan Activated!</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>Your subscription is now active</div>
          </div>
        </div>
      )}

      {/* ─── PLANS TAB ─── */}
      {tab === "plans" && (
        <div style={{maxWidth:1180,margin:"0 auto",padding:"48px 20px"}}>

          {/* Header */}
          <div style={{textAlign:"center",marginBottom:48}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,
              background:"#e8f5ee",borderRadius:20,padding:"6px 18px",
              fontSize:12,fontWeight:700,color:"#006c47",marginBottom:16,letterSpacing:".06em"}}>
              <span className="msym" style={{fontSize:16}}>workspace_premium</span>
              SUBSCRIPTION PLANS
            </div>
            <h1 style={{fontSize:40,fontWeight:800,color:"#001637",letterSpacing:"-.5px",
              marginBottom:12,lineHeight:1.15}}>
              Choose Your<br/>Escrow Plan
            </h1>
            <p style={{fontSize:16,color:"#75777f",maxWidth:480,margin:"0 auto",lineHeight:1.6}}>
              Secure digital service payments with built-in escrow protection.
              Upgrade anytime as your business grows.
            </p>

            {/* Billing toggle */}
            <div style={{display:"inline-flex",alignItems:"center",gap:0,
              background:"#fff",borderRadius:12,padding:4,border:"1px solid #e9e7eb",
              marginTop:28,boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
              {[["monthly","Monthly"],["annual","Annual"]].map(([k,l]) => (
                <button key={k} onClick={() => setBilling(k)}
                  style={{padding:"8px 24px",borderRadius:9,border:"none",cursor:"pointer",
                    background: billing===k ? "#001637" : "transparent",
                    color: billing===k ? "#fff" : "#44474e",
                    fontWeight:700,fontSize:13,fontFamily:"'Inter',sans-serif",transition:"all .15s"}}>
                  {l}
                  {k==="annual" && (
                    <span style={{marginLeft:6,background: billing==="annual" ? "#006c47" : "#e8f5ee",
                      color: billing==="annual" ? "#fff" : "#006c47",
                      borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:700}}>
                      Save 20%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Current plan banner */}
          {subscribedPlan && (
            <div style={{background:"#001637",borderRadius:16,padding:"16px 24px",
              marginBottom:32,display:"flex",alignItems:"center",gap:16,
              boxShadow:"0 4px 20px rgba(0,22,55,.18)"}}>
              <div style={{width:40,height:40,borderRadius:10,
                background:`linear-gradient(135deg,${PLANS.find(p=>p.id===subscribedPlan).gradient.join(",")})`,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span className="msym" style={{fontSize:22,color:"#fff"}}>
                  {PLANS.find(p=>p.id===subscribedPlan).icon}
                </span>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.6)"}}>ACTIVE PLAN</div>
                <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>
                  {PLANS.find(p=>p.id===subscribedPlan).name} · {billing==="annual" ? `$${PLANS.find(p=>p.id===subscribedPlan).annualPrice}/mo billed annually` : `$${PLANS.find(p=>p.id===subscribedPlan).monthlyPrice}/mo`}
                </div>
              </div>
              <button onClick={() => setTab("services")}
                style={{marginLeft:"auto",background:"#006c47",color:"#fff",border:"none",
                  borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer",
                  fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                <span className="msym" style={{fontSize:16}}>store</span>Browse Services
              </button>
            </div>
          )}

          {/* Cards */}
          <div style={{display:"flex",gap:24,flexWrap:"wrap",justifyContent:"center",alignItems:"flex-start"}}>
            {PLANS.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                billing={billing}
                onSubscribe={handleSubscribe}
                currentPlan={subscribedPlan}
              />
            ))}
          </div>

          {/* Comparison table */}
          <div style={{background:"#fff",borderRadius:20,padding:"32px",marginTop:48,
            border:"1px solid #e9e7eb",boxShadow:"0 4px 20px rgba(0,0,0,.05)"}}>
            <h2 style={{fontSize:22,fontWeight:700,color:"#001637",marginBottom:24}}>Full Plan Comparison</h2>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:520}}>
                <thead>
                  <tr style={{borderBottom:"2px solid #e9e7eb"}}>
                    <th style={{textAlign:"left",padding:"10px 16px",fontSize:12,fontWeight:700,color:"#75777f",letterSpacing:".06em"}}>FEATURE</th>
                    {PLANS.map(p => (
                      <th key={p.id} style={{textAlign:"center",padding:"10px 16px",fontSize:13,fontWeight:800,color:"#001637"}}>
                        <div style={{display:"inline-flex",alignItems:"center",gap:6}}>
                          <span className="msym" style={{fontSize:16,background:`linear-gradient(135deg,${p.gradient.join(",")})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{p.icon}</span>
                          {p.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Max escrow per deal","$5,000","$50,000","Unlimited"],
                    ["Active deals","3","15","Unlimited"],
                    ["Escrow fee","3.5%","2.5%","1.5%"],
                    ["AI audits/mo","2","15","Unlimited"],
                    ["KYC level","Level 2","Level 3","Level 4"],
                    ["Support","Email 48h","Priority 12h","Dedicated manager"],
                    ["Transaction history","6 months","2 years","Unlimited"],
                    ["API access","✗","5k calls/mo","Unlimited"],
                    ["Multi-currency wallet","✗","✓","✓"],
                    ["White-label portal","✗","✗","✓"],
                  ].map(([feat,...vals],i) => (
                    <tr key={feat} style={{borderBottom:"1px solid #f0eef1",background: i%2===0 ? "#fafafa" : "#fff"}}>
                      <td style={{padding:"12px 16px",fontSize:13,color:"#44474e",fontWeight:500}}>{feat}</td>
                      {vals.map((v,j) => (
                        <td key={j} style={{padding:"12px 16px",textAlign:"center",fontSize:13,fontWeight:600,
                          color: v==="✓" ? "#006c47" : v==="✗" ? "#ccc" : "#001637"}}>
                          {v==="✓" ? <span className="msym" style={{fontSize:18,color:"#006c47"}}>check_circle</span>
                          :v==="✗" ? <span className="msym" style={{fontSize:18,color:"#ddd"}}>cancel</span>
                          :v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── SERVICES TAB ─── */}
      {tab === "services" && (
        <div style={{maxWidth:1180,margin:"0 auto",padding:"48px 20px"}}>
          <div style={{textAlign:"center",marginBottom:40}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,
              background:"#e8f5ee",borderRadius:20,padding:"6px 18px",
              fontSize:12,fontWeight:700,color:"#006c47",marginBottom:16,letterSpacing:".06em"}}>
              <span className="msym" style={{fontSize:16}}>store</span>
              DIGITAL SERVICES 
            </div>
            <h1 style={{fontSize:36,fontWeight:800,color:"#001637",letterSpacing:"-.5px",marginBottom:12}}>
              Hire Tech Professionals
            </h1>
            <p style={{fontSize:15,color:"#75777f",maxWidth:520,margin:"0 auto",lineHeight:1.6}}>
              All payments protected by escrow. Book a service and funds are held safely until delivery is approved.
            </p>
          </div>

          {/* Category filter */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginBottom:32}}>
            {[{id:"all",label:"All Services",icon:"apps"},...CATS.filter(c=>DIGITAL_SERVICES.some(s=>s.category===c.id))].map(c => (
              <button key={c.id} onClick={() => setFilterCat(c.id)}
                style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:20,border:"none",
                  cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:13,
                  background: filterCat===c.id ? "#001637" : "#fff",
                  color: filterCat===c.id ? "#fff" : "#44474e",
                  border: filterCat===c.id ? "none" : "1px solid #e9e7eb",
                  transition:"all .15s"}}>
                <span className="msym" style={{fontSize:16}}>{c.icon || "code"}</span>{c.label}
              </button>
            ))}
          </div>

          {/* Plan requirement note */}
          {!subscribedPlan && (
            <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,
              padding:"14px 20px",marginBottom:28,display:"flex",alignItems:"center",gap:12}}>
              <span className="msym" style={{fontSize:22,color:"#D97706",flexShrink:0}}>info</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#92400E"}}>Subscribe to book services</div>
                <div style={{fontSize:12,color:"#B45309",marginTop:2}}>Some services require a Gold or Diamond plan.
                  <span style={{cursor:"pointer",fontWeight:700,marginLeft:4,textDecoration:"underline"}}
                    onClick={() => setTab("plans")}>View Plans →</span>
                </div>
              </div>
            </div>
          )}

          {/* Grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:20}}>
            {filteredSvcs.map(svc => (
              <ServiceCard key={svc.id} svc={svc} onBook={handleBook} userPlan={subscribedPlan} />
            ))}
          </div>
        </div>
      )}

      {/* ─── Subscribe Modal ─── */}
      {selectedPlan && (
        <SubscribeModal
          plan={selectedPlan}
          billing={billing}
          onClose={() => setSelectedPlan(null)}
          onConfirm={handleConfirm}
        />
      )}

      {/* Extra CSS for hover effects */}
      <style>{`
        .plan-card-hover:hover { transform: translateY(-6px) !important; box-shadow: 0 24px 70px rgba(0,0,0,.18) !important; }
        .plan-card-hover.popular-card:hover { transform: scale(1.03) translateY(-6px) !important; }
        .plan-cta-btn:hover { opacity:.88; transform:translateY(-1px); }
        .svc-card-hover:hover { box-shadow: 0 12px 36px rgba(0,0,0,.12) !important; transform: translateY(-3px); }
      `}</style>
    </div>
  );
}
