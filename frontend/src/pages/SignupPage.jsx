import { useState } from "react";
import { T } from "../tokens";
import { Spin } from "../components/ui";
import AuthShell from "./AuthShell";
import { auth } from "../utils/api";

const SignupPage = ({ onSuccess, navigate }) => {
  const [fm, setFm] = useState({ name: "", email: "", password: "", confirm: "", role: "client" });
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [err, setErr] = useState("");
  const [ld, setLd] = useState(false);
  const [done, setDone] = useState(false);
  
  const h = k => e => setFm(p => ({ ...p, [k]: e.target.value }));
  
  const sub = async (e) => {
    e.preventDefault();
    setErr("");
    if (!fm.name) return setErr("Full name is required.");
    if (!fm.email || !fm.password) return setErr("Please fill in all fields.");
    if (fm.password.length < 8) return setErr("Password must be at least 8 characters.");
    if (fm.password !== fm.confirm) return setErr("Passwords do not match.");
    
    setLd(true);
    const { data, error } = await auth.signup(fm.name, fm.email, fm.password, fm.role);
    setLd(false);
    
    if (error) {
      return setErr(error);
    }
    
    setDone(true);
    setTimeout(() => onSuccess(data.user), 900);
  };

  return(
    <AuthShell navigate={navigate}>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:60,height:60,borderRadius:16,background:"linear-gradient(135deg,#001637,#172b4d)",marginBottom:14,boxShadow:"0 8px 24px rgba(0,22,55,.22)"}}>
            <span className="msym" style={{fontSize:28,color:"#fff"}}>shield_lock</span>
          </div>
          <h1 style={{fontSize:28,fontWeight:700,color:"#001637",letterSpacing:"-.4px",marginBottom:6}}>Create account</h1>
          <p style={{fontSize:14,color:"#44474e",lineHeight:1.6}}>Join the secure escrow platform for digital services</p>
        </div>
        <div className="auth-card">
          {done?(
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{width:56,height:56,background:"#f0fdf4",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><span className="msym" style={{fontSize:30,color:"#1e9e5e"}}>check_circle</span></div>
              <div style={{fontWeight:700,fontSize:18,color:"#001637",marginBottom:5}}>Account created!</div>
              <div style={{fontSize:13.5,color:"#75777f"}}>Taking you to your dashboard…</div>
            </div>
          ):(
            <form onSubmit={sub} style={{display:"flex",flexDirection:"column",gap:16}}>
              {err&&<div style={{background:"#ffdad6",border:"1px solid #ba1a1a33",borderRadius:9,padding:"10px 14px",fontSize:13.5,color:"#93000a",display:"flex",alignItems:"center",gap:8}}><span className="msym" style={{fontSize:18}}>error</span>{err}</div>}
              <div>
                <label style={{display:"block",fontSize:12.5,fontWeight:700,color:"#44474e",marginBottom:6,letterSpacing:".02em"}}>FULL NAME</label>
                <div style={{position:"relative"}}>
                  <span className="msym" style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:20,color:"#75777f",pointerEvents:"none"}}>person</span>
                  <input className="auth-input" type="text" placeholder="Your full name" value={fm.name} onChange={h("name")} required/>
                </div>
              </div>
              <div>
                <label style={{display:"block",fontSize:12.5,fontWeight:700,color:"#44474e",marginBottom:6,letterSpacing:".02em"}}>EMAIL ADDRESS</label>
                <div style={{position:"relative"}}>
                  <span className="msym" style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:20,color:"#75777f",pointerEvents:"none"}}>mail</span>
                  <input className="auth-input" type="email" placeholder="name@company.com" value={fm.email} onChange={h("email")} required/>
                </div>
              </div>
              <div>
                <label style={{display:"block",fontSize:12.5,fontWeight:700,color:"#44474e",marginBottom:6,letterSpacing:".02em"}}>PASSWORD</label>
                <div style={{position:"relative"}}>
                  <span className="msym" style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:20,color:"#75777f",pointerEvents:"none"}}>lock</span>
                  <input className="auth-input auth-input-pr" type={showPw?"text":"password"} placeholder="Min. 8 characters" value={fm.password} onChange={h("password")} required/>
                  <button type="button" onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#75777f",display:"flex",alignItems:"center"}}>
                    <span className="msym" style={{fontSize:20}}>{showPw?"visibility_off":"visibility"}</span>
                  </button>
                </div>
              </div>
              <div>
                <label style={{display:"block",fontSize:12.5,fontWeight:700,color:"#44474e",marginBottom:6,letterSpacing:".02em"}}>CONFIRM PASSWORD</label>
                <div style={{position:"relative"}}>
                  <span className="msym" style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:20,color:"#75777f",pointerEvents:"none"}}>lock</span>
                  <input className="auth-input auth-input-pr" type={showCf?"text":"password"} placeholder="Repeat password" value={fm.confirm} onChange={h("confirm")} required/>
                  <button type="button" onClick={()=>setShowCf(v=>!v)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#75777f",display:"flex",alignItems:"center"}}>
                    <span className="msym" style={{fontSize:20}}>{showCf?"visibility_off":"visibility"}</span>
                  </button>
                </div>
              </div>
              {/* Role selector */}
              <div>
                <label style={{display:"block",fontSize:12.5,fontWeight:700,color:"#44474e",marginBottom:8,letterSpacing:".02em"}}>I AM A</label>
                <div style={{display:"flex",gap:10}}>
                  {[["client","person","Client","Hiring services"],["provider","engineering","Service Provider","Selling services"]].map(([v,icon,l,sub])=>(
                    <button key={v} type="button" onClick={()=>setFm(p=>({...p,role:v}))}
                      style={{flex:1,padding:"12px 10px",border:`2px solid ${fm.role===v?"#001637":"#e4e2e5"}`,borderRadius:10,background:fm.role===v?"rgba(0,22,55,.06)":"#fff",cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
                      <span className="msym" style={{fontSize:22,color:fm.role===v?"#001637":"#75777f",display:"block",marginBottom:4}}>{icon}</span>
                      <div style={{fontSize:13,fontWeight:700,color:fm.role===v?"#001637":"#44474e"}}>{l}</div>
                      <div style={{fontSize:11,color:"#75777f",marginTop:2}}>{sub}</div>
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="auth-btn-primary" disabled={ld}>
                {ld?<><Spin/>Creating account…</>:<>Create Account <span className="msym" style={{fontSize:18}}>arrow_forward</span></>}
              </button>
              <p style={{textAlign:"center",fontSize:13.5,color:"#44474e",borderTop:"1px solid #e4e2e5",paddingTop:16,margin:0}}>
                Already have an account?{" "}
                <span style={{color:"#001637",fontWeight:700,cursor:"pointer"}} onClick={()=>navigate("login")}>Sign in →</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </AuthShell>
  );
};
export default SignupPage;
