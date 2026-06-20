import { useState } from "react";
import { Spin } from "../components/ui";
import AuthShell from "./AuthShell";

const ForgotPasswordPage=({navigate})=>{
  const [email,setEmail]=useState("");
  const [ld,setLd]=useState(false);const [sent,setSent]=useState(false);
  const sub=e=>{
    e.preventDefault();if(!email)return;
    setLd(true);
    setTimeout(()=>{setLd(false);setSent(true);},1400);
  };
  return(
    <AuthShell navigate={navigate}>
      <div style={{width:"100%",maxWidth:400}}>
        <div className="auth-card">
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{width:64,height:64,background:"rgba(0,22,55,.1)",borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>
              <span className="msym" style={{fontSize:30,color:"#001637"}}>lock_reset</span>
            </div>
            <h1 style={{fontFamily:"'Inter',sans-serif",fontSize:22,fontWeight:700,color:"#1b1b1e",marginBottom:8}}>Forgot Password?</h1>
            <p style={{fontSize:13.5,color:"#44474e",lineHeight:1.65}}>Enter your registered email and we'll send you a link to reset your password.</p>
          </div>
          {sent?(
            <div style={{textAlign:"center",padding:"8px 0 16px"}}>
              <div style={{width:52,height:52,background:"#f0fdf4",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><span className="msym" style={{fontSize:28,color:"#1e9e5e"}}>check_circle</span></div>
              <div style={{fontWeight:700,fontSize:16,color:"#001637",marginBottom:6}}>Reset link sent!</div>
              <p style={{fontSize:13.5,color:"#44474e",marginBottom:20}}>Check your inbox at <strong>{email}</strong>. The link expires in 30 minutes.</p>
              <span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:13.5,color:"#001637",fontWeight:700,cursor:"pointer"}} onClick={()=>navigate("login")}>
                <span className="msym" style={{fontSize:18}}>arrow_back</span> Back to Login
              </span>
            </div>
          ):(
            <form onSubmit={sub} style={{display:"flex",flexDirection:"column",gap:18}}>
              <div>
                <label style={{display:"block",fontSize:12.5,fontWeight:700,color:"#44474e",marginBottom:6,letterSpacing:".02em"}}>EMAIL ADDRESS</label>
                <div style={{position:"relative"}}>
                  <span className="msym" style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:20,color:"#75777f",pointerEvents:"none"}}>mail</span>
                  <input className="auth-input" type="email" placeholder="name@company.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
                </div>
              </div>
              <button type="submit" className="auth-btn-primary" disabled={ld}>
                {ld?<><Spin/>Sending…</>:<>Send Reset Link <span className="msym" style={{fontSize:18}}>arrow_forward</span></>}
              </button>
              <div style={{textAlign:"center"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:13.5,color:"#001637",fontWeight:700,cursor:"pointer"}} onClick={()=>navigate("login")}>
                  <span className="msym" style={{fontSize:18}}>arrow_back</span> Back to Login
                </span>
              </div>
            </form>
          )}
        </div>
        <p style={{textAlign:"center",marginTop:16,fontSize:11.5,color:"#75777f",lineHeight:1.6}}>
          Escrow uses bank-grade encryption to protect your account and financial transactions.
        </p>
      </div>
    </AuthShell>
  );
};
export default ForgotPasswordPage;
