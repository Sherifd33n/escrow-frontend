import { useState } from "react";
import { T, fs } from "../../tokens";
import { Btn, Spin, FormField as F } from "../../components/ui";
import { ai } from "../../utils/api";

const ScopeModal=({catLabel,onClose,onApply})=>{
  const [desc,setDesc]=useState("");const [ld,setLd]=useState(false);const [res,setRes]=useState(null);
  const gen=async()=>{
    if(!desc.trim())return;setLd(true);
    const { data, error } = await ai.generateScope(catLabel, desc.trim());
    if (error) {
      alert(error);
      setLd(false);
      return;
    }
    if (data && data.scope) {
      setRes(data.scope);
    }
    setLd(false);
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.white,borderRadius:20,width:"100%",maxWidth:600,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,.28)",animation:"fadeUp .3s ease"}}>
        <div style={{background:"linear-gradient(135deg,#0f766e,#0d9488)",padding:"22px 26px",color:T.white,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:1}}>
          <div><div style={{fontWeight:800,fontSize:17,display:"flex",alignItems:"center",gap:8}}><span className="msym" style={{fontSize:20}}>assignment</span>AI Scope Generator</div><div style={{fontSize:12,opacity:.65,marginTop:3}}>Describe your project — AI drafts the full scope</div></div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.12)",border:"none",color:T.white,borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:"26px"}}>
          {!res?(<>
            <div style={{background:T.tealLt,border:`1px solid #a7f3d0`,borderRadius:10,padding:"13px 15px",fontSize:13,color:"#005235",marginBottom:18,lineHeight:1.7}}>Describe what you need in plain English. AI will generate deliverables, milestones, and acceptance criteria — ready to attach to your escrow contract.</div>
            <F label="Project Description" req><textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={6} placeholder={`e.g. "I need a ${catLabel} with user auth, a dashboard, CSV export, and an admin panel. Mobile-responsive, deployed to AWS."`} style={{...fs,resize:"vertical",lineHeight:1.7}}/></F>
            <Btn variant="teal" onClick={gen} disabled={!desc.trim()||ld} style={{width:"100%",marginTop:16,fontSize:15}}>
              {ld?<><Spin/>Generating scope…</>:"Generate Scope with AI →"}
            </Btn>
          </>):(<>
            <div style={{background:T.tealLt,border:`1px solid #99f6e4`,borderRadius:12,padding:"16px 18px",marginBottom:20}}>
              <div style={{fontWeight:700,fontSize:15,color:"#0f766e",marginBottom:4}}>{res.title}</div>
              <p style={{fontSize:13,color:"#0f766e",lineHeight:1.65}}>{res.overview}</p>
            </div>
            {[["Deliverables",res.deliverables],["Acceptance Criteria",res.acceptance]].map(([t,items])=>(
              <div key={t} style={{marginBottom:18}}>
                <div style={{fontWeight:700,fontSize:13.5,color:T.primary,marginBottom:10}}>{t}</div>
                {items?.map((d,i)=>{
                  const label = typeof d === "string" ? d : (d && typeof d === "object" ? (d.name ? `${d.name}${d.description ? " — " + d.description : ""}` : JSON.stringify(d)) : String(d || ""));
                  return (
                    <div key={i} style={{display:"flex",gap:9,alignItems:"flex-start",marginBottom:7,fontSize:13,color:T.gray700}}>
                      <span style={{color:T.teal,fontWeight:700,flexShrink:0}}>✓</span>
                      {label}
                    </div>
                  );
                })}
              </div>
            ))}
            <div style={{marginBottom:18}}>
              <div style={{fontWeight:700,fontSize:13.5,color:T.primary,marginBottom:10}}>calendar_today Milestones</div>
              {res.milestones?.map((m,i)=>(
                <div key={i} style={{display:"flex",gap:12,marginBottom:9,padding:"11px 13px",background:T.offWhite,borderRadius:9}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:T.teal,display:"flex",alignItems:"center",justifyContent:"center",color:T.white,fontWeight:700,fontSize:12,flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:T.primary}}>{m.name}</div><div style={{fontSize:12,color:T.gray500,marginTop:2}}>{m.description}</div></div>
                  <span style={{fontSize:11.5,color:T.teal,fontWeight:600,whiteSpace:"nowrap"}}>{m.timeline}</span>
                </div>
              ))}
            </div>
            <div style={{background:T.offWhite,borderRadius:10,padding:"12px 14px",fontSize:12.5,color:T.gray600,lineHeight:1.65,marginBottom:20}}><span className="msym" style={{fontSize:14,verticalAlign:"middle",marginRight:6}}>schedule</span><strong>{res.timeline}</strong> · {res.revisions}</div>
            <div style={{display:"flex",gap:10}}><Btn variant="outline" onClick={()=>setRes(null)} style={{flex:1}}>← Regenerate</Btn><Btn variant="teal" onClick={()=>{onApply(res);onClose();}} style={{flex:1}}>Use This Scope →</Btn></div>
          </>)}
        </div>
      </div>
    </div>
  );
};
export default ScopeModal;
