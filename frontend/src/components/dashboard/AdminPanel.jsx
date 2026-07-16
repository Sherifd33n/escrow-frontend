import { useState, useEffect } from "react";
import { T } from "../../tokens";
import { Btn, Badge, SB } from "../../components/ui";
import { MTX } from "../../data/constants";
import { users } from "../../utils/api";

const AdminPanel=({onBack})=>{
  const [tab,setTab]=useState("overview");
  const [kycQueue, setKycQueue] = useState([]);
  const [kycLoading, setKycLoading] = useState(false);

  const loadKYCQueue = () => {
    setKycLoading(true);
    users.getKYCQueue().then(({ data, error }) => {
      setKycLoading(false);
      if (!error) {
        setKycQueue(data || []);
      }
    });
  };

  useEffect(() => {
    if (tab === "kyc") {
      loadKYCQueue();
    }
  }, [tab]);

  const handleApprove = (id) => {
    if (!window.confirm("Are you sure you want to approve this KYC submission?")) return;
    setKycLoading(true);
    users.approveKYC(id).then(({ error }) => {
      if (error) {
        alert(error);
        setKycLoading(false);
      } else {
        loadKYCQueue();
      }
    });
  };

  const handleReject = (id) => {
    const reason = window.prompt("Enter rejection reason:", "Documents were unclear or expired.");
    if (reason === null) return;
    setKycLoading(true);
    users.rejectKYC(id, reason).then(({ error }) => {
      if (error) {
        alert(error);
        setKycLoading(false);
      } else {
        loadKYCQueue();
      }
    });
  };

  const rows=[
    {id:"TXN-88401",parties:"Tunde A. vs Devcraft",    type:"Software Dev", amount:18000,status:"inspection",flagged:false},
    {id:"TXN-87801",parties:"Aisha M. vs CloudShift",  type:"Cloud/DevOps", amount:12500,status:"disputed",  flagged:true},
    {id:"TXN-88256",parties:"James T. vs AppForge",    type:"Mobile App",   amount:35000,status:"funded",     flagged:false},
    {id:"TXN-88103",parties:"Sarah K. vs TechStar",    type:"Web Dev",      amount:4800, status:"approved",   flagged:false},
  ];
  return(
    <div style={{background:T.offWhite,minHeight:"100vh"}}>
      <div style={{background:"linear-gradient(135deg,#1e1b4b,#3730a3)",color:T.white,padding:"0 1.5rem"}}>
        <div style={{maxWidth:1280,margin:"0 auto",display:"flex",alignItems:"center",height:60,gap:16}}>
          <div style={{fontWeight:800,fontSize:18,cursor:"pointer"}} onClick={onBack}><span style={{color:T.green}}>Escrow</span> <span style={{fontSize:12,opacity:.6,fontWeight:400}}>Admin</span></div>
          <div style={{display:"flex",gap:0,marginLeft:12,overflowX:"auto"}}>
            {[["overview","Overview"],["transactions","All Transactions"],["disputes","Disputes"],["users","Users"],["kyc","KYC Queue"]].map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{background:"none",border:"none",cursor:"pointer",padding:"8px 13px",fontSize:13,fontWeight:600,color:tab===k?T.gold:"rgba(255,255,255,.55)",borderBottom:tab===k?`2px solid ${T.gold}`:"2px solid transparent",transition:"all .15s",whiteSpace:"nowrap"}}>{l}</button>)}
          </div>
          <div style={{marginLeft:"auto"}}><button onClick={onBack} style={{background:"none",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.6)",padding:"7px 13px",borderRadius:6,cursor:"pointer",fontSize:12}}>← Exit Admin</button></div>
        </div>
      </div>
      <div style={{maxWidth:1280,margin:"0 auto",padding:"26px 1.5rem"}}>
        <div className="g4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:26}}>
          {[{l:"Total in Escrow",v:"$70,500",i:"lock",c:T.green},{l:"Active Transactions",v:"3",i:"bolt",c:"#3b82f6"},{l:"Open Disputes",v:"1",i:"gavel",c:T.red},{l:"Pending KYC",v:"5",i:"badge",c:T.accent}].map(c=>(
            <div key={c.l} style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:14,padding:"17px 19px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:11,fontWeight:700,color:T.gray400,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>{c.l}</div><div style={{fontSize:24,fontWeight:800,color:T.primary,fontFamily:"'Inter',sans-serif"}}>{c.v}</div></div>
              <div style={{width:42,height:42,background:c.c+"18",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center"}}><span className="msym" style={{fontSize:20,color:c.c}}>{c.i}</span></div>
            </div>
          ))}
        </div>
        {(tab==="overview"||tab==="transactions")&&(
          <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:16,overflow:"hidden"}}>
            <div style={{padding:"16px 22px",borderBottom:`1px solid ${T.gray100}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontWeight:700,fontSize:15,color:T.primary}}>All Platform Transactions</div>
              <div style={{display:"flex",gap:8}}>{["All","Disputed","Flagged"].map(f=><button key={f} style={{fontSize:12,padding:"5px 12px",borderRadius:7,border:`1px solid ${T.gray100}`,background:f==="All"?T.primary:T.white,color:f==="All"?T.white:T.gray600,cursor:"pointer"}}>{f}</button>)}</div>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
                <thead><tr style={{background:T.offWhite}}>{["Transaction","Parties","Category","Value","Status","Flagged","Action"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:10.5,fontWeight:700,color:T.gray500,textTransform:"uppercase",letterSpacing:".06em",borderBottom:`1px solid ${T.gray100}`}}>{h}</th>)}</tr></thead>
                <tbody>
                  {rows.map((r,i)=>(
                    <tr key={r.id} className="tr" style={{borderBottom:i<rows.length-1?`1px solid ${T.gray100}`:"none"}}>
                      <td style={{padding:"12px 14px",fontWeight:600,fontSize:13.5,color:T.primary}}>{r.id}</td>
                      <td style={{padding:"12px 14px",fontSize:13,color:T.gray700}}>{r.parties}</td>
                      <td style={{padding:"12px 14px"}}><span style={{fontSize:11,fontWeight:700,color:T.teal,background:T.tealLt,padding:"3px 8px",borderRadius:5}}>{r.type}</span></td>
                      <td style={{padding:"12px 14px",fontWeight:700,color:T.primary,fontFamily:"'Inter',sans-serif"}}>${r.amount.toLocaleString()}</td>
                      <td style={{padding:"12px 14px"}}><SB status={r.status}/></td>
                      <td style={{padding:"12px 14px"}}>{r.flagged?<span style={{fontSize:11,fontWeight:700,color:T.red,background:"#fff5f5",padding:"3px 8px",borderRadius:5}}>emergency Flagged</span>:<span style={{fontSize:11,color:T.gray400}}>—</span>}</td>
                      <td style={{padding:"12px 14px"}}><span style={{fontSize:13,fontWeight:700,color:T.accent,cursor:"pointer"}}>Review →</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab==="disputes"&&(
          <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:16,padding:"26px"}}>
            <h2 style={{fontFamily:"'Inter',sans-serif",fontSize:20,color:T.primary,marginBottom:16}}>Dispute Resolution Queue</h2>
            <div style={{border:`1.5px solid #fecaca`,borderRadius:12,padding:"18px 20px",background:"#fff5f5",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
              <div><div style={{fontWeight:700,fontSize:14,color:T.red,marginBottom:4}}>TXN-87801 — AWS Cloud Migration</div><div style={{fontSize:13,color:T.gray500}}>Aisha M. vs CloudShift Inc · $12,500 · Filed 2 days ago</div><div style={{fontSize:12.5,color:T.gray400,marginTop:6}}>Reason: Deliverable does not match agreed scope</div></div>
              <div style={{display:"flex",gap:8}}><Btn variant="outline" style={{fontSize:13}}>View AI Summary</Btn><Btn variant="green" style={{fontSize:13}}>Resolve →</Btn><Btn variant="red" style={{fontSize:13}}>Refund</Btn></div>
            </div>
            <div style={{marginTop:20,background:T.offWhite,borderRadius:12,padding:"18px",fontSize:13.5,color:T.gray600,lineHeight:1.75}}><strong>Dispute Workflow:</strong> AI case summary generated → Both parties notified → Evidence window (48h) → Officer review → Binding decision within 5 days → Refund or payment release executed.</div>
          </div>
        )}
        {tab==="users"&&(
          <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:16,padding:"26px"}}>
            <h2 style={{fontFamily:"'Inter',sans-serif",fontSize:20,color:T.primary,marginBottom:16}}>User Management</h2>
            <div className="g4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
              {[{l:"Total Users",v:"1,847,231",i:"group"},{l:"Clients",v:"1,204,512",i:"person"},{l:"Providers",v:"642,719",i:"build"},{l:"Suspended",v:"127",i:"block"}].map(u=>(
                <div key={u.l} style={{background:T.offWhite,borderRadius:12,padding:"16px",textAlign:"center"}}><div style={{fontSize:26,marginBottom:6}}><span className="msym" style={{fontSize:20,color:T.primary}}>{u.i}</span></div><div style={{fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:20,color:T.primary}}>{u.v}</div><div style={{fontSize:12,color:T.gray500,marginTop:2}}>{u.l}</div></div>
              ))}
            </div>
          </div>
        )}
        {tab==="kyc"&&(
          <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:16,padding:"26px"}}>
            <h2 style={{fontFamily:"'Inter',sans-serif",fontSize:20,color:T.primary,marginBottom:6}}>KYC Verification Queue</h2>
            <p style={{color:T.gray500,fontSize:14,marginBottom:20}}>{kycQueue.length} pending manual verifications.</p>
            {kycLoading && <p style={{fontSize:13.5,color:T.gray500}}>Loading queue...</p>}
            {!kycLoading && kycQueue.length === 0 && <p style={{fontSize:13.5,color:T.gray500}}>No pending verification requests.</p>}
            {!kycLoading && kycQueue.map((u,i)=>(
              <div key={u.id || i} style={{border:`1px solid ${T.gray100}`,borderRadius:10,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:10}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:T.primary}}>{u.user_name} ({u.user_email})</div>
                  <div style={{fontSize:12.5,color:T.gray500}}>{u.biz_name ? "Business Verification" : "Identity Verification"} · Phone: {u.phone} · Submitted {new Date(u.created_at).toLocaleString()}</div>
                  <div style={{fontSize:11.5,color:T.gray400,marginTop:4,display:"flex",gap:10}}>
                    <a href={`http://localhost:4000${u.id_file}`} target="_blank" rel="noreferrer" style={{color:T.accent,textDecoration:"underline"}}>View ID</a>
                    {u.selfie_file && <a href={`http://localhost:4000${u.selfie_file}`} target="_blank" rel="noreferrer" style={{color:T.accent,textDecoration:"underline"}}>View Selfie</a>}
                    {u.biz_file && <a href={`http://localhost:4000${u.biz_file}`} target="_blank" rel="noreferrer" style={{color:T.accent,textDecoration:"underline"}}>View Biz Doc</a>}
                    {u.incorp_file && <a href={`http://localhost:4000${u.incorp_file}`} target="_blank" rel="noreferrer" style={{color:T.accent,textDecoration:"underline"}}>View Incorp Cert</a>}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <Badge color={u.biz_name ? T.accent : T.primary}>{u.biz_name ? "Premium" : "Standard"}</Badge>
                  <Btn variant="green" style={{fontSize:12,padding:"7px 14px"}} onClick={() => handleApprove(u.id)}>Approve</Btn>
                  <Btn variant="red" style={{fontSize:12,padding:"7px 14px"}} onClick={() => handleReject(u.id)}>Reject</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminPanel;
