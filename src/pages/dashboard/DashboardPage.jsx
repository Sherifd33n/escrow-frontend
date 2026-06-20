import { useState, useEffect } from "react";
import { T, fs } from "../../tokens";
import { Btn, Badge, Spin, StatusBadge as SB, FormField as F } from "../../components/ui";
import { CATS, CURR, SCFG, MTX } from "../../data/constants";
import KYC from "../../components/dashboard/KYCModal";
import PhoneVerifyModal from "../../components/dashboard/PhoneVerifyModal";
import ScopeModal from "../../components/dashboard/ScopeModal";
import ContractModal from "../../components/dashboard/ContractModal";
import AuditModal from "../../components/dashboard/AuditModal";
import DisputeModal from "../../components/dashboard/DisputeModal";
import AdminPanel from "../../components/dashboard/AdminPanel";
import SettingsTab from "../../components/dashboard/SettingsTab";
import WalletTab from "../../components/dashboard/WalletTab";

const Dashboard=({user,onLogout,navigate})=>{
  const [tab,setTab]=useState("transactions");
  const [detail,setDetail]=useState(null);
  const [txs,setTxs]=useState(MTX);
  const [showNew,setShowNew]=useState(false);
  const [ns,setNs]=useState(1);
  const [nf,setNf]=useState({title:"",type:"software",amount:"",currency:"USD",counterparty:"",role:"buyer",days:"3",milestones:"2"});
  const [scope,setScope]=useState(null);
  const [msg,setMsg]=useState("");
  const [msgs,setMsgs]=useState([
    {from:"System",text:"Transaction created. Funds confirmed in escrow.",time:"May 14, 9:00 AM"},
    {from:"Devcraft Solutions",text:"Development underway. Submitting first milestone Friday.",time:"May 16, 2:30 PM"},
    {from:"You",text:"Great, looking forward to it.",time:"May 16, 3:00 PM"},
  ]);
  const [kycDone,setKycDone]=useState(false);
  const [showKYC,setShowKYC]=useState(false);
  const [phoneDone,setPhoneDone]=useState(false);
  const [phoneNumber,setPhoneNumber]=useState("");
  const [showPhoneVerify,setShowPhoneVerify]=useState(false);
  const [showAudit,setShowAudit]=useState(null);
  const [showDispute,setShowDispute]=useState(null);
  const [showContract,setShowContract]=useState(null);
  const [showScope,setShowScope]=useState(false);
  const [showAdmin,setShowAdmin]=useState(false);
  const [drawer,setDrawer]=useState(false);
  const [walletBalance,setWalletBalance]=useState(12480.50);

  const hn=k=>e=>setNf(p=>({...p,[k]:e.target.value}));
  const active=txs.filter(t=>!["completed","disputed"].includes(t.status));
  const det=detail?txs.find(t=>t.id===detail.id)||detail:null;
  const switchTab=k=>{setTab(k);setDetail(null);setDrawer(false);};

  const createTx=()=>{
    const cat=CATS.find(c=>c.id===nf.type);
    setTxs(p=>[{id:`TXN-${Math.floor(80000+Math.random()*9000)}`,title:nf.title||scope?.title||"New Project",type:cat?.label||"Software Dev",cat:nf.type,amount:parseFloat(nf.amount)||0,currency:nf.currency,role:nf.role==="buyer"?"Buyer":"Seller",other:nf.counterparty||"Counterparty",status:"pending",date:new Date().toLocaleDateString("en",{month:"short",day:"numeric",year:"numeric"}),milestones:parseInt(nf.milestones)||1},...p]);
    setShowNew(false);setNs(1);setScope(null);setNf({title:"",type:"software",amount:"",currency:"USD",counterparty:"",role:"buyer",days:"3",milestones:"2"});
  };

  if(showAdmin) return <AdminPanel onBack={()=>setShowAdmin(false)}/>;

  const TABS=[["transactions","dashboard","Transactions"],["wallet","account_balance_wallet","Wallet"],["kyc","badge","KYC"],["disputes","gavel","Disputes"],["settings","manage_accounts","Account"],["history","history","History"]];

  return(
    <div style={{background:"#f5f3f6",minHeight:"100dvh",paddingBottom:80}}>

      {/* Overlay */}
      <div className={"dash-overlay"+(drawer?" show":"")} onClick={()=>setDrawer(false)}/>

      {/* Side Drawer */}
      <aside className={"dash-drawer"+(drawer?" open":"")}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",height:64,borderBottom:"1px solid #c5c6cf",flexShrink:0}}>
          <span style={{fontWeight:800,fontSize:20,color:"#001637"}}><span style={{color:"#006c47"}}>Escrow</span></span>
          <button onClick={()=>setDrawer(false)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:4}}>
            <span className="msym" style={{fontSize:24,color:"#44474e"}}>close</span>
          </button>
        </div>
        <div style={{padding:"14px 16px",borderBottom:"1px solid #e9e7eb",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <div style={{width:42,height:42,borderRadius:"50%",background:"#001637",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:16,color:"#fff",flexShrink:0}}>
            {user?.name?user.name[0].toUpperCase():"U"}
          </div>
          <div style={{overflow:"hidden"}}>
            <div style={{fontWeight:700,fontSize:14,color:"#001637",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name||"User"}</div>
            <div style={{fontSize:12,color:"#75777f",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email||""}</div>
          </div>
        </div>
        <nav style={{flex:1,overflowY:"auto",padding:"10px 8px"}}>
          {TABS.map(([k,icon,label])=>(
            <button key={k} onClick={()=>switchTab(k)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,border:"none",cursor:"pointer",background:tab===k?"#001637":"transparent",color:tab===k?"#fff":"#44474e",fontWeight:tab===k?700:500,fontSize:14,marginBottom:2,transition:"all .15s",textAlign:"left"}}>
              <span className="msym" style={{fontSize:20,color:tab===k?"#fff":"#75777f"}}>{icon}</span>{label}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 8px",borderTop:"1px solid #e9e7eb",flexShrink:0,display:"flex",flexDirection:"column",gap:6}}>
          {user?.email==="admin@vaultpay.com"&&(
            <button onClick={()=>{setShowAdmin(true);setDrawer(false);}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:10,border:"1px solid #c5c6cf",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:600,color:"#44474e"}}>
              <span className="msym" style={{fontSize:18}}>admin_panel_settings</span>Admin Panel
            </button>
          )}
          <button onClick={onLogout} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:10,border:"1px solid #fecaca",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:600,color:"#ba1a1a"}}>
            <span className="msym" style={{fontSize:18}}>logout</span>Sign Out
          </button>
        </div>
      </aside>

      {/* Top Bar */}
      <header style={{background:"#fbf9fc",borderBottom:"1px solid #c5c6cf",position:"sticky",top:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px",height:64,gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
          <button className="mob-menu-btn" onClick={()=>setDrawer(v=>!v)} style={{display:"flex",alignItems:"center",justifyContent:"center",width:38,height:38,borderRadius:10,background:"none",border:"none",cursor:"pointer",color:"#001637",flexShrink:0}}>
            <span className="msym" style={{fontSize:24}}>{drawer?"close":"menu"}</span>
          </button>
          <span style={{fontWeight:800,fontSize:20,color:"#001637",letterSpacing:"-.3px",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}} onClick={()=>navigate("home")}>
            <span style={{color:"#006c47"}}>Escrow</span>
          </span>
          <div className="dash-tabs" style={{display:"flex",gap:0,marginLeft:6,overflow:"hidden"}}>
            {TABS.map(([k,_,l])=>(
              <button key={k} onClick={()=>switchTab(k)} style={{background:"none",border:"none",cursor:"pointer",padding:"8px 12px",fontSize:13,fontWeight:600,color:tab===k?"#001637":"#44474e",borderBottom:tab===k?"2px solid #001637":"2px solid transparent",transition:"all .15s",whiteSpace:"nowrap"}}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          {user?.email==="admin@Escrow.com"&&(
            <button onClick={()=>setShowAdmin(true)} style={{background:"none",border:"1px solid #c5c6cf",color:"#44474e",padding:"6px 12px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,whiteSpace:"nowrap",display:"none"}} className="dash-admin-desk">Admin</button>
          )}
          <button onClick={()=>setShowNew(true)} style={{display:"inline-flex",alignItems:"center",gap:6,background:"#006c47",color:"#fff",border:"none",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:13,padding:"9px 13px",whiteSpace:"nowrap"}}>
            <span className="msym" style={{fontSize:18}}>add</span>
            <span style={{display:"none"}} id="new-lbl">New Transaction</span>
            <style>{`@media(min-width:480px){#new-lbl{display:inline!important;}}`}</style>
          </button>
          <div style={{width:36,height:36,borderRadius:"50%",background:"#001637",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:"#fff",cursor:"pointer",flexShrink:0}} onClick={()=>setDrawer(v=>!v)}>
            {user?.name?user.name[0].toUpperCase():"U"}
          </div>
        </div>
      </header>

      {/* Page content */}
      <div style={{maxWidth:1200,margin:"0 auto",padding:"18px 14px 90px"}}>

        {/* KPI row */}
        <div className="dash-kpi" style={{marginBottom:18}}>
          {[
            {l:"Active",      v:active.length,                                               i:"bolt",                    c:"#3b82f6"},
            {l:"In Escrow",   v:"$"+active.reduce((a,b)=>a+b.amount,0).toLocaleString(),    i:"lock",                    c:T.green},
            {l:"Wallet",      v:"$"+walletBalance.toLocaleString("en",{minimumFractionDigits:2}),i:"account_balance_wallet",  c:"#8b5cf6"},
            {l:"Completed",   v:txs.filter(t=>t.status==="completed").length,                i:"check_circle",            c:T.teal},
          ].map(c=>(
            <div key={c.l} onClick={c.l==="Wallet"?()=>switchTab("wallet"):undefined} style={{background:T.white,border:"1px solid "+T.gray100,borderRadius:12,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:c.l==="Wallet"?"pointer":"default",transition:"box-shadow .18s"}} className={c.l==="Wallet"?"ch":""}>
              <div>
                <div style={{fontSize:10.5,fontWeight:700,color:T.gray400,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>{c.l}</div>
                <div style={{fontSize:22,fontWeight:800,color:T.primary}}>{c.v}</div>
              </div>
              <div style={{width:40,height:40,background:c.c+"18",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span className="msym" style={{fontSize:20,color:c.c}}>{c.i}</span>
              </div>
            </div>
          ))}
        </div>

        {/* TRANSACTIONS LIST */}
        {tab==="transactions"&&!det&&(
          <div style={{background:T.white,border:"1px solid "+T.gray100,borderRadius:14,overflow:"hidden"}}>
            <div style={{padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid "+T.gray100,flexWrap:"wrap",gap:10}}>
              <div style={{fontWeight:700,fontSize:15,color:T.primary}}>All Transactions</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["All","Active","Completed","Disputed"].map(f=>(
                  <button key={f} style={{fontSize:12,padding:"5px 10px",borderRadius:7,border:"1px solid "+T.gray100,background:f==="All"?T.primary:T.white,color:f==="All"?T.white:T.gray600,cursor:"pointer"}}>{f}</button>
                ))}
              </div>
            </div>
            {/* Desktop table */}
            <div className="tx-tbl" style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:580}}>
                <thead>
                  <tr style={{background:T.offWhite}}>
                    {["Project","Value","Role","Status","Date",""].map(h=>(
                      <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:10.5,fontWeight:700,color:T.gray500,textTransform:"uppercase",letterSpacing:".06em",borderBottom:"1px solid "+T.gray100,whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txs.map((tx,i)=>(
                    <tr key={tx.id} className="tr" style={{borderBottom:i<txs.length-1?"1px solid "+T.gray100:"none",cursor:"pointer"}} onClick={()=>setDetail(tx)}>
                      <td style={{padding:"12px 14px"}}>
                        <div style={{fontWeight:600,fontSize:13.5,color:T.primary,marginBottom:2}}>{tx.title}</div>
                        <div style={{fontSize:11,color:T.gray400}}>{tx.id} &bull; {tx.type}</div>
                      </td>
                      <td style={{padding:"12px 14px",fontWeight:700,color:T.primary,whiteSpace:"nowrap"}}>${tx.amount.toLocaleString()}</td>
                      <td style={{padding:"12px 14px"}}><span style={{fontSize:11,fontWeight:700,color:tx.role==="Buyer"?"#3b82f6":"#006c47",background:tx.role==="Buyer"?"#eff6ff":"#e8f5ee",padding:"3px 8px",borderRadius:5}}>{tx.role}</span></td>
                      <td style={{padding:"12px 14px"}}><SB status={tx.status}/></td>
                      <td style={{padding:"12px 14px",fontSize:12,color:T.gray400,whiteSpace:"nowrap"}}>{tx.date}</td>
                      <td style={{padding:"12px 14px"}}><span style={{color:T.accent,fontSize:13,fontWeight:700}}>View</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="tx-mob" style={{display:"none",flexDirection:"column"}}>
              {txs.map((tx,i)=>(
                <div key={tx.id} onClick={()=>setDetail(tx)} style={{padding:"14px 16px",cursor:"pointer",borderBottom:i<txs.length-1?"1px solid "+T.gray100:"none",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:14,color:T.primary,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.title}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3}}>
                      <span style={{fontSize:13.5,fontWeight:700,color:T.primary}}>${tx.amount.toLocaleString()}</span>
                      <SB status={tx.status}/>
                    </div>
                    <div style={{fontSize:11.5,color:T.gray400}}>{tx.id} &bull; {tx.date}</div>
                  </div>
                  <span className="msym" style={{fontSize:22,color:T.gray400,flexShrink:0}}>chevron_right</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRANSACTION DETAIL */}
        {tab==="transactions"&&det&&(
          <div>
            <button onClick={()=>setDetail(null)} style={{background:"none",border:"none",color:T.gray500,cursor:"pointer",fontSize:14,marginBottom:14,display:"flex",alignItems:"center",gap:6,padding:0}}>
              <span className="msym" style={{fontSize:18}}>arrow_back</span>Back to transactions
            </button>
            <div className="dg" style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16,alignItems:"start"}}>
              {/* Left */}
              <div style={{background:T.white,border:"1px solid "+T.gray100,borderRadius:14,overflow:"hidden"}}>
                <div style={{background:"linear-gradient(135deg,"+T.primary+","+T.primaryDk+")",padding:"20px",color:T.white}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:4}}>{det.id} &bull; {det.type} &bull; {det.milestones} milestone{det.milestones>1?"s":""}</div>
                  <div style={{fontWeight:700,fontSize:"clamp(15px,3vw,19px)",lineHeight:1.3}}>{det.title}</div>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginTop:10,flexWrap:"wrap"}}>
                    <span style={{fontSize:"clamp(18px,4vw,24px)",fontWeight:800}}>${det.amount?.toLocaleString()} {det.currency}</span>
                    <SB status={det.status}/>
                  </div>
                </div>
                <div style={{padding:"18px 16px"}}>
                  <div style={{fontWeight:700,fontSize:12.5,color:T.primary,marginBottom:14,textTransform:"uppercase",letterSpacing:".06em"}}>Escrow Timeline</div>
                  {["Project created","Contract generated","Escrow funded","Provider working","Deliverable submitted","AI audit completed","Client review","Payment released"].map((s,i,a)=>(
                    <div key={i} style={{display:"flex",gap:10,marginBottom:i<a.length-1?12:0}}>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                        <div style={{width:22,height:22,borderRadius:"50%",background:i<3?T.primary:T.gray100,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:i<3?T.white:T.gray400}}>
                          {i<3?<span className="msym" style={{fontSize:11}}>check</span>:i+1}
                        </div>
                        {i<a.length-1&&<div style={{width:2,flex:1,minHeight:10,background:i<2?T.primary+"30":T.gray100,marginTop:2}}/>}
                      </div>
                      <div style={{paddingTop:2,fontSize:13,color:i<3?T.primary:T.gray400,fontWeight:i<3?600:400}}>{s}</div>
                    </div>
                  ))}
                  <hr style={{border:"none",borderTop:"1px solid "+T.gray100,margin:"18px 0"}}/>
                  <div style={{fontWeight:700,fontSize:12.5,color:T.primary,marginBottom:12,textTransform:"uppercase",letterSpacing:".06em"}}>Messages</div>
                  <div style={{maxHeight:220,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
                    {msgs.map((m,i)=>(
                      <div key={i} style={{display:"flex",gap:8,flexDirection:m.from==="You"?"row-reverse":"row"}}>
                        <div style={{width:28,height:28,borderRadius:"50%",background:m.from==="You"?T.accent:T.primary,display:"flex",alignItems:"center",justifyContent:"center",color:T.white,fontSize:10,fontWeight:700,flexShrink:0}}>{m.from[0]}</div>
                        <div style={{maxWidth:"72%"}}>
                          <div style={{fontSize:10,color:T.gray400,marginBottom:2,textAlign:m.from==="You"?"right":"left"}}>{m.from} &bull; {m.time}</div>
                          <div style={{background:m.from==="You"?T.primary:T.offWhite,color:m.from==="You"?T.white:T.gray900,borderRadius:9,padding:"8px 12px",fontSize:13,lineHeight:1.5}}>{m.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <input style={{flex:1,padding:"9px 12px",border:"1.5px solid "+T.gray100,borderRadius:8,fontSize:13.5,outline:"none",minWidth:0}} placeholder="Type a message..." value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&msg.trim()){setMsgs(p=>[...p,{from:"You",text:msg,time:new Date().toLocaleTimeString("en",{hour:"numeric",minute:"2-digit"})}]);setMsg("");}}}/>
                    <Btn variant="primary" style={{padding:"9px 14px",flexShrink:0}} onClick={()=>{if(msg.trim()){setMsgs(p=>[...p,{from:"You",text:msg,time:new Date().toLocaleTimeString("en",{hour:"numeric",minute:"2-digit"})}]);setMsg("");}}}>
                      <span className="msym" style={{fontSize:18}}>send</span>
                    </Btn>
                  </div>
                </div>
              </div>
              {/* Right sidebar */}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{background:T.white,border:"1px solid "+T.gray100,borderRadius:14,padding:"16px"}}>
                  <div style={{fontWeight:700,fontSize:12.5,color:T.primary,marginBottom:12,textTransform:"uppercase",letterSpacing:".06em"}}>Actions</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <Btn variant="purple" style={{width:"100%",fontSize:13,justifyContent:"flex-start"}} onClick={()=>setShowContract(det)}>
                      <span className="msym" style={{fontSize:16}}>description</span>View AI Contract
                    </Btn>
                    <Btn variant="teal" style={{width:"100%",fontSize:13,justifyContent:"flex-start"}} onClick={()=>setShowAudit(det)}>
                      <span className="msym" style={{fontSize:16}}>smart_toy</span>Run AI Audit
                    </Btn>
                    {(det.status==="inspection"||det.status==="funded")&&det.role==="Buyer"&&(
                      <Btn variant="green" style={{width:"100%",fontSize:13,justifyContent:"flex-start"}} onClick={()=>setTxs(p=>p.map(t=>t.id===det.id?{...t,status:"approved"}:t))}>
                        <span className="msym" style={{fontSize:16}}>check_circle</span>Approve &amp; Release
                      </Btn>
                    )}
                    <Btn variant="red" style={{width:"100%",fontSize:13,justifyContent:"flex-start"}} onClick={()=>setShowDispute(det)}>
                      <span className="msym" style={{fontSize:16}}>gavel</span>Raise Dispute
                    </Btn>
                  </div>
                  {det.status==="approved"&&<div style={{background:T.greenLt,borderRadius:8,padding:"10px 12px",fontSize:12.5,color:"#065f46",marginTop:10,display:"flex",alignItems:"center",gap:6}}><span className="msym" style={{fontSize:14}}>check_circle</span>Payment releases within 1 business day.</div>}
                  {det.status==="disputed"&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"10px 12px",fontSize:12.5,color:T.red,marginTop:10,display:"flex",alignItems:"center",gap:6}}><span className="msym" style={{fontSize:14}}>warning</span>Dispute in review.</div>}
                  {det.status==="revision"&&<div style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,padding:"10px 12px",fontSize:12.5,color:"#c2410c",marginTop:10,display:"flex",alignItems:"center",gap:6}}><span className="msym" style={{fontSize:14}}>refresh</span>Revision requested.</div>}
                </div>
                <div style={{background:T.white,border:"1px solid "+T.gray100,borderRadius:14,padding:"16px"}}>
                  <div style={{fontWeight:700,fontSize:12.5,color:T.primary,marginBottom:12,textTransform:"uppercase",letterSpacing:".06em"}}>Financial Summary</div>
                  {[["Project Value",det.currency+" "+det.amount?.toLocaleString()],["Escrow Fee (3.25%)",det.currency+" "+Math.round(det.amount*.0325).toLocaleString()],["Provider Receives",det.currency+" "+Math.round(det.amount*.9675).toLocaleString()]].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+T.gray100,fontSize:13}}>
                      <span style={{color:T.gray500}}>{k}</span><span style={{fontWeight:600,color:T.primary}}>{v}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,fontSize:14,fontWeight:800,color:T.primary}}>
                    <span>Total Protected</span><span>{det.currency} {det.amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WALLET TAB */}
        {tab==="wallet"&&<WalletTab user={user} balance={walletBalance} setBalance={setWalletBalance} activeTxs={active}/>}

        {/* KYC TAB */}
        {tab==="kyc"&&(
          <div style={{background:T.white,border:"1px solid "+T.gray100,borderRadius:14,padding:"clamp(16px,4vw,28px)"}}>
            <h2 style={{fontSize:"clamp(18px,3vw,22px)",fontWeight:700,color:T.primary,marginBottom:6}}>Identity Verification</h2>
            <p style={{color:T.gray500,fontSize:13.5,marginBottom:22}}>Complete verification to unlock higher transaction limits and build trust with counterparties.</p>
            <div className="g3-dash" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
              {[
                {icon:"mail",       title:"Email Verification",    done:true,      desc:"Required for all accounts.",                       action:null},
                {icon:"smartphone", title:"Phone Verification",    done:phoneDone, desc:phoneDone?phoneNumber:"Add and verify your phone number.", action:()=>setShowPhoneVerify(true)},
                {icon:"badge",      title:"Identity Verification", done:kycDone,   desc:"Government ID (Passport, Licence, NIN).",          action:()=>setShowKYC(true)},
              ].map(v=>(
                <div key={v.title} style={{border:"1.5px solid "+(v.done?T.green:T.gray100),borderRadius:12,padding:"15px",display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span className="msym" style={{fontSize:22,color:v.done?T.green:T.gray400,flexShrink:0,marginTop:1}}>{v.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13.5,color:T.primary,marginBottom:3}}>{v.title}</div>
                    <div style={{fontSize:12,color:T.gray500,marginBottom:9,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.desc}</div>
                    {v.done
                      ?<span style={{fontSize:11.5,fontWeight:700,color:T.green,background:T.greenLt,padding:"3px 10px",borderRadius:20,display:"inline-flex",alignItems:"center",gap:4}}><span className="msym" style={{fontSize:13}}>check_circle</span>Verified</span>
                      :<Btn variant="outline" style={{fontSize:12,padding:"6px 12px"}} onClick={v.action}>Verify Now</Btn>
                    }
                  </div>
                </div>
              ))}
            </div>
            {/* <div style={{background:T.offWhite,borderRadius:12,padding:"16px 18px"}}>
              <div style={{fontWeight:700,fontSize:13,color:T.primary,marginBottom:10}}>Verification Limits</div>
              <div className="g3-dash" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {[["Basic (Email)","Up to $500"],["Verified (ID)","Up to $50,000"],["Full KYC","Unlimited"]].map(([l,v])=>(
                  <div key={l} style={{background:T.white,border:"1px solid "+T.gray100,borderRadius:9,padding:"12px",textAlign:"center"}}>
                    <div style={{fontWeight:600,fontSize:12,color:T.gray700,marginBottom:4}}>{l}</div>
                    <div style={{fontSize:16,fontWeight:800,color:T.accent}}>{v}</div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        )}

        {/* DISPUTES TAB */}
        {tab==="disputes"&&(
          <div style={{background:T.white,border:"1px solid "+T.gray100,borderRadius:14,padding:"clamp(16px,4vw,28px)"}}>
            <h2 style={{fontSize:"clamp(18px,3vw,22px)",fontWeight:700,color:T.primary,marginBottom:6}}>Dispute Center</h2>
            <p style={{color:T.gray500,fontSize:13.5,marginBottom:20}}>AI-assisted dispute resolution with human arbitration. Fair, fast, and binding.</p>
            <div className="g3-dash" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:22}}>
              {[
                {icon:"smart_toy",   title:"AI Case Analysis",  desc:"Timeline reconstruction and evidence analysis generated automatically on filing."},
                {icon:"attach_file", title:"Evidence Uploads",  desc:"Upload screenshots, contracts, code links, and chat exports to support your case."},
                {icon:"gavel",       title:"Admin Arbitration", desc:"A Dispute Resolution Officer issues a binding decision within 5 business days."},
              ].map(d=>(
                <div key={d.title} style={{background:T.offWhite,borderRadius:12,padding:"16px",textAlign:"center"}}>
                  <span className="msym" style={{fontSize:28,color:T.primary,display:"block",marginBottom:10}}>{d.icon}</span>
                  <div style={{fontWeight:700,fontSize:13,color:T.primary,marginBottom:6}}>{d.title}</div>
                  <p style={{fontSize:12.5,color:T.gray500,lineHeight:1.7}}>{d.desc}</p>
                </div>
              ))}
            </div>
            <div style={{fontWeight:700,fontSize:14,color:T.primary,marginBottom:12}}>Active Disputes</div>
            {txs.filter(t=>t.status==="disputed").length===0
              ?<div style={{textAlign:"center",padding:"32px",color:T.gray400,fontSize:14,background:T.offWhite,borderRadius:12}}><span className="msym" style={{fontSize:36,display:"block",marginBottom:10}}>check_circle</span>No active disputes.</div>
              :txs.filter(t=>t.status==="disputed").map(tx=>(
                <div key={tx.id} style={{border:"1.5px solid #fecaca",borderRadius:12,padding:"14px 16px",background:"#fff5f5",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:10}}>
                  <div><div style={{fontWeight:700,fontSize:14,color:T.red,marginBottom:3}}>{tx.title}</div><div style={{fontSize:12.5,color:T.gray500}}>{tx.id} &bull; ${tx.amount.toLocaleString()} &bull; {tx.other}</div></div>
                  <Btn variant="red" style={{fontSize:13}} onClick={()=>setShowDispute(tx)}>View / Update</Btn>
                </div>
              ))
            }
            <div style={{marginTop:20,padding:"16px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:12}}>
              <div style={{fontWeight:700,fontSize:13,color:T.primary,marginBottom:10}}>How it works</div>
              <div className="g2-dash" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {["Escrow funds frozen on filing","AI generates case summary automatically","Both parties submit evidence within 48h","Binding officer decision within 5 days","Refund or release based on outcome"].map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:8,fontSize:13,color:"#1e40af"}}><span style={{fontWeight:700,color:T.primary,flexShrink:0}}>{i+1}.</span>{s}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab==="settings"&&<SettingsTab user={user}/>}

        {/* HISTORY TAB */}
        {tab==="history"&&(
          <div style={{background:T.white,border:"1px solid "+T.gray100,borderRadius:14,padding:"clamp(16px,4vw,28px)"}}>
            <h2 style={{fontSize:"clamp(18px,3vw,22px)",fontWeight:700,color:T.primary,marginBottom:6}}>Transaction History</h2>
            <p style={{color:T.gray500,fontSize:14,marginBottom:16}}>Complete archive with AI audit reports attached to every completed project.</p>
            <div className="hist-row" style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
              <Btn variant="outline" style={{fontSize:13}}><span className="msym" style={{fontSize:16}}>download</span>Download Statement (PDF)</Btn>
              <Btn variant="ghost" style={{color:T.primary,fontSize:13}}>Export via API</Btn>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:380}}>
                <thead><tr style={{background:T.offWhite}}>
                  {["Transaction","Value","Status","Date"].map(h=>(
                    <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:10.5,fontWeight:700,color:T.gray500,textTransform:"uppercase",letterSpacing:".06em",borderBottom:"1px solid "+T.gray100,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {txs.map((tx,i)=>(
                    <tr key={tx.id} className="tr" style={{borderBottom:i<txs.length-1?"1px solid "+T.gray100:"none"}}>
                      <td style={{padding:"12px"}}>
                        <div style={{fontWeight:600,fontSize:13,color:T.primary}}>{tx.title}</div>
                        <div style={{fontSize:11,color:T.gray400,marginTop:1}}>{tx.id}</div>
                      </td>
                      <td style={{padding:"12px",fontWeight:700,fontSize:13,color:T.primary,whiteSpace:"nowrap"}}>${tx.amount.toLocaleString()}</td>
                      <td style={{padding:"12px"}}><SB status={tx.status}/></td>
                      <td style={{padding:"12px",fontSize:12,color:T.gray400,whiteSpace:"nowrap"}}>{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* NEW TRANSACTION MODAL */}
      {showNew&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&setShowNew(false)}>
          <div style={{background:T.white,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:560,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,.18)",animation:"fadeUp .25s ease"}}>
            <div style={{background:"linear-gradient(135deg,"+T.primary+","+T.primaryDk+")",padding:"18px 20px",color:T.white,position:"sticky",top:0,zIndex:1,borderRadius:"20px 20px 0 0"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:16}}>New Escrow Transaction</div>
                  <div style={{fontSize:12,opacity:.6,marginTop:2}}>Step {ns} of 3 &mdash; {["Project Details","Parties & Terms","Review"][ns-1]}</div>
                </div>
                <button onClick={()=>{setShowNew(false);setNs(1);}} style={{background:"rgba(255,255,255,.12)",border:"none",color:T.white,borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span className="msym" style={{fontSize:18}}>close</span>
                </button>
              </div>
              <div style={{display:"flex",gap:5,marginTop:12}}>{[1,2,3].map(n=><div key={n} style={{flex:1,height:3,borderRadius:2,background:ns>=n?T.accent:"rgba(255,255,255,.18)",transition:"background .2s"}}/>)}</div>
            </div>
            <div style={{padding:"18px 16px"}}>
              {ns===1&&(
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <Btn variant="teal" style={{width:"100%",fontSize:13}} onClick={()=>setShowScope(true)}><span className="msym" style={{fontSize:16}}>smart_toy</span>Use AI Scope Generator</Btn>
                  {scope&&<div style={{background:T.tealLt,border:"1px solid #99f6e4",borderRadius:9,padding:"10px 12px",fontSize:13,color:"#005235",display:"flex",alignItems:"center",gap:8}}><span className="msym" style={{fontSize:15}}>check_circle</span>Scope applied: <strong>{scope.title}</strong></div>}
                  <F label="Project Title" req><input style={fs} placeholder="e.g. E-commerce Backend Development" value={nf.title||scope?.title||""} onChange={hn("title")}/></F>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:T.gray700,marginBottom:8}}>Service Category *</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5}}>
                      {CATS.map(c=>(
                        <button key={c.id} onClick={()=>setNf(p=>({...p,type:c.id}))} style={{border:"1.5px solid "+(nf.type===c.id?c.color:T.gray100),borderRadius:8,padding:"7px 3px",cursor:"pointer",textAlign:"center",background:nf.type===c.id?c.color+"12":T.white,transition:"all .15s"}}>
                          <span className="msym" style={{fontSize:18,color:nf.type===c.id?c.color:T.gray400,display:"block",marginBottom:2}}>{c.icon}</span>
                          <div style={{fontSize:8.5,fontWeight:600,color:nf.type===c.id?c.color:T.gray500,lineHeight:1.2}}>{c.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 90px",gap:10}}>
                    <F label="Project Value" req><input style={fs} type="number" placeholder="0.00" value={nf.amount} onChange={hn("amount")}/></F>
                    <F label="Currency"><select style={fs} value={nf.currency} onChange={hn("currency")}>{CURR.map(c=><option key={c}>{c}</option>)}</select></F>
                  </div>
                  <F label="Number of Milestones"><select style={fs} value={nf.milestones} onChange={hn("milestones")}>{[1,2,3,4,5,6,8,10].map(n=><option key={n} value={n}>{n} milestone{n>1?"s":""}</option>)}</select></F>
                </div>
              )}
              {ns===2&&(
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:T.gray700,marginBottom:8}}>Your Role *</div>
                    <div style={{display:"flex",gap:8}}>
                      {[["buyer","Client"],["seller","Provider"],["broker","Broker"]].map(([v,l])=>(
                        <button key={v} onClick={()=>setNf(p=>({...p,role:v}))} style={{flex:1,padding:"10px 0",border:"1.5px solid "+(nf.role===v?T.primary:T.gray100),borderRadius:8,background:nf.role===v?"rgba(0,22,55,.07)":T.white,cursor:"pointer",fontSize:12.5,fontWeight:700,color:nf.role===v?T.primary:T.gray500,transition:"all .15s"}}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <F label="Counterparty Email" req><input style={fs} type="email" placeholder="their@email.com" value={nf.counterparty} onChange={hn("counterparty")}/></F>
                  <F label="Review Period"><select style={fs} value={nf.days} onChange={hn("days")}>{[1,2,3,5,7,10,14].map(d=><option key={d} value={d}>{d} {d===1?"day":"days"}</option>)}</select></F>
                  <div style={{background:T.tealLt,border:"1px solid #99f6e4",borderRadius:8,padding:"10px 12px",fontSize:13,color:"#005235",display:"flex",alignItems:"center",gap:8}}>
                    <span className="msym" style={{fontSize:14}}>mail</span>The counterparty will receive an invitation to review and join this transaction.
                  </div>
                </div>
              )}
              {ns===3&&(
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:T.primary,marginBottom:12}}>Review Transaction</div>
                  <div className="modal-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                    {[["Title",nf.title||scope?.title||""],["Category",CATS.find(c=>c.id===nf.type)?.label||""],["Value",nf.currency+" "+parseFloat(nf.amount||0).toLocaleString()],["Role",nf.role],["Milestones",""+nf.milestones],["Review",nf.days+" days"],["Counterparty",nf.counterparty||""],["AI Audit","Included"]].map(([k,v])=>(
                      <div key={k} style={{background:T.offWhite,borderRadius:8,padding:"9px 11px"}}>
                        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:T.gray400,marginBottom:2}}>{k}</div>
                        <div style={{fontSize:13,fontWeight:600,color:T.primary}}>{v||""}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:T.offWhite,borderRadius:9,padding:"11px 13px",fontSize:13,color:T.gray600,lineHeight:1.7}}>By creating this transaction you agree to the Terms of Service. An AI contract will be generated automatically.</div>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:18,gap:10}}>
                <Btn variant="outline" onClick={()=>ns>1?setNs(p=>p-1):setShowNew(false)}>{ns===1?"Cancel":"Back"}</Btn>
                <Btn variant="accent" onClick={()=>ns<3?setNs(p=>p+1):createTx()} disabled={ns===1&&(!(nf.title||scope?.title)||!nf.amount)}>{ns<3?"Continue":"Create Transaction"}</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showKYC&&<KYC onClose={()=>setShowKYC(false)} onComplete={()=>{setKycDone(true);setShowKYC(false);}}/>}
      {showPhoneVerify&&<PhoneVerifyModal onClose={()=>setShowPhoneVerify(false)} onVerified={(num)=>{setPhoneDone(true);setPhoneNumber(num);setShowPhoneVerify(false);}}/>}
      {showAudit&&<AuditModal tx={showAudit} onClose={()=>setShowAudit(null)} onApprove={()=>setTxs(p=>p.map(t=>t.id===showAudit.id?{...t,status:"approved"}:t))} onRevision={()=>setTxs(p=>p.map(t=>t.id===showAudit.id?{...t,status:"revision"}:t))}/>}
      {showDispute&&<DisputeModal tx={showDispute} onClose={()=>setShowDispute(null)} onSubmit={()=>setTxs(p=>p.map(t=>t.id===showDispute.id?{...t,status:"disputed"}:t))}/>}
      {showContract&&<ContractModal tx={showContract} scope={scope} onClose={()=>setShowContract(null)}/>}
      {showScope&&<ScopeModal catLabel={CATS.find(c=>c.id===nf.type)?.label||"Software"} onClose={()=>setShowScope(false)} onApply={s=>{setScope(s);setNf(p=>({...p,title:s.title}));}}/>}

      {/* Mobile Bottom Nav */}
      <nav className="mbb" style={{display:"none",position:"fixed",bottom:0,left:0,right:0,zIndex:50,background:"#fbf9fc",borderTop:"1px solid #c5c6cf",boxShadow:"0 -2px 12px rgba(0,0,0,.06)",justifyContent:"space-around",alignItems:"center",height:66,padding:"0 4px"}}>
        {TABS.map(([k,icon,label])=>(
          <button key={k} onClick={()=>switchTab(k)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"5px 6px",color:tab===k?"#001637":"#44474e",flex:1,minWidth:0,borderTop:tab===k?"2px solid #001637":"2px solid transparent"}}>
            <span className="msym" style={{fontSize:22,color:tab===k?"#001637":"#75777f"}}>{icon}</span>
            <span style={{fontSize:9.5,fontWeight:tab===k?700:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%"}}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
export default Dashboard;
