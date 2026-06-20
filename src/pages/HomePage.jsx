import { useState } from "react";
import { T } from "../tokens";
import { Btn, Badge, SectionTitle as ST } from "../components/ui";
import { CATS, CURR } from "../data/constants";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ═══ HERO ══════════════════════════════════════════════════ */
const Hero=({onSignup})=>{
  const [role,setRole]=useState("client");
  const [cat,setCat]=useState("software");
  const [amt,setAmt]=useState("");
  const [cur,setCur]=useState("USD");
  return(
    <section style={{background:`linear-gradient(150deg,${T.primaryDk} 0%,${T.primary} 55%,#1a6bb5 100%)`,color:T.white,padding:"72px 1.5rem 0",overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",right:"-5%",top:"-10%",width:550,height:550,background:"radial-gradient(circle,rgba(240,130,15,.14) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div className="hg" style={{maxWidth:1280,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:52,alignItems:"center"}}>
        <div>
          <div style={{marginBottom:18}}><Badge color={T.secondary||T.green} sz="md">AI-Powered Tech Services Escrow</Badge></div>
          <h1 className="fu" style={{fontFamily:"'Inter',sans-serif",fontSize:"clamp(30px,4.5vw,54px)",fontWeight:700,lineHeight:1.15,marginBottom:20,letterSpacing:"-.5px"}}>Secure escrow for<br/>tech services — with<br/><span style={{color:T.gold}}>built-in AI auditing</span></h1>
          <p className="fu2" style={{fontSize:"clamp(14px,1.8vw,16px)",color:"rgba(255,255,255,.75)",lineHeight:1.85,marginBottom:36,maxWidth:480}}>Escrow holds client payments for software, design, and cloud projects — releasing funds only after AI confirms deliverables meet the agreed scope. No chargebacks. No fraud. Full protection for both sides.</p>
          <div className="hcta fu3" style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:40}}>
            <Btn variant="accent" style={{fontSize:15,padding:"13px 28px"}} onClick={onSignup}>Start a Project →</Btn>
            <Btn variant="outlineW" style={{fontSize:15,padding:"13px 24px"}}>See How It Works</Btn>
          </div>
          <div className="fu4" style={{display:"flex",gap:22,flexWrap:"wrap"}}>
            {["AI Deliverable Auditing","KYC Verified Parties","Smart Dispute AI"].map(b=><div key={b} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"rgba(255,255,255,.6)"}}>{b}</div>)}
          </div>
        </div>
        <div className="fu2" style={{paddingBottom:48}}>
          <div style={{background:"rgba(255,255,255,.07)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,.14)",borderRadius:20,padding:"26px 22px",boxShadow:"0 28px 60px rgba(0,0,0,.28)"}}>
            <div style={{fontWeight:700,fontSize:16,marginBottom:18}}>Start a Tech Escrow</div>
            <div style={{display:"flex",background:"rgba(0,0,0,.22)",borderRadius:9,padding:3,marginBottom:18}}>
              {[["client","Client"],["provider","Provider"]].map(([v,l])=><button key={v} onClick={()=>setRole(v)} style={{flex:1,padding:"8px 0",border:"none",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:12.5,transition:"all .15s",background:role===v?T.white:"transparent",color:role===v?T.primary:"rgba(255,255,255,.6)",boxShadow:role===v?"0 2px 8px rgba(0,0,0,.15)":"none"}}>{l}</button>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,marginBottom:18}}>
              {CATS.map(c=><button key={c.id} onClick={()=>setCat(c.id)} style={{border:`1.5px solid ${cat===c.id?c.color:"rgba(255,255,255,.12)"}`,borderRadius:8,padding:"8px 4px",cursor:"pointer",textAlign:"center",background:cat===c.id?"rgba(255,255,255,.13)":"rgba(255,255,255,.04)",transition:"all .15s"}}><span className="msym" style={{fontSize:16,color:"#fff"}}>{c.icon}</span><div style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,.85)",marginTop:2,lineHeight:1.2}}>{c.label}</div></button>)}
            </div>
            <div style={{display:"flex",marginBottom:14}}>
              <div style={{position:"relative",flex:1}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,.4)",fontSize:14}}>$</span><input type="number" placeholder="Project value" value={amt} onChange={e=>setAmt(e.target.value)} style={{width:"100%",padding:"11px 11px 11px 26px",background:"rgba(0,0,0,.25)",border:"1.5px solid rgba(255,255,255,.14)",borderRight:"none",borderRadius:"8px 0 0 8px",color:T.white,fontSize:14,outline:"none"}}/></div>
              <select value={cur} onChange={e=>setCur(e.target.value)} style={{padding:"11px 9px",background:"rgba(0,0,0,.35)",border:"1.5px solid rgba(255,255,255,.14)",borderRadius:"0 8px 8px 0",color:T.white,fontSize:13,outline:"none",cursor:"pointer",minWidth:68}}>{CURR.map(c=><option key={c} style={{background:"#0f3d7a"}}>{c}</option>)}</select>
            </div>
            <Btn variant="accent" style={{width:"100%",fontSize:14,padding:"12px 0",borderRadius:9}} onClick={onSignup}>{role==="client"?"Protect My Payment →":"Get Paid on Delivery →"}</Btn>
            <p style={{textAlign:"center",fontSize:11.5,color:"rgba(255,255,255,.35)",marginTop:9}}>Free to register · AI audit included on every project</p>
          </div>
        </div>
      </div>
      <div style={{borderTop:"1px solid rgba(255,255,255,.08)",marginTop:40,padding:"16px 0"}}>
        <div style={{maxWidth:1280,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",flexWrap:"wrap",padding:"0 1.5rem"}}>
          <span style={{fontSize:11.5,color:"rgba(255,255,255,.35)",marginRight:16,whiteSpace:"nowrap"}}>Trusted for:</span>
          {["Software builds","Mobile apps","Website delivery","Cloud migrations","AI model dev","Security audits"].map(d=><span key={d} style={{fontSize:11.5,fontWeight:600,color:"rgba(255,255,255,.28)",padding:"4px 14px",borderRight:"1px solid rgba(255,255,255,.08)",whiteSpace:"nowrap"}}>{d}</span>)}
        </div>
      </div>
    </section>
  );
};

/* ═══ ANIMATED ESCROW FLOW ══════════════════════════════════ */
const EscrowFlowAnimation=()=>(
  <section style={{background:T.white,padding:"56px 1.5rem 64px",borderBottom:`1px solid ${T.gray100}`}}>
    <style>{`
      @keyframes flowDash{to{stroke-dashoffset:-24}}
      @keyframes pulseRing{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.9;transform:scale(1.07)}}
      @keyframes checkPop{0%{opacity:0;transform:scale(.4)}60%{opacity:1;transform:scale(1.15)}100%{opacity:1;transform:scale(1)}}
      @keyframes coinMove{0%{transform:translateX(0);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateX(420px);opacity:0}}
      @keyframes lockGlow{0%,100%{opacity:.3}50%{opacity:.65}}
      .efa-line{stroke-dasharray:6 6;animation:flowDash 1.1s linear infinite}
      .efa-ring{animation:pulseRing 2.6s ease-in-out infinite;transform-origin:340px 150px}
      .efa-check{animation:checkPop .6s ease-out .4s both}
      .efa-coin{animation:coinMove 3.2s ease-in-out infinite}
      .efa-coin:nth-child(2){animation-delay:.8s}
      .efa-coin:nth-child(3){animation-delay:1.6s}
      .efa-glow{animation:lockGlow 2.8s ease-in-out infinite}
      @media(prefers-reduced-motion:reduce){.efa-line,.efa-ring,.efa-coin,.efa-glow{animation:none}}
    `}</style>
    <div style={{maxWidth:1280,margin:"0 auto"}}>
      <ST badge="See It In Motion" title="How your money stays protected" sub="Funds move from client to provider only after AI confirms the work is done — never before."/>
      <div style={{maxWidth:760,margin:"0 auto"}}>
        <svg width="100%" viewBox="0 0 680 300" role="img" aria-label="Animated diagram showing funds flowing from client to a secure escrow vault, audited by AI, then released to the provider">
          <defs>
            <marker id="efaArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
          </defs>

          {/* Client node */}
          <g>
            <circle cx="80" cy="150" r="44" fill={T.primary+"10"} stroke={T.primary} strokeWidth="1.2"/>
            <text x="80" y="142" textAnchor="middle" dominantBaseline="central" style={{fontSize:14,fontWeight:700,fill:T.primary,fontFamily:"'Inter',sans-serif"}}>Client</text>
            <text x="80" y="160" textAnchor="middle" dominantBaseline="central" style={{fontSize:11,fill:T.gray500,fontFamily:"'Inter',sans-serif"}}>Funds project</text>
          </g>

          {/* Flow line 1 */}
          <line className="efa-line" x1="128" y1="150" x2="222" y2="150" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#efaArrow)"/>
          <circle className="efa-coin" cx="150" cy="150" r="5" fill="#3b82f6"/>
          <circle className="efa-coin" cx="150" cy="150" r="5" fill="#3b82f6"/>
          <circle className="efa-coin" cx="150" cy="150" r="5" fill="#3b82f6"/>

          {/* Vault node */}
          <g>
            <circle className="efa-ring" cx="340" cy="150" r="58" fill="none" stroke={T.green} strokeWidth="1"/>
            <rect className="efa-glow" x="296" y="106" width="88" height="88" rx="16" fill={T.green} opacity=".18"/>
            <rect x="296" y="106" width="88" height="88" rx="16" fill={T.white} stroke={T.green} strokeWidth="1.2"/>
            <path d="M328 142v-10a12 12 0 0 1 24 0v10" fill="none" stroke={T.green} strokeWidth="3" strokeLinecap="round"/>
            <rect x="320" y="142" width="40" height="30" rx="5" fill={T.green}/>
            <text x="340" y="218" textAnchor="middle" dominantBaseline="central" style={{fontSize:14,fontWeight:700,fill:T.primary,fontFamily:"'Inter',sans-serif"}}>Escrow vault</text>
            <text x="340" y="236" textAnchor="middle" dominantBaseline="central" style={{fontSize:11,fill:T.gray500,fontFamily:"'Inter',sans-serif"}}>Funds held safely</text>
          </g>

          {/* AI audit checkmark */}
          <g className="efa-check">
            <circle cx="340" cy="78" r="22" fill={T.greenLt}/>
            <path d="M330 78l7 7 13-14" fill="none" stroke={T.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
          <text x="340" y="50" textAnchor="middle" style={{fontSize:11,fill:T.gray500,fontFamily:"'Inter',sans-serif"}}>AI audit passed</text>

          {/* Flow line 2 */}
          <line className="efa-line" x1="392" y1="150" x2="486" y2="150" stroke={T.green} strokeWidth="2" markerEnd="url(#efaArrow)"/>
          <circle className="efa-coin" cx="414" cy="150" r="5" fill={T.green}/>
          <circle className="efa-coin" cx="414" cy="150" r="5" fill={T.green}/>
          <circle className="efa-coin" cx="414" cy="150" r="5" fill={T.green}/>

          {/* Provider node */}
          <g>
            <circle cx="560" cy="150" r="44" fill="#8b5cf610" stroke="#8b5cf6" strokeWidth="1.2"/>
            <text x="560" y="142" textAnchor="middle" dominantBaseline="central" style={{fontSize:14,fontWeight:700,fill:T.primary,fontFamily:"'Inter',sans-serif"}}>Provider</text>
            <text x="560" y="160" textAnchor="middle" dominantBaseline="central" style={{fontSize:11,fill:T.gray500,fontFamily:"'Inter',sans-serif"}}>Gets paid</text>
          </g>

          <text x="340" y="276" textAnchor="middle" style={{fontSize:12,fill:T.gray500,fontFamily:"'Inter',sans-serif"}}>Payment releases automatically once AI confirms the work matches scope</text>
        </svg>
      </div>
    </div>
  </section>
);


const Stats=()=>(
  <section style={{background:T.white,borderTop:`1px solid ${T.gray100}`,borderBottom:`1px solid ${T.gray100}`,padding:"28px 1.5rem"}}>
    <div className="sg" style={{maxWidth:1280,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,textAlign:"center"}}>
      {[["$5B+","Total value protected"],["1.8M+","Customers worldwide"],["10","Tech service categories"],["98.7%","Dispute-free rate"]].map(([n,l])=>(
        <div key={l} style={{padding:"16px 12px",borderRadius:12,background:T.offWhite,border:`1px solid ${T.gray100}`}}>
          <div style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:"clamp(20px,3vw,30px)",letterSpacing:"-.4px",color:T.primary}}>{n}</div>
          <div style={{fontSize:12.5,color:T.gray500,marginTop:3}}>{l}</div>
        </div>
      ))}
    </div>
  </section>
);

/* ═══ WORKFLOW (9 steps from document) ══════════════════════ */
const Workflow=({onSignup})=>{
  const steps=[
    {n:1,icon:"assignment",title:"Project Creation",      desc:"Client creates the project, describes requirements in plain English, and invites the service provider.",color:"#3b82f6",badge:"Initiation"},
    {n:2,icon:"description",title:"Contract Generation",   desc:"AI automatically drafts a binding escrow contract covering deliverables, timelines, revision rounds, and dispute terms.",color:"#8b5cf6",badge:"AI Contract"},
    {n:3,icon:"credit_card",title:"Escrow Funding",        desc:"Client deposits funds into a regulated trust account. The provider is notified to begin work.",color:"#10b981",badge:"Protected"},
    {n:4,icon:"settings", title:"Project Execution",    desc:"Provider works on the project. AI Project Health Monitor tracks progress and flags risks in real time.",color:"#006c47",badge:"AI Monitor"},
    {n:5,icon:"upload_file",title:"Deliverable Submission",desc:"Provider submits final work — code repo, designs, live URL, documents, or deployment link.",color:"#6366f1",badge:"Submission"},
    {n:6,icon:"smart_toy",title:"AI Audit",              desc:"AI Deliverable Auditor checks completeness, quality, and scope compliance automatically across all file types.",color:"#0d9488",badge:"AI Audit"},
    {n:7,icon:"check_circle",title:"Approval / Revision",   desc:"Client reviews the AI report and approves or raises a structured revision request with specific feedback.",color:"#006c47",badge:"Review"},
    {n:8,icon:"payments",title:"Payment Release",       desc:"On approval, funds release instantly to the provider's account. Transaction marked complete.",color:"#1e9e5e",badge:"Paid"},
    {n:9,icon:"gavel", title:"Dispute Resolution",   desc:"If unresolved, AI Dispute Assistant generates an objective case summary for admin arbitration.",color:"#e53e3e",badge:"AI Dispute"},
  ];
  return(
    <section style={{background:T.offWhite,padding:"90px 1.5rem"}}>
      <div style={{maxWidth:1280,margin:"0 auto"}}>
        <ST badge="Complete Escrow Workflow" title="9-Step AI-Powered Process" sub="Every stage of the tech services lifecycle — protected, verified, and AI-audited end to end."/>
        <div className="g3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
          {steps.map(s=>(
            <div key={s.n} className="ch" style={{background:T.white,border:`1.5px solid ${T.gray100}`,borderRadius:14,padding:"22px 20px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:14,right:14}}><Badge color={s.color}>{s.badge}</Badge></div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:42,height:42,background:s.color+"18",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}><span className="msym" style={{fontSize:20,color:s.color||T.primary}}>{s.icon}</span></div>
                <span style={{fontSize:11,fontWeight:700,color:T.gray400}}>Step {s.n} of 9</span>
              </div>
              <h3 style={{fontWeight:700,fontSize:14,color:T.primary,marginBottom:7}}>{s.title}</h3>
              <p style={{fontSize:13,color:T.gray500,lineHeight:1.75}}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:44}}><Btn variant="primary" onClick={onSignup} style={{fontSize:15,padding:"13px 30px"}}>Start a Project →</Btn></div>
      </div>
    </section>
  );
};

/* ═══ SERVICE CATEGORIES (all 10 from document) ════════════ */
const Categories=({onSignup})=>{
  const cats=[
    {icon:"terminal",title:"Software Development",   desc:"Backend, APIs, SaaS. AI checks code structure, test coverage, and feature completeness.",    color:"#3b82f6"},
    {icon:"smartphone",title:"Mobile App Development", desc:"iOS, Android, cross-platform. AI audits APK/IPA builds, screenshots, and feature parity.", color:"#8b5cf6"},
    {icon:"public",title:"Website Development",    desc:"Landing pages, e-commerce, CMS. Automated crawl verifies live URL and design spec.",        color:"#10b981"},
    {icon:"palette",title:"UI/UX & Product Design", desc:"Figma files, prototypes, style guides. AI reviews against signed-off design briefs.",        color:"#ec4899"},
    {icon:"security",title:"Cybersecurity Services", desc:"Pen testing, audits, compliance. AI validates report completeness and CVE findings.",         color:"#ef4444"},
    {icon:"☁️", title:"Cloud & DevOps",         desc:"Infrastructure, CI/CD, migrations. Verified against architecture and deployment specs.",    color:"#006c47"},
    {icon:"smart_toy",title:"AI Development",         desc:"Model training, fine-tuning, integrations. Benchmark results and accuracy verified.",         color:"#6366f1"},
    {icon:"computer",title:"IT Consulting",           desc:"Strategy docs, roadmaps, advisory. Reviewed for completeness and scope alignment.",          color:"#0d9488"},
    {icon:"bar_chart",title:"Data Analytics",         desc:"Dashboards, pipelines, reports. Verified for accuracy, coverage, and spec compliance.",       color:"#006c47"},
    {icon:"article",title:"Technical Documentation",desc:"API docs, SOPs, wikis. AI checks completeness, accuracy, and scope match.",                   color:"#64748b"},
  ];
  return(
    <section style={{
      position:"relative",
      backgroundImage:`linear-gradient(150deg,rgba(0,16,40,.52) 0%,rgba(5,30,65,.5) 100%),url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1920&auto=format&fit=crop')`,
      backgroundSize:"cover",
      backgroundPosition:"center",
      backgroundAttachment:"fixed",
      backgroundRepeat:"no-repeat",
      padding:"90px 1.5rem"
    }}>
      <div style={{maxWidth:1280,margin:"0 auto",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:52,padding:"28px 24px",background:"rgba(0,8,22,.62)",backdropFilter:"blur(8px)",borderRadius:18,border:"1px solid rgba(255,255,255,.12)"}}>
          <div style={{marginBottom:-52}}>
            <ST light badge="10 Supported Service Categories" title="Every tech service, fully protected" sub="AI auditing is built-in for every category — so both parties always know what 'done' means."/>
          </div>
        </div>
        <div className="g5" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:16}}>
          {cats.map(c=>(
            <div key={c.title} style={{background:"rgba(0,16,40,.68)",backdropFilter:"blur(14px)",border:"1px solid rgba(255,255,255,.2)",borderRadius:14,padding:"22px 18px",cursor:"pointer",transition:"background .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,16,40,.82)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(0,16,40,.68)"}>
              <div style={{width:46,height:46,background:c.color+"28",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}><span className="msym" style={{fontSize:22,color:c.color}}>{c.icon}</span></div>
              <h3 style={{fontWeight:700,fontSize:13,color:T.white,marginBottom:7,lineHeight:1.35}}>{c.title}</h3>
              <p style={{fontSize:12,color:"rgba(255,255,255,.85)",lineHeight:1.7}}>{c.desc}</p>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:44}}>
          <Btn variant="accent" onClick={onSignup} style={{marginRight:12,fontSize:15,padding:"13px 32px"}}>Get Protected Now</Btn>
        </div>
      </div>
    </section>
  );
};

/* ═══ SECURITY (merged w/ verification tiers) ═══════════════ */
const Security=()=>(
  <section style={{background:T.white,padding:"90px 1.5rem"}}>
    <div style={{maxWidth:1280,margin:"0 auto"}}>
      <ST badge="Security & Compliance" title="Licensed, verified, and trusted" sub="Every account is identity-checked and every dollar is held in a regulated, segregated trust account."/>
      <div className="g4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18}}>
        {[{icon:"account_balance",title:"Fully Licensed",      desc:"Licensed and bonded under financial regulations, with regular independent audits."},
          {icon:"badge",        title:"KYC Verified Parties", desc:"Email, phone, and ID verification scale with transaction size — so every counterparty is known."},
          {icon:"security",     title:"256-bit SSL",          desc:"All data and transactions protected with bank-grade encryption end to end."},
          {icon:"payments",     title:"Funds Held in Trust",  desc:"All escrow funds sit in regulated, segregated trust accounts — never mixed with company funds."},
          {icon:"block",        title:"Zero Chargebacks",     desc:"Once payment enters escrow it cannot be reversed. Providers are completely protected."},
          {icon:"phone",        title:"24/7 Support",         desc:"Real humans via phone, email, and chat. Specialists personally handle complex disputes."},
        ].map(f=>(
          <div key={f.title} className="fc ch" style={{background:T.white,border:`1.5px solid ${T.gray100}`,borderRadius:14,padding:"24px 20px"}}>
            <span className="msym" style={{fontSize:24,color:T.primary,display:"block",marginBottom:12}}>{f.icon}</span>
            <h3 style={{fontWeight:700,fontSize:13.5,color:T.primary,marginBottom:8}}>{f.title}</h3>
            <p style={{fontSize:12.5,color:T.gray500,lineHeight:1.7}}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══ TESTIMONIALS ══════════════════════════════════════════ */
const Testimonials=()=>(
  <section style={{padding:"90px 1.5rem",background:T.offWhite}}>
    <div style={{maxWidth:1280,margin:"0 auto"}}>
      <ST badge="Client Stories" title="1.8M+ customers trust Escrow"/>
      <div className="g3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:22}}>
        {[{n:"Tunde A.", r:"Startup CTO",     t:"We used Escrow for a $40k backend build. The AI audit caught a missing API endpoint before we released payment. Worth every cent.",stars:5},
          {n:"David L.", r:"Freelance Dev",   t:"As a provider I love that clients can't withhold payment arbitrarily. The AI audit proves the work is complete. Total peace of mind.",stars:5},
          {n:"Aisha M.", r:"Agency Director", t:"We ran three simultaneous projects. The health monitor flagged one going off-track early. Dispute avoided entirely.",stars:5},
        ].map(x=>(
          <div key={x.n} className="ch" style={{border:`1.5px solid ${T.gray100}`,borderRadius:14,padding:"26px 22px",background:T.white}}>
            <div style={{display:"flex",gap:2,marginBottom:12}}>{Array(x.stars).fill(0).map((_,i)=><span key={i} style={{color:T.gold,fontSize:17}}>★</span>)}</div>
            <p style={{fontSize:13.5,color:T.gray700,lineHeight:1.8,fontStyle:"italic",marginBottom:18}}>"{x.t}"</p>
            <div style={{display:"flex",alignItems:"center",gap:11}}>
              <div style={{width:38,height:38,background:`linear-gradient(135deg,${T.primary},${T.primaryDk})`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:T.white,fontWeight:700,fontSize:14}}>{x.n[0]}</div>
              <div><div style={{fontWeight:700,fontSize:13.5,color:T.primary}}>{x.n}</div><div style={{fontSize:12,color:T.gray500}}>{x.r}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══ FAQ ════════════════════════════════════════════════════ */
const FAQ=()=>{
  const [op,setOp]=useState(null);
  const qs=[
    {q:"What makes Escrow different from regular escrow?",a:"Escrow is built specifically for tech services. Every transaction includes AI scope generation, contract drafting, deliverable auditing, fraud detection, and dispute assistance — so both parties always agree on what 'done' means before any money moves."},
    {q:"How does the AI Deliverable Auditor work?",a:"When a provider submits work, the Auditor checks it against the agreed scope. For code it analyses the repo structure, test coverage, and feature completeness. For websites it crawls the live URL. For designs it compares files against the brief. For documents it checks completeness against the agreed table of contents."},
    {q:"What are the 9 steps of the escrow workflow?",a:"Project Creation → Contract Generation → Escrow Funding → Project Execution → Deliverable Submission → AI Audit → Approval / Revision Request → Payment Release → Dispute Resolution (if needed). Every step is tracked and timestamped."},
    {q:"What happens during a dispute?",a:"The AI Dispute Assistant automatically reconstructs the project timeline, analyses all messages and files, and produces an objective case brief. A Dispute Resolution Officer reviews and issues a binding decision within 5 business days. Both parties can upload evidence."},
    {q:"Which verification level do I need?",a:"Email verification is required for all users. For transactions above $500, identity verification (government ID) is required. Business accounts require business verification. Premium manual KYC is available for enterprise accounts."},
    {q:"Can projects have multiple milestones?",a:"Yes. Projects can be split into up to 10 milestones, each with its own scope, deliverable, and escrowed payment. AI audits each milestone independently before that milestone's funds release."},
    {q:"Is there a subscription required?",a:"No. The Starter plan is free — you only pay escrow fees (1.25%–3.25%) on successful transactions. Pro ($29/mo) and Enterprise plans unlock unlimited transactions, all 7 AI features, reduced fees, and priority support."},
  ];
  return(
    <section style={{background:T.white,padding:"90px 1.5rem"}}>
      <div style={{maxWidth:840,margin:"0 auto"}}>
        <ST badge="FAQ" title="Common Questions"/>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {qs.map((f,i)=>(
            <div key={i} style={{background:T.white,border:`1.5px solid ${op===i?T.accent:T.gray100}`,borderRadius:12,overflow:"hidden",transition:"border-color .18s"}}>
              <div onClick={()=>setOp(op===i?null:i)} style={{padding:"18px 22px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",userSelect:"none"}}>
                <span style={{fontWeight:600,fontSize:14.5,color:T.primary,paddingRight:12}}>{f.q}</span>
                <span style={{fontSize:22,color:T.accent,flexShrink:0,transform:op===i?"rotate(45deg)":"none",transition:"transform .2s"}}>+</span>
              </div>
              {op===i&&<div style={{padding:"0 22px 18px",fontSize:13.5,color:T.gray600,lineHeight:1.8,animation:"fadeIn .2s ease"}}>{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══ CTA BANNER ════════════════════════════════════════════ */
const CTA=({onSignup})=>(
  <section style={{padding:"0 1.5rem 90px"}}>
    <div className="ctar" style={{maxWidth:1240,margin:"0 auto",background:`linear-gradient(135deg,${T.primary},${T.primaryDk})`,borderRadius:20,padding:"clamp(36px,5vw,64px) clamp(28px,5vw,60px)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:36,flexWrap:"wrap"}}>
      <div>
        <h2 style={{fontFamily:"'Inter',sans-serif",fontSize:"clamp(26px,3.5vw,40px)",color:T.white,fontWeight:700,letterSpacing:"-.5px",lineHeight:1.2,marginBottom:10}}>Ready to protect your next project?</h2>
        <p style={{fontSize:15,color:"rgba(255,255,255,.65)"}}>Free to join. AI audit included. Only charged on successful releases.</p>
      </div>
      <Btn onClick={onSignup} style={{background:T.white,color:T.primary,fontSize:16,padding:"14px 32px",flexShrink:0,fontWeight:800,borderRadius:10}}>Create Account →</Btn>
    </div>
  </section>
);

export default function HomePage({ navigate }) {
  return (
    <div>
      <Navbar onLogin={() => navigate("login")} onSignup={() => navigate("signup")} navigate={navigate} />
      <Hero onSignup={() => navigate("signup")} />
      <EscrowFlowAnimation />
      <Stats />
      <Workflow onSignup={() => navigate("signup")} />
      <Categories onSignup={() => navigate("signup")} />
      <Security />
      <Testimonials />
      <FAQ />
      <CTA onSignup={() => navigate("signup")} />
      <Footer />
    </div>
  );
}
