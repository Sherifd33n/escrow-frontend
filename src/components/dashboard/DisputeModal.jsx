import { useState } from "react";
import { T, fs } from "../../tokens";
import { Btn, Spin } from "../../components/ui";

const DisputeModal=({tx,onClose,onSubmit})=>{
  const [reason,setReason]=useState("");const [desc,setDesc]=useState("");const [files,setFiles]=useState([]);
  const [ld,setLd]=useState(false);const [summ,setSumm]=useState("");const [done,setDone]=useState(false);
  const sub=async()=>{
    if(!reason||!desc)return;setLd(true);
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:`You are Escrow's AI Dispute Assistant.\nTransaction: ${tx.title}\nCategory: ${tx.type}\nValue: $${tx.amount?.toLocaleString()}\nProvider: ${tx.other}\nReason: ${reason}\nDescription: ${desc}\nEvidence files: ${files.length>0?files.join(", "):"None"}\nGenerate a neutral 3-4 sentence dispute case summary covering: (1) nature of dispute, (2) key facts from both perspectives, (3) recommended resolution. Plain text only.`}]})});
      const d=await r.json();setSumm(d.content?.map(i=>i.text||"").join("")||"Dispute filed. Our team will contact both parties within 24 hours.");
    }catch{setSumm("A dispute has been filed. Our Dispute Resolution Officer will review all communications and deliverables and contact both parties with a resolution within 5 business days.");}
    setLd(false);setDone(true);onSubmit();
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.white,borderRadius:20,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,.25)",animation:"fadeUp .3s ease",overflow:"hidden"}}>
        <div style={{background:"linear-gradient(135deg,#7f1d1d,#991b1b)",padding:"22px 26px",color:T.white,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontWeight:800,fontSize:17,display:"flex",alignItems:"center",gap:8}}><span className="msym" style={{fontSize:20}}>gavel</span>File a Dispute</div><div style={{fontSize:12,opacity:.65,marginTop:3}}>{tx.title}</div></div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.12)",border:"none",color:T.white,borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:"26px",maxHeight:"calc(90vh - 80px)",overflowY:"auto"}}>
          {done?(<>
            <div style={{textAlign:"center",marginBottom:20}}><span className="msym" style={{fontSize:40,color:T.red,display:"block",marginBottom:10}}>gavel</span><div style={{fontWeight:700,fontSize:17,color:T.red,marginBottom:6}}>Dispute Filed</div><p style={{fontSize:13.5,color:T.gray500}}>Both parties notified. Our team reviews within 24 hours.</p></div>
            <div style={{background:"#fff5f5",border:"1px solid #fecaca",borderRadius:12,padding:"16px 18px",marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:13,color:T.red,marginBottom:8,display:"flex",alignItems:"center",gap:6}}><span className="msym" style={{fontSize:15}}>smart_toy</span>AI Case Summary</div>
              <p style={{fontSize:13,color:T.gray700,lineHeight:1.8}}>{summ}</p>
            </div>
            <div style={{background:T.offWhite,borderRadius:10,padding:"13px 15px",fontSize:12.5,color:T.gray500,lineHeight:1.65,marginBottom:16}}><span className="msym" style={{fontSize:14,verticalAlign:"middle",marginRight:6}}>assignment_ind</span>A Dispute Resolution Officer will contact both parties within 24 hours. Upload additional evidence via the transaction messages panel at any time.</div>
            <Btn variant="outline" onClick={onClose} style={{width:"100%"}}>Close</Btn>
          </>):(<>
            <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"12px 14px",fontSize:13,color:"#991b1b",lineHeight:1.65,marginBottom:20}}><span className="msym" style={{fontSize:14,verticalAlign:"middle",marginRight:6}}>warning</span>Filing a dispute freezes escrow funds and notifies the other party. Try resolving via messages first.</div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:T.gray700,marginBottom:9}}>Dispute Reason *</div>
                {["Deliverable does not match agreed scope","Work is incomplete or non-functional","No delivery made after funding","Scope was changed without agreement","Other"].map(r=>(
                  <label key={r} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",padding:"9px 13px",borderRadius:8,border:`1.5px solid ${reason===r?T.red:T.gray100}`,background:reason===r?"#fff5f5":T.white,marginBottom:7,transition:"all .15s"}}>
                    <input type="radio" name="reason" value={r} checked={reason===r} onChange={()=>setReason(r)} style={{accentColor:T.red}}/>
                    <span style={{fontSize:13.5,color:T.gray900}}>{r}</span>
                  </label>
                ))}
              </div>
              <F label="Describe the issue" req><textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4} placeholder="Explain what was promised, what was delivered, and what the problem is…" style={{...fs,resize:"vertical",lineHeight:1.65}}/></F>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:T.gray700,marginBottom:8}}>Upload Evidence (optional)</div>
                <div style={{border:`2px dashed ${T.gray100}`,borderRadius:10,padding:"20px",textAlign:"center",cursor:"pointer",background:T.offWhite}} onClick={()=>{const names=["screenshot.png","contract.pdf","chat_export.txt"];setFiles(p=>p.length<3?[...p,names[p.length]]:p);}}>
                  <div style={{fontSize:26,marginBottom:8}}>attach_file</div>
                  <div style={{fontSize:13,fontWeight:600,color:T.primary,marginBottom:3}}>Click to attach files</div>
                  <div style={{fontSize:12,color:T.gray400}}>Screenshots, contracts, code links, chat exports</div>
                </div>
                {files.length>0&&<div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:7}}>{files.map((f,i)=><span key={i} style={{fontSize:12,background:T.offWhite,border:`1px solid ${T.gray100}`,borderRadius:6,padding:"4px 10px",color:T.primary,fontWeight:500}}>attach_file {f}</span>)}</div>}
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <Btn variant="outline" onClick={onClose} style={{flex:1}}>Cancel</Btn>
              <Btn variant="red" onClick={sub} disabled={!reason||!desc||ld} style={{flex:1}}>
                {ld?<><Spin/>Generating AI Summary…</>:"File Dispute →"}
              </Btn>
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
};
export default DisputeModal;
