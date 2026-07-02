import { useState } from "react";
import { T } from "../tokens";
import { Spin } from "../components/ui";
import AuthShell from "./AuthShell";

const LoginPage=({onSuccess,navigate})=>{
  const [fm,setFm]=useState({email:"",password:""});
  const [showPw,setShowPw]=useState(false);
  const [err,setErr]=useState("");
  const [ld,setLd]=useState(false);
  const [done,setDone]=useState(false);
  const h=k=>e=>setFm(p=>({...p,[k]:e.target.value}));
  const sub=e=>{
    e.preventDefault();setErr("");
    if(!fm.email||!fm.password)return setErr("Please fill in all fields.");
    setLd(true);
    setTimeout(()=>{
      setLd(false);setDone(true);
      setTimeout(()=>onSuccess({name:"User",role:"client",email:fm.email}),900);
    },1000);
  };
  return(
    <AuthShell navigate={navigate}>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:60,height:60,borderRadius:16,background:"linear-gradient(135deg,#001637,#172b4d)",marginBottom:14,boxShadow:"0 8px 24px rgba(0,22,55,.22)"}}>
            <span className="msym" style={{fontSize:28,color:"#fff"}}>shield_lock</span>
          </div>
          <h1 style={{fontFamily:"'Inter',sans-serif",fontSize:28,fontWeight:700,color:"#001637",letterSpacing:"-.4px",marginBottom:6}}>Welcome back</h1>
          <p style={{fontSize:14,color:"#44474e",lineHeight:1.6}}>Sign in to your Escrow account</p>
        </div>
        <div className="auth-card">
          {done?(
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{width:56,height:56,background:"#f0fdf4",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><span className="msym" style={{fontSize:30,color:"#1e9e5e"}}>check_circle</span></div>
              <div style={{fontWeight:700,fontSize:18,color:"#001637",marginBottom:5}}>Signed in!</div>
              <div style={{fontSize:13.5,color:"#75777f"}}>Redirecting you now…</div>
            </div>
          ):(
            <form onSubmit={sub} style={{display:"flex",flexDirection:"column",gap:18}}>
              {err&&<div style={{background:"#ffdad6",border:"1px solid #ba1a1a33",borderRadius:9,padding:"10px 14px",fontSize:13.5,color:"#93000a",display:"flex",alignItems:"center",gap:8}}><span className="msym" style={{fontSize:18}}>error</span>{err}</div>}
              <div>
                <label style={{display:"block",fontSize:12.5,fontWeight:700,color:"#44474e",marginBottom:6,letterSpacing:".02em"}}>EMAIL ADDRESS</label>
                <div style={{position:"relative"}}>
                  <span className="msym" style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:20,color:"#75777f",pointerEvents:"none"}}>mail</span>
                  <input className="auth-input" type="email" placeholder="name@company.com" value={fm.email} onChange={h("email")} required/>
                </div>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <label style={{fontSize:12.5,fontWeight:700,color:"#44474e",letterSpacing:".02em"}}>PASSWORD</label>
                  <span style={{fontSize:12.5,color:"#1a56a0",cursor:"pointer",fontWeight:600}} onClick={()=>navigate("forgot")}>Forgot password?</span>
                </div>
                <div style={{position:"relative"}}>
                  <span className="msym" style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:20,color:"#75777f",pointerEvents:"none"}}>lock</span>
                  <input className="auth-input auth-input-pr" type={showPw?"text":"password"} placeholder="••••••••" value={fm.password} onChange={h("password")} required/>
                  <button type="button" onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#75777f",display:"flex",alignItems:"center"}}>
                    <span className="msym" style={{fontSize:20}}>{showPw?"visibility_off":"visibility"}</span>
                  </button>
                </div>
              </div>
              <label style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",fontSize:13.5,color:"#44474e",userSelect:"none"}}>
                <input type="checkbox" style={{accentColor:"#001637",width:17,height:17}}/>
                Keep me signed in for 30 days
              </label>
              <button type="submit" className="auth-btn-primary" disabled={ld}>
                {ld?<><Spin/>Signing in…</>:<>Sign In <span className="msym" style={{fontSize:18}}>login</span></>}
              </button>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{flex:1,height:1,background:"#c5c6cf"}}/>
                <span style={{fontSize:11,fontWeight:600,color:"#75777f",letterSpacing:".08em"}}>OR SIGN IN WITH</span>
                <div style={{flex:1,height:1,background:"#c5c6cf"}}/>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button type="button" className="auth-btn-social">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button type="button" className="auth-btn-social">
                  <span className="msym" style={{fontSize:20,color:"#001637"}}>fingerprint</span>
                  Biometric
                </button>
              </div>
              <p style={{textAlign:"center",fontSize:13.5,color:"#44474e",borderTop:"1px solid #e4e2e5",paddingTop:16,margin:0}}>
                New to Escrow?{" "}
                <span style={{color:"#001637",fontWeight:700,cursor:"pointer"}} onClick={()=>navigate("signup")}>Create a free account →</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </AuthShell>
  );
};
export default LoginPage;
