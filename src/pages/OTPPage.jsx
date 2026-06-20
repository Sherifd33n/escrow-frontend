import { useState, useEffect, useRef } from "react";
import { T } from "../tokens";
import { Spin } from "../components/ui";
import AuthShell from "./AuthShell";

const OTPPage=({email,onSuccess,navigate})=>{
  const [otp,setOtp]=useState(["","","","","",""]);
  const [err,setErr]=useState("");
  const [ld,setLd]=useState(false);
  const [done,setDone]=useState(false);
  const [countdown,setCountdown]=useState(59);
  const [canResend,setCanResend]=useState(false);
  const refs=[useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];

  useEffect(()=>{
    refs[0].current?.focus();
  },[]);

  useEffect(()=>{
    if(countdown<=0){setCanResend(true);return;}
    const t=setTimeout(()=>setCountdown(c=>c-1),1000);
    return()=>clearTimeout(t);
  },[countdown]);

  const handleChange=(i,val)=>{
    const v=val.replace(/\D/g,"").slice(0,1);
    const next=[...otp];next[i]=v;setOtp(next);setErr("");
    if(v&&i<5)refs[i+1].current?.focus();
  };

  const handleKey=(i,e)=>{
    if(e.key==="Backspace"&&!otp[i]&&i>0){refs[i-1].current?.focus();}
    if(e.key==="ArrowLeft"&&i>0)refs[i-1].current?.focus();
    if(e.key==="ArrowRight"&&i<5)refs[i+1].current?.focus();
  };

  const handlePaste=(e)=>{
    e.preventDefault();
    const paste=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6).split("");
    const next=["","","","","",""];
    paste.forEach((v,i)=>{next[i]=v;});
    setOtp(next);
    const last=Math.min(paste.length,5);
    refs[last].current?.focus();
  };

  const submit=()=>{
    const code=otp.join("");
    if(code.length<6)return setErr("Please enter all 6 digits.");
    setLd(true);setErr("");
    setTimeout(()=>{setLd(false);setDone(true);setTimeout(onSuccess,1000);},1400);
  };

  const resend=()=>{
    if(!canResend)return;
    setOtp(["","","","","",""]);
    setCountdown(59);setCanResend(false);
    refs[0].current?.focus();
  };

  return(
    <AuthShell navigate={navigate}>
      <div style={{width:"100%",maxWidth:480}}>
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:68,height:68,borderRadius:20,background:"linear-gradient(135deg,#001637,#172b4d)",marginBottom:16,boxShadow:"0 8px 28px rgba(0,22,55,.25)"}}>
            <span className="msym" style={{fontSize:32,color:"#fff",fontVariationSettings:"'FILL' 1"}}>shield_lock</span>
          </div>
          <h1 style={{fontFamily:"'Inter',sans-serif",fontSize:26,fontWeight:700,color:"#001637",letterSpacing:"-.4px",marginBottom:8}}>Verify your email</h1>
          <p style={{fontSize:14,color:"#44474e",lineHeight:1.7}}>
            We sent a 6-digit code to{" "}
            <span style={{fontWeight:700,color:"#001637"}}>{email||"your email"}</span>.
            <br/>Enter it below to activate your account.
          </p>
        </div>

        <div className="auth-card">
          {done?(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{width:60,height:60,background:"#f0fdf4",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
                <span className="msym" style={{fontSize:32,color:"#1e9e5e"}}>check_circle</span>
              </div>
              <div style={{fontWeight:700,fontSize:18,color:"#001637",marginBottom:5}}>Email verified!</div>
              <div style={{fontSize:13.5,color:"#75777f"}}>Taking you to your dashboard…</div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:24}}>
              {/* OTP boxes */}
              <div>
                <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                  {otp.map((v,i)=>(
                    <input
                      key={i}
                      ref={refs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={v}
                      onChange={e=>handleChange(i,e.target.value)}
                      onKeyDown={e=>handleKey(i,e)}
                      onPaste={i===0?handlePaste:undefined}
                      style={{
                        width:52,height:60,textAlign:"center",fontSize:24,fontWeight:700,
                        fontFamily:"'Inter',sans-serif",color:"#001637",
                        background:v?"rgba(0,22,55,.05)":"#f5f3f6",
                        border:`2px solid ${v?"#001637":err?"#ba1a1a":"#c5c6cf"}`,
                        borderRadius:12,outline:"none",
                        transition:"all .15s",
                        caretColor:"#006c47",
                        boxShadow:v?"0 0 0 3px rgba(0,22,55,.07)":"none",
                      }}
                      onFocus={e=>e.target.style.borderColor="#001637"}
                      onBlur={e=>e.target.style.borderColor=v?"#001637":"#c5c6cf"}
                    />
                  ))}
                </div>
                {err&&(
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:12,justifyContent:"center",fontSize:13,color:"#ba1a1a"}}>
                    <span className="msym" style={{fontSize:16}}>error</span>{err}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={submit}
                disabled={ld||otp.join("").length<6}
                className="auth-btn-primary"
                style={{opacity:ld||otp.join("").length<6?.55:1}}
              >
                {ld?(
                  <><Spin/>Verifying…</>
                ):(
                  <><span className="msym" style={{fontSize:18}}>verified</span>Confirm & Activate Account</>
                )}
              </button>

              {/* Resend */}
              <div style={{textAlign:"center",display:"flex",flexDirection:"column",gap:6}}>
                <p style={{fontSize:13.5,color:"#44474e"}}>Didn't receive the code?</p>
                <button
                  onClick={resend}
                  disabled={!canResend}
                  style={{background:"none",border:"none",cursor:canResend?"pointer":"default",fontSize:13.5,fontWeight:700,color:canResend?"#006c47":"#75777f",fontFamily:"'Inter',sans-serif",padding:0,transition:"color .15s"}}
                >
                  {canResend?"Resend Code →":`Resend in ${countdown}s`}
                </button>
              </div>

              {/* Trust row */}
              <div style={{borderTop:"1px solid #e4e2e5",paddingTop:16,display:"flex",justifyContent:"center",gap:28}}>
                {[["lock","256-bit SSL"],["verified_user","KYC Secured"],["gavel","Fully Compliant"]].map(([icon,label])=>(
                  <div key={label} style={{display:"flex",alignItems:"center",gap:5,fontSize:11.5,color:"#75777f"}}>
                    <span className="msym" style={{fontSize:14,color:"#75777f"}}>{icon}</span>{label}
                  </div>
                ))}
              </div>

              {/* Wrong email? */}
              <p style={{textAlign:"center",fontSize:13,color:"#44474e",margin:0}}>
                Wrong email?{" "}
                <span style={{color:"#001637",fontWeight:700,cursor:"pointer"}} onClick={()=>navigate("signup")}>Go back →</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthShell>
  );
};
export default OTPPage;
