import { useState, useEffect, useRef } from "react";
import { T } from "../../tokens";
import { Btn, Spin } from "../../components/ui";
import { ai } from "../../utils/api";

const AuditModal=({tx,onClose,onApprove,onRevision})=>{
  const [ld,setLd]=useState(true);const [res,setRes]=useState(null);
  const auditedRef = useRef(false);

  useEffect(()=>{
    if (auditedRef.current) return;
    auditedRef.current = true;
    (async()=>{
      setLd(true);
      const activeM = (tx.milestones || []).find(m => ["submitted", "inprogress", "due", "rejected"].includes(m.status));
      const activeSub = activeM && activeM.submissions && activeM.submissions.length ? activeM.submissions[activeM.submissions.length - 1].id : undefined;
      const { data, error } = await ai.runAudit({
        transactionId: tx.realId || tx.id,
        milestoneId: activeM?.id,
        submissionId: activeSub,
        title: tx.title,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        counterparty: tx.other,
      });
      if (error) {
        alert(error);
        onClose();
        return;
      }
      if (data && data.audit) {
        setRes(data.audit);
      }
      setLd(false);
    })();
  },[]);
  const sc=s=>s==="passed"?T.green:s==="warning"?T.accent:T.red;
  const si=s=>s==="passed"?"check_circle":s==="warning"?"warning":"cancel";
  const oc=r=>r?.status==="passed"?T.green:r?.status==="passed_with_notes"?T.accent:T.red;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.white,borderRadius:20,width:"100%",maxWidth:580,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,.28)",animation:"fadeUp .3s ease"}}>
        <div style={{background:"linear-gradient(135deg,#1e1b4b,#4338ca)",padding:"22px 26px",color:T.white,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:1}}>
          <div><div style={{fontWeight:800,fontSize:17,display:"flex",alignItems:"center",gap:8}}><span className="msym" style={{fontSize:20}}>smart_toy</span>AI Deliverable Audit</div><div style={{fontSize:12,opacity:.65,marginTop:3}}>{tx.title}</div></div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.12)",border:"none",color:T.white,borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:"26px"}}>
          {ld?(
            <div style={{textAlign:"center",padding:"48px 0"}}>
              <span className="msym" style={{fontSize:46,color:T.primary,display:"block",marginBottom:14,animation:"pulse 1.5s ease infinite"}}>smart_toy</span>
              <div style={{fontWeight:700,fontSize:16,color:T.primary,marginBottom:8}}>Auditing deliverable…</div>
              <p style={{fontSize:13,color:T.gray500,lineHeight:1.7,marginBottom:20}}>Running scope check, code analysis, documentation review, and security scan.</p>
              {["Scanning repository structure…","Checking scope compliance…","Running security analysis…","Calculating risk score…"].map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:T.gray500,justifyContent:"center",marginBottom:8}}><Spin size={12} color={T.primary}/>{s}</div>)}
            </div>
          ):res&&(<>
            <div style={{display:"flex",alignItems:"center",gap:18,background:T.offWhite,borderRadius:14,padding:"18px 20px",marginBottom:22}}>
              <div style={{width:70,height:70,borderRadius:"50%",background:oc(res)+"16",border:`3px solid ${oc(res)}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:22,color:oc(res)}}>{res.score}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:15,color:T.primary,marginBottom:4}}>{res.status==="passed"?"Audit Passed":res.status==="passed_with_notes"?"Passed with Notes":"Revision Required"}</div>
                <p style={{fontSize:12.5,color:T.gray600,lineHeight:1.65}}>{res.summary}</p>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:11,color:T.gray400,marginBottom:4}}>Risk Score</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:800,color:res.risk==="low"?T.green:res.risk==="medium"?T.accent:T.red}}>{res.riskScore}</div>
                <span style={{fontSize:10,fontWeight:700,color:res.risk==="low"?T.green:res.risk==="medium"?T.accent:T.red,textTransform:"uppercase"}}>{res.risk} risk</span>
              </div>
            </div>
            {Array.isArray(res.requirements) && res.requirements.length > 0 && (
              <div style={{marginBottom:20}}>
                <div style={{fontWeight:700,fontSize:13.5,color:T.primary,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>Scope Requirement Audit</span>
                  <span style={{fontSize:11,color:T.gray500,fontWeight:500}}>{res.requirements.filter(r => r.status === "passed").length}/{res.requirements.length} Verified</span>
                </div>
                {/* Deterministic fallback notice */}
                {res.requirements.some(r => Array.isArray(r.limitations) && r.limitations.some(l => l.includes("Deterministic fallback") || l.includes("GROQ_API_KEY"))) && (
                  <div style={{display:"flex",alignItems:"flex-start",gap:8,background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"10px 12px",marginBottom:12,fontSize:12,color:"#92400e",lineHeight:1.55}}>
                    <span className="msym" style={{fontSize:16,flexShrink:0,color:"#d97706"}}>info</span>
                    <span><strong>Deterministic audit mode:</strong> Groq AI key not configured. Scores are based on evidence submitted. Add <code>GROQ_API_KEY</code> to <code>/backend/.env</code> for full AI-powered analysis.</span>
                  </div>
                )}
                {res.requirements.map((req, i) => {
                  const reqColor = req.status === "passed" ? T.green : req.status === "passed_with_notes" ? T.accent : req.status === "insufficient_evidence" ? "#d97706" : T.red;
                  const reqLabel = req.status === "passed" ? "PASSED" : req.status === "passed_with_notes" ? "WITH NOTES" : req.status === "insufficient_evidence" ? "NO EVIDENCE" : "REVISION REQ.";
                  const reqScore = typeof req.score === "number" ? req.score : null;
                  return (
                    <div key={i} style={{padding:"12px 14px",background:T.offWhite,borderRadius:10,marginBottom:8,border:`1px solid ${reqColor}30`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:4}}>
                        <div style={{fontWeight:700,fontSize:13,color:T.primary}}>{req.requirement}</div>
                        <span style={{fontSize:10.5,fontWeight:700,color:reqColor,background:reqColor+"15",padding:"2px 8px",borderRadius:12,whiteSpace:"nowrap"}}>
                          {reqLabel}{reqScore !== null ? ` • ${reqScore}/100` : ""}
                        </span>
                      </div>
                      <div style={{fontSize:12,color:T.gray600,lineHeight:1.5}}>{req.reason}</div>
                      {Array.isArray(req.verified) && req.verified.length > 0 && (
                        <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:4}}>
                          {req.verified.map((v,vi) => <span key={vi} style={{fontSize:10,color:T.green,background:T.green+"12",borderRadius:8,padding:"1px 7px"}}>{v}</span>)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{marginBottom:20}}>
              <div style={{fontWeight:700,fontSize:13.5,color:T.primary,marginBottom:12}}>Technical Checks</div>
              {res.checks?.map((c,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 13px",background:T.offWhite,borderRadius:9,marginBottom:7,border:`1px solid ${sc(c.status)}20`}}>
                  <span className="msym" style={{fontSize:18,flexShrink:0,marginTop:1,color:sc(c.status)}}>{si(c.status)}</span>
                  <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:T.primary}}>{c.name}</div><div style={{fontSize:12,color:T.gray500,marginTop:2}}>{c.note}</div></div>
                  <span style={{fontSize:11,fontWeight:700,color:sc(c.status),background:sc(c.status)+"16",padding:"2px 8px",borderRadius:20,whiteSpace:"nowrap"}}>{c.status}</span>
                </div>
              ))}
            </div>
            <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"13px 15px",marginBottom:20}}>
              <div style={{fontWeight:700,fontSize:13,color:T.primary,marginBottom:5,display:"flex",alignItems:"center",gap:6}}><span className="msym" style={{fontSize:16}}>smart_toy</span>AI Recommendation</div>
              <p style={{fontSize:13,color:"#1e40af",lineHeight:1.65}}>{res.recommendation}</p>
            </div>
            {(() => {
              const isCompleted = tx.status === "completed";
              const isDisputed = tx.status === "disputed";
              const isCancelled = tx.status === "cancelled";
              const isInactive = isCompleted || isDisputed || isCancelled;

              return (
                <div style={{display:"flex",gap:9}}>
                  <Btn variant="outline" onClick={onClose} style={{flex:1,fontSize:13}}>Close Report</Btn>
                  {res.status!=="revision_required"&&<Btn variant="green" disabled={isInactive} onClick={async ()=>{if(isInactive)return;await onApprove();onClose();}} style={{flex:1,fontSize:13,opacity:isInactive?0.55:1,cursor:isInactive?"not-allowed":"pointer"}}><span className="msym" style={{fontSize:16}}>check_circle</span>{isCompleted?"Funds Released":isDisputed?"Under Dispute":"Approve & Release →"}</Btn>}
                  {res.status!=="passed"&&!isInactive&&<Btn variant="accent" onClick={async ()=>{await onRevision();onClose();}} style={{flex:1,fontSize:13}}><span className="msym" style={{fontSize:16}}>refresh</span>Request Revision</Btn>}
                </div>
              );
            })()}
          </>)}
        </div>
      </div>
    </div>
  );
};
export default AuditModal;
