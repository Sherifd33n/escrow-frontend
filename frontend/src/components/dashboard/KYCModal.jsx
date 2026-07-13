import { useState, useRef } from "react";
import { T, fs } from "../../tokens";
import { Btn, Spin, FormField as F } from "../ui";
import { users } from "../../utils/api";

const KYC=({onClose,onComplete})=>{
  const [step,setStep]=useState(1);
  const [fm,setFm]=useState({phone:"",idType:"passport",idNum:"",biz:false,bizName:"",bizReg:""});
  const [ld,setLd]=useState(false);
  const [kycState,setKycState]=useState("form"); // "form" | "review" | "rejected"
  const [notifyEmail,setNotifyEmail]=useState(false);

  // File states — store actual File objects + preview URLs
  const [idFile,setIdFile]=useState(null);
  const [idPreview,setIdPreview]=useState(null);
  const [selfieFile,setSelfieFile]=useState(null);
  const [selfiePreview,setSelfiePreview]=useState(null);
  const [bizFile,setBizFile]=useState(null);
  const [bizPreview,setBizPreview]=useState(null);
  const [incorpFile,setIncorpFile]=useState(null);
  const [incorpPreview,setIncorpPreview]=useState(null);

  const [err,setErr]=useState("");

  const h=k=>e=>setFm(p=>({...p,[k]:e.target.value}));
  const total=fm.biz?3:2;

  // Cleans up object URLs to avoid memory leaks
  const revokeURL=(url)=>{if(url&&url.startsWith("blob:"))URL.revokeObjectURL(url);};

  const handleFile=(file,setFile,setPreview,prevPreview)=>{
    if(!file)return;
    revokeURL(prevPreview);
    setFile(file);
    // Images get a preview, PDFs just show filename
    if(file.type.startsWith("image/")){
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview("pdf");
    }
  };

  const removeFile=(setFile,setPreview,prevPreview)=>{
    revokeURL(prevPreview);
    setFile(null);
    setPreview(null);
  };

  // Validate current step before advancing
  const canAdvance=()=>{
    setErr("");
    if(step===1){
      if(!fm.phone.trim())    return setErr("Phone number is required."),false;
      if(!fm.idNum.trim())    return setErr("ID number is required."),false;
      if(!idFile)             return setErr("Please upload your ID document."),false;
      return true;
    }
    if(step===2&&!fm.biz){
      if(!selfieFile)         return setErr("Please upload a selfie holding your ID."),false;
      return true;
    }
    if(step===2&&fm.biz){
      if(!fm.bizName.trim())  return setErr("Business name is required."),false;
      if(!fm.bizReg.trim())   return setErr("Registration number is required."),false;
      if(!bizFile)            return setErr("Please upload your business document."),false;
      return true;
    }
    if(step===3&&fm.biz){
      if(!incorpFile)         return setErr("Please upload your incorporation certificate."),false;
      return true;
    }
    return true;
  };

  const next=()=>{
    if(!canAdvance())return;
    if(step<total){setStep(p=>p+1);}
    else{
      setLd(true);
      setTimeout(()=>{setLd(false);setKycState("review");},1600);
    }
  };

  // ── Upload Zone Component ────────────────────────────────
  const UploadZone=({file,preview,accept,onSelect,onRemove,label,hint,icon="photo_camera"})=>{
    const inputRef=useRef();
    return(
      <div>
        <div style={{fontSize:13,fontWeight:600,color:T.gray700,marginBottom:8}}>{label} *</div>
        <input
          ref={inputRef}
          type="file"
          accept={accept||"image/jpeg,image/png,application/pdf"}
          style={{display:"none"}}
          onChange={e=>{if(e.target.files[0])onSelect(e.target.files[0]);e.target.value="";}}
        />
        {!file?(
          <div
            onClick={()=>inputRef.current.click()}
            style={{border:`2px dashed ${T.gray100}`,borderRadius:12,padding:"28px 20px",textAlign:"center",cursor:"pointer",background:T.offWhite,transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.green;e.currentTarget.style.background="rgba(0,108,71,.03)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.gray100;e.currentTarget.style.background=T.offWhite;}}
          >
            <span className="msym" style={{fontSize:32,color:T.gray400,display:"block",marginBottom:8}}>{icon}</span>
            <div style={{fontSize:13,fontWeight:600,color:T.gray700,marginBottom:3}}>Click to upload</div>
            <div style={{fontSize:11.5,color:T.gray500}}>{hint||"JPG, PNG or PDF — max 5MB"}</div>
          </div>
        ):(
          <div style={{border:`1.5px solid ${T.green}`,borderRadius:12,padding:"14px",display:"flex",alignItems:"center",gap:12,background:T.greenLt}}>
            {preview&&preview!=="pdf"?(
              <img src={preview} alt="preview" style={{width:52,height:52,borderRadius:8,objectFit:"cover",flexShrink:0}}/>
            ):(
              <div style={{width:52,height:52,borderRadius:8,background:T.white,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span className="msym" style={{fontSize:24,color:T.green}}>description</span>
              </div>
            )}
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:T.primary,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{file.name}</div>
              <div style={{fontSize:11.5,color:T.green,display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                <span className="msym" style={{fontSize:14}}>check_circle</span>Uploaded
              </div>
            </div>
            <button onClick={onRemove} style={{background:"none",border:"none",cursor:"pointer",color:T.gray500,padding:6,flexShrink:0}}>
              <span className="msym" style={{fontSize:20}}>close</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.white,borderRadius:20,width:"100%",maxWidth:540,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,.22)",animation:"fadeUp .3s ease"}}>

        {/* ═══ REJECTED STATE ═══ */}
        {kycState==="rejected"&&(
          <div style={{padding:"40px 30px",textAlign:"center"}}>
            <div style={{width:64,height:64,background:"#ffdad6",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}>
              <span className="msym" style={{fontSize:34,color:T.red}}>cancel</span>
            </div>
            <div style={{fontWeight:700,fontSize:18,color:T.gray900,marginBottom:6}}>Identity Verification Rejected</div>
            <p style={{fontSize:13.5,color:T.gray500,lineHeight:1.7,marginBottom:24}}>Your submitted documents could not be verified. Common reasons: blurry image, expired ID, or mismatched details. Please try again with clearer documents.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <Btn variant="outline" onClick={onClose}>Close</Btn>
              <Btn variant="primary" onClick={()=>{setKycState("form");setStep(1);}}>Try Again</Btn>
            </div>
          </div>
        )}

        {/* ═══ REVIEW / PENDING STATE ═══ */}
        {kycState==="review"&&(
          <div style={{padding:"40px 30px",textAlign:"center"}}>
            <div style={{width:64,height:64,background:T.greenLt,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}>
              <span className="msym" style={{fontSize:34,color:T.green}}>schedule</span>
            </div>
            <div style={{fontWeight:700,fontSize:18,color:T.primary,marginBottom:6}}>Verification Submitted</div>
            <p style={{fontSize:13.5,color:T.gray500,lineHeight:1.7,marginBottom:20}}>Your documents are under review. This usually takes 1–24 hours. We'll notify you once it's complete.</p>
            <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:24,cursor:"pointer"}}>
              <input type="checkbox" checked={notifyEmail} onChange={e=>setNotifyEmail(e.target.checked)} style={{width:16,height:16,accentColor:T.green}}/>
              <span style={{fontSize:13,color:T.gray700}}>Email me when verification completes</span>
            </label>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <Btn variant="outline" onClick={onClose}>Close</Btn>
              {/* Demo helper — simulate admin approving/rejecting */}
              <Btn variant="primary" disabled={ld} onClick={async ()=>{
                setLd(true);
                const targetTier = fm.biz ? 3 : 2;
                const { error } = await users.updateKYC(targetTier);
                setLd(false);
                if (error) {
                  alert(error);
                  return;
                }
                if(onComplete) onComplete(targetTier);
              }}>{ld ? <Spin /> : "Simulate Approval"}</Btn>
            </div>
          </div>
        )}

        {/* ═══ FORM STATE ═══ */}
        {kycState==="form"&&(
          <>
            {/* Header */}
            <div style={{background:`linear-gradient(135deg,${T.primary},${T.primaryDk})`,padding:"22px 26px",color:T.white,position:"sticky",top:0,zIndex:5}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontWeight:800,fontSize:17,display:"flex",alignItems:"center",gap:8}}>
                  <span className="msym" style={{fontSize:20}}>badge</span>Identity Verification (KYC)
                </div>
                <button onClick={onClose} style={{background:"rgba(255,255,255,.12)",border:"none",color:T.white,borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
              </div>
              {/* Step indicator */}
              <div style={{display:"flex",gap:6}}>
                {Array.from({length:total}).map((_,i)=>(
                  <div key={i} style={{flex:1,height:4,borderRadius:4,background:i<step?T.gold:"rgba(255,255,255,.2)"}}/>
                ))}
              </div>
              <div style={{fontSize:11.5,color:"rgba(255,255,255,.6)",marginTop:8}}>Step {step} of {total}</div>
            </div>

            <div style={{padding:"26px"}}>
              {err&&(
                <div style={{background:"#ffdad6",border:"1px solid #ba1a1a33",borderRadius:9,padding:"10px 14px",marginBottom:18,fontSize:13.5,color:"#93000a",display:"flex",alignItems:"center",gap:8}}>
                  <span className="msym" style={{fontSize:18}}>error</span>{err}
                </div>
              )}

              {/* ── STEP 1: Phone + ID ── */}
              {step===1&&(
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  <F label="Phone Number" req>
                    <input style={fs} placeholder="+234 801 234 5678" value={fm.phone} onChange={h("phone")}/>
                  </F>

                  <div>
                    <label style={{display:"block",fontSize:13,fontWeight:600,color:T.gray700,marginBottom:5}}>ID Type *</label>
                    <select style={fs} value={fm.idType} onChange={h("idType")}>
                      <option value="passport">International Passport</option>
                      <option value="license">Driver's License</option>
                      <option value="nin">National ID (NIN)</option>
                      <option value="voters">Voter's Card</option>
                    </select>
                  </div>

                  <F label="ID Number" req>
                    <input style={fs} placeholder="Enter document number" value={fm.idNum} onChange={h("idNum")}/>
                  </F>

                  <UploadZone
                    label="Upload ID Document"
                    hint="Clear photo or scan of the front of your ID"
                    icon="badge"
                    file={idFile}
                    preview={idPreview}
                    onSelect={f=>handleFile(f,setIdFile,setIdPreview,idPreview)}
                    onRemove={()=>removeFile(setIdFile,setIdPreview,idPreview)}
                  />

                  <label style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",padding:"12px 14px",background:T.offWhite,borderRadius:10}}>
                    <input type="checkbox" checked={fm.biz} onChange={e=>setFm(p=>({...p,biz:e.target.checked}))} style={{width:16,height:16,accentColor:T.primary}}/>
                    <span style={{fontSize:13,color:T.gray700}}>I'm also verifying a business account</span>
                  </label>
                </div>
              )}

              {/* ── STEP 2 (personal): Selfie ── */}
              {step===2&&!fm.biz&&(
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  <div style={{background:"#f0f4ff",border:"1px solid #c7d7fd",borderRadius:10,padding:"12px 14px",fontSize:13,color:"#1e40af",display:"flex",gap:8,alignItems:"flex-start"}}>
                    <span className="msym" style={{fontSize:18,flexShrink:0}}>info</span>
                    <span>Take a clear selfie of yourself holding your ID document next to your face.</span>
                  </div>
                  <UploadZone
                    label="Upload Selfie with ID"
                    hint="Your face and ID must both be clearly visible"
                    icon="photo_camera"
                    accept="image/jpeg,image/png"
                    file={selfieFile}
                    preview={selfiePreview}
                    onSelect={f=>handleFile(f,setSelfieFile,setSelfiePreview,selfiePreview)}
                    onRemove={()=>removeFile(setSelfieFile,setSelfiePreview,selfiePreview)}
                  />
                </div>
              )}

              {/* ── STEP 2 (business): Business details ── */}
              {step===2&&fm.biz&&(
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  <F label="Registered Business Name" req>
                    <input style={fs} placeholder="e.g. Devcraft Solutions Ltd" value={fm.bizName} onChange={h("bizName")}/>
                  </F>
                  <F label="Registration / CAC Number" req>
                    <input style={fs} placeholder="RC1234567" value={fm.bizReg} onChange={h("bizReg")}/>
                  </F>
                  <UploadZone
                    label="Upload Business Document"
                    hint="CAC certificate, business registration, or tax ID"
                    icon="business"
                    file={bizFile}
                    preview={bizPreview}
                    onSelect={f=>handleFile(f,setBizFile,setBizPreview,bizPreview)}
                    onRemove={()=>removeFile(setBizFile,setBizPreview,bizPreview)}
                  />
                </div>
              )}

              {/* ── STEP 3 (business): Incorporation cert + selfie ── */}
              {step===3&&fm.biz&&(
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  <UploadZone
                    label="Upload Certificate of Incorporation"
                    hint="Official incorporation document"
                    icon="article"
                    file={incorpFile}
                    preview={incorpPreview}
                    onSelect={f=>handleFile(f,setIncorpFile,setIncorpPreview,incorpPreview)}
                    onRemove={()=>removeFile(setIncorpFile,setIncorpPreview,incorpPreview)}
                  />
                  <UploadZone
                    label="Upload Selfie with ID"
                    hint="Your face and ID must both be clearly visible"
                    icon="photo_camera"
                    accept="image/jpeg,image/png"
                    file={selfieFile}
                    preview={selfiePreview}
                    onSelect={f=>handleFile(f,setSelfieFile,setSelfiePreview,selfiePreview)}
                    onRemove={()=>removeFile(setSelfieFile,setSelfiePreview,selfiePreview)}
                  />
                </div>
              )}

              {/* Footer buttons */}
              <div style={{display:"flex",gap:10,marginTop:26}}>
                {step>1&&(
                  <Btn variant="outline" onClick={()=>setStep(p=>p-1)} style={{flex:1}}>Back</Btn>
                )}
                <Btn variant="primary" onClick={next} disabled={ld} style={{flex:2}}>
                  {ld?<><Spin/>Submitting…</>:step<total?"Continue":"Submit for Review"}
                </Btn>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KYC;