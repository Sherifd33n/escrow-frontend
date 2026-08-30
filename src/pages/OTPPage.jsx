import { useState, useEffect, useRef } from "react";
import { Spin } from "../components/ui";
import AuthShell from "./AuthShell";
import { auth, saveToken } from "../utils/api";

const OTPPage = ({ pendingUser, onSuccess, navigate }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState("");
  const [ld, setLd] = useState(false);
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    refs[0].current?.focus();
    const t = setInterval(() => setCountdown(c => { if (c <= 1) { setCanResend(true); clearInterval(t); return 0; } return c - 1; }), 1000);
    return () => clearInterval(t);
  }, []);

  const change = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...otp]; n[i] = v.slice(-1); setOtp(n); setErr("");
    if (v && i < 5) refs[i + 1].current?.focus();
  };
  const keydown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };
  const paste = (e) => {
    const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (d.length === 6) { setOtp(d.split("")); refs[5].current?.focus(); }
  };

  const submit = async () => {
    const code = otp.join("");
    if (code.length < 6) return setErr("Please enter all 6 digits.");
    setLd(true);
    setErr("");
    
    const { data, error } = await auth.verifyOTP(pendingUser?.id, code);
    setLd(false);
    
    if (error) {
      return setErr(error);
    }
    
    saveToken(data.token);
    setDone(true);
    setTimeout(() => onSuccess(data.user), 1000);
  };

  const resend = async () => {
    if (!canResend) return;
    setLd(true);
    setErr("");
    const { error } = await auth.resendOTP(pendingUser?.id);
    setLd(false);
    
    if (error) {
      return setErr(error);
    }
    
    setOtp(["", "", "", "", "", ""]);
    setCountdown(59);
    setCanResend(false);
    refs[0].current?.focus();
  };


  return(
    <AuthShell navigate={navigate}>
      <div style={{width:"100%",maxWidth:420,textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:64,height:64,borderRadius:18,background:"linear-gradient(135deg,#001637,#172b4d)",marginBottom:18,boxShadow:"0 8px 24px rgba(0,22,55,.22)"}}>
          <span className="msym" style={{fontSize:30,color:"#fff"}}>mark_email_read</span>
        </div>
        <h1 style={{fontSize:26,fontWeight:700,color:"#001637",marginBottom:8}}>Check your email</h1>
        <p style={{fontSize:14,color:"#44474e",lineHeight:1.7,marginBottom:28}}>
          We sent a 6-digit code to<br/><strong style={{color:"#001637"}}>{pendingUser?.email||"your email"}</strong>
        </p>
        <div className="auth-card">
          {done?(
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{width:56,height:56,background:"#f0fdf4",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
                <span className="msym" style={{fontSize:30,color:"#1e9e5e"}}>check_circle</span>
              </div>
              <div style={{fontWeight:700,fontSize:18,color:"#001637",marginBottom:5}}>Email verified!</div>
              <div style={{fontSize:13.5,color:"#75777f"}}>Taking you to your dashboard…</div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              {err&&<div style={{background:"#ffdad6",borderRadius:9,padding:"10px 14px",fontSize:13.5,color:"#93000a",display:"flex",alignItems:"center",gap:8}}><span className="msym" style={{fontSize:18}}>error</span>{err}</div>}
              <div style={{display:"flex",gap:"clamp(6px,2vw,10px)",justifyContent:"center",width:"100%"}} onPaste={paste}>
                {otp.map((v,i)=>(
                  <input key={i} ref={refs[i]} value={v}
                    onChange={e=>change(i,e.target.value)}
                    onKeyDown={e=>keydown(i,e)}
                    maxLength={1} inputMode="numeric"
                    style={{flex:"1 1 0",minWidth:0,maxWidth:48,height:"clamp(44px,12vw,56px)",textAlign:"center",fontSize:"clamp(17px,5vw,24px)",fontWeight:700,color:"#001637",border:`2px solid ${v?"#001637":"#c5c6cf"}`,borderRadius:12,outline:"none",background:v?"#f0f4ff":"#fff",transition:"all .15s",fontFamily:"inherit"}}/>
                ))}
              </div>
              <button onClick={submit} disabled={ld||otp.join("").length<6}
                style={{width:"100%",padding:"14px",borderRadius:12,border:"none",cursor:otp.join("").length<6?"not-allowed":"pointer",background:otp.join("").length===6?"linear-gradient(135deg,#001637,#172b4d)":"#c5c6cf",color:"#fff",fontSize:15,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .2s"}}>
                {ld?<><Spin/>Verifying…</>:<>Verify Code <span className="msym" style={{fontSize:18}}>arrow_forward</span></>}
              </button>
              <div style={{fontSize:13.5,color:"#44474e"}}>
                Didn't receive it?{" "}
                <span onClick={resend} style={{color:canResend?"#001637":"#75777f",fontWeight:700,cursor:canResend?"pointer":"default"}}>
                  {canResend?"Resend code":`Resend in 0:${String(countdown).padStart(2,"0")}`}
                </span>
              </div>
              <button onClick={()=>navigate("login")} style={{background:"none",border:"none",color:"#75777f",fontSize:13,cursor:"pointer"}}>
                ← Back to login
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthShell>
  );
};
export default OTPPage;
