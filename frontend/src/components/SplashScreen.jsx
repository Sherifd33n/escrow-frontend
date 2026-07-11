import { useState, useEffect } from "react";
import { T } from "../tokens";

const SplashScreen=({onDone})=>{
  const [prog,setProg]=useState(0);
  useEffect(()=>{
    const t1=setTimeout(()=>setProg(35),500);
    const t2=setTimeout(()=>setProg(65),1800);
    const t3=setTimeout(()=>setProg(100),3000);
    const t4=setTimeout(()=>onDone(),3800);
    return()=>{[t1,t2,t3,t4].forEach(clearTimeout);};
  },[]);
  return(
    <div style={{minHeight:"100dvh",background:"linear-gradient(180deg,#fbf9fc 0%,#f5f3f6 100%)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",top:"-10%",left:0,width:"100%",height:"50%",background:"linear-gradient(135deg,rgba(215,226,255,.25) 0%,transparent 80%)",filter:"blur(60px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"-5%",right:"-10%",width:300,height:300,borderRadius:"50%",background:"rgba(130,249,190,.12)",filter:"blur(60px)",pointerEvents:"none"}}/>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:64,position:"relative",zIndex:1,padding:"0 24px",width:"100%",maxWidth:430}}>
        {/* Logo */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:28,animation:"fadeUp .6s .2s ease both"}}>
          <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",width:128,height:128}}>
            <div style={{position:"absolute",inset:-10,borderRadius:"50%",border:"2px solid rgba(180,199,241,.25)",animation:"pulse-ring 3s cubic-bezier(.4,0,.6,1) infinite"}}/>
            <div style={{position:"absolute",inset:-20,borderRadius:"50%",border:"1px solid rgba(180,199,241,.12)",animation:"pulse-ring 3s cubic-bezier(.4,0,.6,1) .5s infinite"}}/>
            <div style={{position:"relative",zIndex:1,background:"#172b4d",borderRadius:28,padding:24,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 20px 60px rgba(0,22,55,.28)"}}>
              <span className="msym" style={{fontSize:64,color:"#fff",fontVariationSettings:"'FILL' 1"}}>shield_with_heart</span>
              <div style={{position:"absolute",bottom:-4,right:-4,width:40,height:40,borderRadius:"50%",background:"#006c47",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",border:"4px solid #fbf9fc",boxShadow:"0 2px 8px rgba(0,108,71,.28)"}}>
                <span className="msym" style={{fontSize:18,fontVariationSettings:"'FILL' 1"}}>lock</span>
              </div>
            </div>
          </div>
          <div style={{textAlign:"center"}}>
            <h1 style={{fontSize:30,fontWeight:800,color:"#001637",letterSpacing:"-.4px",marginBottom:4}}><span style={{color:"#006c47"}}>Escrow</span></h1>
            <p style={{fontSize:11.5,fontWeight:600,color:"#75777f",letterSpacing:".2em",textTransform:"uppercase"}}>Institutional Trust</p>
          </div>
        </div>
        {/* Status + bar */}
        <div style={{width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:18,animation:"fadeUp .6s .6s ease both"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:999,background:"#e9e7eb",border:"1px solid rgba(197,198,207,.4)"}}>
            <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:"#006c47",flexShrink:0,boxShadow:"0 0 0 3px rgba(0,108,71,.2)",animation:"pulse-ring 2s ease infinite"}}/>
            <span style={{fontSize:11,fontWeight:600,color:"#44474e",letterSpacing:".06em",textTransform:"uppercase"}}>Secure Connection Established</span>
          </div>
          <div style={{width:192,height:3,background:"#e4e2e5",borderRadius:999,overflow:"hidden",position:"relative"}}>
            <div style={{height:"100%",background:"#006c47",borderRadius:999,width:`${prog}%`,transition:"width 1s ease-out"}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:28,opacity:.3,filter:"grayscale(1)",marginTop:4}}>
            {["verified_user","account_balance","security"].map(ic=><span key={ic} className="msym" style={{fontSize:22}}>{ic}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SplashScreen;
